import React, { useState, useEffect } from "react";
import api from "../services/api";
import { btnGhost, btnDanger } from "./adminTheme";

const SLOT_TIMES  = { afternoon:"12:00 PM – 4:00 PM", evening:"5:00 PM – 9:00 PM", latenight:"10:00 PM – 2:00 AM" };
const SLOT_COLOR  = { afternoon:"#06b6d4", evening:"#f59e0b", latenight:"#818cf8" };
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
  Cancelled:  { color:"#ef4444", bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.28)",  icon:"✕", msg:"This booking has been cancelled. Please contact the client if needed." },
  Completed:  { color:"#5eead4", bg:"rgba(94,234,212,0.1)", border:"rgba(94,234,212,0.28)", icon:"★", msg:"This event has been completed. Thank you for choosing Noor Mahal!" },
};

const fmt = d => d ? new Date(d).toLocaleDateString("en-PK",{weekday:"long",day:"numeric",month:"long",year:"numeric"}) : "—";

function InfoRow({ icon, label, value, highlight, mono }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.6rem 0", borderBottom:"1px solid #252d3d", gap:"1rem" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"0.55rem", flexShrink:0 }}>
        <span style={{ fontSize:"0.85rem", opacity:0.6, width:18, textAlign:"center" }}>{icon}</span>
        <span style={{ color:"rgba(255,255,255,0.32)", fontSize:"0.78rem", fontWeight:500 }}>{label}</span>
      </div>
      <span style={{
        color: highlight?"#a5b4fc":"rgba(255,255,255,0.88)",
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
const DISH_CAT_META = [
  { key:"Starter Menu", icon:"🥗", short:"Starters" },
  { key:"Main Course Menu", icon:"🍛", short:"Main" },
  { key:"Dessert Menu", icon:"🍰", short:"Desserts" },
  { key:"Drinks Menu", icon:"🥤", short:"Drinks" },
];

function SelectedDishesSection({ bookingId, dishIds, cateringOption, onDishesUpdated }) {
  const [dishes, setDishes]       = useState([]);
  const [allDishes, setAllDishes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [selected, setSelected]   = useState([]);
  const [activeTab, setActiveTab] = useState("Starter Menu");
  const [showAll, setShowAll]     = useState(false); // dishes popup

  const hasIds      = Array.isArray(dishIds) && dishIds.length > 0;
  const isUnset     = dishIds == null && !cateringOption;
  const isSelfCater = cateringOption === "self-catering" ||
                      (!cateringOption && Array.isArray(dishIds) && dishIds.length === 0);
  const isOurMenu   = cateringOption === "our-menu" || hasIds;

  useEffect(() => {
    setDishes([]);
    if (!hasIds) { setLoading(false); return; }
    setLoading(true);
    api.get("/dishes")
      .then(r => {
        const all = r.data.dishes || [];
        setAllDishes(all);
        setDishes(all.filter(d => dishIds.map(String).includes(String(d._id))));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [JSON.stringify(dishIds)]);

  const openEditor = async () => {
    if (allDishes.length === 0) {
      const r = await api.get("/dishes").catch(() => ({ data: { dishes: [] } }));
      setAllDishes(r.data.dishes || []);
    }
    setSelected(dishIds ? dishIds.map(String) : []);
    setEditing(true);
  };

  const toggleDish = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const saveDishes = async () => {
    setSaving(true);
    try {
      await api.put(`/bookings/${bookingId}`, {
        selectedDishes: selected,
        cateringOption: "our-menu",
      });
      // Refresh displayed dishes
      const r = await api.get("/dishes");
      const all = r.data.dishes || [];
      setAllDishes(all);
      setDishes(all.filter(d => selected.includes(String(d._id))));
      setEditing(false);
      if (onDishesUpdated) onDishesUpdated(selected);
    } catch { /* silent */ }
    setSaving(false);
  };

  const tabDishes = allDishes.filter(d => d.category === activeTab);

  // Group by category
  const grouped = {};
  dishes.forEach(d => {
    if (!grouped[d.category]) grouped[d.category] = [];
    grouped[d.category].push(d);
  });

  const editorTabDishes = allDishes.filter(d => d.category === activeTab);

  return (
    <div className="bdm-dishes" style={{ padding:"0.75rem 1.7rem 0" }}>
      {/* Section header */}
      <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.75rem", paddingTop:"0.5rem", borderTop:"1px solid #252d3d" }}>
        <span style={{ fontSize:"0.85rem", opacity:0.6 }}>🍽️</span>
        <span style={{ color:"rgba(255,255,255,0.32)", fontSize:"0.78rem", fontWeight:500 }}>Selected Menu</span>
        {!loading && dishes.length > 0 && (
          <span style={{ marginLeft:"auto", background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:999, padding:"1px 8px", color:"#a5b4fc", fontSize:"0.65rem", fontWeight:700 }}>
            {dishes.length} dish{dishes.length !== 1 ? "es" : ""}
          </span>
        )}
        {/* Edit button — always visible for admin */}
        {!editing && (
          <button
            onClick={openEditor}
            style={{ marginLeft: dishes.length > 0 ? "0.5rem" : "auto", padding:"2px 10px", borderRadius:8, fontSize:"0.65rem", fontWeight:600, cursor:"pointer", border:"1px solid rgba(99,102,241,0.3)", background:"rgba(99,102,241,0.1)", color:"#a5b4fc", transition:"all 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(99,102,241,0.25)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(99,102,241,0.1)"}
          >✏️ Edit</button>
        )}
      </div>

      {/* ── Inline dish editor ── */}
      {editing && (
        <div style={{ border:"1px solid rgba(99,102,241,0.3)", borderRadius:12, overflow:"hidden", marginBottom:"0.75rem" }}>
          {/* Tabs */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0, borderBottom:"1px solid rgba(99,102,241,0.2)" }}>
            {DISH_CAT_META.map(cat => (
              <button key={cat.key} type="button" onClick={() => setActiveTab(cat.key)}
                style={{ padding:"7px 4px", fontSize:"0.68rem", fontWeight:600, cursor:"pointer", border:"none", background: activeTab===cat.key ? "rgba(79,70,229,0.35)" : "#1e2433", color: activeTab===cat.key ? "white" : "#94a3b8", borderRight:"1px solid rgba(99,102,241,0.15)", transition:"all 0.15s" }}>
                {cat.icon} {cat.short}
              </button>
            ))}
          </div>
          {/* Dish list */}
          <div style={{ padding:"8px", display:"flex", flexDirection:"column", gap:4, maxHeight:180, overflowY:"auto" }}>
            {editorTabDishes.length === 0
              ? <p style={{ color:"#94a3b8", fontSize:"0.72rem", padding:"8px", textAlign:"center" }}>No items in this category</p>
              : editorTabDishes.map(d => {
                  const checked = selected.includes(String(d._id));
                  return (
                    <button key={d._id} type="button" onClick={() => toggleDish(String(d._id))}
                      style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 8px", borderRadius:7, cursor:"pointer", border:`1px solid ${checked ? "#6366f1" : "#252d3d"}`, background: checked ? "rgba(79,70,229,0.2)" : "#1e2433", textAlign:"left", transition:"all 0.12s" }}>
                      <span style={{ width:14, height:14, borderRadius:3, border:`1.5px solid ${checked ? "#818cf8" : "#94a3b8"}`, background: checked ? "#4f46e5" : "transparent", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"white" }}>{checked ? "✓" : ""}</span>
                      <span style={{ fontSize:"0.75rem", color: checked ? "white" : "#cbd5e1", fontWeight: checked ? 600 : 400 }}>{d.name}</span>
                    </button>
                  );
                })
            }
          </div>
          {/* Footer */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 10px", borderTop:"1px solid rgba(99,102,241,0.15)", background:"#1e2433" }}>
            <span style={{ fontSize:"0.68rem", color:"rgba(255,255,255,0.3)" }}>{selected.length} selected</span>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={() => setEditing(false)}
                style={{ padding:"4px 12px", borderRadius:7, fontSize:"0.7rem", cursor:"pointer", border:"1px solid rgba(255,255,255,0.12)", background:"transparent", color:"#94a3b8" }}>
                Cancel
              </button>
              <button onClick={saveDishes} disabled={saving}
                style={{ padding:"4px 14px", borderRadius:7, fontSize:"0.7rem", fontWeight:600, cursor: saving ? "not-allowed" : "pointer", border:"1px solid rgba(99,102,241,0.5)", background:"rgba(79,70,229,0.3)", color:"#a5b4fc", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!editing && (
        loading && hasIds ? (
          <p style={{ color:"#94a3b8", fontSize:"0.78rem", marginBottom:"0.75rem" }}>Loading dishes…</p>
        ) : isUnset ? (
          <div style={{ background:"#1e2433", border:"1px solid #252d3d", borderRadius:10, padding:"0.65rem 0.9rem", marginBottom:"0.75rem", display:"flex", alignItems:"center", gap:"0.5rem" }}>
            <span style={{ fontSize:"0.85rem", opacity:0.4 }}>📋</span>
            <span style={{ color:"#cbd5e1", fontSize:"0.78rem" }}>Not specified — click Edit to set</span>
          </div>
        ) : isSelfCater ? (
          <div style={{ background:"#1e2433", border:"1px solid #252d3d", borderRadius:10, padding:"0.65rem 0.9rem", marginBottom:"0.75rem", display:"flex", alignItems:"center", gap:"0.5rem" }}>
            <span style={{ fontSize:"0.85rem", opacity:0.4 }}>👨‍🍳</span>
            <span style={{ color:"#cbd5e1", fontSize:"0.78rem" }}>Self-catering</span>
          </div>
        ) : (isOurMenu && !hasIds) ? (
          <div style={{ background:"#1e2433", border:"1px solid #252d3d", borderRadius:10, padding:"0.65rem 0.9rem", marginBottom:"0.75rem", display:"flex", alignItems:"center", gap:"0.5rem" }}>
            <span style={{ fontSize:"0.85rem", opacity:0.4 }}>🍽️</span>
            <span style={{ color:"#cbd5e1", fontSize:"0.78rem" }}>Our menu — click Edit to add dishes</span>
          </div>
        ) : dishes.length > 0 ? (
          <>
            {/* Compact summary — first 3 pills + "View All" if more */}
            <div
              onClick={() => setShowAll(true)}
              style={{ cursor:"pointer", background:"#1e2433", border:"1px solid rgba(99,102,241,0.15)", borderRadius:10, padding:"0.6rem 0.85rem", marginBottom:"0.75rem", transition:"all 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor="rgba(99,102,241,0.4)"}
              onMouseLeave={e => e.currentTarget.style.borderColor="rgba(99,102,241,0.15)"}
            >
              <div style={{ display:"flex", flexWrap:"wrap", gap:"0.35rem", alignItems:"center" }}>
                {dishes.slice(0, 4).map(d => (
                  <span key={d._id} style={{ background:"#252d3d", border:"1px solid rgba(255,255,255,0.1)", borderRadius:999, padding:"2px 10px", color:"rgba(255,255,255,0.82)", fontSize:"0.72rem", fontWeight:500 }}>
                    {d.name}
                  </span>
                ))}
                {dishes.length > 4 && (
                  <span style={{ background:"rgba(99,102,241,0.2)", border:"1px solid rgba(99,102,241,0.35)", borderRadius:999, padding:"2px 10px", color:"#a5b4fc", fontSize:"0.72rem", fontWeight:600 }}>
                    +{dishes.length - 4} more
                  </span>
                )}
                <span style={{ marginLeft:"auto", color:"rgba(99,102,241,0.5)", fontSize:"0.68rem" }}>tap to view all →</span>
              </div>
            </div>

            {/* Full dishes popup */}
            {showAll && (
              <div
                onClick={e => e.target === e.currentTarget && setShowAll(false)}
                style={{ position:"fixed", inset:0, zIndex:600, background:"rgba(4,3,14,0.8)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}
              >
                <div style={{ width:"100%", maxWidth:460, borderRadius:20, background:"linear-gradient(145deg,#13093e,#1e2433)", border:"1px solid rgba(99,102,241,0.3)", overflow:"hidden", boxShadow:"0 40px 80px rgba(0,0,0,0.7)" }}>
                  {/* Header */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"1.1rem 1.3rem", borderBottom:"1px solid #1e2433" }}>
                    <div>
                      <p style={{ color:"white", fontWeight:600, fontSize:"0.95rem", margin:"0 0 2px" }}>Selected Menu</p>
                      <p style={{ color:"#94a3b8", fontSize:"0.72rem", margin:0 }}>{dishes.length} dish{dishes.length !== 1 ? "es" : ""} selected</p>
                    </div>
                    <button onClick={() => setShowAll(false)}
                      style={{ width:30, height:30, borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"#252d3d", color:"#cbd5e1", fontSize:"0.9rem", cursor:"pointer" }}>✕</button>
                  </div>
                  {/* Grouped dishes */}
                  <div style={{ padding:"1rem 1.3rem", maxHeight:"60vh", overflowY:"auto" }}>
                    {Object.entries(grouped).map(([cat, items]) => {
                      const clr = CAT_COLOR[cat] || CAT_COLOR["Starter Menu"];
                      return (
                        <div key={cat} style={{ marginBottom:"0.85rem" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.5rem" }}>
                            <span style={{ width:7, height:7, borderRadius:"50%", background:clr.dot, flexShrink:0, display:"inline-block" }}/>
                            <span style={{ fontSize:"0.75rem" }}>{CAT_ICON[cat]}</span>
                            <span style={{ color:clr.text, fontSize:"0.7rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>{cat}</span>
                            <span style={{ marginLeft:"auto", color:clr.text, fontSize:"0.65rem", opacity:0.7 }}>{items.length}</span>
                          </div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:"0.35rem", paddingLeft:"0.85rem" }}>
                            {items.map(d => (
                              <span key={d._id} style={{ background:clr.bg, border:`1px solid ${clr.border}`, borderRadius:999, padding:"3px 12px", color:clr.text, fontSize:"0.75rem", fontWeight:500 }}>
                                {d.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ padding:"0.75rem 1.3rem", borderTop:"1px solid #252d3d", textAlign:"right" }}>
                    <button onClick={() => setShowAll(false)}
                      style={{ padding:"0.45rem 1.2rem", borderRadius:9, border:"1px solid rgba(99,102,241,0.3)", background:"rgba(79,70,229,0.15)", color:"#a5b4fc", fontSize:"0.82rem", fontWeight:600, cursor:"pointer" }}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null
      )}
    </div>
  );
}

export default function BookingDetailModal({ booking:b, onClose, onStatusChange }) {
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [localDishIds, setLocalDishIds] = useState(null); // tracks after inline save

  if (!b) return null;

  const dishIds = localDishIds ?? b.selectedDishes;

  const displayStatus = (b.status === "Confirmed" && b.eventDate && new Date(b.eventDate) < new Date(new Date().setHours(0,0,0,0))) ? "Completed" : (b.status || "Pending");
  const st   = STATUS_CFG[displayStatus] || STATUS_CFG.Pending;
  const sc   = st.color;
  const slot = b.timeSlot;
  const slotColor = slot ? (SLOT_COLOR[slot]||"#6366f1") : "#6366f1";

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
      style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(4,3,14,0.75)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"0.5rem", animation:"fadeIn 0.18s ease" }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        .bdm-scroll::-webkit-scrollbar{width:3px}
        .bdm-scroll::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.3);border-radius:2px}
        @media(max-width:520px){
          .bdm-hero{padding:1.1rem 1.1rem 0!important}
          .bdm-grid{grid-template-columns:1fr!important;padding:0 1.1rem!important}
          .bdm-rows{padding:0.3rem 1.1rem 0!important}
          .bdm-dishes{padding:0.75rem 1.1rem 0!important}
          .bdm-footer{padding:1rem 1.1rem 1.3rem!important;flex-direction:column!important}
          .bdm-footer button{width:100%!important;justify-content:center!important}
          .bdm-name{font-size:1.25rem!important}
          .bdm-status{flex-direction:column!important;gap:0.6rem!important}
          .bdm-status-right{text-align:left!important}
        }
      `}</style>

      <div className="bdm-scroll" style={{
        width:"100%", maxWidth:520, maxHeight:"92vh", overflowY:"auto", minWidth:0,
        borderRadius:24, background:"linear-gradient(160deg,#13093e,#1e2433)",
        border:"1px solid rgba(99,102,241,0.25)",
        boxShadow:"0 40px 100px rgba(0,0,0,0.75), 0 0 0 1px rgba(99,102,241,0.1)",
        animation:"slideUp 0.22s ease",
      }}>

        {/* ── Slot colour bar ── */}
        <div style={{ height:4, background:`linear-gradient(90deg,${slotColor},${slotColor}55,transparent)`, borderRadius:"24px 24px 0 0" }}/>

        {/* ── Hero header ── */}
        <div className="bdm-hero" style={{ padding:"1.6rem 1.7rem 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.2rem" }}>
            <div style={{ flex:1, minWidth:0 }}>
              <h3 className="bdm-name" style={{ fontFamily:"'Sora',sans-serif", color:"white", fontSize:"1.65rem", fontWeight:700, margin:"0 0 6px", lineHeight:1.1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {b.clientName}
              </h3>
              <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap", alignItems:"center" }}>
                {b.bookingRef&&(
                  <span style={{ background:"rgba(99,102,241,0.16)", border:"1px solid rgba(99,102,241,0.35)", borderRadius:999, padding:"2px 10px", color:"#a5b4fc", fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.07em", fontFamily:"'Courier New',monospace" }}>
                    {b.bookingRef}
                  </span>
                )}
                {slot&&(
                  <span style={{ background:`${slotColor}16`, border:`1px solid ${slotColor}38`, borderRadius:999, padding:"2px 9px", color:slotColor, fontSize:"0.68rem", fontWeight:600 }}>
                    {SLOT_LABEL[slot]||slot} · {SLOT_TIMES[slot]||""}
                  </span>
                )}
                {b.eventType&&(
                  <span style={{ background:"#1e2433", border:"1px solid rgba(255,255,255,0.1)", borderRadius:999, padding:"2px 9px", color:"#cbd5e1", fontSize:"0.68rem" }}>
                    {b.eventType}
                  </span>
                )}
              </div>
            </div>

            <button onClick={onClose}
              style={{ width:34, height:34, borderRadius:10, border:"1px solid rgba(255,255,255,0.09)", background:"#252d3d", color:"#94a3b8", fontSize:"1rem", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginLeft:"0.75rem", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.12)";e.currentTarget.style.color="white";}}
              onMouseLeave={e=>{e.currentTarget.style.background="#252d3d";e.currentTarget.style.color="#94a3b8";}}>✕</button>
          </div>

          {/* ── Status banner ── */}
          <div className="bdm-status" style={{ background:st.bg, border:`1px solid ${st.border}`, borderRadius:16, padding:"1rem 1.15rem", marginBottom:"1.4rem", display:"flex", alignItems:"center", gap:"1rem" }}>
            <div style={{ width:44, height:44, borderRadius:14, background:`${sc}22`, border:`1px solid ${sc}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem", flexShrink:0, color:sc }}>
              {st.icon}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:sc, fontWeight:700, fontSize:"0.95rem", margin:"0 0 3px" }}>{displayStatus}</p>
              <p style={{ color:"rgba(255,255,255,0.38)", fontSize:"0.75rem", margin:0, lineHeight:1.5 }}>{st.msg}</p>
            </div>
            <div className="bdm-status-right" style={{ textAlign:"right", flexShrink:0 }}>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.6rem", margin:"0 0 2px", letterSpacing:"0.06em" }}>TOTAL</p>
              <p style={{ color:"#a5b4fc", fontWeight:800, fontSize:"1.05rem", margin:0 }}>PKR {b.totalPrice?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* ── Two-column key info cards ── */}
        <div className="bdm-grid" style={{ padding:"0 1.7rem", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem", marginBottom:"0.5rem" }}>
          {[
            { icon:"📅", label:"Event Date",  value:fmt(b.eventDate) },
            { icon:"👥", label:"Guests",       value:`${b.guests} guests` },
            { icon:"🏛️", label:"Hall",         value:b.hallId?.name||"—" },
            { icon:"🎉", label:"Event Type",   value:b.eventType||"—" },
          ].map(({icon,label,value})=>(
            <div key={label} style={{ background:"#1e2433", border:"1px solid #252d3d", borderRadius:12, padding:"0.75rem 0.85rem" }}>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.65rem", margin:"0 0 3px", textTransform:"uppercase", letterSpacing:"0.07em" }}>{icon} {label}</p>
              <p style={{ color:"rgba(255,255,255,0.88)", fontSize:"0.82rem", fontWeight:600, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Detail rows ── */}
        <div className="bdm-rows" style={{ padding:"0.3rem 1.7rem 0" }}>
          <InfoRow icon="📞" label="Phone"        value={b.clientPhone} mono />
          <InfoRow icon="📧" label="Email"        value={b.clientEmail||"—"} />
          <InfoRow icon="💳" label="Payment"      value={b.paymentMethod||"—"} />
          <InfoRow icon="🔖" label="Transaction"  value={b.transactionId||"—"} mono />
          {b.specialRequests&&b.specialRequests!=="None"&&(
            <div style={{ padding:"0.7rem 0", borderBottom:"1px solid #252d3d" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.55rem", marginBottom:"0.35rem" }}>
                <span style={{ fontSize:"0.85rem", opacity:0.6 }}>💬</span>
                <span style={{ color:"rgba(255,255,255,0.32)", fontSize:"0.78rem", fontWeight:500 }}>Special Requests</span>
              </div>
              <p style={{ color:"#cbd5e1", fontSize:"0.8rem", margin:0, lineHeight:1.6, paddingLeft:"1.55rem" }}>{b.specialRequests}</p>
            </div>
          )}
        </div>

        {/* ── Selected Dishes ── */}
        <SelectedDishesSection
          bookingId={b._id}
          dishIds={dishIds}
          cateringOption={localDishIds ? "our-menu" : b.cateringOption}
          onDishesUpdated={(ids) => setLocalDishIds(ids)}
        />

        {/* ── Action buttons ── */}
        <div className="bdm-footer" style={{ padding:"1.25rem 1.7rem 1.7rem", display:"flex", gap:"0.6rem", justifyContent:"flex-end", flexWrap:"wrap" }}>
          {displayStatus==="Pending"&&(
            <button
              disabled={confirming}
              onClick={handleConfirm}
              style={{ padding:"0.55rem 1.2rem", borderRadius:11, border:"1px solid rgba(16,185,129,0.38)", background: confirming?"rgba(16,185,129,0.08)":"rgba(16,185,129,0.12)", color:"#34d399", fontSize:"0.82rem", fontWeight:700, cursor: confirming?"not-allowed":"pointer", transition:"all 0.15s", opacity: confirming?0.6:1 }}
              onMouseEnter={e=>{ if(!confirming) e.currentTarget.style.background="rgba(16,185,129,0.22)";}}
              onMouseLeave={e=>e.currentTarget.style.background=confirming?"rgba(16,185,129,0.08)":"rgba(16,185,129,0.12)"}>
              {confirming?"Confirming…":"✓ Confirm & SMS"}
            </button>
          )}
          {displayStatus!=="Cancelled" && displayStatus!=="Completed" && (
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
            style={{ padding:"0.55rem 1.1rem", borderRadius:11, border:"1px solid rgba(99,102,241,0.25)", background:"transparent", color:"#94a3b8", fontSize:"0.82rem", fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(79,70,229,0.15)";e.currentTarget.style.color="#a5b4fc";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#94a3b8";}}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}