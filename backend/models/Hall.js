const mongoose = require("mongoose");

const hallSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    location:     { type: String, default: "Karachi" },
    pricePerHead: { type: Number, required: true },
    totalSeats:   { type: Number, required: true },
    description:  { type: String, default: "" },

    // NEW: array of event types this hall supports e.g. ["Walima","Barat","Nikkah"]
    functions: {
      type: [String],
      default: ["Walima", "Barat", "Nikkah", "Birthday", "Conference"],
    },

    // NEW: image URL for the hall card
    image: { type: String, default: "" },

    // NEW: optional capacity label override e.g. "Up to 800 guests"
    capacityLabel: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hall", hallSchema);