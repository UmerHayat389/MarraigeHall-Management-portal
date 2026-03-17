const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: "",
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["manager", "waiter", "chef", "security", "cleaner", "decorator"],
      default: "waiter",
    },
    salary: {
      type: Number,
      default: 0,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── FIX: image field was missing — MongoDB was silently discarding it ──────
    // Stores either a URL string (https://...) or a base64 data URI (data:image/...)
    image: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

// ── FIX: use async/await — old callback style crashes Mongoose 6+ ─────────────
employeeSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("Employee", employeeSchema);