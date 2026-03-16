/**
 * ONE-TIME FIX SCRIPT
 * Run from your backend/models folder: node fixDishes.js
 *
 * What it does:
 * - Finds all bookings where selectedDishes is empty but cateringOption is "our-menu"
 * - Prints them so you can see which ones need fixing
 * - Does NOT auto-assign dishes (we don't know what the user picked)
 * - Instead marks them as "our-menu / not recorded" so they show correctly
 *
 * For bookings where you KNOW what dishes were selected,
 * pass them as command line args: node fixDishes.js <bookingRef> <dishName1> <dishName2>
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DB_URI;

if (!MONGO_URI) {
  console.error("❌  No MongoDB URI found in .env (tried MONGO_URI, MONGODB_URI, DB_URI)");
  process.exit(1);
}

// Minimal schemas — no need to import full models
const Booking = mongoose.model("Booking", new mongoose.Schema({
  bookingRef:     String,
  clientName:     String,
  cateringOption: String,
  selectedDishes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dish" }],
  eventDate:      Date,
  status:         String,
}, { strict: false }));

const Dish = mongoose.model("Dish", new mongoose.Schema({
  name:     String,
  category: String,
}, { strict: false }));

async function run() {
  const maskedURI = MONGO_URI.replace(/:([^:@]+)@/, ":****@");
  console.log("Connecting to:", maskedURI);
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // Force IPv4 — fixes SRV hostname resolution issues
  });
  console.log("✅  Connected to MongoDB\n");

  const args = process.argv.slice(2);

  // ── Mode 1: Fix a specific booking by ref + dish names ──────────────────
  if (args.length >= 2) {
    const [ref, ...dishNames] = args;
    const booking = await Booking.findOne({ bookingRef: ref.toUpperCase() });
    if (!booking) { console.error(`❌  Booking ${ref} not found`); process.exit(1); }

    const dishes = await Dish.find({ name: { $in: dishNames } });
    if (dishes.length === 0) {
      console.error(`❌  No dishes found matching: ${dishNames.join(", ")}`);
      const allDishes = await Dish.find({}, "name category");
      console.log("\nAvailable dishes:");
      allDishes.forEach(d => console.log(`  - ${d.name} (${d.category})`));
      process.exit(1);
    }

    await Booking.updateOne(
      { _id: booking._id },
      { $set: { selectedDishes: dishes.map(d => d._id), cateringOption: "our-menu" } }
    );
    console.log(`✅  Fixed booking ${ref}:`);
    dishes.forEach(d => console.log(`   • ${d.name} (${d.category})`));
    await mongoose.disconnect();
    return;
  }

  // ── Mode 2: List all broken bookings ────────────────────────────────────
  const broken = await Booking.find({
    cateringOption: "our-menu",
    $or: [
      { selectedDishes: { $size: 0 } },
      { selectedDishes: { $exists: false } },
    ],
  }).sort({ createdAt: -1 });

  const alsoCheck = await Booking.find({
    cateringOption: { $in: ["", null] },
    selectedDishes: { $size: 0 },
    status: { $in: ["Pending", "Confirmed"] },
  }).sort({ createdAt: -1 });

  console.log(`Found ${broken.length} booking(s) with cateringOption="our-menu" but no dishes saved:`);
  broken.forEach(b => {
    console.log(`  📋 ${b.bookingRef} | ${b.clientName} | ${new Date(b.eventDate).toLocaleDateString()} | ${b.status}`);
  });

  console.log(`\nFound ${alsoCheck.length} booking(s) with empty dishes and no cateringOption (old bookings):`);
  alsoCheck.forEach(b => {
    console.log(`  📋 ${b.bookingRef} | ${b.clientName} | ${new Date(b.eventDate).toLocaleDateString()} | ${b.status}`);
  });

  const allDishes = await Dish.find({}, "name category").sort({ category: 1, name: 1 });
  console.log(`\nAvailable dishes in your menu (${allDishes.length} total):`);
  const grouped = {};
  allDishes.forEach(d => {
    if (!grouped[d.category]) grouped[d.category] = [];
    grouped[d.category].push(d.name);
  });
  Object.entries(grouped).forEach(([cat, names]) => {
    console.log(`  ${cat}:`);
    names.forEach(n => console.log(`    - ${n}`));
  });

  console.log(`\n── HOW TO FIX ──────────────────────────────────────────────────────`);
  console.log(`To assign dishes to a specific booking, run:`);
  console.log(`  node fixDishes.js <BOOKING_REF> "<Dish Name 1>" "<Dish Name 2>"\n`);
  console.log(`Example:`);
  if (broken.length > 0 || alsoCheck.length > 0) {
    const sample = broken[0] || alsoCheck[0];
    const sampleDish = allDishes[0]?.name || "Paneer Tikka";
    console.log(`  node fixDishes.js ${sample.bookingRef} "${sampleDish}"`);
  }
  console.log(`\nDish names must match exactly (copy from the list above).`);

  await mongoose.disconnect();
}

run().catch(err => { console.error("❌ Error:", err.message); process.exit(1); });