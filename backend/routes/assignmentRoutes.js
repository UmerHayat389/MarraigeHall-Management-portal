const express = require("express");
const router  = express.Router();
const {
  getAssignments,
  assignStaff,
  removeStaff,
  getEmployeeSchedule,
} = require("../controllers/assignmentController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect, adminOnly);

// GET  /api/assignments                          — all bookings + employees
router.get("/",                              getAssignments);

// POST /api/assignments/:bookingId/assign        — assign employee to booking
router.post("/:bookingId/assign",            assignStaff);

// DELETE /api/assignments/:bookingId/assign/:employeeId — remove employee
router.delete("/:bookingId/assign/:employeeId", removeStaff);

// GET  /api/assignments/employee/:employeeId     — one employee's schedule
router.get("/employee/:employeeId",          getEmployeeSchedule);

module.exports = router;