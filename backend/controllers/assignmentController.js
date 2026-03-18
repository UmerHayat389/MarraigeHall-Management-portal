const Booking  = require("../models/Booking");
const Employee = require("../models/Employee");
const mongoose = require("mongoose");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ── Which roles are relevant depending on catering option ─────────────────────
// self-catering → no chefs needed
// our-menu      → chefs included
// always needed → manager, waiter, security, decorator, cleaner
const ROLES_ALWAYS   = ["manager", "waiter", "security", "decorator", "cleaner"];
const ROLES_WITH_CHEF = [...ROLES_ALWAYS, "chef"];

const relevantRoles = (cateringOption) =>
  cateringOption === "self-catering" ? ROLES_ALWAYS : ROLES_WITH_CHEF;

// ─────────────────────────────────────────────────────────────────────────────
// @route  GET /api/assignments
// @desc   All confirmed bookings with their assigned staff + available staff
// @access Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
exports.getAssignments = async (req, res) => {
  try {
    // Only show confirmed (or pending) bookings — no point assigning to cancelled
    const bookings = await Booking.find({ status: { $in: ["Pending", "Confirmed"] } })
      .populate("hallId",    "name location")
      .populate("assignedStaff.employeeId", "name role image isActive phone")
      .sort({ eventDate: 1 })
      .lean();

    const employees = await Employee.find({ isActive: true })
      .select("name role image phone isActive")
      .sort({ role: 1, name: 1 })
      .lean();

    res.json({ success: true, bookings, employees });
  } catch (error) {
    console.error("getAssignments error:", error.message);
    res.status(500).json({ success: false, message: "Could not fetch assignments" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route  POST /api/assignments/:bookingId/assign
// @desc   Assign one employee to a booking
// @body   { employeeId, note? }
// @access Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
exports.assignStaff = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { employeeId, note } = req.body;

    if (!isValidId(bookingId))  return res.status(400).json({ success: false, message: "Invalid booking ID" });
    if (!isValidId(employeeId)) return res.status(400).json({ success: false, message: "Invalid employee ID" });

    const booking  = await Booking.findById(bookingId);
    if (!booking)  return res.status(404).json({ success: false, message: "Booking not found" });

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
    if (!employee.isActive) return res.status(400).json({ success: false, message: "Employee is inactive" });

    // Prevent duplicate assignment of the same employee to the same booking
    const alreadyAssigned = booking.assignedStaff.some(
      a => a.employeeId.toString() === employeeId
    );
    if (alreadyAssigned) {
      return res.status(400).json({ success: false, message: `${employee.name} is already assigned to this booking` });
    }

    // Check if employee is already assigned to another booking on the same date+slot
    const conflict = await Booking.findOne({
      _id:        { $ne: bookingId },
      eventDate:  booking.eventDate,
      timeSlot:   booking.timeSlot,
      status:     { $in: ["Pending", "Confirmed"] },
      "assignedStaff.employeeId": new mongoose.Types.ObjectId(employeeId),
    });
    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `${employee.name} is already assigned to booking ${conflict.bookingRef} on the same date & slot`,
      });
    }

    booking.assignedStaff.push({
      employeeId,
      role:       employee.role,
      assignedAt: new Date(),
      note:       note?.trim() || "",
    });

    await booking.save();
    await booking.populate("assignedStaff.employeeId", "name role image isActive phone");

    res.json({ success: true, message: `${employee.name} assigned successfully`, booking });
  } catch (error) {
    console.error("assignStaff error:", error.message);
    res.status(500).json({ success: false, message: "Could not assign staff" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route  DELETE /api/assignments/:bookingId/assign/:employeeId
// @desc   Remove one employee from a booking
// @access Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
exports.removeStaff = async (req, res) => {
  try {
    const { bookingId, employeeId } = req.params;

    if (!isValidId(bookingId))  return res.status(400).json({ success: false, message: "Invalid booking ID" });
    if (!isValidId(employeeId)) return res.status(400).json({ success: false, message: "Invalid employee ID" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    const before = booking.assignedStaff.length;
    booking.assignedStaff = booking.assignedStaff.filter(
      a => a.employeeId.toString() !== employeeId
    );

    if (booking.assignedStaff.length === before) {
      return res.status(404).json({ success: false, message: "Employee not found in this booking's staff" });
    }

    await booking.save();
    await booking.populate("assignedStaff.employeeId", "name role image isActive phone");

    res.json({ success: true, message: "Staff removed from booking", booking });
  } catch (error) {
    console.error("removeStaff error:", error.message);
    res.status(500).json({ success: false, message: "Could not remove staff" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route  GET /api/assignments/employee/:employeeId
// @desc   All bookings a specific employee is assigned to
// @access Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
exports.getEmployeeSchedule = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!isValidId(employeeId)) return res.status(400).json({ success: false, message: "Invalid employee ID" });

    const bookings = await Booking.find({
      "assignedStaff.employeeId": new mongoose.Types.ObjectId(employeeId),
      status: { $in: ["Pending", "Confirmed"] },
    })
      .populate("hallId", "name location")
      .sort({ eventDate: 1 })
      .lean();

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error("getEmployeeSchedule error:", error.message);
    res.status(500).json({ success: false, message: "Could not fetch schedule" });
  }
};

// Export relevantRoles helper for use in frontend hint
exports.relevantRoles = relevantRoles;