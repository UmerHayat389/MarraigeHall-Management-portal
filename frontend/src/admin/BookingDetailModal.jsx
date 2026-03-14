import React from "react";
import { statusColor, statusBg, statusBorder, btnGhost, btnDanger } from "./adminTheme";

const SLOT_TIMES = { morning:"10:00 AM – 2:00 PM", afternoon:"3:00 PM – 7:00 PM", evening:"8:00 PM – 12:00 AM" };

export default function BookingDetailModal({ booking: b, onClose, onStatusChange }) {
  if (!b) return null;
  const sc  = statusColor[b.status] || "#888";
  const sb  = statusBg[b.status]    || "rgba(136,136,136,0.1)";
  const sbd = statusBorder[b.status]|| "rgba(136,136,136,0.3)";
  const fmt = d => d ? new Date(d).toLocaleDateString("en-PK",{day:"numeric",month:"long",year:"numeric"}) : "—";
  const slotLabel = s => s ? `${s.charAt(0).toUpperCase()+s.slice(1)}  (${SLOT_TIMES[s]||""})` : "—";

  const rows = [
    { icon:"👤", label:"Guest Name",   value: b.clientName },
    { icon:"📞", label:"Phone",        value: b.clientPhone },
    { icon:"📧", label:"Email",        value: b.clientEmail || "—" },
    { icon:"🏛️", label:"Hall",         value: b.hallId?.name || "—" },
    { icon:"📅", label:"Event Date",   value: fmt(b.eventDate) },
    { icon:"🕐", label:"Time Slot",    value: slotLabel(b.timeSlot) },
    { icon:"🎉", label:"Event Type",   value: b.eventType },
    { icon:"👥", label:"Guests",       value: b.guests },
    { icon:"💳", label:"Payment",      value: b.paymentMethod || "—" },
    { icon:"🔖", label:"Transaction",  value: b.transactionId || "—" },
    { icon:"💬", label:"Special Req.", value: b.specialRequests || "None" },
    { icon:"💰", label:"Total Amount", value: b.totalPrice ? `PKR ${b.totalPrice.toLocaleString()}` : "—", highlight: true },
  ];

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* Header */}
        <div style={{ padding:"1.75rem 1.75rem 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.25rem" }}>
            <div>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", color:"white", fontSize:"1.55rem", fontWeight:600, margin:"0 0 4px" }}>
                Booking Details
              </h3>
              <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
                {b.bookingRef && (
                  <span style={{ background:"rgba(147,51,234,0.15)", border:"1px solid rgba(147,51,234,0.3)", borderRadius:"999px", padding:"2px 10px", color:"rgba(192,132,252,0.85)", fontSize:"0.7rem", fontWeight:600, letterSpacing:"0.06em" }}>
                    {b.bookingRef}
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", color:"rgba(255,255,255,0.5)", fontSize:"1rem", cursor:"pointer", width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)";e.currentTarget.style.color="white";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.color="rgba(255,255,255,0.5)";}}>✕</button>
          </div>

          {/* Status banner */}
          <div style={{ background:sb, border:`1px solid ${sbd}`, borderRadius:"14px", padding:"1rem 1.15rem", marginBottom:"1.4rem", display:"flex", alignItems:"center", gap:"0.85rem" }}>
            <div style={{ width:42, height:42, borderRadius:"12px", background:`${sc}22`, border:`1px solid ${sc}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", flexShrink:0 }}>
              {b.status==="Confirmed"?"✓":b.status==="Cancelled"?"✕":"⏳"}
            </div>
            <div>
              <p style={{ color:sc, fontWeight:700, fontSize:"0.95rem", margin:"0 0 2px" }}>{b.status}</p>
              <p style={{ color:"rgba(255,255,255,0.38)", fontSize:"0.76rem", margin:0, lineHeight:1.4 }}>
                {b.status==="Pending" ? "Awaiting manager confirmation. Client will be notified via SMS." :
                 b.status==="Confirmed" ? "Booking confirmed. SMS has been sent to client." :
                 "Booking cancelled. Please contact the client for details."}
              </p>
            </div>
          </div>
        </div>

        {/* Detail rows */}
        <div style={{ padding:"0 1.75rem" }}>
          {rows.map(({ icon, label, value, highlight }) => (
            <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.62rem 0", borderBottom:"1px solid rgba(255,255,255,0.05)", gap:"1rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.55rem", flexShrink:0 }}>
                <span style={{ fontSize:"0.9rem", opacity:0.75 }}>{icon}</span>
                <span style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.82rem" }}>{label}</span>
              </div>
              <span style={{ color: highlight ? "#c084fc" : "rgba(255,255,255,0.85)", fontSize:"0.82rem", fontWeight: highlight ? 700 : 500, textAlign:"right" }}>{String(value)}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding:"1.25rem 1.75rem 1.75rem", display:"flex", gap:"0.6rem", justifyContent:"flex-end", flexWrap:"wrap" }}>
          {b.status==="Pending" && (
            <button style={{ ...btnGhost, color:"#34d399", borderColor:"rgba(16,185,129,0.35)", padding:"0.5rem 1.1rem", fontSize:"0.82rem" }}
              onClick={()=>{onStatusChange(b._id,"Confirmed");onClose();}}>
              ✓ Confirm &amp; Send SMS
            </button>
          )}
          {b.status!=="Cancelled" && (
            <button style={{ ...btnDanger, padding:"0.5rem 1.1rem", fontSize:"0.82rem" }} onClick={()=>{onStatusChange(b._id,"Cancelled");onClose();}}>
              ✕ Cancel Booking
            </button>
          )}
          <button style={{ ...btnGhost, padding:"0.5rem 1.1rem", fontSize:"0.82rem" }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}