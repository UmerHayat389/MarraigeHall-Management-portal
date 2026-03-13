const mongoose = require("mongoose");

const hallSchema = new mongoose.Schema({
  name: String,
  location: String,
  pricePerHead: Number,
  totalSeats: Number,
  description: String
});

module.exports = mongoose.model("Hall", hallSchema);