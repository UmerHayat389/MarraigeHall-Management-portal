const Booking  = require("../models/Booking");
const mongoose = require("mongoose");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ── Build $match — supports grouping by eventDate OR createdAt ────────────────
const buildMatch = (from, to, hallId, dateField = "eventDate") => {
  const match = {
    status:          "Confirmed",
    [dateField]:     { $gte: from, $lte: to },
  };
  if (hallId && isValidId(hallId)) match.hallId = new mongoose.Types.ObjectId(hallId);
  return match;
};

// ── Parse & validate a date range from query params ───────────────────────────
const parseDateRange = (fromStr, toStr, defaultDays = 30) => {
  const toDate   = toStr   ? new Date(toStr)   : new Date();
  const fromDate = fromStr ? new Date(fromStr)  : (() => {
    const d = new Date(toDate); d.setDate(d.getDate() - (defaultDays - 1)); return d;
  })();
  // Set full-day UTC boundaries
  fromDate.setUTCHours(0, 0, 0, 0);
  toDate.setUTCHours(23, 59, 59, 999);
  return { fromDate, toDate };
};

// ─────────────────────────────────────────────────────────────────────────────
// @route  GET /api/revenue/daily
// @query  from=YYYY-MM-DD, to=YYYY-MM-DD, hallId, groupBy=eventDate|createdAt
// @access Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
exports.getDailyRevenue = async (req, res) => {
  try {
    const { fromDate, toDate } = parseDateRange(req.query.from, req.query.to, 30);

    if (isNaN(fromDate) || isNaN(toDate))
      return res.status(400).json({ success: false, message: "Invalid date format. Use YYYY-MM-DD." });
    if (fromDate > toDate)
      return res.status(400).json({ success: false, message: "'from' must be before 'to'" });

    const { hallId } = req.query;
    const dateField  = req.query.groupBy === "createdAt" ? "createdAt" : "eventDate";

    const rows = await Booking.aggregate([
      { $match: buildMatch(fromDate, toDate, hallId, dateField) },
      {
        $group: {
          _id: {
            year:  { $year:       `$${dateField}` },
            month: { $month:      `$${dateField}` },
            day:   { $dayOfMonth: `$${dateField}` },
          },
          revenue:  { $sum: "$totalPrice" },
          bookings: { $sum: 1 },
          guests:   { $sum: "$guests" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: { $dateFromParts: { year: "$_id.year", month: "$_id.month", day: "$_id.day" } },
            },
          },
          revenue: 1, bookings: 1, guests: 1,
        },
      },
    ]);

    // Fill zero-revenue days for a complete series
    const filled  = [];
    const rowMap  = Object.fromEntries(rows.map(r => [r.date, r]));
    const cursor  = new Date(fromDate);

    while (cursor <= toDate) {
      const key = cursor.toISOString().split("T")[0];
      filled.push(rowMap[key] || { date: key, revenue: 0, bookings: 0, guests: 0 });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    const totalRevenue  = filled.reduce((s, r) => s + r.revenue,  0);
    const totalBookings = filled.reduce((s, r) => s + r.bookings, 0);
    const totalGuests   = filled.reduce((s, r) => s + r.guests,   0);
    const bestDay       = [...filled].sort((a, b) => b.revenue - a.revenue)[0] || null;

    res.json({
      success: true,
      groupBy: dateField,
      range:   { from: fromDate.toISOString().split("T")[0], to: toDate.toISOString().split("T")[0] },
      summary: { totalRevenue, totalBookings, totalGuests, bestDay },
      data:    filled,
    });
  } catch (error) {
    console.error("getDailyRevenue error:", error.message);
    res.status(500).json({ success: false, message: "Could not calculate daily revenue" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route  GET /api/revenue/monthly
// @query  year=2026, from=YYYY-MM-DD, to=YYYY-MM-DD, hallId, groupBy=eventDate|createdAt
// @access Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
exports.getMonthlyRevenue = async (req, res) => {
  try {
    let fromDate, toDate;

    if (req.query.from || req.query.to) {
      const parsed = parseDateRange(req.query.from, req.query.to, 365);
      fromDate = parsed.fromDate;
      toDate   = parsed.toDate;
    } else {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      if (isNaN(year) || year < 2000 || year > 2100)
        return res.status(400).json({ success: false, message: "Invalid year" });
      fromDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));   // Jan 1 UTC
      toDate   = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)); // Dec 31 UTC
    }

    if (isNaN(fromDate) || isNaN(toDate))
      return res.status(400).json({ success: false, message: "Invalid date format. Use YYYY-MM-DD." });

    const { hallId } = req.query;
    const dateField  = req.query.groupBy === "createdAt" ? "createdAt" : "eventDate";

    const rows = await Booking.aggregate([
      { $match: buildMatch(fromDate, toDate, hallId, dateField) },
      {
        $group: {
          _id: {
            year:  { $year:  `$${dateField}` },
            month: { $month: `$${dateField}` },
          },
          revenue:  { $sum: "$totalPrice" },
          bookings: { $sum: 1 },
          guests:   { $sum: "$guests" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          year:     "$_id.year",
          month:    "$_id.month",
          monthKey: {
            $dateToString: {
              format: "%Y-%m",
              date: { $dateFromParts: { year: "$_id.year", month: "$_id.month", day: 1 } },
            },
          },
          revenue: 1, bookings: 1, guests: 1,
        },
      },
    ]);

    // Fill all months in range with zeros
    const MONTHS   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const rowMap   = Object.fromEntries(rows.map(r => [r.monthKey, r]));
    const filled   = [];

    const startYear  = fromDate.getUTCFullYear();
    const startMonth = fromDate.getUTCMonth() + 1;
    const endYear    = toDate.getUTCFullYear();
    const endMonth   = toDate.getUTCMonth() + 1;

    let y = startYear, m = startMonth;
    while (y < endYear || (y === endYear && m <= endMonth)) {
      const key   = `${y}-${String(m).padStart(2, "0")}`;
      const found = rowMap[key];
      filled.push({
        monthKey: key,
        label:    `${MONTHS[m - 1]} ${y}`,
        year:     y,
        month:    m,
        revenue:  found?.revenue  || 0,
        bookings: found?.bookings || 0,
        guests:   found?.guests   || 0,
      });
      m++;
      if (m > 12) { m = 1; y++; }
    }

    const totalRevenue  = filled.reduce((s, r) => s + r.revenue,  0);
    const totalBookings = filled.reduce((s, r) => s + r.bookings, 0);
    const totalGuests   = filled.reduce((s, r) => s + r.guests,   0);
    const bestMonth     = [...filled].sort((a, b) => b.revenue - a.revenue)[0] || null;
    const avgMonthly    = filled.length ? Math.round(totalRevenue / filled.length) : 0;

    res.json({
      success: true,
      groupBy: dateField,
      range:   { from: fromDate.toISOString().split("T")[0], to: toDate.toISOString().split("T")[0] },
      summary: { totalRevenue, totalBookings, totalGuests, avgMonthly, bestMonth },
      data:    filled,
    });
  } catch (error) {
    console.error("getMonthlyRevenue error:", error.message);
    res.status(500).json({ success: false, message: "Could not calculate monthly revenue" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route  GET /api/revenue/summary
// @desc   Quick overview: today / this week / this month / all time
// @access Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
exports.getRevenueSummary = async (req, res) => {
  try {
    const now = new Date();

    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const endOfToday   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    const startOfWeek  = new Date(startOfToday);
    startOfWeek.setUTCDate(startOfToday.getUTCDate() - startOfToday.getUTCDay());

    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));

    // Query by createdAt for "today/week/month" summary (more intuitive for admin)
    const [today, week, month, allTime] = await Promise.all([
      Booking.aggregate([
        { $match: { status: "Confirmed", createdAt: { $gte: startOfToday, $lte: endOfToday } } },
        { $group: { _id: null, revenue: { $sum: "$totalPrice" }, bookings: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { status: "Confirmed", createdAt: { $gte: startOfWeek,  $lte: endOfToday } } },
        { $group: { _id: null, revenue: { $sum: "$totalPrice" }, bookings: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { status: "Confirmed", createdAt: { $gte: startOfMonth, $lte: endOfToday } } },
        { $group: { _id: null, revenue: { $sum: "$totalPrice" }, bookings: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { status: "Confirmed" } },
        { $group: { _id: null, revenue: { $sum: "$totalPrice" }, bookings: { $sum: 1 } } },
      ]),
    ]);

    const pick = (agg) => ({ revenue: agg[0]?.revenue || 0, bookings: agg[0]?.bookings || 0 });

    res.json({
      success: true,
      summary: {
        today:   pick(today),
        week:    pick(week),
        month:   pick(month),
        allTime: pick(allTime),
      },
    });
  } catch (error) {
    console.error("getRevenueSummary error:", error.message);
    res.status(500).json({ success: false, message: "Could not fetch revenue summary" });
  }
};