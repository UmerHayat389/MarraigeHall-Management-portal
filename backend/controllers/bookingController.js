const Booking = require("../models/Booking");
const Hall = require("../models/Hall");

// @desc  Create a new booking
// @route POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const {
      clientName, clientPhone, clientEmail,
      hallId, eventType, eventDate,
      guests, paymentMethod, transactionId, specialRequests
    } = req.body;

    // Check hall exists
    const hall = await Hall.findById(hallId);
    if (!hall) {
      return res.status(404).json({ success: false, message: "Hall not found" });
    }

    // Check if date is already booked
    const existing = await Booking.findOne({
      hallId,
      eventDate: new Date(eventDate),
      status: { $in: ["Pending", "Confirmed"] },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "This hall is already booked on that date" });
    }

    // Calculate price
    const totalPrice = hall.pricePerHead * guests;

    const booking = await Booking.create({
      clientName, clientPhone, clientEmail,
      userId: req.body.userId || null,
      hallId, eventType, eventDate,
      guests, totalPrice,
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

// @desc  Get available slots (dates not booked) for a hall
// @route GET /api/bookings/slots/:hallId
exports.getAvailableSlots = async (req, res) => {
  try {
    const bookedDates = await Booking.find({
      hallId: req.params.hallId,
      status: { $in: ["Pending", "Confirmed"] },
    }).select("eventDate eventType clientName");

    res.json({ success: true, bookedDates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};