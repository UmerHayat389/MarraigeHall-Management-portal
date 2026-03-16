import React, { useState } from "react";
import api from "../services/api";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');`;

const STATUS_CONFIG = {
  Pending:   { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)",  icon: "⏳", label: "Awaiting Approval",  msg: "Your booking has been received and is waiting for manager approval. You will receive an SMS on your number once it is confirmed." },
  Confirmed: { color: "#22c55e", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.3)",   icon: "✓",  label: "Confirmed",           msg: "Your booking has been confirmed by our manager. We look forward to hosting your event at Noor Mahal!" },
  Cancelled:  { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)",   icon: "✕",  label: "Cancelled",  msg: "Your booking has been cancelled. Please contact us if you believe this is a mistake or to make a new booking." },
  Completed:  { color: "#818cf8", bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.3)", icon: "★",  label: "Completed",  msg: "Your event has been completed. Thank you for choosing Noor Mahal. We hope to host you again!" },
};

const getDisplayStatus = (b) => {
  if (b?.status === "Confirmed" && b?.eventDate && new Date(b.eventDate) < new Date(new Date().setHours(0,0,0,0))) return "Completed";
  return b?.status || "Pending";
};

export default function BookingStatus() {
  const [name, setName]           = useState("");
  const [phone, setPhone]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [bookings, setBookings]   = useState(null);
  const [selected, setSelected]   = useState(null); // which booking is expanded

  const search = async () => {
    const n = name.trim();
    const p = phone.trim();
    if (!n && !p) { setError("Please enter your name or phone number"); return; }
    setLoading(true); setError(""); setBookings(null); setSelected(null);

    const normalize = (ph) => ph.replace(/\s/g, "").replace(/^\+92/, "0").replace(/^92/, "0");

    try {
      let found = [];

      if (p) {
        // Use the dedicated client history endpoint — returns all bookings for this phone
        const np = normalize(p);
        const res = await api.get(`/bookings/client/${encodeURIComponent(np)}`);
        found = res.data.bookings || [];
        // If name also provided, filter down further
        if (n && found.length > 0) {
          found = found.filter(b => b.clientName?.toLowerCase().includes(n.toLowerCase()));
        }
      } else {
        // Phone not given, only name — fall back to full list search
        const res = await api.get("/bookings");
        const all = res.data.bookings || [];
        found = all.filter(b => b.clientName?.toLowerCase().includes(n.toLowerCase()));
      }

      if (found.length === 0) {
        setError("No bookings found. Please check your name or phone number and try again.");
      } else {
        setBookings(found);
      }
    } catch {
      setError("Unable to reach the server. Please try again later.");
    }
    setLoading(false);
  };

  const fmt = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" });
  };

  const slotLabel = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";

  return (
    <div style={{ background: "#07050f", minHeight: "100vh", color: "white", fontFamily: "'DM Sans',sans-serif", position: "relative", overflowX: "hidden" }}>
      <style>{`
        ${FONTS}
        /* Background hero image with blur */
        .bs-bg {
          position: fixed; inset: 0; z-index: 0;
          background: url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80') center/cover no-repeat;
        }
        .bs-bg-overlay {
          position: fixed; inset: 0; z-index: 1;
          background: linear-gradient(to bottom, rgba(7,5,15,0.82) 0%, rgba(7,5,15,0.75) 50%, rgba(7,5,15,0.96) 100%);
          backdrop-filter: blur(3px);
        }
        .bs-content { position: relative; z-index: 2; padding: 2rem 1rem; }

        .bs-input { transition: border-color 0.2s; }
        .bs-input:focus { border-color: rgba(167,139,250,0.55) !important; outline: none; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .bs-card { animation: fadeUp 0.4s ease forwards; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .bs-spinner { width:18px; height:18px; border:2px solid rgba(167,139,250,0.2); border-top-color:#a855f7; border-radius:50%; animation: spin 0.7s linear infinite; display:inline-block; flex-shrink:0; }

        /* Glow blobs */
        .bs-glow-1 { position:fixed; top:15%; left:10%; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(124,58,237,0.18),transparent); filter:blur(60px); pointer-events:none; z-index:1; }
        .bs-glow-2 { position:fixed; bottom:20%; right:5%; width:300px; height:300px; border-radius:50%; background:radial-gradient(circle,rgba(168,85,247,0.12),transparent); filter:blur(50px); pointer-events:none; z-index:1; }

        /* Responsive */
        .bs-search-card { background:linear-gradient(145deg,rgba(26,16,53,0.92),rgba(18,13,42,0.92)); border:1px solid rgba(167,139,250,0.18); border-radius:20px; padding:2rem; backdrop-filter:blur(20px); }
        .bs-result-card { background:linear-gradient(145deg,rgba(26,16,53,0.95),rgba(18,13,42,0.95)); border:1px solid rgba(167,139,250,0.15); border-radius:18px; overflow:hidden; backdrop-filter:blur(20px); }

        @media (max-width: 480px) {
          .bs-search-card { padding: 1.25rem; border-radius: 16px; }
          .bs-inputs-row { grid-template-columns: 1fr !important; }
          .bs-ref-row { flex-direction: column; gap: 0.5rem; }
          .bs-ref-id { text-align: left !important; }
        }
      `}</style>

      {/* Background layers */}
      <div className="bs-bg" />
      <div className="bs-bg-overlay" />
      <div className="bs-glow-1" />
      <div className="bs-glow-2" />

      <div className="bs-content">
        {/* Back link */}
        <div style={{ maxWidth: 640, margin: "0 auto 1.75rem" }}>
          <a href="/" style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#c084fc"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>
            ← Back to Noor Mahal
          </a>
        </div>

        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2.25rem" }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.6rem,4vw,2rem)", marginBottom: "0.5rem" }}>
              <span style={{ color: "#a855f7" }}>Noor</span><span style={{ color: "white" }}> Mahal</span>
            </p>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.5rem,5vw,2.2rem)", fontWeight: 300, margin: "0 0 0.5rem" }}>
              Check Your <em style={{ color: "#a855f7" }}>Booking Status</em>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.88rem" }}>
              Enter your booking reference or phone number to see the latest status
            </p>
          </div>

          {/* Search card */}
          <div className="bs-search-card">
            {/* Two inputs */}
            <div className="bs-inputs-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(192,132,252,0.7)", marginBottom: "0.5rem" }}>
                  Full Name
                </label>
                <input className="bs-input"
                  style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "12px", background: "rgba(255,255,255,0.06)", color: "white", fontSize: "0.88rem", border: "1px solid rgba(167,139,250,0.2)", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" }}
                  placeholder="Enter your name"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && search()}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(192,132,252,0.7)", marginBottom: "0.5rem" }}>
                  Phone Number
                </label>
                <input className="bs-input"
                  style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "12px", background: "rgba(255,255,255,0.06)", color: "white", fontSize: "0.88rem", border: "1px solid rgba(167,139,250,0.2)", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" }}
                  placeholder="+92 3XX XXXXXXX"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && search()}
                />
              </div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.72rem", marginBottom: "1rem" }}>
              Enter your name, phone number, or both to find your booking
            </p>

            {error && (
              <div style={{ padding: "0.65rem 0.875rem", borderRadius: "10px", marginBottom: "1rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", fontSize: "0.82rem" }}>
                ✕ {error}
              </div>
            )}

            <button onClick={search} disabled={loading}
              style={{ width: "100%", padding: "0.85rem", borderRadius: "12px", border: "none", background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "white", fontWeight: 600, fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", boxShadow: "0 8px 24px rgba(124,58,237,0.3)" }}>
              {loading ? <><span className="bs-spinner"/><span>Searching...</span></> : "Check Status →"}
            </button>
          </div>

          {/* Results */}
          {bookings && bookings.length > 0 && (
            <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {bookings.map((b, i) => {
                const ds = getDisplayStatus(b);
                const cfg = STATUS_CONFIG[ds] || STATUS_CONFIG.Pending;
                const internalId = b._id ? b._id.slice(-8).toUpperCase() : "—";
                const isExpanded = selected === b._id;

                return (
                  <div key={b._id || i} className="bs-card bs-result-card">

                    {/* ── Compact summary row (always visible, clickable) ── */}
                    <button
                      onClick={() => setSelected(isExpanded ? null : b._id)}
                      style={{
                        width: "100%", textAlign: "left", background: "none", border: "none",
                        cursor: "pointer", padding: "0.85rem 1.25rem",
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem",
                        borderBottom: isExpanded ? "1px solid rgba(167,139,250,0.12)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                        {/* Status dot */}
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
                        {/* Ref */}
                        <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "0.95rem", color: "white", letterSpacing: "0.04em", flexShrink: 0 }}>
                          {b.bookingRef || "—"}
                        </span>
                        {/* Hall · Date · Slot */}
                        <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.38)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {b.hallId?.name || "—"} · {fmt(b.eventDate)} · {slotLabel(b.timeSlot)}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
                        <span style={{ fontSize: "0.68rem", fontWeight: 600, padding: "0.2rem 0.65rem", borderRadius: 99, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                          {ds}
                        </span>
                        <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", transition: "transform 0.2s", display: "inline-block", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                      </div>
                    </button>

                    {/* ── Full detail (only when expanded) ── */}
                    {isExpanded && (
                      <div>
                        {/* Status banner */}
                        <div style={{ background: cfg.bg, borderBottom: `1px solid ${cfg.border}`, padding: "1rem 1.5rem", display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                          <div style={{ width: 42, height: 42, borderRadius: "50%", background: `${cfg.color}22`, border: `2px solid ${cfg.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: cfg.color, flexShrink: 0, fontWeight: 700 }}>
                            {cfg.icon}
                          </div>
                          <div>
                            <p style={{ color: cfg.color, fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.2rem" }}>{cfg.label}</p>
                            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem", lineHeight: 1.55 }}>{cfg.msg}</p>
                          </div>
                        </div>

                        <div style={{ padding: "1.25rem 1.5rem" }}>
                          {/* Guest name header */}
                          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                            <p style={{ color: "rgba(192,132,252,0.5)", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.25rem" }}>Booking For</p>
                            <p style={{ color: "white", fontWeight: 600, fontSize: "1.1rem", fontFamily: "'Playfair Display',serif" }}>{b.clientName || "—"}</p>
                          </div>

                          {/* Reference row */}
                          <div className="bs-ref-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.18)", borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1rem" }}>
                            <div>
                              <p style={{ color: "rgba(192,132,252,0.6)", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.2rem" }}>Your Booking Reference</p>
                              <p style={{ color: "white", fontWeight: 700, fontSize: "1.2rem", letterSpacing: "0.08em", fontFamily: "'Playfair Display',serif" }}>{b.bookingRef || "—"}</p>
                            </div>
                            <div className="bs-ref-id" style={{ textAlign: "right" }}>
                              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.2rem" }}>Internal ID</p>
                              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem", fontFamily: "monospace", letterSpacing: "0.05em" }}>#{internalId}</p>
                            </div>
                          </div>

                          {/* Status badge */}
                          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                            <span style={{ fontSize: "0.72rem", padding: "0.3rem 1rem", borderRadius: "999px", fontWeight: 600, letterSpacing: "0.05em", background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                              Status: {ds}
                            </span>
                          </div>

                          {/* Detail rows */}
                          {[
                            ["Guest",      b.clientName],
                            ["Hall",       b.hallId?.name],
                            ["Date",       fmt(b.eventDate)],
                            ["Time Slot",  slotLabel(b.timeSlot)],
                            ["Event Type", b.eventType],
                            ["Guests",     b.guests],
                            ["Payment",    b.paymentMethod],
                            ["Total",      b.totalPrice ? `PKR ${b.totalPrice.toLocaleString()}` : "—"],
                          ].map(([k, v]) => v && (
                            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "0.85rem", flexWrap: "wrap", gap: "0.25rem" }}>
                              <span style={{ color: "rgba(255,255,255,0.35)" }}>{k}</span>
                              <span style={{ color: "rgba(255,255,255,0.82)", fontWeight: 500 }}>{v}</span>
                            </div>
                          ))}

                          {/* Footer note */}
                          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.72rem", textAlign: "center", marginTop: "1rem", lineHeight: 1.6 }}>
                            {ds === "Pending"
                              ? "⏳ You will receive an SMS on your registered number once the manager confirms."
                              : ds === "Completed"
                              ? "★ Your event has been completed. Thank you for choosing Noor Mahal!"
                              : ds === "Confirmed"
                              ? "✓ An SMS confirmation has been sent to your registered number."
                              : "For assistance, please contact Noor Mahal directly."}
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

          {/* Contact help */}
          <div style={{ textAlign: "center", marginTop: "2.5rem", paddingBottom: "2.5rem" }}>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.78rem" }}>
              Need help? Call{" "}
              <a href="tel:+922134567890" style={{ color: "#a855f7", textDecoration: "none" }}>+92 21 3456 7890</a>
              {" · "}
              <a href="mailto:bookings@noormahal.pk" style={{ color: "#a855f7", textDecoration: "none" }}>bookings@noormahal.pk</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}