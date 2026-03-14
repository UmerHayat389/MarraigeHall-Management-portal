const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// ── Protect — verifies JWT, attaches req.user ────────────────────────────────
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorised — no token" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("FATAL: JWT_SECRET env var is not set");
      return res.status(500).json({ success: false, message: "Server configuration error" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.name === "TokenExpiredError" ? "Token expired — please log in again" : "Invalid token",
      });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(500).json({ success: false, message: "Authentication error" });
  }
};

// ── Admin only ────────────────────────────────────────────────────────────────
exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied — admin only" });
  }
  next();
};