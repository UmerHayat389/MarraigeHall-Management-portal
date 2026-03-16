import React, { useState, useEffect } from "react";
import api from "../services/api";
import { statusColor, statusBg, statusBorder, btnGhost, btnDanger, getDisplayStatus } from "./adminTheme";
import BookingDetailModal from "./BookingDetailModal";

export default function BookingsTab({ toast }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("All");
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const PER_PAGE = 10;

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

  // Reset to page 1 when filter or search changes
  useEffect(() => { setPage(1); }, [filter, search]);

  const filtered = bookings
    .filter(b => filter==="All" || getDisplayStatus(b)===filter)
    .filter(b => !search ||
      b.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      b.bookingRef?.toLowerCase().includes(search.toLowerCase()) ||
      b.clientPhone?.includes(search) ||
      b.eventType?.toLowerCase().includes(search.toLowerCase()) ||
      b.hallId?.name?.toLowerCase().includes(search.toLowerCase())
    );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
          <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.8rem", margin:0 }}>{filtered.length !== bookings.length ? `${filtered.length} of ${bookings.length} bookings` : `${bookings.length} total bookings`}</p>
        </div>

        {/* Search */}
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:"0.8rem", top:"50%", transform:"translateY(-50%)", color:"rgba(167,139,250,0.4)", fontSize:"0.85rem" }}>🔍</span>
          <input className="a-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, ref, phone…" style={{ paddingLeft:"2.2rem", width:220, fontSize:"0.82rem" }} />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-row" style={{ display:"flex", gap:"0.4rem", marginBottom:"1.25rem" }}>
        {["All","Pending","Confirmed","Cancelled","Completed"].map(s => (
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
        <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
          {paginated.map(b => {
            const ds  = getDisplayStatus(b);
            const sc  = statusColor[ds] || "#888";
            const sbg = statusBg[ds]    || "transparent";
            const sbd = statusBorder[ds]|| "transparent";
            const dateStr = b.eventDate
              ? new Date(b.eventDate).toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"})
              : "—";
            const slot = b.timeSlot ? b.timeSlot.charAt(0).toUpperCase()+b.timeSlot.slice(1) : "—";
            return (
              <div
                key={b._id}
                onClick={() => setSelected(b)}
                style={{
                  display:"flex", alignItems:"stretch", borderRadius:12, overflow:"hidden", cursor:"pointer",
                  border:"1px solid rgba(139,92,246,0.13)",
                  background:"rgba(255,255,255,0.025)",
                  transition:"all 0.16s",
                }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(147,51,234,0.38)"; e.currentTarget.style.background="rgba(109,40,217,0.07)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(139,92,246,0.13)"; e.currentTarget.style.background="rgba(255,255,255,0.025)"; }}
              >
                {/* Status accent bar */}
                <div style={{ width:3, flexShrink:0, background:sc }} />

                {/* Main content */}
                <div style={{ flex:1, padding:"12px 16px", minWidth:0, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                  {/* Left: name + meta */}
                  <div style={{ minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                      <span style={{ color:"white", fontWeight:600, fontSize:"0.88rem" }}>{b.clientName}</span>
                      <span style={{ fontSize:"0.6rem", fontWeight:700, padding:"2px 7px", borderRadius:99, textTransform:"uppercase", letterSpacing:"0.07em", background:sbg, color:sc, border:`1px solid ${sbd}`, flexShrink:0 }}>{ds}</span>
                      {b.bookingRef && <span style={{ fontSize:"0.63rem", fontWeight:600, padding:"2px 7px", borderRadius:99, background:"rgba(139,92,246,0.1)", color:"rgba(196,139,252,0.65)", border:"1px solid rgba(139,92,246,0.18)", flexShrink:0 }}>{b.bookingRef}</span>}
                    </div>
                    {/* Essential info — only hall, date, slot */}
                    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                      <span style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.5)" }}>{b.hallId?.name||"—"}</span>
                      <span style={{ color:"rgba(255,255,255,0.18)", fontSize:"0.65rem" }}>·</span>
                      <span style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.5)" }}>{dateStr}</span>
                      <span style={{ color:"rgba(255,255,255,0.18)", fontSize:"0.65rem" }}>·</span>
                      <span style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.5)" }}>{slot}</span>
                      <span style={{ color:"rgba(255,255,255,0.18)", fontSize:"0.65rem" }}>·</span>
                      <span style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.4)" }}>{b.guests} guests</span>
                    </div>
                  </div>

                  {/* Right: price */}
                  <span style={{ color:"#c084fc", fontWeight:700, fontSize:"0.9rem", flexShrink:0 }}>
                    PKR {b.totalPrice?.toLocaleString()}
                  </span>
                </div>

                {/* Action buttons */}
                <div
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"0 14px", borderLeft:"1px solid rgba(139,92,246,0.1)", flexShrink:0 }}
                  onClick={e => e.stopPropagation()}
                >
                  {ds === "Pending" && (
                    <button
                      onClick={() => updateStatus(b._id,"Confirmed")}
                      style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 13px", borderRadius:8, fontSize:"0.75rem", fontWeight:600, cursor:"pointer", border:"1px solid rgba(16,185,129,0.4)", background:"rgba(16,185,129,0.12)", color:"#4ade80", whiteSpace:"nowrap", transition:"all 0.15s" }}
                      onMouseEnter={e=>{ e.currentTarget.style.background="rgba(16,185,129,0.25)"; e.currentTarget.style.borderColor="rgba(16,185,129,0.6)"; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background="rgba(16,185,129,0.12)"; e.currentTarget.style.borderColor="rgba(16,185,129,0.4)"; }}
                    ><span style={{fontSize:11}}>✓</span> Confirm</button>
                  )}
                  {ds !== "Cancelled" && ds !== "Completed" && (
                    <button
                      onClick={() => updateStatus(b._id,"Cancelled")}
                      style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 13px", borderRadius:8, fontSize:"0.75rem", fontWeight:600, cursor:"pointer", border:"1px solid rgba(239,68,68,0.35)", background:"rgba(239,68,68,0.1)", color:"#f87171", whiteSpace:"nowrap", transition:"all 0.15s" }}
                      onMouseEnter={e=>{ e.currentTarget.style.background="rgba(239,68,68,0.22)"; e.currentTarget.style.borderColor="rgba(239,68,68,0.55)"; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background="rgba(239,68,68,0.1)"; e.currentTarget.style.borderColor="rgba(239,68,68,0.35)"; }}
                    ><span style={{fontSize:11}}>✕</span> Cancel</button>
                  )}
                  <button
                    onClick={() => deleteBooking(b._id)}
                    style={{ display:"flex", alignItems:"center", justifyContent:"center", width:32, height:32, borderRadius:8, cursor:"pointer", border:"1px solid rgba(239,68,68,0.25)", background:"rgba(239,68,68,0.07)", color:"#f87171", fontSize:"0.85rem", transition:"all 0.15s", flexShrink:0 }}
                    onMouseEnter={e=>{ e.currentTarget.style.background="rgba(239,68,68,0.2)"; e.currentTarget.style.borderColor="rgba(239,68,68,0.5)"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background="rgba(239,68,68,0.07)"; e.currentTarget.style.borderColor="rgba(239,68,68,0.25)"; }}
                  >🗑</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && filtered.length > PER_PAGE && (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"1.25rem", flexWrap:"wrap", gap:"0.5rem" }}>
          {/* Info text */}
          <p style={{ color:"rgba(255,255,255,0.28)", fontSize:"0.78rem", margin:0 }}>
            Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length} bookings
          </p>

          {/* Page buttons */}
          <div style={{ display:"flex", alignItems:"center", gap:"0.35rem" }}>
            {/* Prev */}
            <button
              onClick={()=>setPage(p=>Math.max(1,p-1))}
              disabled={page===1}
              style={{ padding:"0.38rem 0.75rem", borderRadius:9, border:"1px solid rgba(139,92,246,0.22)", background:"rgba(255,255,255,0.03)", color: page===1?"rgba(255,255,255,0.2)":"rgba(192,132,252,0.7)", fontSize:"0.78rem", cursor:page===1?"not-allowed":"pointer", transition:"all 0.15s", fontWeight:600 }}
              onMouseEnter={e=>{ if(page>1){ e.currentTarget.style.background="rgba(109,40,217,0.2)"; e.currentTarget.style.color="white"; }}}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.color=page===1?"rgba(255,255,255,0.2)":"rgba(192,132,252,0.7)"; }}>
              ← Prev
            </button>

            {/* Page number pills */}
            {Array.from({ length: totalPages }, (_,i) => i+1)
              .filter(n => n===1 || n===totalPages || Math.abs(n-page)<=1)
              .reduce((acc, n, idx, arr) => {
                if (idx>0 && n-arr[idx-1]>1) acc.push("...");
                acc.push(n);
                return acc;
              }, [])
              .map((n, idx) => n==="..." ? (
                <span key={`dot-${idx}`} style={{ color:"rgba(255,255,255,0.2)", fontSize:"0.78rem", padding:"0 2px" }}>…</span>
              ) : (
                <button key={n} onClick={()=>setPage(n)} style={{
                  width:34, height:34, borderRadius:9, border:`1px solid ${page===n?"rgba(147,51,234,0.6)":"rgba(139,92,246,0.2)"}`,
                  background: page===n?"linear-gradient(135deg,rgba(109,40,217,0.5),rgba(147,51,234,0.3))":"rgba(255,255,255,0.03)",
                  color: page===n?"white":"rgba(192,132,252,0.6)", fontSize:"0.8rem", fontWeight: page===n?700:500,
                  cursor:"pointer", transition:"all 0.15s",
                  boxShadow: page===n?"0 0 0 2px rgba(147,51,234,0.2)":"none",
                }}>{n}</button>
              ))
            }

            {/* Next */}
            <button
              onClick={()=>setPage(p=>Math.min(totalPages,p+1))}
              disabled={page===totalPages}
              style={{ padding:"0.38rem 0.75rem", borderRadius:9, border:"1px solid rgba(139,92,246,0.22)", background:"rgba(255,255,255,0.03)", color: page===totalPages?"rgba(255,255,255,0.2)":"rgba(192,132,252,0.7)", fontSize:"0.78rem", cursor:page===totalPages?"not-allowed":"pointer", transition:"all 0.15s", fontWeight:600 }}
              onMouseEnter={e=>{ if(page<totalPages){ e.currentTarget.style.background="rgba(109,40,217,0.2)"; e.currentTarget.style.color="white"; }}}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.color=page===totalPages?"rgba(255,255,255,0.2)":"rgba(192,132,252,0.7)"; }}>
              Next →
            </button>
          </div>
        </div>
      )}

      {selected && <BookingDetailModal booking={selected} onClose={()=>setSelected(null)} onStatusChange={updateStatus} />}
    </div>
  );
}