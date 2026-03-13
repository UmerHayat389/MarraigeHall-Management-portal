const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    clientName:      { type: String, required: true, trim: true },
    clientPhone:     { type: String, required: true },
    clientEmail:     { type: String, default: "" },
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    hallId:          { type: mongoose.Schema.Types.ObjectId, ref: "Hall", required: true },
    eventType:       { type: String, default: "Walima" },
    eventDate:       { type: Date, required: true },

    // NEW: which time slot is booked — morning / afternoon / evening
    timeSlot: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
      required: true,
    },

    guests:          { type: Number, required: true, min: 1 },
    totalPrice:      { type: Number, required: true },

    paymentMethod:   { type: String, default: "" },
    transactionId:   { type: String, default: "" },
    specialRequests: { type: String, default: "" },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Compound index — prevents duplicate hall+date+slot bookings at DB level
bookingSchema.index(
  { hallId: 1, eventDate: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ["Pending", "Confirmed"] } } }
);

module.exports = mongoose.model("Booking", bookingSchema);