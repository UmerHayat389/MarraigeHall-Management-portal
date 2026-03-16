const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingRef: {
    type: String,
    required: true,
    unique: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  clientPhone: {
    type: String,
    required: true,
    trim: true
  },
  clientEmail: {
    type: String,
    trim: true
  },
  hallId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hall',
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true,
    enum: ['afternoon', 'evening', 'latenight']
  },
  eventType: {
    type: String,
    required: true
  },
  guests: {
    type: Number,
    required: true,
    min: 1
  },
  paymentMethod: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  specialRequests: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Pending'
  },
  // Array of selected dish IDs
  selectedDishes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish'
  }],

  // "our-menu" | "self-catering" | "" (empty = old booking, not specified)
  cateringOption: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Prevent OverwriteModelError when both Booking.js and Booking_model.js are loaded
module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);