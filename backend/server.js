const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

connectDB();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.CLIENT_URL,
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/api/auth",      require("./routes/authRoutes"));
app.use("/api/bookings",  require("./routes/bookingRoutes"));
app.use("/api/halls",     require("./routes/hallRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Marriage Hall Management System API is running",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend  -> http://localhost:${PORT}`);
  console.log(`Frontend -> http://localhost:5173`);
});