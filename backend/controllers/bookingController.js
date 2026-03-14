const Booking = require("../models/Booking");
const Hall    = require("../models/Hall");

// ── Twilio SMS (optional — only sends if env vars are set) ──────────────────
const sendSMS = async (to, body) => {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_PHONE;          // e.g. +12015551234
  if (!sid || !token || !from) return;              // skip silently if not configured

  try {
    const twilio = require("twilio")(sid, token);
    await twilio.messages.create({ to, from, body });
  } catch (err) {
    console.error("SMS error:", err.message);       // log but don't crash
  }
};

// ── Generate human-readable booking reference ───────────────────────────────
// Format: NM-<NAME3>-<RAND4>  e.g. NM-UME-A3X9
const generateRef = (clientName) => {
  const namePart = (clientName || "GUE")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 4);
  const rand = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
  return `NM-${namePart}-${rand}`;
};

const VALID_SLOTS = ["morning", "afternoon", "evening"];

// @desc  Create a new booking
// @route POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const {
      clientName, clientPhone, clientEmail,
      hallId, eventType, eventDate,
      timeSlot,
      guests, paymentMethod, transactionId,
      specialRequests, totalPrice,
    } = req.body;

    if (!clientName || !clientPhone || !hallId || !eventDate) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    if (!timeSlot || !VALID_SLOTS.includes(timeSlot)) {
      return res.status(400).json({ success: false, message: "Please select a valid time slot" });
    }

    const hall = await Hall.findById(hallId);
    if (!hall) return res.status(404).json({ success: false, message: "Hall not found" });

    const existing = await Booking.findOne({
      hallId,
      eventDate: new Date(eventDate),
      timeSlot,
      status: { $in: ["Pending", "Confirmed"] },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `This hall is already booked for the ${timeSlot} slot on that date`,
      });
    }

    const price      = totalPrice || hall.pricePerHead * guests;
    const bookingRef = generateRef(clientName);

    const booking = await Booking.create({
      clientName, clientPhone, clientEmail,
      userId: req.body.userId || null,
      hallId, eventType, eventDate, timeSlot,
      guests, totalPrice: price,
      paymentMethod, transactionId, specialRequests,
      bookingRef,
      status: "Pending",
    });

    await booking.populate("hallId", "name location");

    // SMS to client: booking received, pending approval
    const dateStr = new Date(eventDate).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
    await sendSMS(
      clientPhone,
      `Noor Mahal: Your booking request (Ref: ${bookingRef}) for ${hall.name} on ${dateStr} [${timeSlot}] has been received. You will be notified once the manager confirms it.`
    );

    res.status(201).json({ success: true, message: "Booking created successfully", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all bookings
// @route GET /api/bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("hallId", "name location pricePerHead")
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single booking
// @route GET /api/bookings/:id
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("hallId", "name location pricePerHead totalSeats")
      .populate("userId", "name email phone");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get booking status by ID (used by frontend polling)
// @route GET /api/bookings/:id/status
exports.getBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .select("status bookingRef clientName")
      .populate("hallId", "name");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, status: booking.status, bookingRef: booking.bookingRef });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update booking status — sends SMS when Confirmed or Cancelled
// @route PUT /api/bookings/:id
exports.updateBooking = async (req, res) => {
  try {
    const previous = await Booking.findById(req.params.id).populate("hallId", "name");
    const booking  = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate("hallId", "name");

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    // Send SMS only when status actually changes
    if (req.body.status && previous && req.body.status !== previous.status) {
      const dateStr = new Date(booking.eventDate).toLocaleDateString("en-PK", {
        day: "numeric", month: "short", year: "numeric",
      });
      const hallName = booking.hallId?.name || "the hall";

      if (req.body.status === "Confirmed") {
        await sendSMS(
          booking.clientPhone,
          `Noor Mahal: CONFIRMED! Your booking (Ref: ${booking.bookingRef}) for ${hallName} on ${dateStr} [${booking.timeSlot}] has been confirmed by our manager. We look forward to serving you!`
        );
      } else if (req.body.status === "Cancelled") {
        await sendSMS(
          booking.clientPhone,
          `Noor Mahal: Your booking (Ref: ${booking.bookingRef}) for ${hallName} on ${dateStr} has been cancelled. Please contact us for more info.`
        );
      }
    }

    res.json({ success: true, message: "Booking updated", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete booking
// @route DELETE /api/bookings/:id
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, message: "Booking deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get booked slots for a hall
// @route GET /api/bookings/slots/:hallId?date=YYYY-MM-DD
exports.getAvailableSlots = async (req, res) => {
  try {
    const { hallId } = req.params;
    const { date }   = req.query;
    const TOTAL_SLOTS = 3; // morning, afternoon, evening

    // With ?date= -> return booked slots for that specific day
    if (date) {
      const startOfDay = new Date(date); startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay   = new Date(date); endOfDay.setUTCHours(23, 59, 59, 999);
      const bookings   = await Booking.find({
        hallId,
        eventDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ["Pending", "Confirmed"] },
      }).select("timeSlot");
      return res.json({ success: true, date, bookedSlots: bookings.map((b) => b.timeSlot).filter(Boolean) });
    }

    // Without ?date -> return only FULLY booked dates (all 3 slots taken)
    const allBookings = await Booking.find({
      hallId,
      status: { $in: ["Pending", "Confirmed"] },
    }).select("eventDate timeSlot");

    // Count distinct booked slots per date
    const slotsByDate = {};
    allBookings.forEach((b) => {
      const dateKey = new Date(b.eventDate).toISOString().split("T")[0];
      if (!slotsByDate[dateKey]) slotsByDate[dateKey] = new Set();
      if (b.timeSlot) slotsByDate[dateKey].add(b.timeSlot);
    });

    // Only return dates where all 3 slots are booked
    const fullyBookedDates = Object.keys(slotsByDate)
      .filter((d) => slotsByDate[d].size >= TOTAL_SLOTS)
      .map((d) => ({ eventDate: d }));

    res.json({ success: true, bookedDates: fullyBookedDates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};