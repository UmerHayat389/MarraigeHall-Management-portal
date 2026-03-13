const Booking = require("../models/Booking");
const Hall = require("../models/Hall");

// Valid time slot IDs — must match frontend ALL_TIME_SLOTS ids
const VALID_SLOTS = ["morning", "afternoon", "evening"];

// @desc  Create a new booking
// @route POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const {
      clientName, clientPhone, clientEmail,
      hallId, eventType, eventDate,
      timeSlot,                          // NEW
      guests, paymentMethod, transactionId,
      specialRequests, totalPrice,
    } = req.body;

    // Validate required fields
    if (!clientName || !clientPhone || !hallId || !eventDate) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Validate time slot
    if (!timeSlot || !VALID_SLOTS.includes(timeSlot)) {
      return res.status(400).json({ success: false, message: "Please select a valid time slot (morning / afternoon / evening)" });
    }

    // Check hall exists
    const hall = await Hall.findById(hallId);
    if (!hall) {
      return res.status(404).json({ success: false, message: "Hall not found" });
    }

    // Check if this specific hall + date + timeSlot is already booked
    // (allows multiple bookings on same date as long as time slots differ)
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

    // Use provided totalPrice (already calculated on frontend) or recalculate
    const price = totalPrice || hall.pricePerHead * guests;

    const booking = await Booking.create({
      clientName, clientPhone, clientEmail,
      userId: req.body.userId || null,
      hallId, eventType, eventDate,
      timeSlot,                          // NEW — save the slot
      guests,
      totalPrice: price,
      paymentMethod, transactionId, specialRequests,
    });

    await booking.populate("hallId", "name location");

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

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update booking status
// @route PUT /api/bookings/:id
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
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
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.json({ success: true, message: "Booking deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get booked slots for a hall
//        Without ?date  → returns all booked dates (used to mark calendar dates)
//        With    ?date  → returns booked TIME SLOTS for that specific date
// @route GET /api/bookings/slots/:hallId
// @route GET /api/bookings/slots/:hallId?date=YYYY-MM-DD
exports.getAvailableSlots = async (req, res) => {
  try {
    const { hallId } = req.params;
    const { date } = req.query;   // optional

    if (date) {
      // ── Return which time slots are booked on this specific date ──
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const bookings = await Booking.find({
        hallId,
        eventDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ["Pending", "Confirmed"] },
      }).select("timeSlot");

      const bookedSlots = bookings.map((b) => b.timeSlot).filter(Boolean);

      return res.json({ success: true, date, bookedSlots });
    }

    // ── No date param → return all booked dates (for calendar display) ──
    const bookedDates = await Booking.find({
      hallId,
      status: { $in: ["Pending", "Confirmed"] },
    }).select("eventDate eventType clientName timeSlot");

    res.json({ success: true, bookedDates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};