import React, { useState, useEffect } from "react";
import api from "../services/api";
import { statusColor, statusBg, statusBorder } from "./adminTheme";
import BookingDetailModal from "./BookingDetailModal";

const SLOTS      = ["afternoon","evening","latenight"];
const SLOT_LABEL = { afternoon:"Afternoon", evening:"Evening", latenight:"Late Night" };
const SLOT_TIME  = { afternoon:"12–4 PM",   evening:"5–9 PM",  latenight:"10 PM–2 AM" };
const SLOT_COLOR = { afternoon:"#06b6d4",   evening:"#f59e0b", latenight:"#a855f7" };
const SLOT_DARK  = { afternoon:"rgba(6,182,212,0.18)", evening:"rgba(245,158,11,0.18)", latenight:"rgba(168,85,247,0.18)" };
const SLOT_BORDER= { afternoon:"rgba(6,182,212,0.4)",  evening:"rgba(245,158,11,0.4)",  latenight:"rgba(168,85,247,0.4)" };

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function CalendarTab({ toast }) {
  const [bookings,    setBookings]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [current,     setCurrent]     = useState(new Date());
  const [selected,    setSelected]    = useState(null);
  const [dayBookings, setDayBookings] = useState([]);
  const [detail,      setDetail]      = useState(null);

  useEffect(() => {
    api.get("/bookings")
      .then(r => setBookings(r.data.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const year        = current.getFullYear();
  const month       = current.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr    = new Date().toISOString().split("T")[0];

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
    setDayBookings(bookingMap[ds] || []);
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}`, { status });
      setBookings(b => b.map(x => x._id===id ? {...x,status} : x));
      setDayBookings(b => b.map(x => x._id===id ? {...x,status} : x));
      if (detail?._id===id) setDetail(x => ({...x,status}));
      toast(`Booking ${status}`, "success");
    } catch { toast("Update failed","error"); }
  };

  const cells = [];
  for (let i=0; i<firstDay; i++) cells.push(null);
  for (let d=1; d<=daysInMonth; d++) cells.push(d);

  const monthBks   = bookings.filter(b => { if(!b.eventDate) return false; const d=new Date(b.eventDate); return d.getFullYear()===year && d.getMonth()===month; });
  const confirmed  = monthBks.filter(b=>b.status==="Confirmed");
  const revenue    = confirmed.reduce((s,b)=>s+(b.totalPrice||0),0);

  const selectedDateLabel = selected
    ? new Date(selected+"T12:00:00").toLocaleDateString("en-PK",{weekday:"long",day:"numeric",month:"long",year:"numeric"})
    : "";

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{`
        .cal-wrap { display:grid; grid-template-columns:1fr 360px; gap:1.5rem; align-items:start; }
        .cal-7 { display:grid; grid-template-columns:repeat(7,1fr); gap:5px; }
        .c-day {
          aspect-ratio:1; border-radius:12px; border:1px solid rgba(139,92,246,0.1);
          background:rgba(255,255,255,0.02); cursor:pointer; position:relative;
          display:flex; flex-direction:column; padding:7px 6px 5px; transition:all 0.16s;
          min-height:70px;
        }
        .c-day:hover { border-color:rgba(147,51,234,0.45); background:rgba(109,40,217,0.14); transform:translateY(-1px); }
        .c-day.is-today { border-color:rgba(147,51,234,0.65)!important; background:rgba(109,40,217,0.16)!important; }
        .c-day.is-sel { border-color:#9333ea!important; background:linear-gradient(135deg,rgba(109,40,217,0.38),rgba(147,51,234,0.22))!important; box-shadow:0 0 0 2px rgba(147,51,234,0.22); }
        .c-day.is-booked { border-color:rgba(147,51,234,0.3); background:rgba(109,40,217,0.1); }
        .c-day.is-full { border-color:rgba(239,68,68,0.32); background:rgba(239,68,68,0.07); }
        .c-day.is-past { opacity:0.38; pointer-events:none; }
        .pip { height:3px; border-radius:2px; width:100%; margin-top:2px; }
        .bk-chip { font-size:0.58rem; font-weight:700; border-radius:4px; padding:1px 4px; margin-top:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }
        @media(max-width:960px){ .cal-wrap{grid-template-columns:1fr!important;} }
        @media(max-width:560px){ .c-day{min-height:44px;padding:5px 4px;} .bk-chip{display:none;} .pip{height:2px;} }
      `}</style>

      {/* ── Page header ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.75rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", color:"white", fontSize:"1.8rem", fontWeight:600, margin:"0 0 4px" }}>
            Booking <em style={{ color:"#9333ea", fontStyle:"italic" }}>Calendar</em>
          </h2>
          <p style={{ color:"rgba(255,255,255,0.28)", fontSize:"0.8rem", margin:0 }}>Click any date to see booking details</p>
        </div>

        {/* Month stat pills */}
        <div style={{ display:"flex", gap:"0.55rem" }}>
          {[
            { v: monthBks.length,      l:"Bookings",  c:"#c084fc" },
            { v: confirmed.length,     l:"Confirmed", c:"#10b981" },
            { v: monthBks.filter(b=>b.status==="Pending").length, l:"Pending", c:"#f59e0b" },
            { v:`${(revenue/1000).toFixed(0)}K`, l:"Revenue", c:"#f59e0b" },
          ].map(({v,l,c})=>(
            <div key={l} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(139,92,246,0.16)", borderRadius:14, padding:"0.5rem 0.9rem", textAlign:"center", minWidth:64 }}>
              <p style={{ color:c, fontWeight:700, fontSize:"1.05rem", margin:0, lineHeight:1.2 }}>{v}</p>
              <p style={{ color:"rgba(255,255,255,0.28)", fontSize:"0.6rem", margin:0, letterSpacing:"0.04em" }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="cal-wrap">
        {/* ── Calendar card ── */}
        <div style={{ background:"linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))", border:"1px solid rgba(139,92,246,0.15)", borderRadius:22, padding:"1.75rem" }}>

          {/* Month nav */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.4rem" }}>
            <button onClick={()=>setCurrent(new Date(year,month-1,1))}
              style={{ width:38, height:38, borderRadius:11, border:"1px solid rgba(139,92,246,0.22)", background:"rgba(255,255,255,0.04)", color:"rgba(167,139,250,0.7)", cursor:"pointer", fontSize:"1.1rem", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(109,40,217,0.28)";e.currentTarget.style.color="white";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.color="rgba(167,139,250,0.7)";}}>‹</button>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", color:"white", fontSize:"1.45rem", fontWeight:600, margin:0, lineHeight:1 }}>{MONTH_NAMES[month]}</p>
              <p style={{ color:"rgba(255,255,255,0.28)", fontSize:"0.7rem", margin:"3px 0 0" }}>{year}</p>
            </div>
            <button onClick={()=>setCurrent(new Date(year,month+1,1))}
              style={{ width:38, height:38, borderRadius:11, border:"1px solid rgba(139,92,246,0.22)", background:"rgba(255,255,255,0.04)", color:"rgba(167,139,250,0.7)", cursor:"pointer", fontSize:"1.1rem", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(109,40,217,0.28)";e.currentTarget.style.color="white";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.color="rgba(167,139,250,0.7)";}}>›</button>
          </div>

          {/* Day headers */}
          <div className="cal-7" style={{ marginBottom:6 }}>
            {DAY_NAMES.map(d=>(
              <div key={d} style={{ textAlign:"center", color:"rgba(255,255,255,0.22)", fontSize:"0.62rem", fontWeight:700, letterSpacing:"0.1em", padding:"4px 0", textTransform:"uppercase" }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="cal-7">
            {cells.map((d,i)=>{
              if (!d) return <div key={i}/>;
              const ds   = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
              const bks  = bookingMap[ds]||[];
              const acts = bks.filter(b=>b.status!=="Cancelled");
              const bookedSet = new Set(acts.map(b=>b.timeSlot));
              const isFull   = bookedSet.size>=3;
              const hasAny   = bookedSet.size>0;
              const isToday  = ds===todayStr;
              const isSel    = selected===ds;
              const isPast   = ds<todayStr && !hasAny;

              let cls = "c-day";
              if (isPast) cls+=" is-past";
              else if (isSel) cls+=" is-sel";
              else if (isToday) cls+=" is-today";
              else if (isFull) cls+=" is-full";
              else if (hasAny) cls+=" is-booked";

              return (
                <div key={i} className={cls} onClick={()=>selectDay(d)}>
                  {/* Number + count badge */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <span style={{
                      fontSize:"0.82rem", lineHeight:1, fontWeight: isToday||isSel||hasAny ? 700 : 400,
                      color: isFull?"#f87171" : isToday?"#c084fc" : isSel?"white" : hasAny?"rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)",
                    }}>{d}</span>
                    {acts.length>0 && (
                      <span style={{ fontSize:"0.52rem", fontWeight:800, lineHeight:"13px", color:isFull?"#f87171":"#c084fc", background:isFull?"rgba(239,68,68,0.18)":"rgba(147,51,234,0.22)", borderRadius:5, padding:"0 3px" }}>
                        {acts.length}
                      </span>
                    )}
                  </div>

                  {/* Slot pip bars */}
                  {hasAny && (
                    <div style={{ marginTop:"auto", display:"flex", flexDirection:"column", gap:2, width:"100%", paddingTop:4 }}>
                      {SLOTS.map(s => bookedSet.has(s) ? (
                        <div key={s} className="pip" style={{ background:SLOT_COLOR[s] }}/>
                      ):null)}
                    </div>
                  )}

                  {/* Slot name chips — show which slots are booked */}
                  {hasAny && (
                    <div style={{ display:"flex", flexDirection:"column", gap:1, marginTop:2 }}>
                      {SLOTS.filter(s=>bookedSet.has(s)).map(s=>(
                        <div key={s} className="bk-chip" style={{ background:SLOT_COLOR[s]+"22", color:SLOT_COLOR[s] }}>
                          {SLOT_LABEL[s]}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:"1rem", marginTop:"1.4rem", paddingTop:"1.1rem", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
            {[
              {c:"#06b6d4", l:"Afternoon"},
              {c:"#f59e0b", l:"Evening"},
              {c:"#a855f7", l:"Late Night"},
              {c:"rgba(109,40,217,0.6)", l:"Has booking"},
              {c:"rgba(239,68,68,0.7)",  l:"Fully booked"},
            ].map(({c,l})=>(
              <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:c, flexShrink:0 }}/>
                <span style={{ color:"rgba(255,255,255,0.28)", fontSize:"0.66rem" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div style={{ background:"linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))", border:"1px solid rgba(139,92,246,0.15)", borderRadius:22, overflow:"hidden", minHeight:400 }}>
          {!selected ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:400, gap:"0.75rem" }}>
              <div style={{ width:56, height:56, borderRadius:16, background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.6rem" }}>📅</div>
              <p style={{ color:"rgba(255,255,255,0.28)", fontSize:"0.88rem", margin:0 }}>Select a date to view details</p>
            </div>
          ) : (
            <>
              {/* Panel header */}
              <div style={{ padding:"1.4rem 1.4rem 0" }}>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", color:"white", fontWeight:600, fontSize:"1.2rem", margin:"0 0 3px" }}>
                  {selectedDateLabel}
                </p>
                <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1.1rem", flexWrap:"wrap" }}>
                  {[
                    { v:dayBookings.filter(b=>b.status!=="Cancelled").length, l:"active",    c:"#c084fc" },
                    { v:dayBookings.filter(b=>b.status==="Confirmed").length,  l:"confirmed", c:"#10b981" },
                    { v:dayBookings.filter(b=>b.status==="Pending").length,    l:"pending",   c:"#f59e0b" },
                  ].map(({v,l,c})=>(
                    <span key={l} style={{ fontSize:"0.7rem", color:c, background:`${c}14`, border:`1px solid ${c}30`, borderRadius:999, padding:"2px 9px", fontWeight:600 }}>
                      {v} {l}
                    </span>
                  ))}
                </div>

                {/* Slot status row */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.5rem", marginBottom:"1.2rem" }}>
                  {SLOTS.map(s=>{
                    const bk = dayBookings.find(b=>b.timeSlot===s && b.status!=="Cancelled");
                    return (
                      <div key={s}
                        onClick={()=>bk&&setDetail(bk)}
                        style={{ borderRadius:12, padding:"10px 6px 9px", textAlign:"center", cursor:bk?"pointer":"default",
                          background: bk ? SLOT_DARK[s] : "rgba(16,185,129,0.07)",
                          border:`1px solid ${bk ? SLOT_BORDER[s] : "rgba(16,185,129,0.2)"}`,
                          transition:"all 0.15s" }}
                        onMouseEnter={e=>{ if(bk){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 4px 16px ${SLOT_COLOR[s]}22`;}}}
                        onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
                        {/* Slot colour dot */}
                        <div style={{ width:6, height:6, borderRadius:"50%", background: bk?SLOT_COLOR[s]:"#34d399", margin:"0 auto 5px" }}/>
                        <p style={{ color: bk?SLOT_COLOR[s]:"#34d399", fontSize:"0.6rem", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", margin:"0 0 2px" }}>
                          {SLOT_LABEL[s]}
                        </p>
                        <p style={{ color: bk?SLOT_COLOR[s]:"#34d399", fontSize:"0.72rem", fontWeight:700, margin:"0 0 2px" }}>
                          {bk?"Booked":"Free"}
                        </p>
                        <p style={{ color:"rgba(255,255,255,0.28)", fontSize:"0.58rem", margin:0 }}>{SLOT_TIME[s]}</p>
                        {bk&&<p style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.6rem", margin:"4px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{bk.clientName?.split(" ")[0]}</p>}
                      </div>
                    );
                  })}
                </div>

                {dayBookings.length>0 && (
                  <p style={{ color:"rgba(255,255,255,0.22)", fontSize:"0.68rem", margin:"0 0 0.7rem", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>
                    Bookings
                  </p>
                )}
              </div>

              {/* Booking cards */}
              <div style={{ padding:"0 1.4rem 1.4rem", maxHeight:380, overflowY:"auto" }}>
                {dayBookings.length===0 ? (
                  <div style={{ textAlign:"center", padding:"2rem 0 1rem" }}>
                    <p style={{ fontSize:"1.6rem", marginBottom:6, opacity:0.25 }}>🎉</p>
                    <p style={{ color:"rgba(255,255,255,0.22)", fontSize:"0.84rem" }}>No bookings on this date</p>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
                    {dayBookings.map(b=>{
                      const sc  = statusColor[b.status]||"#888";
                      const s   = b.timeSlot;
                      const sc2 = s ? SLOT_COLOR[s] : "#9333ea";
                      return (
                        <div key={b._id} onClick={()=>setDetail(b)}
                          style={{ borderRadius:16, border:"1px solid rgba(139,92,246,0.15)", background:"rgba(255,255,255,0.03)", cursor:"pointer", overflow:"hidden", transition:"all 0.17s" }}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(147,51,234,0.4)";e.currentTarget.style.background="rgba(109,40,217,0.1)";e.currentTarget.style.transform="translateY(-1px)";}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(139,92,246,0.15)";e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.transform="translateY(0)";}}>

                          {/* Colour top bar */}
                          <div style={{ height:3, background:`linear-gradient(90deg,${sc2},${sc2}88)` }}/>

                          <div style={{ padding:"0.85rem 0.95rem" }}>
                            {/* Row 1: name + status */}
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.45rem" }}>
                              <p style={{ color:"white", fontWeight:700, fontSize:"0.9rem", margin:0 }}>{b.clientName}</p>
                              <span style={{ fontSize:"0.62rem", fontWeight:700, color:sc, background:`${sc}16`, border:`1px solid ${sc}35`, borderRadius:999, padding:"2px 8px" }}>
                                {b.status==="Confirmed"?"✓ ":b.status==="Cancelled"?"✕ ":"⏳ "}{b.status}
                              </span>
                            </div>

                            {/* Row 2: slot + event type tags */}
                            <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap", marginBottom:"0.45rem" }}>
                              {s&&<span style={{ fontSize:"0.62rem", color:sc2, background:`${sc2}16`, border:`1px solid ${sc2}35`, borderRadius:6, padding:"2px 7px", fontWeight:600 }}>
                                {SLOT_LABEL[s]} · {SLOT_TIME[s]}
                              </span>}
                              {b.eventType&&<span style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.45)", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:6, padding:"2px 7px" }}>
                                {b.eventType}
                              </span>}
                            </div>

                            {/* Row 3: phone + guests + price */}
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: b.hallId?.name?"0.3rem":"0" }}>
                              <p style={{ color:"rgba(255,255,255,0.32)", fontSize:"0.71rem", margin:0 }}>
                                📞 {b.clientPhone} · 👥 {b.guests}
                              </p>
                              <p style={{ color:"#c084fc", fontWeight:700, fontSize:"0.8rem", margin:0 }}>
                                PKR {b.totalPrice?.toLocaleString()}
                              </p>
                            </div>

                            {b.hallId?.name&&(
                              <p style={{ color:"rgba(255,255,255,0.22)", fontSize:"0.67rem", margin:0 }}>🏛 {b.hallId.name}</p>
                            )}

                            {/* Confirm / Cancel quick actions */}
                            {b.status==="Pending"&&(
                              <div style={{ display:"flex", gap:"0.4rem", marginTop:"0.65rem" }}>
                                <button onClick={e=>{e.stopPropagation();updateStatus(b._id,"Confirmed");}}
                                  style={{ flex:1, padding:"5px 0", borderRadius:9, border:"1px solid rgba(16,185,129,0.38)", background:"rgba(16,185,129,0.1)", color:"#34d399", fontSize:"0.68rem", fontWeight:700, cursor:"pointer", transition:"all 0.14s" }}
                                  onMouseEnter={e=>e.currentTarget.style.background="rgba(16,185,129,0.2)"}
                                  onMouseLeave={e=>e.currentTarget.style.background="rgba(16,185,129,0.1)"}>
                                  ✓ Confirm
                                </button>
                                <button onClick={e=>{e.stopPropagation();updateStatus(b._id,"Cancelled");}}
                                  style={{ flex:1, padding:"5px 0", borderRadius:9, border:"1px solid rgba(239,68,68,0.32)", background:"rgba(239,68,68,0.08)", color:"#f87171", fontSize:"0.68rem", fontWeight:700, cursor:"pointer", transition:"all 0.14s" }}
                                  onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,0.18)"}
                                  onMouseLeave={e=>e.currentTarget.style.background="rgba(239,68,68,0.08)"}>
                                  ✕ Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {detail&&<BookingDetailModal booking={detail} onClose={()=>setDetail(null)} onStatusChange={updateStatus}/>}
    </div>
  );
}