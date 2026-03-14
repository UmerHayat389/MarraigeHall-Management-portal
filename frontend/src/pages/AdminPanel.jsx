import React, { useState, useEffect } from "react";
import api from "../services/api";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');`;

const ADMIN_CSS = `
  .admin-layout { display: flex; min-height: 100vh; }

  /* Sidebar */
  .admin-sidebar {
    width: 220px;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    height: 100vh;
    background: rgba(255,255,255,0.015);
    border-right: 1px solid rgba(167,139,250,0.1);
    display: flex;
    flex-direction: column;
    padding: 1.5rem 1rem;
    transition: transform 0.3s;
    z-index: 100;
  }

  /* Main content */
  .admin-main { flex: 1; padding: 2rem; overflow-y: auto; min-width: 0; }

  /* Mobile top bar */
  .admin-topbar {
    display: none;
    position: sticky;
    top: 0;
    z-index: 200;
    background: #07050f;
    border-bottom: 1px solid rgba(167,139,250,0.1);
    padding: 0.75rem 1rem;
    align-items: center;
    justify-content: space-between;
  }

  /* Mobile overlay */
  .sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    z-index: 99;
    backdrop-filter: blur(4px);
  }

  @media (max-width: 768px) {
    .admin-layout { flex-direction: column; }

    .admin-topbar { display: flex; }

    .admin-sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      transform: translateX(-100%);
      z-index: 200;
      background: #0d0920;
      border-right: 1px solid rgba(167,139,250,0.2);
    }
    .admin-sidebar.open { transform: translateX(0); }

    .sidebar-overlay.open { display: block; }

    .admin-main { padding: 1.25rem 1rem; }

    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }

  @media (max-width: 480px) {
    .stats-grid { grid-template-columns: 1fr !important; }
    .bookings-header { flex-direction: column; align-items: flex-start !important; }
    .booking-row { flex-direction: column !important; }
    .booking-actions { justify-content: flex-start !important; }
    .filter-btns { flex-wrap: wrap; }
  }
`;

const inputStyle = (err) => ({
  width: "100%", padding: "0.6rem 0.875rem", borderRadius: "10px",
  background: "rgba(255,255,255,0.05)", color: "white", fontSize: "0.85rem",
  outline: "none", border: `1px solid ${err ? "rgba(239,68,68,0.5)" : "rgba(167,139,250,0.2)"}`,
  fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box",
});
const labelStyle = { display: "block", fontSize: "0.68rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(192,132,252,0.7)", marginBottom: "0.35rem" };
const cardStyle = { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(167,139,250,0.12)", borderRadius: "16px", padding: "1.5rem" };
const btnPrimary = { padding: "0.6rem 1.4rem", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "white", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" };
const btnDanger = { padding: "0.45rem 0.9rem", borderRadius: "8px", background: "rgba(239,68,68,0.15)", color: "#f87171", fontSize: "0.78rem", cursor: "pointer", border: "1px solid rgba(239,68,68,0.25)" };
const btnGhost = { padding: "0.45rem 0.9rem", borderRadius: "8px", background: "transparent", color: "#c084fc", fontSize: "0.78rem", cursor: "pointer", border: "1px solid rgba(167,139,250,0.25)" };

/* ── Login Page — supports Admin and Employee login ── */
function LoginPage({ onLogin }) {
  const [loginType, setLoginType] = useState("admin"); // "admin" | "employee"
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) { setError("Please enter email and password"); return; }
    setLoading(true); setError("");
    try {
      if (loginType === "admin") {
        const res = await api.post("/auth/login", { email, password });
        const { user, token } = res.data;
        if (user.role !== "admin") { setError("Access denied. Admin only."); setLoading(false); return; }
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminUser", JSON.stringify(user));
        onLogin({ ...user, loginType: "admin" });
      } else {
        const res = await api.post("/employees/login", { email, password });
        const { employee, token } = res.data;
        if (!["manager"].includes(employee.role)) {
          setError("Access denied. Manager role required."); setLoading(false); return;
        }
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminUser", JSON.stringify({ ...employee, loginType: "employee" }));
        onLogin({ ...employee, loginType: "employee" });
      }
    } catch (e) {
      setError(e.response?.data?.message || "Invalid email or password");
    }
    setLoading(false);
  };

  return (
    <div style={{ background: "#07050f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", padding: "1rem" }}>
      <style>{FONTS}</style>
      <div style={{ width: "100%", maxWidth: 440, background: "linear-gradient(145deg,#1a1035,#120d2a)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "24px", padding: "2.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem" }}>
            <span style={{ color: "#a855f7" }}>Noor</span><span style={{ color: "white" }}> Mahal</span>
          </p>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 4 }}>Management Portal</p>
        </div>

        {/* Toggle: Admin / Employee */}
        <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "4px", marginBottom: "1.75rem", border: "1px solid rgba(167,139,250,0.12)" }}>
          {[["admin","Admin"],["employee","Employee"]].map(([val, lbl]) => (
            <button key={val} onClick={() => { setLoginType(val); setError(""); }}
              style={{ flex: 1, padding: "0.55rem", borderRadius: "9px", border: "none", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600, fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s",
                background: loginType === val ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "transparent",
                color: loginType === val ? "white" : "rgba(255,255,255,0.35)",
              }}>
              {lbl === "Admin" ? "🛡 Admin" : "👷 Employee"}
            </button>
          ))}
        </div>

        <h2 style={{ color: "white", fontFamily: "'Playfair Display',serif", fontWeight: 400, fontSize: "1.3rem", marginBottom: "0.3rem" }}>Welcome back</h2>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.82rem", marginBottom: "1.5rem" }}>
          {loginType === "admin" ? "Sign in to manage halls and bookings" : "Sign in to view and confirm bookings"}
        </p>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Email Address</label>
          <input style={inputStyle()} value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Enter your email" />
        </div>
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={labelStyle}>Password</label>
          <input style={inputStyle()} value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()} />
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1rem", color: "#f87171", fontSize: "0.83rem" }}>
            ✕ {error}
          </div>
        )}

        <button onClick={submit} disabled={loading} style={{ ...btnPrimary, width: "100%", padding: "0.85rem", fontSize: "0.95rem", opacity: loading ? 0.6 : 1 }}>
          {loading ? "Signing in..." : "Sign In →"}
        </button>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <a href="/" style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8rem", textDecoration: "none" }}>← Back to site</a>
        </div>
      </div>
    </div>
  );
}


/* ── Toast ── */
function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 9999, padding: "0.75rem 1.25rem", borderRadius: "12px", fontSize: "0.85rem", background: type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${type === "success" ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}`, color: type === "success" ? "#4ade80" : "#f87171", backdropFilter: "blur(12px)" }}>
      {type === "success" ? "✓ " : "✕ "}{msg}
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "1rem" }}>
      <div style={{ width: 48, height: 48, borderRadius: "12px", flexShrink: 0, background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", border: `1px solid ${color}33` }}>{icon}</div>
      <div>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</p>
        <p style={{ color: "white", fontSize: "1.5rem", fontWeight: 700, fontFamily: "'Playfair Display',serif", marginTop: 2 }}>{value}</p>
      </div>
    </div>
  );
}

/* ── Hall Modal ── */
function HallModal({ hall, onClose, onSave }) {
  const [form, setForm] = useState(hall || { name: "", location: "Karachi", pricePerHead: "", totalSeats: "", description: "", image: "" });
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErr(e => ({ ...e, [k]: "" })); };
  const submit = async () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.pricePerHead) e.pricePerHead = "Required";
    if (!form.totalSeats) e.totalSeats = "Required";
    if (Object.keys(e).length) { setErr(e); return; }
    setLoading(true);
    try {
      const res = hall?._id ? await api.put(`/halls/${hall._id}`, form) : await api.post("/halls", form);
      onSave(res.data.hall, !hall?._id);
    } catch (ex) { setErr({ submit: ex.response?.data?.message || "Error saving hall" }); }
    setLoading(false);
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(7,5,15,0.85)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth: 480, borderRadius: "20px", background: "linear-gradient(145deg,#1a1035,#120d2a)", border: "1px solid rgba(167,139,250,0.22)", padding: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: "1.2rem" }}>{hall?._id ? "Edit Hall" : "Add New Hall"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(167,139,250,0.5)", fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={labelStyle}>Hall Name *</label>
            <input style={inputStyle(err.name)} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Royal Banquet Hall" />
            {err.name && <p style={{ color: "#f87171", fontSize: "0.72rem", marginTop: 3 }}>{err.name}</p>}
          </div>
          <div>
            <label style={labelStyle}>Price Per Head (PKR) *</label>
            <input style={inputStyle(err.pricePerHead)} type="number" value={form.pricePerHead} onChange={e => set("pricePerHead", e.target.value)} placeholder="1500" />
            {err.pricePerHead && <p style={{ color: "#f87171", fontSize: "0.72rem", marginTop: 3 }}>{err.pricePerHead}</p>}
          </div>
          <div>
            <label style={labelStyle}>Total Seats *</label>
            <input style={inputStyle(err.totalSeats)} type="number" value={form.totalSeats} onChange={e => set("totalSeats", e.target.value)} placeholder="500" />
            {err.totalSeats && <p style={{ color: "#f87171", fontSize: "0.72rem", marginTop: 3 }}>{err.totalSeats}</p>}
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={labelStyle}>Location</label>
            <input style={inputStyle()} value={form.location} onChange={e => set("location", e.target.value)} placeholder="Clifton, Karachi" />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={labelStyle}>Image URL</label>
            <input style={inputStyle()} value={form.image} onChange={e => set("image", e.target.value)} placeholder="https://images.unsplash.com/..." />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle(), resize: "vertical", minHeight: 70 }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Hall description..." />
          </div>
        </div>
        {err.submit && <p style={{ color: "#f87171", fontSize: "0.8rem", marginBottom: "0.75rem", textAlign: "center" }}>{err.submit}</p>}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button style={btnGhost} onClick={onClose}>Cancel</button>
          <button style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }} onClick={submit} disabled={loading}>{loading ? "Saving..." : hall?._id ? "Save Changes" : "Add Hall"}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Halls Tab ── */
function HallsTab({ toast }) {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  useEffect(() => {
    api.get("/halls").then(res => setHalls(res.data.halls || res.data || [])).catch(() => setHalls([])).finally(() => setLoading(false));
  }, []);
  const handleSave = (hall, isNew) => {
    if (isNew) setHalls(h => [hall, ...h]); else setHalls(h => h.map(x => x._id === hall._id ? hall : x));
    setModal(null); toast(isNew ? "Hall added successfully" : "Hall updated", "success");
  };
  const deleteHall = async (id) => {
    if (!window.confirm("Delete this hall?")) return;
    try { await api.delete(`/halls/${id}`); setHalls(h => h.filter(x => x._id !== id)); toast("Hall deleted", "success"); }
    catch { toast("Failed to delete", "error"); }
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: "1.4rem", fontWeight: 400 }}>Manage <em style={{ color: "#a855f7" }}>Halls</em></h2>
        <button style={btnPrimary} onClick={() => setModal("new")}>+ Add Hall</button>
      </div>
      {loading ? <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "3rem" }}>Loading halls...</p>
        : halls.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: "center", padding: "3rem" }}>
            <p style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🏛️</p>
            <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "1rem" }}>No halls yet. Add your first hall.</p>
            <button style={btnPrimary} onClick={() => setModal("new")}>+ Add First Hall</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1rem" }}>
            {halls.map(h => (
              <div key={h._id} style={cardStyle}>
                {h.image && <img src={h.image} alt={h.name} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10, marginBottom: "1rem" }} />}
                <h3 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: "1.05rem", marginBottom: "0.5rem" }}>{h.name}</h3>
                <p style={{ color: "#c084fc", fontSize: "0.82rem", marginBottom: "0.4rem" }}>PKR {h.pricePerHead?.toLocaleString()}/head · {h.totalSeats?.toLocaleString()} seats</p>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.78rem", marginBottom: "1rem" }}>{h.location}</p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button style={btnGhost} onClick={() => setModal(h)}>✏ Edit</button>
                  <button style={btnDanger} onClick={() => deleteHall(h._id)}>🗑 Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      {(modal === "new" || (modal && modal._id)) && <HallModal hall={modal === "new" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  );
}

/* ── Bookings Tab ── */
function BookingsTab({ toast }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  useEffect(() => {
    api.get("/bookings").then(res => setBookings(res.data.bookings || [])).catch(() => setBookings([])).finally(() => setLoading(false));
  }, []);
  const updateStatus = async (id, status) => {
    try { await api.put(`/bookings/${id}`, { status }); setBookings(b => b.map(x => x._id === id ? { ...x, status } : x)); toast(`Booking ${status}`, "success"); }
    catch { toast("Update failed", "error"); }
  };
  const deleteBooking = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    try { await api.delete(`/bookings/${id}`); setBookings(b => b.filter(x => x._id !== id)); toast("Booking deleted", "success"); }
    catch { toast("Failed to delete", "error"); }
  };
  const filtered = filter === "All" ? bookings : bookings.filter(b => b.status === filter);
  const statusColor = { Pending: "#f59e0b", Confirmed: "#22c55e", Cancelled: "#ef4444" };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: "1.4rem", fontWeight: 400 }}>All <em style={{ color: "#a855f7" }}>Bookings</em></h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {["All", "Pending", "Confirmed", "Cancelled"].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: "0.35rem 0.9rem", borderRadius: "999px", fontSize: "0.75rem", border: `1px solid ${filter === s ? "rgba(167,139,250,0.5)" : "rgba(167,139,250,0.15)"}`, background: filter === s ? "rgba(124,58,237,0.3)" : "transparent", color: filter === s ? "white" : "rgba(192,132,252,0.6)", cursor: "pointer" }}>{s}</button>
          ))}
        </div>
      </div>
      {loading ? <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "3rem" }}>Loading bookings...</p>
        : filtered.length === 0 ? <div style={{ ...cardStyle, textAlign: "center", padding: "3rem" }}><p style={{ color: "rgba(255,255,255,0.3)" }}>No bookings found.</p></div>
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {filtered.map(b => (
              <div key={b._id} style={{ ...cardStyle, padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                      <p style={{ color: "white", fontWeight: 600 }}>{b.clientName}</p>
                      <span style={{ fontSize: "0.65rem", padding: "2px 8px", borderRadius: "999px", background: `${statusColor[b.status]}20`, color: statusColor[b.status], border: `1px solid ${statusColor[b.status]}44` }}>{b.status}</span>
                      {b.bookingRef && (
                        <span style={{ fontSize: "0.62rem", padding: "2px 8px", borderRadius: "999px", background: "rgba(167,139,250,0.1)", color: "rgba(192,132,252,0.8)", border: "1px solid rgba(167,139,250,0.2)", letterSpacing: "0.05em" }}>
                          {b.bookingRef}
                        </span>
                      )}
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" }}>
                      📞 {b.clientPhone} · 🏛️ {b.hallId?.name || "—"} · 📅 {b.eventDate ? new Date(b.eventDate).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "—"} · 🕐 {b.timeSlot || "—"} · 🎉 {b.eventType} · 👥 {b.guests} guests
                    </p>
                    {b.paymentMethod && (
                      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.72rem", marginTop: "0.2rem" }}>
                        💳 {b.paymentMethod}{b.transactionId ? ` · Ref: ${b.transactionId}` : ""}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ color: "#c084fc", fontWeight: 700, marginBottom: "0.5rem" }}>PKR {b.totalPrice?.toLocaleString()}</p>
                    <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                      {b.status === "Pending" && (
                        <button
                          style={{ ...btnGhost, fontSize: "0.72rem", padding: "0.3rem 0.7rem", color: "#4ade80", borderColor: "rgba(34,197,94,0.3)" }}
                          onClick={() => updateStatus(b._id, "Confirmed")}
                          title="Confirm booking — SMS will be sent to client"
                        >
                          ✓ Confirm & SMS
                        </button>
                      )}
                      {b.status !== "Cancelled" && (
                        <button style={{ ...btnDanger, fontSize: "0.72rem", padding: "0.3rem 0.7rem" }} onClick={() => updateStatus(b._id, "Cancelled")}>
                          ✕ Cancel
                        </button>
                      )}
                      <button style={{ ...btnDanger, fontSize: "0.72rem", padding: "0.3rem 0.7rem" }} onClick={() => deleteBooking(b._id)}>🗑</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

/* ── Main ── */
export default function AdminPanel() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("adminUser") || "null"); } catch { return null; }
  });
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState({ halls: 0, bookings: 0, pending: 0, revenue: 0 });
  const [toast, setToastMsg] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = (msg, type = "success") => setToastMsg({ msg, type });
  const logout = () => { localStorage.removeItem("adminToken"); localStorage.removeItem("adminUser"); setUser(null); };

  useEffect(() => {
    if (!user) return;
    Promise.all([api.get("/halls").catch(() => ({ data: {} })), api.get("/bookings").catch(() => ({ data: {} }))]).then(([hr, br]) => {
      const halls = hr.data.halls || hr.data || [];
      const bookings = br.data.bookings || br.data || [];
      const pending = bookings.filter(b => b.status === "Pending").length;
      const revenue = bookings.filter(b => b.status === "Confirmed").reduce((s, b) => s + (b.totalPrice || 0), 0);
      setStats({ halls: halls.length, bookings: bookings.length, pending, revenue });
    });
  }, [tab, user]);

  if (!user) return <LoginPage onLogin={u => setUser(u)} />;

  const isEmployee = user.loginType === "employee";
  const activeTab = isEmployee ? "bookings" : tab;
  const TABS = isEmployee
    ? [{ id: "bookings", label: "Bookings", icon: "📋" }]
    : [{ id: "dashboard", label: "Dashboard", icon: "📊" }, { id: "halls", label: "Halls", icon: "🏛️" }, { id: "bookings", label: "Bookings", icon: "📋" }];

  const switchTab = (id) => { if (!isEmployee) setTab(id); setSidebarOpen(false); };

  return (
    <div style={{ background: "#07050f", minHeight: "100vh", color: "white", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{FONTS}{ADMIN_CSS}</style>

      {/* Mobile top bar */}
      <div className="admin-topbar">
        <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", fontSize: "1.4rem", lineHeight: 1, padding: "0.25rem" }}>
          ☰
        </button>
        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.1rem" }}>
          <span style={{ color: "#a855f7" }}>Noor</span><span style={{ color: "white" }}> Mahal</span>
        </p>
        <button onClick={logout} style={{ ...btnDanger, fontSize: "0.72rem", padding: "0.3rem 0.7rem" }}>Logout</button>
      </div>

      {/* Sidebar overlay */}
      <div className={`sidebar-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
          <div style={{ marginBottom: "2rem", paddingLeft: "0.5rem" }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem" }}><span style={{ color: "#a855f7" }}>Noor</span><span style={{ color: "white" }}> Mahal</span></p>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 2 }}>
              {isEmployee ? `${user.role || "Employee"} Portal` : "Admin Panel"}
            </p>
          </div>
          <nav style={{ flex: 1 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => switchTab(t.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.65rem 0.75rem", borderRadius: "10px", marginBottom: "0.25rem", border: "none", cursor: "pointer", fontSize: "0.85rem", textAlign: "left", background: activeTab === t.id ? "rgba(124,58,237,0.25)" : "transparent", color: activeTab === t.id ? "white" : "rgba(255,255,255,0.45)", borderLeft: activeTab === t.id ? "2px solid #a855f7" : "2px solid transparent" }}>
                <span>{t.icon}</span><span>{t.label}</span>
                {t.id === "bookings" && stats.pending > 0 && <span style={{ marginLeft: "auto", background: "#a855f7", color: "white", fontSize: "0.62rem", padding: "1px 6px", borderRadius: "999px" }}>{stats.pending}</span>}
              </button>
            ))}
          </nav>
          <div style={{ borderTop: "1px solid rgba(167,139,250,0.1)", paddingTop: "1rem", marginTop: "0.5rem" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", paddingLeft: "0.75rem", marginBottom: "0.5rem" }}>{user.email}</p>
            <button onClick={logout} style={{ ...btnDanger, width: "100%", textAlign: "center" }}>Logout</button>
          </div>
        </aside>

        {/* Main content */}
        <main className="admin-main">
          {activeTab === "dashboard" && (
            <div>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.5rem,4vw,2rem)", fontWeight: 300, marginBottom: "2rem" }}>Welcome to <em style={{ color: "#a855f7" }}>Admin</em></h1>
              <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
                <StatCard label="Total Halls" value={stats.halls} icon="🏛️" color="#a855f7" />
                <StatCard label="Total Bookings" value={stats.bookings} icon="📋" color="#06b6d4" />
                <StatCard label="Pending" value={stats.pending} icon="⏳" color="#f59e0b" />
                <StatCard label="Revenue (PKR)" value={`${(stats.revenue / 1000).toFixed(0)}K`} icon="💰" color="#22c55e" />
              </div>
              <div style={{ ...cardStyle }}>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>Quick Actions</p>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <button style={btnPrimary} onClick={() => switchTab("halls")}>+ Add Hall</button>
                  <button style={btnGhost} onClick={() => switchTab("bookings")}>View Bookings</button>
                </div>
              </div>
            </div>
          )}
          {activeTab === "halls" && <HallsTab toast={showToast} />}
          {activeTab === "bookings" && <BookingsTab toast={showToast} />}
        </main>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToastMsg(null)} />}
    </div>
  );
}