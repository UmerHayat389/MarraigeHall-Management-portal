const Hall     = require("../models/Hall");
const Booking  = require("../models/Booking");
const mongoose = require("mongoose");

// @route GET /api/halls
exports.getHalls = async (req, res) => {
  try {
    const halls = await Hall.find().sort({ createdAt: -1 });
    res.json({ success: true, count: halls.length, halls });
  } catch (error) {
    console.error("getHalls error:", error.message);
    res.status(500).json({ success: false, message: "Could not fetch halls" });
  }
};

// @route GET /api/halls/:id
exports.getHallById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid hall ID" });
    }
    const hall = await Hall.findById(req.params.id);
    if (!hall) return res.status(404).json({ success: false, message: "Hall not found" });
    res.json({ success: true, hall });
  } catch (error) {
    console.error("getHallById error:", error.message);
    res.status(500).json({ success: false, message: "Could not fetch hall" });
  }
};

// @route POST /api/halls
exports.addHall = async (req, res) => {
  try {
    const { name, pricePerHead, totalSeats } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Hall name is required" });
    if (!pricePerHead || isNaN(pricePerHead) || Number(pricePerHead) <= 0)
      return res.status(400).json({ success: false, message: "Valid price per head is required" });
    if (!totalSeats || isNaN(totalSeats) || Number(totalSeats) <= 0)
      return res.status(400).json({ success: false, message: "Valid total seats are required" });

    const hall = await Hall.create({
      ...req.body,
      name: name.trim(),
      pricePerHead: Number(pricePerHead),
      totalSeats: Number(totalSeats),
    });
    res.status(201).json({ success: true, message: "Hall added successfully", hall });
  } catch (error) {
    console.error("addHall error:", error.message);
    if (error.code === 11000) return res.status(400).json({ success: false, message: "A hall with this name already exists" });
    res.status(500).json({ success: false, message: "Could not add hall" });
  }
};

// @route PUT /api/halls/:id
exports.updateHall = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid hall ID" });
    }
    if (req.body.pricePerHead !== undefined && (isNaN(req.body.pricePerHead) || Number(req.body.pricePerHead) <= 0))
      return res.status(400).json({ success: false, message: "Valid price per head is required" });
    if (req.body.totalSeats !== undefined && (isNaN(req.body.totalSeats) || Number(req.body.totalSeats) <= 0))
      return res.status(400).json({ success: false, message: "Valid total seats are required" });

    const hall = await Hall.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hall) return res.status(404).json({ success: false, message: "Hall not found" });
    res.json({ success: true, message: "Hall updated", hall });
  } catch (error) {
    console.error("updateHall error:", error.message);
    res.status(500).json({ success: false, message: "Could not update hall" });
  }
};

// @route DELETE /api/halls/:id
exports.deleteHall = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid hall ID" });
    }
    // Block deletion if active bookings exist
    const activeBookings = await Booking.countDocuments({
      hallId: req.params.id,
      status: { $in: ["Pending", "Confirmed"] },
    });
    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete — ${activeBookings} active booking(s) exist for this hall`,
      });
    }
    const hall = await Hall.findByIdAndDelete(req.params.id);
    if (!hall) return res.status(404).json({ success: false, message: "Hall not found" });
    res.json({ success: true, message: "Hall deleted" });
  } catch (error) {
    console.error("deleteHall error:", error.message);
    res.status(500).json({ success: false, message: "Could not delete hall" });
  }
};