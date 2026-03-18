const express = require("express");
const router  = express.Router();
const { getDailyRevenue, getMonthlyRevenue, getRevenueSummary } = require("../controllers/revenueController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// All revenue routes are admin-only
router.use(protect, adminOnly);

// GET /api/revenue/summary  — today / week / month / all-time totals
router.get("/summary", getRevenueSummary);

// GET /api/revenue/daily?from=YYYY-MM-DD&to=YYYY-MM-DD&hallId=...
router.get("/daily",   getDailyRevenue);

// GET /api/revenue/monthly?year=2025&hallId=...
// GET /api/revenue/monthly?from=YYYY-MM-DD&to=YYYY-MM-DD&hallId=...
router.get("/monthly", getMonthlyRevenue);

module.exports = router;