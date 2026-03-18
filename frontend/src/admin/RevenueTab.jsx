import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { btnPrimary } from "./adminTheme";

// ── Bar chart ─────────────────────────────────────────────────────────────────
function BarChart({ data, color = "#10b981", valueKey = "revenue", labelKey = "label" }) {
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: 100, paddingTop: "0.5rem", overflowX: "auto" }}>
      {data.map((d, i) => (
        <div
          key={i}
          title={`${d[labelKey] || ""}: PKR ${(d[valueKey] || 0).toLocaleString()}`}
          style={{ flex: "0 0 auto", minWidth: data.length > 20 ? 10 : 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}
        >
          <div style={{ width: "100%", borderRadius: "4px 4px 0 0", background: `${color}18`, height: 76, position: "relative" }}>
            <div style={{
              width: "100%", borderRadius: "4px 4px 0 0",
              background: `linear-gradient(180deg,${color},${color}88)`,
              position: "absolute", bottom: 0,
              height: `${((d[valueKey] || 0) / max) * 100}%`,
              transition: "height 0.7s cubic-bezier(.34,1.56,.64,1)",
              minHeight: (d[valueKey] || 0) > 0 ? "4px" : "0",
            }} />
          </div>
          <span style={{
            color: "rgba(255,255,255,0.3)", fontSize: "0.52rem", textAlign: "center",
            lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis",
            whiteSpace: "nowrap", width: "100%", maxWidth: 32,
          }}>
            {(d[labelKey] || "").toString().slice(-5)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({ label, value, sub, color }) {
  return (
    <div style={{
      background: "linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))",
      border: `1px solid ${color}44`, borderRadius: "14px", padding: "1rem 1.1rem",
    }}>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.63rem", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 5px", fontWeight: 600 }}>{label}</p>
      <p style={{ color: "white", fontSize: "1.3rem", fontWeight: 700, fontFamily: "'Cormorant Garamond',serif", margin: 0, lineHeight: 1.1 }}>
        <span style={{ color }}>{value}</span>
      </p>
      {sub && <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.65rem", margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

// ── Dark year select ──────────────────────────────────────────────────────────
function YearSelect({ value, onChange }) {
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          appearance: "none", WebkitAppearance: "none",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(139,92,246,0.35)",
          borderRadius: "10px", color: "white",
          fontSize: "0.84rem", fontWeight: 600,
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          padding: "0.5rem 2.2rem 0.5rem 0.85rem",
          cursor: "pointer", outline: "none", colorScheme: "dark",
        }}
        onFocus={e => { e.target.style.borderColor = "rgba(147,51,234,0.7)"; e.target.style.background = "rgba(255,255,255,0.09)"; }}
        onBlur={e =>  { e.target.style.borderColor = "rgba(139,92,246,0.35)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
      >
        {years.map(y => <option key={y} value={String(y)} style={{ background: "#0f0a28", color: "white" }}>{y}</option>)}
      </select>
      <span style={{ position: "absolute", right: "0.6rem", pointerEvents: "none", color: "rgba(196,139,252,0.7)", fontSize: "0.6rem" }}>▼</span>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtK = (n) => {
  const num = Number(n) || 0;
  if (num >= 1000000) return `PKR ${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000)    return `PKR ${(num / 1000).toFixed(1)}K`;
  return `PKR ${num}`;
};
const fmt   = (n) => `PKR ${(Number(n) || 0).toLocaleString()}`;
const toISO = (d) => d.toISOString().split("T")[0];

const today  = new Date();
const d30ago = new Date(today); d30ago.setDate(today.getDate() - 29);

const dateInputStyle = {
  width: "100%", padding: "0.5rem 0.65rem", borderRadius: "10px",
  fontSize: "0.82rem", background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(139,92,246,0.35)", color: "white",
  outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", colorScheme: "dark",
};
const fieldLabel = {
  color: "rgba(196,139,252,0.7)", fontSize: "0.65rem", fontWeight: 700,
  letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "0.25rem",
};
const pillBtn = (active) => ({
  padding: "0.38rem 0.85rem", borderRadius: "999px", fontSize: "0.75rem",
  fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, cursor: "pointer",
  border: `1px solid ${active ? "rgba(147,51,234,0.7)" : "rgba(139,92,246,0.25)"}`,
  background: active ? "linear-gradient(135deg,rgba(109,40,217,0.5),rgba(147,51,234,0.3))" : "rgba(255,255,255,0.03)",
  color: active ? "white" : "rgba(196,139,252,0.6)",
  transition: "all 0.15s", whiteSpace: "nowrap",
});

// ─────────────────────────────────────────────────────────────────────────────
export default function RevenueTab({ toast }) {
  const [mode,      setMode]      = useState("monthly");          // daily | monthly
  const [groupBy,   setGroupBy]   = useState("createdAt");        // eventDate | createdAt
  const [fromDate,  setFrom]      = useState(toISO(d30ago));
  const [toDate,    setTo]        = useState(toISO(today));
  const [year,      setYear]      = useState(String(today.getFullYear()));
  const [month,     setMonth]     = useState("all");              // "all" | "1".."12"
  const [summary,   setSummary]   = useState(null);
  const [report,    setReport]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [sumLoad,   setSumLoad]   = useState(true);

  // fetch quick summary on mount
  useEffect(() => {
    api.get("/revenue/summary")
      .then(r => setSummary(r.data?.summary || null))
      .catch(() => toast("Could not load summary", "error"))
      .finally(() => setSumLoad(false));
  }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setReport(null);
    try {
      const gb = `groupBy=${groupBy}`;
      let url;
      if (mode === "daily") {
        url = `/revenue/daily?from=${fromDate}&to=${toDate}&${gb}`;
      } else if (month !== "all") {
        // single month: use from/to date range for that specific month
        const mm    = String(month).padStart(2, "0");
        const lastD = new Date(Number(year), Number(month), 0).getDate(); // last day of month
        url = `/revenue/daily?from=${year}-${mm}-01&to=${year}-${mm}-${lastD}&${gb}`;
      } else {
        url = `/revenue/monthly?year=${year}&${gb}`;
      }
      const res = await api.get(url);
      setReport(res.data || null);
    } catch (err) {
      toast(err.response?.data?.message || "Could not load revenue data", "error");
    }
    setLoading(false);
  }, [mode, groupBy, fromDate, toDate, year, month]);

  // auto-fetch when mode or groupBy changes
  useEffect(() => { fetchReport(); }, [mode, groupBy]);

  // build chart data safely
  const chartData = (() => {
    if (!report?.data || !Array.isArray(report.data)) return [];
    return report.data.map(d => {
      if (mode === "daily") {
        const s = d.date ? String(d.date) : "";
        return { label: s.length >= 10 ? s.slice(5) : s, revenue: d.revenue || 0, bookings: d.bookings || 0 };
      }
      // monthly — show "Mar" style short labels
      const label = d.label ? String(d.label).slice(0, 3) : (d.monthKey || "");
      return { label, revenue: d.revenue || 0, bookings: d.bookings || 0 };
    });
  })();

  const tableRows = (() => {
    if (!report?.data || !Array.isArray(report.data)) return [];
    return [...report.data].filter(r => (r.revenue || 0) > 0).sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
  })();

  const totalRevenue = report?.summary?.totalRevenue || 0;
  const hasRevenue   = chartData.some(d => d.revenue > 0);
  const hasBookings  = chartData.some(d => d.bookings > 0);

  const groupByLabel = groupBy === "createdAt" ? "booking date" : "event date";

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>

      {/* ── CSS ────────────────────────────────────────────────────────── */}
      <style>{`
        .rev-pills  { display:grid; grid-template-columns:repeat(4,1fr); gap:.75rem; margin-bottom:1.25rem; }
        .rev-rpt    { display:grid; grid-template-columns:repeat(3,1fr); gap:.75rem; margin-bottom:1.25rem; }
        .rev-ctrl   { display:flex; align-items:flex-end; gap:.65rem; flex-wrap:wrap; }
        .rev-trow   { display:grid; }
        .rev-trow.daily   { grid-template-columns:1.3fr 1fr .6fr 1.2fr; }
        .rev-trow.monthly { grid-template-columns:1.3fr 1fr .6fr .6fr 1.2fr; }
        .rev-date-inp:focus { border-color:rgba(147,51,234,.7)!important; background:rgba(255,255,255,.09)!important; }
        @media(max-width:620px){
          .rev-pills { grid-template-columns:repeat(2,1fr); }
          .rev-rpt   { grid-template-columns:repeat(2,1fr); }
          .rev-ctrl  { flex-direction:column; align-items:stretch; }
          .rev-toggle{ justify-content:center; }
          .rev-dates { display:grid; grid-template-columns:1fr 1fr; gap:.5rem; }
          .rev-trow.daily   { grid-template-columns:1fr 1fr; }
          .rev-trow.monthly { grid-template-columns:1fr 1fr; }
          .rev-nm    { display:none!important; }
          .rev-gen   { width:100%; }
        }
        @media(max-width:360px){
          .rev-pills { grid-template-columns:1fr; }
          .rev-rpt   { grid-template-columns:1fr; }
          .rev-dates { grid-template-columns:1fr; }
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", color: "white", fontSize: "clamp(1.4rem,4vw,1.75rem)", fontWeight: 600, margin: "0 0 4px" }}>
          Revenue <em style={{ color: "#10b981", fontStyle: "italic" }}>Analytics</em>
        </h2>
        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.82rem", margin: 0 }}>
          Confirmed bookings only — grouped by {groupByLabel}
        </p>
      </div>

      {/* ── Quick summary pills ───────────────────────────────────────────── */}
      {!sumLoad && summary && (
        <div className="rev-pills">
          <StatPill label="Today"      value={fmtK(summary.today?.revenue)}    sub={`${summary.today?.bookings   || 0} booking(s)`} color="#10b981" />
          <StatPill label="This Week"  value={fmtK(summary.week?.revenue)}     sub={`${summary.week?.bookings    || 0} booking(s)`} color="#06b6d4" />
          <StatPill label="This Month" value={fmtK(summary.month?.revenue)}    sub={`${summary.month?.bookings   || 0} booking(s)`} color="#a855f7" />
          <StatPill label="All Time"   value={fmtK(summary.allTime?.revenue)}  sub={`${summary.allTime?.bookings || 0} total`}      color="#f59e0b" />
        </div>
      )}

      {/* ── Controls card ────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))",
        border: "1px solid rgba(139,92,246,0.2)", borderRadius: "16px",
        padding: "1.1rem 1.2rem", marginBottom: "1.25rem",
      }}>
        <div className="rev-ctrl">

          {/* Daily / Monthly */}
          <div className="rev-toggle" style={{ display: "flex", gap: "0.35rem" }}>
            {["daily", "monthly"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={pillBtn(mode === m)}>{m.charAt(0).toUpperCase() + m.slice(1)}</button>
            ))}
          </div>

          {/* Daily date range */}
          {mode === "daily" && (
            <div className="rev-dates" style={{ display: "flex", gap: "0.5rem", flex: 1 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <label style={fieldLabel}>From</label>
                <input type="date" className="rev-date-inp" style={dateInputStyle}
                  value={fromDate} max={toDate} onChange={e => setFrom(e.target.value)} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <label style={fieldLabel}>To</label>
                <input type="date" className="rev-date-inp" style={dateInputStyle}
                  value={toDate} min={fromDate} max={toISO(today)} onChange={e => setTo(e.target.value)} />
              </div>
            </div>
          )}

          {/* Monthly: Year + Month selects */}
          {mode === "monthly" && (
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div>
                <label style={fieldLabel}>Year</label>
                <YearSelect value={year} onChange={v => { setYear(v); setMonth("all"); }} />
              </div>
              <div>
                <label style={fieldLabel}>Month</label>
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                  <select
                    value={month}
                    onChange={e => setMonth(e.target.value)}
                    style={{
                      appearance: "none", WebkitAppearance: "none",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(139,92,246,0.35)",
                      borderRadius: "10px", color: "white",
                      fontSize: "0.84rem", fontWeight: 600,
                      fontFamily: "'Plus Jakarta Sans',sans-serif",
                      padding: "0.5rem 2.2rem 0.5rem 0.85rem",
                      cursor: "pointer", outline: "none", colorScheme: "dark",
                    }}
                    onFocus={e => { e.target.style.borderColor = "rgba(147,51,234,0.7)"; e.target.style.background = "rgba(255,255,255,0.09)"; }}
                    onBlur={e =>  { e.target.style.borderColor = "rgba(139,92,246,0.35)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
                  >
                    <option value="all"  style={{ background: "#0f0a28", color: "white" }}>All months</option>
                    {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                      <option key={i+1} value={String(i+1)} style={{ background: "#0f0a28", color: "white" }}>{m}</option>
                    ))}
                  </select>
                  <span style={{ position: "absolute", right: "0.6rem", pointerEvents: "none", color: "rgba(196,139,252,0.7)", fontSize: "0.6rem" }}>▼</span>
                </div>
              </div>
            </div>
          )}

          {/* Group by toggle */}
          <div>
            <label style={fieldLabel}>Group by</label>
            <div style={{ display: "flex", gap: "0.3rem" }}>
              <button onClick={() => setGroupBy("createdAt")} style={pillBtn(groupBy === "createdAt")}>Booking date</button>
              <button onClick={() => setGroupBy("eventDate")} style={pillBtn(groupBy === "eventDate")}>Event date</button>
            </div>
          </div>

          {/* Generate */}
          <div className="rev-gen" style={{ alignSelf: "flex-end" }}>
            <button
              style={{ ...btnPrimary, width: "100%", opacity: loading ? 0.6 : 1, padding: "0.52rem 1.4rem" }}
              onClick={fetchReport} disabled={loading}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(109,40,217,0.45)"; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              {loading ? "Loading…" : "Generate"}
            </button>
          </div>
        </div>

        {/* Info hint */}
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.7rem", margin: "0.75rem 0 0" }}>
          <span style={{ color: "rgba(196,139,252,0.5)" }}>ℹ</span>
          {" "}<strong style={{ color: "rgba(255,255,255,0.4)" }}>Booking date</strong> = when the booking was made ·{" "}
          <strong style={{ color: "rgba(255,255,255,0.4)" }}>Event date</strong> = when the event takes place
        </p>
      </div>

      {/* ── Loading ─────────────────────────────────────────────────────── */}
      {loading && (
        <div style={{ textAlign: "center", padding: "4rem", color: "rgba(255,255,255,0.3)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem", opacity: 0.5 }}>💰</div>
          Calculating revenue…
        </div>
      )}

      {/* ── Report ───────────────────────────────────────────────────────── */}
      {!loading && report && (
        <>
          {/* Report summary pills */}
          <div className="rev-rpt">
            <StatPill label="Total Revenue" value={fmtK(totalRevenue)} sub={`${report.summary?.totalBookings || 0} confirmed`} color="#10b981" />
            <StatPill label="Total Guests"  value={(report.summary?.totalGuests || 0).toLocaleString()} sub="across period" color="#06b6d4" />
            {mode === "monthly"
              ? month !== "all"
                ? <StatPill label="Best Day"    value={fmtK(report.summary?.bestDay?.revenue)} sub={report.summary?.bestDay?.date || "—"} color="#f59e0b" />
                : <StatPill label="Avg / Month" value={fmtK(report.summary?.avgMonthly)} sub="monthly average" color="#a855f7" />
              : <StatPill label="Best Day"    value={fmtK(report.summary?.bestDay?.revenue)} sub={report.summary?.bestDay?.date || "—"} color="#f59e0b" />
            }
          </div>

          {/* Revenue chart */}
          <div style={{
            background: "linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))",
            border: "1px solid rgba(139,92,246,0.18)", borderRadius: "18px",
            padding: "1.2rem", marginBottom: "1rem",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.8rem", fontWeight: 600, margin: 0 }}>
                  Revenue — {mode === "daily"
                    ? `${fromDate} → ${toDate}`
                    : month !== "all"
                    ? `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][Number(month)-1]} ${year}`
                    : `Year ${year}`
                  }
                </p>
                <p style={{ color: "rgba(255,255,255,0.32)", fontSize: "0.68rem", margin: "2px 0 0" }}>
                  Confirmed bookings · grouped by {groupByLabel}
                </p>
              </div>
              <span style={{
                background: "rgba(16,185,129,0.18)", border: "1px solid rgba(16,185,129,0.4)",
                borderRadius: "999px", padding: "3px 10px",
                color: "#34d399", fontSize: "0.72rem", fontWeight: 700, whiteSpace: "nowrap",
              }}>
                {fmt(totalRevenue)}
              </span>
            </div>
            {!hasRevenue
              ? (
                <div style={{ padding: "1.5rem 0" }}>
                  <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.84rem", margin: "0 0 0.5rem" }}>
                    No confirmed revenue in this period
                  </p>
                  {groupBy === "eventDate" && (
                    <p style={{ color: "rgba(196,139,252,0.5)", fontSize: "0.75rem", margin: 0 }}>
                      💡 Try switching <strong>Group by</strong> to <strong>Booking date</strong> — your bookings may have been made in this period but with a future event date.
                    </p>
                  )}
                </div>
              )
              : <BarChart data={chartData} color="#10b981" valueKey="revenue" labelKey="label" />
            }
          </div>

          {/* Bookings chart */}
          <div style={{
            background: "linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))",
            border: "1px solid rgba(139,92,246,0.18)", borderRadius: "18px",
            padding: "1.2rem", marginBottom: "1.25rem",
          }}>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.8rem", fontWeight: 600, margin: "0 0 0.5rem" }}>
              Bookings Count — same period
            </p>
            {!hasBookings
              ? <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.84rem", padding: "1.5rem 0" }}>No bookings in this period</p>
              : <BarChart data={chartData} color="#9333ea" valueKey="bookings" labelKey="label" />
            }
          </div>

          {/* Detail table */}
          {tableRows.length > 0 && (
            <div style={{
              background: "linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))",
              border: "1px solid rgba(139,92,246,0.18)", borderRadius: "18px", overflow: "hidden",
            }}>
              {/* Header */}
              <div className={`rev-trow ${mode === "daily" || month !== "all" ? "daily" : "monthly"}`} style={{
                padding: "0.72rem 1.1rem",
                borderBottom: "1px solid rgba(139,92,246,0.15)",
                background: "rgba(139,92,246,0.1)",
              }}>
                <span style={{ color: "rgba(196,139,252,0.7)", fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {mode === "daily" || month !== "all" ? "Date" : "Month"}
                </span>
                <span style={{ color: "rgba(196,139,252,0.7)", fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Revenue (PKR)</span>
                <span style={{ color: "rgba(196,139,252,0.7)", fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Bookings</span>
                {mode === "monthly" && (
                  <span className="rev-nm" style={{ color: "rgba(196,139,252,0.7)", fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Guests</span>
                )}
                <span className="rev-nm" style={{ color: "rgba(196,139,252,0.7)", fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Share</span>
              </div>

              {/* Rows */}
              {tableRows.map((r, idx) => {
                const pct = totalRevenue ? (((r.revenue || 0) / totalRevenue) * 100).toFixed(1) : "0.0";
                return (
                  <div key={idx} className={`rev-trow ${mode === "daily" || month !== "all" ? "daily" : "monthly"}`}
                    style={{ padding: "0.68rem 1.1rem", borderBottom: idx < tableRows.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(109,40,217,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.82rem", fontWeight: 500 }}>
                      {mode === "daily" || month !== "all"
                        ? (r.date || "—")
                        : (r.label || r.monthKey || "—")
                      }
                    </span>
                    <span style={{ color: "#34d399", fontWeight: 700, fontSize: "0.82rem" }}>
                      {(r.revenue || 0).toLocaleString()}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem" }}>{r.bookings || 0}</span>
                    {mode === "monthly" && (
                      <span className="rev-nm" style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem" }}>{(r.guests || 0).toLocaleString()}</span>
                    )}
                    <div className="rev-nm" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg,#10b981,#34d399)", width: `${pct}%` }} />
                      </div>
                      <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.68rem", minWidth: "2.2rem" }}>{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {!loading && !report && (
        <div style={{ textAlign: "center", padding: "3rem 2rem", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "18px", background: "rgba(255,255,255,0.02)" }}>
          <p style={{ fontSize: "2.2rem", marginBottom: "0.75rem" }}>💰</p>
          <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "1.25rem", fontSize: "0.9rem" }}>
            Select a range and click Generate to see revenue data
          </p>
          <button style={btnPrimary} onClick={fetchReport}>Generate Report</button>
        </div>
      )}
    </div>
  );
}