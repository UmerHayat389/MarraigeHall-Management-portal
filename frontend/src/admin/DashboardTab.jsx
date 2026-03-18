import React from "react";
import { statusColor, statusBg, statusBorder, getDisplayStatus } from "./adminTheme";

function MiniBarChart({ data, color="#6366f1" }) {
  const max = Math.max(...data.map(d=>d.value), 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:"5px", height:72 }}>
      {data.map((d,i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, minWidth:0 }}>
          <div style={{ width:"100%", borderRadius:"6px 6px 0 0", background:`${color}22`, height:52, position:"relative" }}>
            <div style={{ width:"100%", borderRadius:"6px 6px 0 0", background:`linear-gradient(180deg,${color},${color}77)`, position:"absolute", bottom:0, height:`${(d.value/max)*100}%`, transition:"height 0.7s cubic-bezier(.34,1.56,.64,1)", minHeight: d.value>0?"6px":"0" }} />
          </div>
          <span style={{ color:"#64748b", fontSize:"0.6rem", textAlign:"center", lineHeight:1.2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", width:"100%" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardTab({ stats, bookings, switchTab }) {
  // Last 7 days chart
  const last7 = Array.from({length:7},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-(6-i)); d.setHours(0,0,0,0);
    const next = new Date(d); next.setDate(next.getDate()+1);
    const count = bookings.filter(b=>{ const bd=new Date(b.createdAt); return bd>=d&&bd<next; }).length;
    return { label:d.toLocaleDateString("en",{weekday:"short"}), value:count };
  });

  const confirmed = bookings.filter(b=>getDisplayStatus(b)==="Confirmed").length;
  const pending   = bookings.filter(b=>getDisplayStatus(b)==="Pending").length;
  const cancelled = bookings.filter(b=>getDisplayStatus(b)==="Cancelled").length;
  const total     = bookings.length || 1;

  const recent = [...bookings].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);

  const statCards = [
    { label:"Total Halls",    value:stats.halls,    icon:"🏛️", color:"#6366f1", sub:"venues" },
    { label:"Total Bookings", value:stats.bookings, icon:"📋", color:"#06b6d4", sub:"all time" },
    { label:"Pending",        value:stats.pending,  icon:"⏳", color:"#f59e0b", sub:"need action" },
    { label:"Revenue",        value:`${(stats.revenue/1000).toFixed(0)}K`, icon:"💰", color:"#10b981", sub:"PKR confirmed" },
  ];

  return (
    <div>
      <div style={{ marginBottom:"1.75rem" }}>
        <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(1.5rem,4vw,2rem)", fontWeight:400, margin:"0 0 6px", color:"white" }}>
          Welcome to <em style={{ color:"#6366f1", fontStyle:"italic" }}>Admin</em>
        </h1>
        <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.84rem", margin:0 }}>Here's your venue overview for today</p>
      </div>

      {/* Stat cards */}
      <div className="stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(185px,1fr))", gap:"1rem", marginBottom:"1.5rem" }}>
        {statCards.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ width:48, height:48, borderRadius:"14px", flexShrink:0, background:`${s.color}1a`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.25rem", border:`1px solid ${s.color}33` }}>{s.icon}</div>
            <div style={{ minWidth:0 }}>
              <p style={{ color:"#cbd5e1", fontSize:"0.68rem", letterSpacing:"0.1em", textTransform:"uppercase", margin:"0 0 3px" }}>{s.label}</p>
              <p style={{ color:"white", fontSize:"1.65rem", fontWeight:700, fontFamily:"'Sora',sans-serif", margin:0, lineHeight:1 }}>{s.value}</p>
              <p style={{ color:"#94a3b8", fontSize:"0.68rem", margin:"3px 0 0" }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="charts-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.25rem" }}>
        {/* Bar chart */}
        <div style={{ background:"#1e2433", border:"1px solid #2d35480.13)", borderRadius:"18px", padding:"1.35rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
            <div>
              <p style={{ color:"#cbd5e1", fontSize:"0.78rem", fontWeight:600, margin:0 }}>Bookings — Last 7 Days</p>
              <p style={{ color:"#94a3b8", fontSize:"0.68rem", margin:"2px 0 0" }}>New bookings per day</p>
            </div>
            <span style={{ background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.28)", borderRadius:"999px", padding:"2px 9px", color:"#a5b4fc", fontSize:"0.7rem", fontWeight:600 }}>
              {last7.reduce((s,d)=>s+d.value,0)} total
            </span>
          </div>
          <MiniBarChart data={last7} color="#6366f1" />
        </div>

        {/* Status breakdown */}
        <div style={{ background:"#1e2433", border:"1px solid #2d35480.13)", borderRadius:"18px", padding:"1.35rem" }}>
          <p style={{ color:"#cbd5e1", fontSize:"0.78rem", fontWeight:600, margin:"0 0 1.1rem" }}>Status Breakdown</p>
          {[["Confirmed","#10b981",confirmed],["Pending","#f59e0b",pending],["Cancelled","#ef4444",cancelled]].map(([l,c,v])=>(
            <div key={l} style={{ marginBottom:"0.85rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
                <span style={{ color:"#cbd5e1", fontSize:"0.8rem", display:"flex", alignItems:"center", gap:"0.4rem" }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:c, display:"inline-block" }} />{l}
                </span>
                <span style={{ color:c, fontWeight:700, fontSize:"0.8rem" }}>{v} <span style={{ color:"#94a3b8", fontWeight:400 }}>({Math.round((v/total)*100)}%)</span></span>
              </div>
              <div style={{ height:6, borderRadius:3, background:"#252d3d", overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:3, background:`linear-gradient(90deg,${c},${c}99)`, width:`${(v/total)*100}%`, transition:"width 0.9s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent + Quick Actions */}
      <div className="dash-bottom" style={{ display:"grid", gridTemplateColumns:"1fr 200px", gap:"1rem" }}>
        {/* Recent bookings */}
        <div style={{ background:"#1e2433", border:"1px solid #2d35480.13)", borderRadius:"18px", padding:"1.35rem" }}>
          <p style={{ color:"#cbd5e1", fontSize:"0.78rem", fontWeight:600, margin:"0 0 1rem", textTransform:"uppercase", letterSpacing:"0.08em" }}>Recent Bookings</p>
          {recent.length===0
            ? <p style={{ color:"#94a3b8", fontSize:"0.84rem" }}>No bookings yet</p>
            : recent.map(b=>(
              <div key={b._id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.55rem 0", borderBottom:"1px solid #252d3d" }}>
                <div style={{ minWidth:0 }}>
                  <p style={{ color:"white", fontSize:"0.86rem", fontWeight:500, margin:"0 0 2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.clientName}</p>
                  <p style={{ color:"#64748b", fontSize:"0.72rem", margin:0 }}>{b.hallId?.name||"—"} · {b.timeSlot||"—"}</p>
                </div>
                <span className="badge" style={{ background:statusBg[getDisplayStatus(b)], color:statusColor[getDisplayStatus(b)], border:`1px solid ${statusBorder[getDisplayStatus(b)]}`, marginLeft:"0.5rem", flexShrink:0 }}>{getDisplayStatus(b)}</span>
              </div>
            ))
          }
        </div>

        {/* Quick actions */}
        <div style={{ background:"#1e2433", border:"1px solid #2d35480.13)", borderRadius:"18px", padding:"1.35rem" }}>
          <p style={{ color:"#cbd5e1", fontSize:"0.78rem", fontWeight:600, margin:"0 0 1rem", textTransform:"uppercase", letterSpacing:"0.08em" }}>Quick Actions</p>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.55rem" }}>
            {[
              { icon:"🏛️", label:"Add Hall",       tab:"halls" },
              { icon:"📋", label:"All Bookings",   tab:"bookings" },
              { icon:"📅", label:"Calendar",       tab:"calendar" },
            ].map(({icon,label,tab})=>(
              <button key={tab} onClick={()=>switchTab(tab)} style={{ background:"#252d3d", border:"1px solid rgba(99,102,241,0.16)", borderRadius:"10px", color:"#cbd5e1", fontSize:"0.82rem", cursor:"pointer", padding:"0.6rem 0.85rem", textAlign:"left", display:"flex", alignItems:"center", gap:"0.55rem", fontFamily:"'Inter',sans-serif", transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.background="#252d3d";e.currentTarget.style.color="white";e.currentTarget.style.borderColor="#6366f1";}}
                onMouseLeave={e=>{e.currentTarget.style.background="#252d3d";e.currentTarget.style.color="#cbd5e1";e.currentTarget.style.borderColor="rgba(99,102,241,0.16)";}}>
                <span>{icon}</span><span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}