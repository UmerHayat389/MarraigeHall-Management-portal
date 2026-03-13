const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  hallId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hall"
  },

  eventDate: Date,

  guests: Number,

  totalPrice: Number,

  status: {
    type: String,
    default: "Pending"
  }
});

module.exports = mongoose.model("Booking", bookingSchema);