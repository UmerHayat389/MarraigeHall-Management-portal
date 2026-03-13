// backend/seed.js
// Run once: node seed.js

require("dotenv").config();
const mongoose = require("mongoose");
const User     = require("./models/User");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Delete any existing to start clean
    await User.deleteOne({ email: "umer@gmail.com" });

    // Use new + save so the model's pre('save') hook hashes the password
    const user = new User({
      name:     "Umer Admin",
      email:    "umer@gmail.com",
      password: "umer12",
      phone:    "+92 300 0000000",
      role:     "admin",
    });

    await user.save();

    console.log("✅ Admin user created successfully!");
    console.log("   Email:    umer@gmail.com");
    console.log("   Password: umer12");
    console.log("   Role:     admin");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();