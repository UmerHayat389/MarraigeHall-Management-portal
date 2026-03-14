const express = require("express");
const router  = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  getBookingStatus,
  updateBooking,
  deleteBooking,
  getAvailableSlots,
} = require("../controllers/bookingController");

router.get("/slots/:hallId", getAvailableSlots);   // must be before /:id
router.get("/",              getBookings);
router.post("/",             createBooking);
router.get("/:id/status",    getBookingStatus);    // NEW — polling endpoint
router.get("/:id",           getBookingById);
router.put("/:id",           updateBooking);
router.delete("/:id",        deleteBooking);

module.exports = router;