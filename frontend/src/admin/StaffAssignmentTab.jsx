import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { btnPrimary, btnGhost, statusColor, statusBg, statusBorder, getDisplayStatus } from "./adminTheme";

// ── Role meta ─────────────────────────────────────────────────────────────────
const ROLE_META = {
  manager:   { icon: "👔", color: "#818cf8", bg: "rgba(15,118,110,0.12)",  border: "rgba(99,102,241,0.25)" },
  waiter:    { icon: "🍽️", color: "#06b6d4", bg: "rgba(6,182,212,0.12)",   border: "rgba(6,182,212,0.25)"  },
  chef:      { icon: "👨‍🍳", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)" },
  security:  { icon: "🛡️", color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)" },
  cleaner:   { icon: "🧹", color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.25)"},
  decorator: { icon: "🎨", color: "#ec4899", bg: "rgba(236,72,153,0.12)",  border: "rgba(236,72,153,0.25)" },
};
const RM = (r) => ROLE_META[r] || { icon: "👤", color: "#888", bg: "rgba(136,136,136,0.1)", border: "rgba(136,136,136,0.2)" };

const neededRoles = (catering) =>
  catering === "self-catering"
    ? ["manager", "waiter", "security", "decorator", "cleaner"]
    : ["manager", "chef", "waiter", "security", "decorator", "cleaner"];

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "—";
const SLOT    = { afternoon: "Afternoon", evening: "Evening", latenight: "Late Night" };

// ── Assign modal ──────────────────────────────────────────────────────────────
function AssignModal({ booking, employees, onClose, onAssigned }) {
  const [search,  setSearch]  = useState("");
  const [roleTab, setRoleTab] = useState("all");
  const [busy,    setBusy]    = useState(null);
  const [err,     setErr]     = useState("");

  const needed   = neededRoles(booking.cateringOption);
  const assigned = (booking.assignedStaff || []).map(a => (a.employeeId?._id || a.employeeId)?.toString());

  const visible = employees.filter(e => {
    if (!needed.includes(e.role)) return false;
    if (roleTab !== "all" && e.role !== roleTab) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const assign = async (emp) => {
    setErr(""); setBusy(emp._id);
    try {
      const res = await api.post(`/assignments/${booking._id}/assign`, { employeeId: emp._id });
      onAssigned(res.data.booking);
    } catch (e) { setErr(e.response?.data?.message || "Could not assign"); }
    setBusy(null);
  };

  return (
    <div className="sa-ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sa-modal">

        {/* Header */}
        <div style={{ padding: "1.1rem 1.25rem 0.9rem", borderBottom: "1px solid rgba(99,102,241,0.12)", background: "linear-gradient(135deg,#252d3d,transparent)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: "#94a3b8", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 4px" }}>Assign Staff to Booking</p>
              <h3 style={{ fontFamily: "'Sora',sans-serif", color: "white", fontSize: "1.2rem", fontWeight: 600, margin: "0 0 2px" }}>{booking.clientName}</h3>
              <p style={{ color: "rgba(255,255,255,0.32)", fontSize: "0.73rem", margin: 0 }}>
                {booking.hallId?.name || "—"} · {fmtDate(booking.eventDate)} · {SLOT[booking.timeSlot] || booking.timeSlot}
              </p>
            </div>
            <button onClick={onClose} style={{ background: "#252d3d", border: "1px solid #252d3d", borderRadius: "8px", color: "#cbd5e1", fontSize: "0.85rem", cursor: "pointer", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: "0.75rem" }}>✕</button>
          </div>
          {/* Catering note - simple one-liner */}
          <p style={{ margin: "0.6rem 0 0", fontSize: "0.7rem", color: booking.cateringOption === "self-catering" ? "rgba(103,232,249,0.6)" : "rgba(252,211,77,0.6)" }}>
            {booking.cateringOption === "self-catering" ? "🥡 Self-catering — chefs not needed" : booking.cateringOption === "our-menu" ? "🍽️ Our menu — chefs required" : "📋 Catering not specified"}
          </p>
        </div>

        {/* Search */}
        <div style={{ padding: "0.85rem 1.25rem 0.5rem" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "rgba(99,102,241,0.35)", fontSize: "0.78rem", pointerEvents: "none" }}>🔍</span>
            <input className="a-input" placeholder="Search staff name…" style={{ paddingLeft: "2rem", fontSize: "0.8rem", width: "100%" }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {/* Role tabs */}
          <div style={{ display: "flex", gap: "0.28rem", marginTop: "0.55rem", flexWrap: "wrap" }}>
            {["all", ...needed].map(r => (
              <button key={r} onClick={() => setRoleTab(r)} style={{
                padding: "0.22rem 0.65rem", borderRadius: "999px", fontSize: "0.67rem",
                fontFamily: "'Inter',sans-serif", fontWeight: 600, cursor: "pointer",
                border: `1px solid ${roleTab === r ? "rgba(99,102,241,0.55)" : "rgba(99,102,241,0.15)"}`,
                background: roleTab === r ? "rgba(79,70,229,0.35)" : "transparent",
                color: roleTab === r ? "white" : "#94a3b8",
                textTransform: "capitalize", transition: "all 0.12s",
              }}>{r === "all" ? "All roles" : r}</button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 1.25rem 0.5rem" }}>
          {err && <p style={{ color: "#f87171", fontSize: "0.74rem", margin: "0 0 0.5rem", padding: "0.4rem 0.7rem", background: "rgba(239,68,68,0.07)", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.18)" }}>✕ {err}</p>}
          {visible.length === 0
            ? <p style={{ color: "#cbd5e1", textAlign: "center", padding: "1.5rem 0", fontSize: "0.82rem" }}>No staff match</p>
            : visible.map(emp => {
              const m          = RM(emp.role);
              const isAssigned = assigned.includes(emp._id?.toString());
              return (
                <div key={emp._id} style={{
                  display: "flex", alignItems: "center", gap: "0.6rem",
                  padding: "0.5rem 0.6rem", borderRadius: "10px", marginBottom: "0.28rem",
                  background: isAssigned ? "rgba(16,185,129,0.05)" : "#1e2433",
                  border: `1px solid ${isAssigned ? "rgba(16,185,129,0.15)" : "#252d3d"}`,
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: m.bg, border: `1px solid ${m.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.82rem", overflow: "hidden" }}>
                    {emp.image ? <img src={emp.image} alt={emp.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : m.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "white", fontSize: "0.82rem", fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.name}</p>
                    <p style={{ color: m.color, fontSize: "0.65rem", margin: 0, textTransform: "capitalize" }}>{m.icon} {emp.role}</p>
                  </div>
                  {isAssigned
                    ? <span style={{ color: "#34d399", fontSize: "0.7rem", fontWeight: 600, flexShrink: 0 }}>✓ Added</span>
                    : <button onClick={() => assign(emp)} disabled={busy === emp._id}
                        style={{ ...btnPrimary, padding: "0.28rem 0.85rem", fontSize: "0.72rem", flexShrink: 0, opacity: busy === emp._id ? 0.6 : 1 }}>
                        {busy === emp._id ? "…" : "Add"}
                      </button>
                  }
                </div>
              );
            })
          }
        </div>

        <div style={{ padding: "0.7rem 1.25rem", borderTop: "1px solid rgba(99,102,241,0.1)" }}>
          <button style={{ ...btnGhost, width: "100%", textAlign: "center", padding: "0.5rem" }} onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────
export default function StaffAssignmentTab({ toast }) {
  const [bookings,  setBookings]  = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("all");
  const [search,    setSearch]    = useState("");
  const [modal,     setModal]     = useState(null);
  const [removing,  setRemoving]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/assignments");
      setBookings(res.data.bookings   || []);
      setEmployees(res.data.employees || []);
    } catch { toast("Could not load assignments", "error"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, []);

  const patchBooking = (updated) => {
    setBookings(prev => prev.map(b => b._id === updated._id ? updated : b));
    if (modal?._id === updated._id) setModal(updated);
  };

  const removeStaff = async (bookingId, empId, empName) => {
    setRemoving(`${bookingId}-${empId}`);
    try {
      const res = await api.delete(`/assignments/${bookingId}/assign/${empId}`);
      patchBooking(res.data.booking);
      toast(`${empName} removed`, "success");
    } catch (e) { toast(e.response?.data?.message || "Could not remove", "error"); }
    setRemoving(null);
  };

  const filtered = bookings.filter(b => {
    if (filter === "unassigned" && (b.assignedStaff || []).length > 0) return false;
    if (filter === "assigned"   && (b.assignedStaff || []).length === 0) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!b.clientName?.toLowerCase().includes(q) && !(b.bookingRef || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const unassigned = bookings.filter(b => (b.assignedStaff || []).length === 0).length;

  return (
    <div style={{ fontFamily: "'Inter',sans-serif" }}>

      <style>{`
        .sa-ov {
          position:fixed; inset:0; z-index:600;
          background:rgba(2,1,8,.65); backdrop-filter:blur(6px);
          display:flex; align-items:center; justify-content:center;
          padding:.75rem; animation:saFd .15s ease;
        }
        @keyframes saFd { from{opacity:0} to{opacity:1} }
        .sa-modal {
          width:100%; max-width:460px;
          background:linear-gradient(160deg,#110a2e,#0c0720);
          border:1px solid rgba(99,102,241,.22); border-radius:18px;
          max-height:88vh; overflow:hidden; display:flex; flex-direction:column;
          box-shadow:0 32px 80px rgba(0,0,0,.85);
          animation:saUp .2s cubic-bezier(.22,1,.36,1);
        }
        @keyframes saUp { from{opacity:0;transform:translateY(14px) scale(.97)} to{opacity:1;transform:none} }
        .sa-modal > div:nth-child(4) { overflow-y:auto; }
        .sa-modal > div:nth-child(4)::-webkit-scrollbar { width:3px; }
        .sa-modal > div:nth-child(4)::-webkit-scrollbar-thumb { background:rgba(99,102,241,.3); border-radius:2px; }

        .sa-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:.85rem; }
        .sa-card {
          background:linear-gradient(135deg,#1e2433,rgba(255,255,255,.015));
          border:1px solid rgba(99,102,241,.35); border-radius:16px;
          overflow:hidden; transition:border-color .2s, box-shadow .2s;
        }
        .sa-card:hover { border-color:rgba(99,102,241,.28); box-shadow:0 8px 28px rgba(0,0,0,.28); }

        .sa-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:.75rem; margin-bottom:1.25rem; }

        @media(max-width:640px) {
          .sa-grid  { grid-template-columns:1fr; }
          .sa-stats { grid-template-columns:repeat(2,1fr); }
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "'Sora',sans-serif", color: "white", fontSize: "clamp(1.4rem,4vw,1.75rem)", fontWeight: 600, margin: "0 0 4px" }}>
          Staff <em style={{ color: "#818cf8", fontStyle: "italic" }}>Assignments</em>
        </h2>
        <p style={{ color: "rgba(255,255,255,0.32)", fontSize: "0.82rem", margin: 0 }}>
          Assign managers, chefs &amp; staff to upcoming bookings
        </p>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="sa-stats">
        {[
          { label: "Total Bookings", value: bookings.length,                                                color: "#6366f1" },
          { label: "Unassigned",     value: unassigned,                                                     color: "#f59e0b" },
          { label: "Staffed",        value: bookings.filter(b => (b.assignedStaff||[]).length > 0).length, color: "#10b981" },
          { label: "Active Staff",   value: employees.length,                                               color: "#06b6d4" },
        ].map(s => (
          <div key={s.label} style={{ background: "linear-gradient(135deg,#1e2433,#1e2433)", border: `1px solid ${s.color}28`, borderRadius: "14px", padding: ".85rem 1rem" }}>
            <p style={{ color: "rgba(255,255,255,.35)", fontSize: ".6rem", letterSpacing: ".1em", textTransform: "uppercase", margin: "0 0 4px", fontWeight: 600 }}>{s.label}</p>
            <p style={{ color: s.color, fontSize: "1.5rem", fontWeight: 700, fontFamily: "'Sora',sans-serif", margin: 0, lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: ".5rem", marginBottom: "1.1rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: ".28rem" }}>
          {[["all","All"], ["unassigned","Unassigned"], ["assigned","Assigned"]].map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} style={{
              padding: ".32rem .82rem", borderRadius: "999px", fontSize: ".74rem",
              fontFamily: "'Inter',sans-serif", fontWeight: 600, cursor: "pointer",
              border: `1px solid ${filter === id ? "rgba(99,102,241,.55)" : "rgba(99,102,241,.15)"}`,
              background: filter === id ? "linear-gradient(135deg,rgba(99,102,241,.38),rgba(99,102,241,.22))" : "transparent",
              color: filter === id ? "white" : "#94a3b8", transition: "all .15s",
            }}>{label}</button>
          ))}
        </div>
        <div style={{ position: "relative", flex: 1, minWidth: 160 }}>
          <span style={{ position: "absolute", left: ".8rem", top: "50%", transform: "translateY(-50%)", color: "rgba(99,102,241,.35)", fontSize: ".78rem", pointerEvents: "none" }}>🔍</span>
          <input className="a-input" placeholder="Search name or ref…" style={{ paddingLeft: "2.1rem", fontSize: ".78rem", width: "100%" }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* ── Loading ─────────────────────────────────────────────────────── */}
      {loading && (
        <div style={{ textAlign: "center", padding: "4rem", color: "rgba(255,255,255,.22)" }}>
          <div style={{ fontSize: "2rem", marginBottom: ".75rem", opacity: .35 }}>📌</div>
          Loading…
        </div>
      )}

      {/* ── Empty ───────────────────────────────────────────────────────── */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem 2rem", border: "1px solid rgba(99,102,241,.1)", borderRadius: "16px" }}>
          <p style={{ fontSize: "1.8rem", marginBottom: ".5rem" }}>📋</p>
          <p style={{ color: "rgba(255,255,255,.28)", fontSize: ".88rem" }}>
            {search || filter !== "all" ? "No bookings match" : "No active bookings"}
          </p>
        </div>
      )}

      {/* ── Cards ───────────────────────────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <div className="sa-grid">
          {filtered.map(booking => {
            const ds    = getDisplayStatus(booking);
            const sc    = statusColor[ds]  || "#888";
            const sbg   = statusBg[ds]     || "transparent";
            const sbd   = statusBorder[ds] || "transparent";
            const staff = booking.assignedStaff || [];
            const needed       = neededRoles(booking.cateringOption);
            const coveredRoles = [...new Set(staff.map(a => a.employeeId?.role).filter(Boolean))];
            const missing      = needed.filter(r => !coveredRoles.includes(r));
            const pct          = needed.length ? Math.round((coveredRoles.length / needed.length) * 100) : 0;
            const complete     = missing.length === 0 && needed.length > 0;

            return (
              <div key={booking._id} className="sa-card">

                {/* ── Info section ── */}
                <div style={{ padding: ".9rem 1rem .8rem" }}>

                  {/* Name row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: ".4rem", marginBottom: ".28rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".35rem", flex: 1, minWidth: 0 }}>
                      <p style={{ color: "white", fontSize: ".88rem", fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{booking.clientName}</p>
                      <span style={{ background: sbg, color: sc, border: `1px solid ${sbd}`, borderRadius: "999px", padding: "1px 7px", fontSize: ".57rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", flexShrink: 0 }}>{ds}</span>
                    </div>
                    {booking.bookingRef && (
                      <span style={{ color: "#94a3b8", fontSize: ".6rem", fontWeight: 600, flexShrink: 0 }}>{booking.bookingRef}</span>
                    )}
                  </div>

                  {/* Hall · date · slot */}
                  <p style={{ color: "rgba(255,255,255,.35)", fontSize: ".73rem", margin: "0 0 .55rem" }}>
                    {booking.hallId?.name || "—"} &nbsp;·&nbsp; {fmtDate(booking.eventDate)} &nbsp;·&nbsp; {SLOT[booking.timeSlot] || booking.timeSlot}
                  </p>

                  {/* Catering + guests — simple text, no big badge */}
                  <p style={{ color: "rgba(255,255,255,.28)", fontSize: ".7rem", margin: 0 }}>
                    {booking.cateringOption === "self-catering" ? "🥡 Self-catering" : booking.cateringOption === "our-menu" ? "🍽️ Our menu" : "📋 Not specified"}
                    &nbsp;&nbsp;·&nbsp;&nbsp;{booking.guests} guests
                  </p>
                </div>

                {/* ── Coverage bar ── */}
                <div style={{ padding: "0 1rem .7rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ color: "rgba(255,255,255,.25)", fontSize: ".6rem" }}>{coveredRoles.length}/{needed.length} roles covered</span>
                    <span style={{ fontSize: ".6rem", fontWeight: 700, color: complete ? "#34d399" : pct > 0 ? "#f59e0b" : "#f87171" }}>
                      {complete ? "✓ Complete" : missing.length > 0 ? `${missing.length} missing` : "Not started"}
                    </span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: "#1e2433", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 2, transition: "width .5s ease",
                      width: `${pct}%`,
                      background: complete ? "linear-gradient(90deg,#10b981,#34d399)" : pct > 0 ? "linear-gradient(90deg,#f59e0b,#fbbf24)" : "rgba(248,113,113,0.4)",
                    }} />
                  </div>
                </div>

                {/* ── Assigned staff ── */}
                <div style={{ borderTop: "1px solid rgba(99,102,241,.08)", padding: ".6rem 1rem" }}>
                  {staff.length === 0 ? (
                    <p style={{ color: "rgba(255,255,255,.22)", fontSize: ".73rem", margin: 0 }}>No staff assigned yet</p>
                  ) : (
                    staff.map(s => {
                      const emp   = s.employeeId;
                      if (!emp) return null;
                      const empId = (emp._id || emp)?.toString();
                      const m     = RM(emp.role);
                      const isRem = removing === `${booking._id}-${empId}`;
                      return (
                        <div key={empId} style={{ display: "flex", alignItems: "center", gap: ".5rem", padding: ".32rem 0", borderBottom: "1px solid #1e2433" }}>
                          {/* Avatar */}
                          <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: m.bg, border: `1px solid ${m.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".72rem", overflow: "hidden" }}>
                            {emp.image ? <img src={emp.image} alt={emp.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : m.icon}
                          </div>
                          {/* Name */}
                          <p style={{ color: "rgba(255,255,255,.75)", fontSize: ".78rem", fontWeight: 600, margin: 0, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.name}</p>
                          {/* Role — just text, no badge */}
                          <span style={{ color: m.color, fontSize: ".65rem", textTransform: "capitalize", flexShrink: 0 }}>{emp.role}</span>
                          {/* Remove */}
                          <button disabled={isRem} onClick={() => removeStaff(booking._id, empId, emp.name)} style={{ background: "none", border: "none", color: "rgba(248,113,113,.5)", fontSize: ".7rem", cursor: isRem ? "not-allowed" : "pointer", padding: "2px 4px", flexShrink: 0, opacity: isRem ? 0.4 : 1 }}>
                            {isRem ? "…" : "✕"}
                          </button>
                        </div>
                      );
                    })
                  )}

                  {/* Missing roles — just plain text */}
                  {missing.length > 0 && (
                    <p style={{ color: "rgba(255,255,255,.2)", fontSize: ".65rem", margin: staff.length > 0 ? ".45rem 0 0" : ".1rem 0 0" }}>
                      Still needed: {missing.join(", ")}
                    </p>
                  )}
                </div>

                {/* ── Action button ── */}
                <div style={{ padding: "0 1rem .85rem" }}>
                  <button
                    onClick={() => setModal(booking)}
                    style={{
                      width: "100%", padding: ".46rem", borderRadius: "10px",
                      fontSize: ".78rem", fontWeight: 600, cursor: "pointer",
                      fontFamily: "'Inter',sans-serif",
                      border: staff.length > 0 ? "1px solid rgba(99,102,241,.25)" : "none",
                      background: staff.length === 0 ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "rgba(99,102,241,.1)",
                      color: "white", transition: "transform .15s, box-shadow .15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 5px 18px rgba(79,70,229,.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  >
                    {staff.length === 0 ? "+ Assign Staff" : "Manage Staff"}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ───────────────────────────────────────────────────────── */}
      {modal && (
        <AssignModal
          booking={modal}
          employees={employees}
          onClose={() => setModal(null)}
          onAssigned={updated => { patchBooking(updated); toast("Staff assigned", "success"); }}
        />
      )}
    </div>
  );
}