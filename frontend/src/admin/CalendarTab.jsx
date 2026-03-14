import React, { useState, useEffect } from "react";
import api from "../services/api";
import { statusColor, statusBg, statusBorder } from "./adminTheme";
import BookingDetailModal from "./BookingDetailModal";

const SLOTS      = ["morning","afternoon","evening"];
const SLOT_COLOR = { morning:"#06b6d4", afternoon:"#f59e0b", evening:"#9333ea" };
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function CalendarTab({ toast }) {
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [current, setCurrent]       = useState(new Date());
  const [selected, setSelected]     = useState(null);  // "YYYY-MM-DD"
  const [dayBookings, setDayBookings] = useState([]);
  const [detail, setDetail]         = useState(null);

  useEffect(() => {
    api.get("/bookings").then(r=>setBookings(r.data.bookings||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const year  = current.getFullYear();
  const month = current.getMonth();
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const todayStr   = new Date().toISOString().split("T")[0];

  // Map: "YYYY-MM-DD" → bookings[]
  const bookingMap = {};
  bookings.forEach(b => {
    if (!b.eventDate) return;
    const k = new Date(b.eventDate).toISOString().split("T")[0];
    if (!bookingMap[k]) bookingMap[k] = [];
    bookingMap[k].push(b);
  });

  const selectDay = d => {
    const ds = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    setSelected(ds);
    setDayBookings(bookingMap[ds]||[]);
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}`,{status});
      setBookings(b=>b.map(x=>x._id===id?{...x,status}:x));
      setDayBookings(b=>b.map(x=>x._id===id?{...x,status}:x));
      if (detail?._id===id) setDetail(x=>({...x,status}));
      toast(`Booking ${status}`,"success");
    } catch { toast("Update failed","error"); }
  };

  // Build calendar cells
  const cells = [];
  for (let i=0;i<firstDay;i++) cells.push(null);
  for (let d=1;d<=daysInMonth;d++) cells.push(d);

  return (
    <div>
      <div style={{ marginBottom:"1.5rem" }}>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", color:"white", fontSize:"1.75rem", fontWeight:600, margin:"0 0 4px" }}>
          Booking <em style={{ color:"#9333ea", fontStyle:"italic" }}>Calendar</em>
        </h2>
        <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.8rem", margin:0 }}>Click any date to see bookings and slot availability</p>
      </div>

      <div className="cal-layout" style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:"1.25rem", alignItems:"start" }}>
        {/* ── Calendar grid ── */}
        <div style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))", border:"1px solid rgba(139,92,246,0.14)", borderRadius:"20px", padding:"1.6rem" }}>
          {/* Month navigation */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.35rem" }}>
            <button onClick={()=>setCurrent(new Date(year,month-1,1))} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:"10px", color:"rgba(167,139,250,0.7)", cursor:"pointer", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(109,40,217,0.2)";e.currentTarget.style.color="white";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="rgba(167,139,250,0.7)";}}>‹</button>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", color:"white", fontSize:"1.3rem", fontWeight:600, margin:0, lineHeight:1 }}>{MONTH_NAMES[month]}</p>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.72rem", margin:"3px 0 0" }}>{year}</p>
            </div>
            <button onClick={()=>setCurrent(new Date(year,month+1,1))} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:"10px", color:"rgba(167,139,250,0.7)", cursor:"pointer", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(109,40,217,0.2)";e.currentTarget.style.color="white";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="rgba(167,139,250,0.7)";}}>›</button>
          </div>

          {/* Day names */}
          <div className="cal-grid" style={{ marginBottom:"6px" }}>
            {DAY_NAMES.map(d => (
              <div key={d} style={{ textAlign:"center", color:"rgba(255,255,255,0.25)", fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.08em", padding:"4px 0", textTransform:"uppercase" }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="cal-grid">
            {cells.map((d,i) => {
              if (!d) return <div key={i} />;
              const ds = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
              const bks = bookingMap[ds] || [];
              const bookedSlots = new Set(bks.filter(b=>b.status!=="Cancelled").map(b=>b.timeSlot));
              const isFull = bookedSlots.size >= 3;
              const hasAny = bookedSlots.size > 0;
              const isToday = ds === todayStr;
              const isSel   = selected === ds;
              return (
                <div key={i} className={`cal-day${isToday?" today":""}${isSel?" selected":""}${isFull?" full":hasAny?" has-booking":""}`}
                  onClick={()=>selectDay(d)}
                  style={{ flexDirection:"column" }}>
                  <span>{d}</span>
                  {hasAny && (
                    <div style={{ display:"flex", gap:2, marginTop:2 }}>
                      {SLOTS.map(s => bookedSlots.has(s) ? <div key={s} style={{ width:5, height:5, borderRadius:"50%", background:SLOT_COLOR[s], flexShrink:0 }} /> : null)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display:"flex", gap:"1.1rem", marginTop:"1.4rem", paddingTop:"1rem", borderTop:"1px solid rgba(255,255,255,0.06)", flexWrap:"wrap" }}>
            {[["#06b6d4","Morning"],["#f59e0b","Afternoon"],["#9333ea","Evening"],["rgba(239,68,68,0.8)","Fully Booked"]].map(([c,l])=>(
              <div key={l} style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:c, flexShrink:0 }} />
                <span style={{ color:"rgba(255,255,255,0.32)", fontSize:"0.68rem" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Day detail panel ── */}
        <div style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))", border:"1px solid rgba(139,92,246,0.14)", borderRadius:"20px", padding:"1.4rem", minHeight:320 }}>
          {!selected ? (
            <div style={{ textAlign:"center", padding:"3rem 1rem" }}>
              <p style={{ fontSize:"2.5rem", marginBottom:"0.75rem", opacity:0.4 }}>📅</p>
              <p style={{ color:"rgba(255,255,255,0.25)", fontSize:"0.88rem" }}>Select a date to view details</p>
            </div>
          ) : (
            <>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", color:"white", fontWeight:600, fontSize:"1.1rem", marginBottom:"0.25rem" }}>
                {new Date(selected).toLocaleDateString("en-PK",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
              </p>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.75rem", marginBottom:"1rem" }}>
                {dayBookings.filter(b=>b.status!=="Cancelled").length} active booking{dayBookings.filter(b=>b.status!=="Cancelled").length!==1?"s":""}
              </p>

              {/* Slot availability */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.4rem", marginBottom:"1.1rem" }}>
                {SLOTS.map(s => {
                  const bk = dayBookings.find(b=>b.timeSlot===s && b.status!=="Cancelled");
                  return (
                    <div key={s} style={{ padding:"8px 6px", borderRadius:"10px", background: bk ? `${SLOT_COLOR[s]}18` : "rgba(16,185,129,0.08)", border:`1px solid ${bk ? SLOT_COLOR[s]+"40" : "rgba(16,185,129,0.22)"}`, textAlign:"center" }}>
                      <p style={{ color: bk?SLOT_COLOR[s]:"#34d399", fontSize:"0.62rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", margin:"0 0 2px" }}>{s}</p>
                      <p style={{ color: bk?SLOT_COLOR[s]:"#34d399", fontSize:"0.7rem", margin:0 }}>{bk?"Booked":"Free"}</p>
                    </div>
                  );
                })}
              </div>

              {/* Booking list for day */}
              {dayBookings.length===0 ? (
                <p style={{ color:"rgba(255,255,255,0.25)", fontSize:"0.84rem", textAlign:"center", padding:"1.5rem 0" }}>No bookings on this date</p>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                  {dayBookings.map(b => (
                    <div key={b._id} onClick={()=>setDetail(b)}
                      style={{ padding:"0.75rem 0.9rem", borderRadius:"12px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(139,92,246,0.15)", cursor:"pointer", transition:"all 0.15s" }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(147,51,234,0.4)";e.currentTarget.style.background="rgba(109,40,217,0.1)";}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(139,92,246,0.15)";e.currentTarget.style.background="rgba(255,255,255,0.04)";}}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"3px" }}>
                        <p style={{ color:"white", fontWeight:600, fontSize:"0.86rem", margin:0 }}>{b.clientName}</p>
                        <span className="badge" style={{ background:statusBg[b.status], color:statusColor[b.status], border:`1px solid ${statusBorder[b.status]}` }}>{b.status}</span>
                      </div>
                      <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.73rem", margin:0 }}>
                        {b.timeSlot} · {b.eventType} · {b.guests} guests · PKR {b.totalPrice?.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {detail && <BookingDetailModal booking={detail} onClose={()=>setDetail(null)} onStatusChange={updateStatus} />}
    </div>
  );
}