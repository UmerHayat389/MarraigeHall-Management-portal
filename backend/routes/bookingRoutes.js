const express = require("express");
const router  = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  getBookingByRef,
  getBookingStatus,
  getClientHistory,
  updateBooking,
  deleteBooking,
  getAvailableSlots,
} = require("../controllers/bookingController");

// IMPORTANT: specific routes must come before /:id
router.get("/slots/:hallId",   getAvailableSlots);   // GET /api/bookings/slots/:hallId
router.get("/client/:phone",   getClientHistory);    // GET /api/bookings/client/:phone
router.get("/ref/:bookingRef", getBookingByRef);     // GET /api/bookings/ref/:bookingRef
router.get("/",                getBookings);
router.post("/",               createBooking);
router.get("/:id/status",      getBookingStatus);    // GET /api/bookings/:id/status
router.get("/:id",             getBookingById);
router.put("/:id",             updateBooking);
router.delete("/:id",          deleteBooking);

module.exports = router;