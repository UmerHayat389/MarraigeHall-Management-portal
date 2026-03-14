const Booking  = require("../models/Booking");
const Hall     = require("../models/Hall");
const User     = require("../models/User");
const mongoose = require("mongoose");

// ── SMS helper — never crashes the server ────────────────────────────────────
const sendSMS = async (to, body) => {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_PHONE;
  if (!sid || !token || !from) return; // silently skip if not configured
  try {
    const twilio = require("twilio")(sid, token);
    await twilio.messages.create({ to, from, body });
  } catch (err) {
    console.error("SMS error (non-fatal):", err.message);
  }
};

// ── Reference generator: NM-NAME-NN  e.g. NM-UMER-47 ───────────────────────
const generateRef = (clientName) => {
  const namePart = (clientName || "GUE").replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4) || "GUE";
  const digits   = String(Math.floor(10 + Math.random() * 90)); // always 2 digits
  return `NM-${namePart}-${digits}`;
};

const VALID_SLOTS = ["afternoon", "evening", "latenight"];

// ── Validate ObjectId to prevent CastError crashes ──────────────────────────
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// @route POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const {
      clientName, clientPhone, clientEmail,
      hallId, eventType, eventDate, timeSlot,
      guests, paymentMethod, transactionId,
      specialRequests, totalPrice,
    } = req.body;

    // ── Input validation ────────────────────────────────────────────────────
    if (!clientName?.trim()) return res.status(400).json({ success: false, message: "Client name is required" });
    if (!clientPhone?.trim()) return res.status(400).json({ success: false, message: "Client phone is required" });
    if (!hallId) return res.status(400).json({ success: false, message: "Hall ID is required" });
    if (!isValidId(hallId)) return res.status(400).json({ success: false, message: "Invalid hall ID" });
    if (!eventDate) return res.status(400).json({ success: false, message: "Event date is required" });
    if (!timeSlot || !VALID_SLOTS.includes(timeSlot))
      return res.status(400).json({ success: false, message: "Valid time slot is required (afternoon / evening / latenight)" });
    if (!guests || isNaN(guests) || Number(guests) < 1)
      return res.status(400).json({ success: false, message: "At least 1 guest is required" });

    // ── Date validation ─────────────────────────────────────────────────────
    const parsedDate = new Date(eventDate);
    if (isNaN(parsedDate.getTime())) return res.status(400).json({ success: false, message: "Invalid event date" });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (parsedDate < today) return res.status(400).json({ success: false, message: "Event date cannot be in the past" });

    // ── Hall exists + capacity check ────────────────────────────────────────
    const hall = await Hall.findById(hallId);
    if (!hall) return res.status(404).json({ success: false, message: "Hall not found" });

    if (Number(guests) > hall.totalSeats) {
      return res.status(400).json({
        success: false,
        message: `Guests (${guests}) exceed hall capacity of ${hall.totalSeats} seats`,
      });
    }

    // ── Slot availability ───────────────────────────────────────────────────
    const slotTaken = await Booking.findOne({
      hallId,
      eventDate: parsedDate,
      timeSlot,
      status: { $in: ["Pending", "Confirmed"] },
    });
    if (slotTaken) {
      return res.status(409).json({
        success: false,
        message: `The ${timeSlot} slot for this hall on that date is already booked`,
      });
    }

    // ── Auto-link userId by phone ────────────────────────────────────────────
    let resolvedUserId = req.body.userId || null;
    if (!resolvedUserId && clientPhone) {
      const matchedUser = await User.findOne({ phone: clientPhone.trim() }).catch(() => null);
      if (matchedUser) resolvedUserId = matchedUser._id;
    }

    const price      = totalPrice && !isNaN(totalPrice) ? Number(totalPrice) : hall.pricePerHead * Number(guests);
    const bookingRef = generateRef(clientName);

    const booking = await Booking.create({
      clientName:      clientName.trim(),
      clientPhone:     clientPhone.trim(),
      clientEmail:     clientEmail?.trim() || "",
      userId:          resolvedUserId,
      hallId, eventType: eventType || "Walima",
      eventDate:       parsedDate,
      timeSlot,
      guests:          Number(guests),
      totalPrice:      price,
      paymentMethod:   paymentMethod || "",
      transactionId:   transactionId || "",
      specialRequests: specialRequests || "",
      bookingRef,
      status: "Pending",
    });

    await booking.populate("hallId", "name location");

    const dateStr = parsedDate.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
    await sendSMS(clientPhone,
      `Noor Mahal: Booking request (Ref: ${bookingRef}) for ${hall.name} on ${dateStr} [${timeSlot}] received. You will be notified once confirmed.`
    );

    res.status(201).json({ success: true, message: "Booking created successfully", booking });
  } catch (error) {
    console.error("createBooking error:", error.message);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "This slot is already booked (duplicate prevented)" });
    }
    res.status(500).json({ success: false, message: "Could not create booking. Please try again." });
  }
};

// @route GET /api/bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("hallId", "name location pricePerHead")
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error("getBookings error:", error.message);
    res.status(500).json({ success: false, message: "Could not fetch bookings" });
  }
};

// @route GET /api/bookings/:id
exports.getBookingById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });
    const booking = await Booking.findById(req.params.id)
      .populate("hallId", "name location pricePerHead totalSeats")
      .populate("userId", "name email phone");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, booking });
  } catch (error) {
    console.error("getBookingById error:", error.message);
    res.status(500).json({ success: false, message: "Could not fetch booking" });
  }
};

// @route GET /api/bookings/:id/status
exports.getBookingStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });
    const booking = await Booking.findById(req.params.id).select("status bookingRef clientName");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, status: booking.status, bookingRef: booking.bookingRef });
  } catch (error) {
    console.error("getBookingStatus error:", error.message);
    res.status(500).json({ success: false, message: "Could not fetch status" });
  }
};

// @route PUT /api/bookings/:id
exports.updateBooking = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });

    const VALID_STATUSES = ["Pending", "Confirmed", "Cancelled"];
    if (req.body.status && !VALID_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const previous = await Booking.findById(req.params.id).populate("hallId", "name");
    if (!previous) return res.status(404).json({ success: false, message: "Booking not found" });

    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate("hallId", "name");

    // Send SMS only when status actually changes
    if (req.body.status && req.body.status !== previous.status) {
      const dateStr  = new Date(booking.eventDate).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
      const hallName = booking.hallId?.name || "the hall";

      if (req.body.status === "Confirmed") {
        await sendSMS(booking.clientPhone,
          `Noor Mahal: CONFIRMED! Booking (Ref: ${booking.bookingRef}) for ${hallName} on ${dateStr} [${booking.timeSlot}] confirmed. We look forward to serving you!`
        );
      } else if (req.body.status === "Cancelled") {
        await sendSMS(booking.clientPhone,
          `Noor Mahal: Booking (Ref: ${booking.bookingRef}) for ${hallName} on ${dateStr} has been cancelled. Contact us for more info.`
        );
      }
    }

    res.json({ success: true, message: "Booking updated", booking });
  } catch (error) {
    console.error("updateBooking error:", error.message);
    res.status(500).json({ success: false, message: "Could not update booking" });
  }
};

// @route DELETE /api/bookings/:id
exports.deleteBooking = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, message: "Booking deleted" });
  } catch (error) {
    console.error("deleteBooking error:", error.message);
    res.status(500).json({ success: false, message: "Could not delete booking" });
  }
};

// @route GET /api/bookings/slots/:hallId?date=YYYY-MM-DD
exports.getAvailableSlots = async (req, res) => {
  try {
    const { hallId } = req.params;
    const { date }   = req.query;

    if (!isValidId(hallId)) return res.status(400).json({ success: false, message: "Invalid hall ID" });

    if (date) {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) return res.status(400).json({ success: false, message: "Invalid date format" });

      const startOfDay = new Date(date); startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay   = new Date(date); endOfDay.setUTCHours(23, 59, 59, 999);

      const bookings = await Booking.find({
        hallId,
        eventDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ["Pending", "Confirmed"] },
      }).select("timeSlot");

      return res.json({ success: true, date, bookedSlots: bookings.map(b => b.timeSlot).filter(Boolean) });
    }

    // Without ?date → return fully booked dates (all 3 slots taken)
    const allBookings = await Booking.find({
      hallId,
      status: { $in: ["Pending", "Confirmed"] },
    }).select("eventDate timeSlot");

    const slotsByDate = {};
    allBookings.forEach(b => {
      const key = new Date(b.eventDate).toISOString().split("T")[0];
      if (!slotsByDate[key]) slotsByDate[key] = new Set();
      if (b.timeSlot) slotsByDate[key].add(b.timeSlot);
    });

    const fullyBookedDates = Object.keys(slotsByDate)
      .filter(d => slotsByDate[d].size >= 3)
      .map(d => ({ eventDate: d }));

    res.json({ success: true, bookedDates: fullyBookedDates });
  } catch (error) {
    console.error("getAvailableSlots error:", error.message);
    res.status(500).json({ success: false, message: "Could not fetch slot availability" });
  }
};

// @route GET /api/bookings/client/:phone
exports.getClientHistory = async (req, res) => {
  try {
    const rawPhone = decodeURIComponent(req.params.phone || "").trim();
    if (!rawPhone) return res.status(400).json({ success: false, message: "Phone number is required" });

    const bookings = await Booking.find({ clientPhone: rawPhone })
      .populate("hallId", "name location")
      .sort({ createdAt: -1 });

    if (!bookings.length) return res.json({ success: true, count: 0, bookings: [], summary: null });

    const confirmed = bookings.filter(b => b.status === "Confirmed");
    const summary = {
      clientName:    bookings[0].clientName,
      clientPhone:   rawPhone,
      clientEmail:   bookings[0].clientEmail || "",
      totalBookings: bookings.length,
      confirmed:     confirmed.length,
      pending:       bookings.filter(b => b.status === "Pending").length,
      cancelled:     bookings.filter(b => b.status === "Cancelled").length,
      totalSpend:    confirmed.reduce((s, b) => s + (b.totalPrice || 0), 0),
      firstBooking:  bookings[bookings.length - 1].createdAt,
      lastBooking:   bookings[0].createdAt,
    };

    res.json({ success: true, count: bookings.length, bookings, summary });
  } catch (error) {
    console.error("getClientHistory error:", error.message);
    res.status(500).json({ success: false, message: "Could not fetch client history" });
  }
};