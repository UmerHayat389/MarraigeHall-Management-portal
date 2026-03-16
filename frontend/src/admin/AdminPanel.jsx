import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

import { FONTS, ADMIN_CSS, btnDanger } from "./adminTheme";
import AdminLogin    from "../pages/AdminLogin";
import AdminToast    from "./AdminToast";
import DashboardTab  from "./DashboardTab";
import HallsTab      from "./HallsTab";
import BookingsTab   from "./BookingsTab";
import CalendarTab   from "./CalendarTab";
import DishesTab     from "./DishesTab"; // NEW: Import Dishes Tab

const TABS = [
  { id:"dashboard", label:"Dashboard", icon:"📊" },
  { id:"halls",     label:"Halls",     icon:"🏛️" },
  { id:"bookings",  label:"Bookings",  icon:"📋" },
  { id:"dishes",    label:"Dishes",    icon:"🍽️" }, // NEW: Added Dishes Tab
  { id:"calendar",  label:"Calendar",  icon:"📅" },
];

export default function AdminPanel() {
  const [user, setUser]   = useState(()=>{ try{return JSON.parse(localStorage.getItem("adminUser")||"null");}catch{return null;} });
  const [stats, setStats] = useState({ halls:0, bookings:0, pending:0, revenue:0 });
  const [allBookings, setAllBookings] = useState([]);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  // Derive active tab from URL
  const pathSeg  = location.pathname.replace(/^\/admin\/?/,"") || "dashboard";
  const activeTab = TABS.find(t=>t.id===pathSeg) ? pathSeg : "dashboard";

  const showToast = (msg, type="success") => setToast({ msg, type });
  const logout = () => { localStorage.removeItem("adminToken"); localStorage.removeItem("adminUser"); setUser(null); navigate("/admin"); };
  const switchTab = id => { navigate(`/admin/${id}`); setSidebarOpen(false); };

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get("/halls").catch(()=>({data:{}})),
      api.get("/bookings").catch(()=>({data:{}})),
    ]).then(([hr,br]) => {
      const halls    = hr.data.halls    || hr.data    || [];
      const bookings = br.data.bookings || br.data    || [];
      const pending  = bookings.filter(b=>b.status==="Pending").length;
      const revenue  = bookings.filter(b=>b.status==="Confirmed").reduce((s,b)=>s+(b.totalPrice||0),0);
      setStats({ halls:halls.length, bookings:bookings.length, pending, revenue });
      setAllBookings(bookings);
    });
  }, [activeTab, user]);

  if (!user) return <AdminLogin onLogin={u=>{ setUser(u); navigate("/admin/dashboard"); }} />;

  return (
    <div className="admin-wrap">
      <style>{FONTS}{ADMIN_CSS}</style>

      {/* Mobile top bar */}
      <div className="admin-topbar">
        <button onClick={()=>setSidebarOpen(o=>!o)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.7)", cursor:"pointer", fontSize:"1.5rem", padding:"0.2rem", lineHeight:1 }}>☰</button>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.2rem", margin:0 }}>
          <span style={{ color:"#a855f7" }}>Noor</span><span style={{ color:"white" }}> Mahal</span>
        </p>
        <button onClick={logout} style={{ ...btnDanger, fontSize:"0.72rem", padding:"0.32rem 0.75rem" }}>Logout</button>
      </div>

      {/* Sidebar overlay */}
      <div className={`sidebar-overlay${sidebarOpen?" open":""}`} onClick={()=>setSidebarOpen(false)} />

      <div className="admin-layout">
        {/* ── Sidebar ── */}
        <aside className={`admin-sidebar${sidebarOpen?" open":""}`}>
          {/* Logo */}
          <div style={{ padding:"0 0.5rem 2rem" }}>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.4rem", margin:"0 0 3px", lineHeight:1 }}>
              <span style={{ color:"#a855f7" }}>Noor</span><span style={{ color:"white" }}> Mahal</span>
            </p>
            <p style={{ color:"rgba(255,255,255,0.22)", fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", margin:0 }}>Admin Panel</p>
          </div>

          {/* Nav */}
          <nav style={{ flex:1 }}>
            {TABS.map(t => (
              <button key={t.id} className={`nav-btn${activeTab===t.id?" active":""}`} onClick={()=>switchTab(t.id)}>
                <span style={{ fontSize:"1rem", flexShrink:0 }}>{t.icon}</span>
                <span>{t.label}</span>
                {t.id==="bookings" && stats.pending>0 && (
                  <span style={{ marginLeft:"auto", background:"linear-gradient(135deg,#6d28d9,#9333ea)", color:"white", fontSize:"0.6rem", padding:"2px 8px", borderRadius:"999px", fontWeight:700 }}>
                    {stats.pending}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* User info + logout */}
          <div style={{ borderTop:"1px solid rgba(139,92,246,0.12)", paddingTop:"1rem" }}>
            <div style={{ padding:"0.6rem 0.9rem", borderRadius:"12px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(139,92,246,0.1)", marginBottom:"0.75rem" }}>
              <p style={{ color:"rgba(255,255,255,0.22)", fontSize:"0.6rem", textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 3px" }}>Signed in as</p>
              <p style={{ color:"rgba(255,255,255,0.65)", fontSize:"0.78rem", margin:0, wordBreak:"break-all" }}>{user.email}</p>
            </div>
            <button onClick={logout} style={{ ...btnDanger, width:"100%", textAlign:"center", padding:"0.62rem", fontSize:"0.82rem" }}>Sign Out</button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="admin-main">
          {activeTab==="dashboard" && <DashboardTab stats={stats} bookings={allBookings} switchTab={switchTab} />}
          {activeTab==="halls"     && <HallsTab     toast={showToast} />}
          {activeTab==="bookings"  && <BookingsTab  toast={showToast} />}
          {activeTab==="dishes"    && <DishesTab    toast={showToast} />} {/* NEW: Dishes Tab Route */}
          {activeTab==="calendar"  && <CalendarTab  toast={showToast} />}
        </main>
      </div>

      {toast && <AdminToast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)} />}
    </div>
  );
}