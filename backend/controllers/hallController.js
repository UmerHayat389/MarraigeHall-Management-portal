const Hall = require("../models/Hall");

// @desc  Get all halls
// @route GET /api/halls
exports.getHalls = async (req, res) => {
  try {
    const halls = await Hall.find().sort({ createdAt: -1 });
    res.json({ success: true, count: halls.length, halls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single hall
// @route GET /api/halls/:id
exports.getHallById = async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id);
    if (!hall) {
      return res.status(404).json({ success: false, message: "Hall not found" });
    }
    res.json({ success: true, hall });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Add hall
// @route POST /api/halls
exports.addHall = async (req, res) => {
  try {
    const hall = await Hall.create(req.body);
    res.status(201).json({ success: true, message: "Hall added successfully", hall });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update hall
// @route PUT /api/halls/:id
exports.updateHall = async (req, res) => {
  try {
    const hall = await Hall.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!hall) {
      return res.status(404).json({ success: false, message: "Hall not found" });
    }
    res.json({ success: true, message: "Hall updated", hall });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete hall
// @route DELETE /api/halls/:id
exports.deleteHall = async (req, res) => {
  try {
    const hall = await Hall.findByIdAndDelete(req.params.id);
    if (!hall) {
      return res.status(404).json({ success: false, message: "Hall not found" });
    }
    res.json({ success: true, message: "Hall deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};