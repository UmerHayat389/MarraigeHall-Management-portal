/**
 * TEMPORARY FIX ROUTE
 * 
 * Add this to your backend routes temporarily:
 * 
 * In your main server.js / app.js, add:
 *   app.use("/api/fix", require("./routes/fixDishesRoute"));
 * 
 * Then visit these URLs in your browser:
 * 
 * 1. See all broken bookings:
 *    GET http://localhost:5000/api/fix/dishes
 *
 * 2. Fix a specific booking:
 *    GET http://localhost:5000/api/fix/dishes/NM-UMER-96/Paneer%20Tikka
 *
 * 3. Fix with multiple dishes:
 *    GET http://localhost:5000/api/fix/dishes/NM-UMER-96/Paneer%20Tikka,Biryani
 *
 * IMPORTANT: Remove this route from server.js after you're done!
 */

const express  = require("express");
const router   = express.Router();
const Booking  = require("../models/Booking");
const Dish     = require("../models/Dish.model");

// GET /api/fix/dishes — list all broken bookings
router.get("/dishes", async (req, res) => {
  try {
    const broken = await Booking.find({
      $or: [
        { cateringOption: "our-menu",  selectedDishes: { $size: 0 } },
        { cateringOption: "",          selectedDishes: { $size: 0 }, status: { $in: ["Pending","Confirmed"] } },
        { cateringOption: { $exists: false }, selectedDishes: { $size: 0 }, status: { $in: ["Pending","Confirmed"] } },
      ]
    }).select("bookingRef clientName cateringOption selectedDishes eventDate status").lean();

    const allDishes = await Dish.find({}).select("name category").sort({ category:1, name:1 }).lean();

    res.json({
      message: "Broken bookings (selectedDishes empty)",
      count: broken.length,
      bookings: broken.map(b => ({
        bookingRef: b.bookingRef,
        clientName: b.clientName,
        status: b.status,
        cateringOption: b.cateringOption || "(empty)",
        eventDate: new Date(b.eventDate).toLocaleDateString(),
        fixUrl: `http://localhost:5000/api/fix/dishes/${b.bookingRef}/DISH_NAME_HERE`,
      })),
      availableDishes: allDishes,
      instructions: "Copy a bookingRef and replace DISH_NAME_HERE with dish name(s) comma-separated",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/fix/dishes/:ref/:dishes — fix a specific booking
router.get("/dishes/:ref/:dishes", async (req, res) => {
  try {
    const ref       = req.params.ref.toUpperCase();
    const dishNames = req.params.dishes.split(",").map(d => d.trim());

    const booking = await Booking.findOne({ bookingRef: ref });
    if (!booking) return res.status(404).json({ error: `Booking ${ref} not found` });

    const dishes = await Dish.find({ name: { $in: dishNames } });
    if (dishes.length === 0) {
      const all = await Dish.find({}).select("name").lean();
      return res.status(404).json({
        error: `No dishes found matching: ${dishNames.join(", ")}`,
        available: all.map(d => d.name),
      });
    }

    await Booking.updateOne(
      { _id: booking._id },
      { $set: { selectedDishes: dishes.map(d => d._id), cateringOption: "our-menu" } }
    );

    res.json({
      success: true,
      message: `✅ Fixed booking ${ref}`,
      booking: {
        bookingRef: ref,
        clientName: booking.clientName,
      },
      dishesSet: dishes.map(d => ({ name: d.name, category: d.category })),
      notFound: dishNames.filter(n => !dishes.find(d => d.name === n)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;