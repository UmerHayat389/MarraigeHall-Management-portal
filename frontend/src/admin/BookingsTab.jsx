import React, { useState, useEffect } from "react";
import api from "../services/api";
import { statusColor, statusBg, statusBorder, btnGhost, btnDanger } from "./adminTheme";
import BookingDetailModal from "./BookingDetailModal";

export default function BookingsTab({ toast }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("All");
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    api.get("/bookings").then(r => setBookings(r.data.bookings||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}`, { status });
      setBookings(b => b.map(x => x._id===id ? {...x,status} : x));
      if (selected?._id===id) setSelected(x => ({...x,status}));
      toast(`Booking ${status}`, "success");
    } catch { toast("Update failed","error"); }
  };

  const deleteBooking = async id => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      await api.delete(`/bookings/${id}`);
      setBookings(b => b.filter(x => x._id!==id));
      setSelected(null);
      toast("Booking deleted","success");
    } catch { toast("Failed to delete","error"); }
  };

  const filtered = bookings
    .filter(b => filter==="All" || b.status===filter)
    .filter(b => !search || b.clientName?.toLowerCase().includes(search.toLowerCase()) || b.bookingRef?.toLowerCase().includes(search.toLowerCase()) || b.clientPhone?.includes(search));

  const counts = {
    All: bookings.length,
    Pending: bookings.filter(b=>b.status==="Pending").length,
    Confirmed: bookings.filter(b=>b.status==="Confirmed").length,
    Cancelled: bookings.filter(b=>b.status==="Cancelled").length,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.5rem", flexWrap:"wrap", gap:"0.75rem" }}>
        <div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", color:"white", fontSize:"1.75rem", fontWeight:600, margin:"0 0 4px" }}>
            All <em style={{ color:"#9333ea", fontStyle:"italic" }}>Bookings</em>
          </h2>
          <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.8rem", margin:0 }}>{bookings.length} total bookings</p>
        </div>

        {/* Search */}
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:"0.8rem", top:"50%", transform:"translateY(-50%)", color:"rgba(167,139,250,0.4)", fontSize:"0.85rem" }}>🔍</span>
          <input className="a-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, ref, phone…" style={{ paddingLeft:"2.2rem", width:220, fontSize:"0.82rem" }} />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-row" style={{ display:"flex", gap:"0.4rem", marginBottom:"1.25rem" }}>
        {["All","Pending","Confirmed","Cancelled"].map(s => (
          <button key={s} onClick={()=>setFilter(s)} style={{
            padding:"0.38rem 0.9rem", borderRadius:"999px", fontSize:"0.75rem", fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600,
            border:`1px solid ${filter===s ? "rgba(147,51,234,0.55)" : "rgba(139,92,246,0.18)"}`,
            background: filter===s ? "linear-gradient(135deg,rgba(109,40,217,0.4),rgba(147,51,234,0.25))" : "transparent",
            color: filter===s ? "white" : "rgba(196,139,252,0.55)", cursor:"pointer", transition:"all 0.15s",
            display:"flex", alignItems:"center", gap:"0.35rem",
          }}>
            {s}
            <span style={{ background:filter===s?"rgba(255,255,255,0.2)":"rgba(139,92,246,0.2)", borderRadius:"999px", padding:"0 5px", fontSize:"0.65rem", fontWeight:700 }}>{counts[s]}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign:"center", padding:"4rem", color:"rgba(255,255,255,0.25)" }}>
          <div style={{ fontSize:"2rem", marginBottom:"0.75rem", opacity:0.4 }}>📋</div>
          Loading bookings…
        </div>
      ) : filtered.length===0 ? (
        <div style={{ textAlign:"center", padding:"4rem 2rem", border:"1px solid rgba(139,92,246,0.12)", borderRadius:"18px" }}>
          <p style={{ fontSize:"2rem", marginBottom:"0.6rem" }}>🔍</p>
          <p style={{ color:"rgba(255,255,255,0.28)", fontSize:"0.9rem" }}>No bookings match your filter</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"0.55rem" }}>
          {filtered.map(b => (
            <div key={b._id} className="bk-card" onClick={()=>setSelected(b)}>
              <div className="bk-row" style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"0.75rem", alignItems:"center" }}>
                {/* Left info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.55rem", marginBottom:"0.38rem", flexWrap:"wrap" }}>
                    <p style={{ color:"white", fontWeight:600, fontSize:"0.95rem", margin:0 }}>{b.clientName}</p>
                    <span className="badge" style={{ background:statusBg[b.status], color:statusColor[b.status], border:`1px solid ${statusBorder[b.status]}` }}>{b.status}</span>
                    {b.bookingRef && (
                      <span className="badge" style={{ background:"rgba(139,92,246,0.12)", color:"rgba(196,139,252,0.85)", border:"1px solid rgba(139,92,246,0.22)" }}>{b.bookingRef}</span>
                    )}
                  </div>
                  <p style={{ color:"rgba(255,255,255,0.38)", fontSize:"0.77rem", margin:0, lineHeight:1.6 }}>
                    🏛️ {b.hallId?.name||"—"} &nbsp;·&nbsp;
                    📅 {b.eventDate ? new Date(b.eventDate).toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"}) : "—"} &nbsp;·&nbsp;
                    🕐 {b.timeSlot ? b.timeSlot.charAt(0).toUpperCase()+b.timeSlot.slice(1) : "—"} &nbsp;·&nbsp;
                    🎉 {b.eventType} &nbsp;·&nbsp;
                    👥 {b.guests} guests
                  </p>
                </div>

                {/* Right actions */}
                <div className="bk-actions" style={{ display:"flex", alignItems:"center", gap:"0.45rem", flexShrink:0 }}>
                  <span style={{ color:"#c084fc", fontWeight:700, fontSize:"0.9rem", marginRight:"0.2rem" }}>PKR {b.totalPrice?.toLocaleString()}</span>
                  {b.status==="Pending" && (
                    <button style={{ ...btnGhost, color:"#34d399", borderColor:"rgba(16,185,129,0.3)", fontSize:"0.72rem", padding:"0.32rem 0.72rem" }}
                      onClick={e=>{e.stopPropagation();updateStatus(b._id,"Confirmed");}}>✓ Confirm</button>
                  )}
                  {b.status!=="Cancelled" && (
                    <button style={{ ...btnDanger, fontSize:"0.72rem", padding:"0.32rem 0.72rem" }}
                      onClick={e=>{e.stopPropagation();updateStatus(b._id,"Cancelled");}}>✕ Cancel</button>
                  )}
                  <button style={{ ...btnDanger, fontSize:"0.72rem", padding:"0.32rem 0.62rem" }}
                    onClick={e=>{e.stopPropagation();deleteBooking(b._id);}}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <BookingDetailModal booking={selected} onClose={()=>setSelected(null)} onStatusChange={updateStatus} />}
    </div>
  );
}