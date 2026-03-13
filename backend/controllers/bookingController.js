const Booking = require("../models/Booking");

exports.createBooking = async (req, res) => {
  const booking = new Booking(req.body);
  await booking.save();
  res.json(booking);
};

exports.getBookings = async (req, res) => {
  const bookings = await Booking.find();
  res.json(bookings);
};