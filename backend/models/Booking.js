const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    clientPhone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    clientEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    hallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hall",
      required: [true, "Hall is required"],
    },
    eventType: {
      type: String,
      enum: ["Nikkah", "Walima", "Birthday", "Conference", "Anniversary", "Other"],
      default: "Walima",
    },
    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
    },
    guests: {
      type: Number,
      required: [true, "Number of guests is required"],
      min: 1,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["JazzCash", "EasyPaisa", "Card", "Bank Transfer", "Cash", "Crypto"],
      default: "Cash",
    },
    transactionId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Pending",
    },
    specialRequests: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);