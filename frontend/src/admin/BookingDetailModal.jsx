import React, { useState, useEffect } from "react";
import api from "../services/api";
import { btnGhost, btnDanger } from "./adminTheme";

const SLOT_TIMES  = { afternoon:"12:00 PM – 4:00 PM", evening:"5:00 PM – 9:00 PM", latenight:"10:00 PM – 2:00 AM" };
const SLOT_COLOR  = { afternoon:"#06b6d4", evening:"#f59e0b", latenight:"#a855f7" };
const SLOT_LABEL  = { afternoon:"Afternoon", evening:"Evening", latenight:"Late Night" };

const CAT_COLOR = {
  "Starter Menu":     { dot:"#06b6d4", bg:"rgba(6,182,212,0.1)",   border:"rgba(6,182,212,0.28)",   text:"#67e8f9" },
  "Main Course Menu": { dot:"#f59e0b", bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.28)",  text:"#fcd34d" },
  "Dessert Menu":     { dot:"#ec4899", bg:"rgba(236,72,153,0.1)",  border:"rgba(236,72,153,0.28)",  text:"#f9a8d4" },
  "Drinks Menu":      { dot:"#10b981", bg:"rgba(16,185,129,0.1)",  border:"rgba(16,185,129,0.28)",  text:"#6ee7b7" },
};
const CAT_ICON = {
  "Starter Menu":"🥗", "Main Course Menu":"🍛", "Dessert Menu":"🍰", "Drinks Menu":"🥤",
};

const STATUS_CFG = {
  Confirmed: { color:"#10b981", bg:"rgba(16,185,129,0.1)",  border:"rgba(16,185,129,0.28)", icon:"✓", msg:"Booking confirmed. SMS has been sent to the client." },
  Pending:   { color:"#f59e0b", bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.28)", icon:"⏳", msg:"Awaiting manager confirmation. Client will be notified once approved." },
  Cancelled: { color:"#ef4444", bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.28)",  icon:"✕", msg:"This booking has been cancelled. Please contact the client if needed." },
};

const fmt = d => d ? new Date(d).toLocaleDateString("en-PK",{weekday:"long",day:"numeric",month:"long",year:"numeric"}) : "—";

function InfoRow({ icon, label, value, highlight, mono }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.6rem 0", borderBottom:"1px solid rgba(255,255,255,0.05)", gap:"1rem" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"0.55rem", flexShrink:0 }}>
        <span style={{ fontSize:"0.85rem", opacity:0.6, width:18, textAlign:"center" }}>{icon}</span>
        <span style={{ color:"rgba(255,255,255,0.32)", fontSize:"0.78rem", fontWeight:500 }}>{label}</span>
      </div>
      <span style={{
        color: highlight?"#c084fc":"rgba(255,255,255,0.88)",
        fontSize: mono?"0.8rem":"0.82rem",
        fontWeight: highlight?700:500,
        textAlign:"right",
        fontFamily: mono?"'Courier New',monospace":"inherit",
        letterSpacing: mono?"0.04em":"0",
      }}>{String(value??"")||"—"}</span>
    </div>
  );
}

/* ── Selected Dishes Section ── */
function SelectedDishesSection({ dishIds }) {
  const [dishes, setDishes]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dishIds?.length) { setLoading(false); return; }
    api.get("/dishes")
      .then(r => {
        const all = r.data.dishes || [];
        setDishes(all.filter(d => dishIds.includes(d._id)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dishIds]);

  // Group by category
  const grouped = {};
  dishes.forEach(d => {
    if (!grouped[d.category]) grouped[d.category] = [];
    grouped[d.category].push(d);
  });

  return (
    <div style={{ padding:"0.75rem 1.7rem 0" }}>
      {/* Section header */}
      <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.75rem", paddingTop:"0.5rem", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ fontSize:"0.85rem", opacity:0.6 }}>🍽️</span>
        <span style={{ color:"rgba(255,255,255,0.32)", fontSize:"0.78rem", fontWeight:500 }}>Selected Menu</span>
        {!loading && dishes.length > 0 && (
          <span style={{ marginLeft:"auto", background:"rgba(147,51,234,0.15)", border:"1px solid rgba(147,51,234,0.3)", borderRadius:999, padding:"1px 8px", color:"#c084fc", fontSize:"0.65rem", fontWeight:700 }}>
            {dishes.length} dish{dishes.length !== 1 ? "es" : ""}
          </span>
        )}
      </div>

      {loading ? (
        <p style={{ color:"rgba(255,255,255,0.25)", fontSize:"0.78rem", marginBottom:"0.75rem" }}>Loading dishes…</p>
      ) : dishes.length === 0 ? (
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"0.65rem 0.9rem", marginBottom:"0.75rem", display:"flex", alignItems:"center", gap:"0.5rem" }}>
          <span style={{ fontSize:"0.85rem", opacity:0.4 }}>👨‍🍳</span>
          <span style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.78rem" }}>Self-catering / no dishes selected</span>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"0.55rem", marginBottom:"0.75rem" }}>
          {Object.entries(grouped).map(([cat, items]) => {
            const clr = CAT_COLOR[cat] || CAT_COLOR["Starter Menu"];
            return (
              <div key={cat} style={{ background:clr.bg, border:`1px solid ${clr.border}`, borderRadius:12, padding:"0.65rem 0.85rem" }}>
                {/* Category header */}
                <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.45rem" }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:clr.dot, flexShrink:0, display:"inline-block" }}/>
                  <span style={{ fontSize:"0.75rem" }}>{CAT_ICON[cat]}</span>
                  <span style={{ color:clr.text, fontSize:"0.7rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>{cat}</span>
                  <span style={{ marginLeft:"auto", color:clr.text, fontSize:"0.65rem", opacity:0.7 }}>{items.length}</span>
                </div>
                {/* Dish pills */}
                <div style={{ display:"flex", flexWrap:"wrap", gap:"0.35rem" }}>
                  {items.map(d => (
                    <span key={d._id} style={{
                      background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)",
                      borderRadius:999, padding:"2px 10px",
                      color:"rgba(255,255,255,0.82)", fontSize:"0.72rem", fontWeight:500,
                    }}>
                      {d.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function BookingDetailModal({ booking:b, onClose, onStatusChange }) {
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (!b) return null;

  const st   = STATUS_CFG[b.status] || STATUS_CFG.Pending;
  const sc   = st.color;
  const slot = b.timeSlot;
  const slotColor = slot ? (SLOT_COLOR[slot]||"#9333ea") : "#9333ea";

  const handleConfirm = async () => {
    setConfirming(true);
    await onStatusChange(b._id, "Confirmed");
    setConfirming(false);
    onClose();
  };
  const handleCancel = async () => {
    setCancelling(true);
    await onStatusChange(b._id, "Cancelled");
    setCancelling(false);
    onClose();
  };

  return (
    <div
      onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(4,3,14,0.75)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", animation:"fadeIn 0.18s ease" }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        .bdm-scroll::-webkit-scrollbar{width:3px}
        .bdm-scroll::-webkit-scrollbar-thumb{background:rgba(147,51,234,0.3);border-radius:2px}
      `}</style>

      <div className="bdm-scroll" style={{
        width:"100%", maxWidth:520, maxHeight:"92vh", overflowY:"auto",
        borderRadius:24, background:"linear-gradient(160deg,#13093e,#0d0726)",
        border:"1px solid rgba(147,51,234,0.25)",
        boxShadow:"0 40px 100px rgba(0,0,0,0.75), 0 0 0 1px rgba(147,51,234,0.1)",
        animation:"slideUp 0.22s ease",
      }}>

        {/* ── Slot colour bar ── */}
        <div style={{ height:4, background:`linear-gradient(90deg,${slotColor},${slotColor}55,transparent)`, borderRadius:"24px 24px 0 0" }}/>

        {/* ── Hero header ── */}
        <div style={{ padding:"1.6rem 1.7rem 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.2rem" }}>
            <div style={{ flex:1, minWidth:0 }}>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", color:"white", fontSize:"1.65rem", fontWeight:700, margin:"0 0 6px", lineHeight:1.1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {b.clientName}
              </h3>
              <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap", alignItems:"center" }}>
                {b.bookingRef&&(
                  <span style={{ background:"rgba(147,51,234,0.16)", border:"1px solid rgba(147,51,234,0.35)", borderRadius:999, padding:"2px 10px", color:"rgba(192,132,252,0.9)", fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.07em", fontFamily:"'Courier New',monospace" }}>
                    {b.bookingRef}
                  </span>
                )}
                {slot&&(
                  <span style={{ background:`${slotColor}16`, border:`1px solid ${slotColor}38`, borderRadius:999, padding:"2px 9px", color:slotColor, fontSize:"0.68rem", fontWeight:600 }}>
                    {SLOT_LABEL[slot]||slot} · {SLOT_TIMES[slot]||""}
                  </span>
                )}
                {b.eventType&&(
                  <span style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:999, padding:"2px 9px", color:"rgba(255,255,255,0.5)", fontSize:"0.68rem" }}>
                    {b.eventType}
                  </span>
                )}
              </div>
            </div>

            <button onClick={onClose}
              style={{ width:34, height:34, borderRadius:10, border:"1px solid rgba(255,255,255,0.09)", background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.45)", fontSize:"1rem", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginLeft:"0.75rem", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.12)";e.currentTarget.style.color="white";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="rgba(255,255,255,0.45)";}}>✕</button>
          </div>

          {/* ── Status banner ── */}
          <div style={{ background:st.bg, border:`1px solid ${st.border}`, borderRadius:16, padding:"1rem 1.15rem", marginBottom:"1.4rem", display:"flex", alignItems:"center", gap:"1rem" }}>
            <div style={{ width:44, height:44, borderRadius:14, background:`${sc}22`, border:`1px solid ${sc}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem", flexShrink:0, color:sc }}>
              {st.icon}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:sc, fontWeight:700, fontSize:"0.95rem", margin:"0 0 3px" }}>{b.status}</p>
              <p style={{ color:"rgba(255,255,255,0.38)", fontSize:"0.75rem", margin:0, lineHeight:1.5 }}>{st.msg}</p>
            </div>
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.6rem", margin:"0 0 2px", letterSpacing:"0.06em" }}>TOTAL</p>
              <p style={{ color:"#c084fc", fontWeight:800, fontSize:"1.05rem", margin:0 }}>PKR {b.totalPrice?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* ── Two-column key info cards ── */}
        <div style={{ padding:"0 1.7rem", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem", marginBottom:"0.5rem" }}>
          {[
            { icon:"📅", label:"Event Date",  value:fmt(b.eventDate) },
            { icon:"👥", label:"Guests",       value:`${b.guests} guests` },
            { icon:"🏛️", label:"Hall",         value:b.hallId?.name||"—" },
            { icon:"🎉", label:"Event Type",   value:b.eventType||"—" },
          ].map(({icon,label,value})=>(
            <div key={label} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"0.75rem 0.85rem" }}>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.65rem", margin:"0 0 3px", textTransform:"uppercase", letterSpacing:"0.07em" }}>{icon} {label}</p>
              <p style={{ color:"rgba(255,255,255,0.88)", fontSize:"0.82rem", fontWeight:600, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Detail rows ── */}
        <div style={{ padding:"0.3rem 1.7rem 0" }}>
          <InfoRow icon="📞" label="Phone"        value={b.clientPhone} mono />
          <InfoRow icon="📧" label="Email"        value={b.clientEmail||"—"} />
          <InfoRow icon="💳" label="Payment"      value={b.paymentMethod||"—"} />
          <InfoRow icon="🔖" label="Transaction"  value={b.transactionId||"—"} mono />
          {b.specialRequests&&b.specialRequests!=="None"&&(
            <div style={{ padding:"0.7rem 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.55rem", marginBottom:"0.35rem" }}>
                <span style={{ fontSize:"0.85rem", opacity:0.6 }}>💬</span>
                <span style={{ color:"rgba(255,255,255,0.32)", fontSize:"0.78rem", fontWeight:500 }}>Special Requests</span>
              </div>
              <p style={{ color:"rgba(255,255,255,0.7)", fontSize:"0.8rem", margin:0, lineHeight:1.6, paddingLeft:"1.55rem" }}>{b.specialRequests}</p>
            </div>
          )}
        </div>

        {/* ── Selected Dishes ── */}
        <SelectedDishesSection dishIds={b.selectedDishes || []} />

        {/* ── Action buttons ── */}
        <div style={{ padding:"1.25rem 1.7rem 1.7rem", display:"flex", gap:"0.6rem", justifyContent:"flex-end", flexWrap:"wrap" }}>
          {b.status==="Pending"&&(
            <button
              disabled={confirming}
              onClick={handleConfirm}
              style={{ padding:"0.55rem 1.2rem", borderRadius:11, border:"1px solid rgba(16,185,129,0.38)", background: confirming?"rgba(16,185,129,0.08)":"rgba(16,185,129,0.12)", color:"#34d399", fontSize:"0.82rem", fontWeight:700, cursor: confirming?"not-allowed":"pointer", transition:"all 0.15s", opacity: confirming?0.6:1 }}
              onMouseEnter={e=>{ if(!confirming) e.currentTarget.style.background="rgba(16,185,129,0.22)";}}
              onMouseLeave={e=>e.currentTarget.style.background=confirming?"rgba(16,185,129,0.08)":"rgba(16,185,129,0.12)"}>
              {confirming?"Confirming…":"✓ Confirm & SMS"}
            </button>
          )}
          {b.status!=="Cancelled"&&(
            <button
              disabled={cancelling}
              onClick={handleCancel}
              style={{ padding:"0.55rem 1.2rem", borderRadius:11, border:"1px solid rgba(239,68,68,0.32)", background: cancelling?"rgba(239,68,68,0.06)":"rgba(239,68,68,0.1)", color:"#f87171", fontSize:"0.82rem", fontWeight:700, cursor: cancelling?"not-allowed":"pointer", transition:"all 0.15s", opacity: cancelling?0.6:1 }}
              onMouseEnter={e=>{ if(!cancelling) e.currentTarget.style.background="rgba(239,68,68,0.2)";}}
              onMouseLeave={e=>e.currentTarget.style.background=cancelling?"rgba(239,68,68,0.06)":"rgba(239,68,68,0.1)"}>
              {cancelling?"Cancelling…":"✕ Cancel Booking"}
            </button>
          )}
          <button onClick={onClose}
            style={{ padding:"0.55rem 1.1rem", borderRadius:11, border:"1px solid rgba(139,92,246,0.25)", background:"transparent", color:"rgba(192,132,252,0.7)", fontSize:"0.82rem", fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(109,40,217,0.15)";e.currentTarget.style.color="#c084fc";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(192,132,252,0.7)";}}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}