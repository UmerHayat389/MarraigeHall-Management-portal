import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { statusColor, statusBg, statusBorder, btnPrimary, getDisplayStatus } from "./adminTheme";
import BookingDetailModal from "./BookingDetailModal";

// ── Constants ─────────────────────────────────────────────────────────────────
const EVENT_TYPES  = ["Nikkah","Walima","Barat","Birthday","Conference","Anniversary","Other"];
const EVENT_ICONS  = { Nikkah:"☪️", Walima:"🌸", Barat:"💐", Birthday:"🎂", Conference:"🎤", Anniversary:"💍", Other:"✨" };
const PAY_METHODS  = ["JazzCash","EasyPaisa","Bank Transfer","Cash"];
const PAY_ICONS    = { JazzCash:"📱", EasyPaisa:"💚", "Bank Transfer":"🏦", Cash:"💵" };
const TIME_SLOTS   = [
  { id:"afternoon", label:"Afternoon",  time:"12:00 PM – 4:00 PM"  },
  { id:"evening",   label:"Evening",    time:"5:00 PM – 9:00 PM"   },
  { id:"latenight", label:"Late Night", time:"10:00 PM – 2:00 AM"  },
];
const DISH_CATS = [
  { key:"Starter Menu",     icon:"🥗", short:"Starters" },
  { key:"Main Course Menu", icon:"🍛", short:"Main"     },
  { key:"Dessert Menu",     icon:"🍰", short:"Desserts" },
  { key:"Drinks Menu",      icon:"🥤", short:"Drinks"   },
];
const MAX_PER_CAT = 2;
const STEPS = ["Details","Hall & Date","Menu","Payment","Done"];

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes abIn  { from{opacity:0;transform:translateY(14px) scale(.98)} to{opacity:1;transform:none} }
  @keyframes abBg  { from{opacity:0} to{opacity:1} }
  @keyframes abSpin{ to{transform:rotate(360deg)} }

  .ab-ov {
    position:fixed;inset:0;z-index:600;
    background:rgba(2,1,8,.55);
    backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);
    display:flex;align-items:center;justify-content:center;
    padding:.75rem;animation:abBg .15s ease;
  }
  .ab-box {
    width:100%;max-width:560px;
    background:linear-gradient(160deg,#110a2e 0%,#0c0720 100%);
    border:1px solid rgba(99,102,241,.22);border-radius:18px;
    display:flex;flex-direction:column;
    max-height:calc(100vh - 1.5rem);
    box-shadow:0 32px 80px rgba(0,0,0,.8);
    animation:abIn .2s cubic-bezier(.22,1,.36,1);
    overflow:hidden;
  }
  .ab-head {
    padding:1.2rem 1.4rem 1rem;flex-shrink:0;
    background:linear-gradient(135deg,rgba(79,70,229,.14),rgba(99,102,241,.06));
    border-bottom:1px solid rgba(99,102,241,.14);
  }
  .ab-body {
    flex:1;overflow-y:auto;padding:1.15rem 1.4rem;
  }
  .ab-body::-webkit-scrollbar{width:3px}
  .ab-body::-webkit-scrollbar-thumb{background:rgba(99,102,241,.3);border-radius:2px}
  .ab-foot {
    flex-shrink:0;padding:.9rem 1.4rem;
    border-top:1px solid rgba(99,102,241,.12);
    display:flex;justify-content:flex-end;gap:.6rem;
  }

  .ab-lbl {
    display:block;font-size:.61rem;font-weight:700;
    letter-spacing:.12em;text-transform:uppercase;
    color:#94a3b8;margin-bottom:.25rem;
  }
  .ab-inp {
    width:100%;padding:.6rem .85rem;border-radius:9px;
    background:#1e2433;
    border:1px solid rgba(99,102,241,.35);
    color:white;font-size:.84rem;outline:none;
    font-family:'Inter',sans-serif;
    transition:border-color .15s,background .15s;
    box-sizing:border-box;
  }
  .ab-inp:focus { border-color:rgba(99,102,241,.55);background:#1e2433; }
  .ab-inp.err   { border-color:rgba(239,68,68,.5);background:rgba(239,68,68,.04); }
  .ab-inp::placeholder{color:rgba(255,255,255,.18);}
  .ab-inp[type=date]{color-scheme:dark;}
  .ab-inp[type=textarea]{resize:vertical;min-height:72px;}

  .ab-err { color:#f87171;font-size:.66rem;margin:3px 0 0; }

  .ab-grid { display:grid;grid-template-columns:1fr 1fr;gap:.7rem; }
  .ab-full { grid-column:1/-1; }
  .ab-g3   { display:flex;flex-direction:column;gap:.7rem; }

  .ab-dd { position:relative; }
  .ab-dd-btn {
    width:100%;padding:.6rem .85rem;border-radius:9px;
    background:#1e2433;border:1px solid rgba(99,102,241,.35);
    color:white;cursor:pointer;outline:none;
    font-family:'Inter',sans-serif;font-size:.84rem;
    display:flex;align-items:center;justify-content:space-between;
    transition:all .15s;box-sizing:border-box;
  }
  .ab-dd-btn.open,.ab-dd-btn:focus{border-color:rgba(99,102,241,.55);background:#1e2433;}
  .ab-dd-btn.err{border-color:rgba(239,68,68,.5);background:rgba(239,68,68,.04);}
  .ab-dd-menu {
    position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:9999;
    background:#1e2433;border:1px solid rgba(99,102,241,.22);
    border-radius:10px;overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,.7);
  }
  .ab-dd-opt {
    width:100%;padding:.52rem .85rem;border:none;background:transparent;
    border-left:3px solid transparent;
    display:flex;align-items:center;gap:.6rem;
    cursor:pointer;transition:background .1s;
    font-family:'Inter',sans-serif;font-size:.83rem;
  }
  .ab-dd-opt:hover{background:#1e2433;}
  .ab-dd-opt.sel{background:rgba(79,70,229,.25);border-left-color:#6366f1;}

  .ab-step-bar { display:flex;align-items:center;gap:0;margin-bottom:0; }
  .ab-step-dot {
    width:8px;height:8px;border-radius:50%;flex-shrink:0;transition:all .25s;
  }
  .ab-step-line { flex:1;height:2px;transition:background .25s; }

  .ab-slot-btn {
    width:100%;padding:.75rem 1rem;border-radius:10px;
    display:flex;align-items:center;justify-content:space-between;
    cursor:pointer;border:1px solid rgba(99,102,241,.35);
    background:#1e2433;transition:all .15s;
    font-family:'Inter',sans-serif;
  }
  .ab-slot-btn:hover:not(:disabled){border-color:rgba(99,102,241,.45);background:rgba(79,70,229,.1);}
  .ab-slot-btn.sel{border-color:#6366f1;background:linear-gradient(135deg,rgba(79,70,229,.3),rgba(99,102,241,.15));}
  .ab-slot-btn:disabled{opacity:.45;cursor:not-allowed;}

  .ab-catering-btn {
    flex:1;padding:.9rem 1rem;border-radius:10px;cursor:pointer;text-align:left;
    border:1px solid rgba(99,102,241,.35);background:#1e2433;
    transition:all .15s;font-family:'Inter',sans-serif;
  }
  .ab-catering-btn.sel{border-color:#6366f1;background:rgba(79,70,229,.2);}
  .ab-catering-btn:hover:not(.sel){border-color:rgba(99,102,241,.35);background:rgba(79,70,229,.08);}

  .ab-dish-tab {
    flex:1;padding:.45rem .5rem;border-radius:8px;cursor:pointer;
    display:flex;flex-direction:column;align-items:center;gap:2px;
    border:1px solid rgba(99,102,241,.35);background:#1e2433;
    transition:all .14s;font-family:'Inter',sans-serif;
  }
  .ab-dish-tab.sel{border-color:rgba(99,102,241,.55);background:rgba(79,70,229,.3);}

  .ab-dish-item {
    display:flex;align-items:center;gap:.55rem;padding:.45rem .6rem;
    border-radius:7px;cursor:pointer;border:1px solid rgba(99,102,241,.35);
    background:rgba(255,255,255,.025);transition:all .12s;
    font-family:'Inter',sans-serif;
  }
  .ab-dish-item.sel{border-color:#6366f1;background:rgba(79,70,229,.18);}
  .ab-dish-item:hover:not(.sel):not(.blocked){border-color:rgba(99,102,241,.3);background:rgba(79,70,229,.08);}
  .ab-dish-item.blocked{opacity:.4;cursor:not-allowed;}

  .ab-sumrow {
    display:flex;justify-content:space-between;align-items:center;
    padding:.4rem 0;border-bottom:1px solid #1e2433;
    font-size:.82rem;
  }

  .ab-btn-back {
    padding:.58rem 1.1rem;border-radius:9px;cursor:pointer;
    border:1px solid rgba(99,102,241,.4);background:transparent;
    color:#94a3b8;font-size:.83rem;font-weight:500;
    font-family:'Inter',sans-serif;transition:all .15s;
  }
  .ab-btn-back:hover{border-color:rgba(99,102,241,.4);color:rgba(165,180,252,.85);}
  .ab-btn-next {
    padding:.58rem 1.4rem;border-radius:9px;border:none;cursor:pointer;
    background:linear-gradient(135deg,#4f46e5,#7c3aed);
    color:white;font-size:.83rem;font-weight:700;
    font-family:'Inter',sans-serif;
    min-width:120px;display:flex;align-items:center;justify-content:center;gap:.4rem;
    box-shadow:0 4px 16px rgba(99,102,241,.38);transition:all .15s;
  }
  .ab-btn-next:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 22px rgba(79,70,229,.52);}
  .ab-btn-next:disabled{opacity:.5;cursor:not-allowed;transform:none;}

  @media(max-width:520px){
    .ab-box{border-radius:14px;}
    .ab-head,.ab-body,.ab-foot{padding-left:1rem;padding-right:1rem;}
    .ab-grid{grid-template-columns:1fr;}
    .ab-full{grid-column:1;}
    .ab-foot{flex-direction:column;}
    .ab-btn-back,.ab-btn-next{width:100%;justify-content:center;}
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function Lbl({ children }) {
  return <label className="ab-lbl">{children}</label>;
}
function ErrTxt({ msg }) {
  return msg ? <p className="ab-err">⚠ {msg}</p> : null;
}

function Dropdown({ value, onChange, options, placeholder, icons = {}, error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const sel = options.find(o => (o.value ?? o) === value);
  const lbl = sel ? (sel.label ?? sel) : null;
  const ico = lbl ? (icons[lbl] || icons[value] || null) : null;

  return (
    <div className="ab-dd" ref={ref}>
      <button type="button" className={`ab-dd-btn${open ? " open" : ""}${error ? " err" : ""}`}
        onClick={() => setOpen(o => !o)}>
        <span style={{ display:"flex", alignItems:"center", gap:".55rem", color: lbl ? "white" : "rgba(255,255,255,.25)", fontSize:".84rem" }}>
          {ico && <span style={{ fontSize:"1rem" }}>{ico}</span>}
          {lbl || placeholder}
        </span>
        <span style={{ color:"rgba(99,102,241,.45)", fontSize:".58rem", transform: open ? "rotate(180deg)" : "rotate(0)", transition:"transform .18s", display:"inline-block" }}>▼</span>
      </button>
      {open && (
        <div className="ab-dd-menu">
          {options.map(o => {
            const val = o.value ?? o;
            const txt = o.label ?? o;
            const ic  = icons[txt] || icons[val] || null;
            const active = val === value;
            return (
              <button key={val} type="button" className={`ab-dd-opt${active ? " sel" : ""}`}
                onClick={() => { onChange(val); setOpen(false); }}>
                {ic && <span style={{ fontSize:".95rem", width:18, textAlign:"center" }}>{ic}</span>}
                <span style={{ color: active ? "white" : "rgba(255,255,255,.65)", fontWeight: active ? 700 : 400 }}>{txt}</span>
                {active && <span style={{ marginLeft:"auto", color:"#6366f1", fontSize:".72rem" }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── ADD BOOKING MODAL ─────────────────────────────────────────────────────────
function AddBookingModal({ onClose, onSaved }) {
  const [step, setStep]   = useState(1);
  const [loading, setLoading] = useState(false);
  const [halls, setHalls] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [dishTab, setDishTab] = useState("Starter Menu");
  const [bookingRef, setBookingRef] = useState("");

  const blank = {
    clientName:"", clientPhone:"", clientEmail:"", eventType:"",
    hallId:"", eventDate:"", timeSlot:"", guests:"",
    cateringOption:"", selectedDishes:[],
    paymentMethod:"", transactionId:"", specialRequests:"",
  };
  const [form, setForm] = useState(blank);
  const [err,  setErr]  = useState({});

  const set = (k, v) => { setForm(f => ({...f,[k]:v})); setErr(e => ({...e,[k]:""})); };

  const selectedHall = halls.find(h => h._id === form.hallId) || null;
  const roomRate     = selectedHall ? selectedHall.pricePerHead * (parseInt(form.guests) || 0) : 0;
  const tax          = Math.round(roomRate * 0.16);
  const grandTotal   = roomRate + tax;

  useEffect(() => {
    api.get("/halls").then(r => setHalls(r.data.halls || [])).catch(() => {});
    api.get("/dishes").then(r => setDishes(r.data.dishes || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.hallId || !form.eventDate) return;
    setSlotsLoading(true);
    api.get(`/bookings/slots/${form.hallId}?date=${form.eventDate}`)
      .then(r => setBookedSlots(r.data.bookedSlots || []))
      .catch(() => setBookedSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [form.hallId, form.eventDate]);

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.clientName.trim()) e.clientName = "Required";
      if (!form.clientPhone.trim()) e.clientPhone = "Required";
      else if (!/^03\d{9}$/.test(form.clientPhone.replace(/\s/g,""))) e.clientPhone = "Must be 11 digits starting with 03";
      if (form.clientEmail && !/^\S+@\S+\.\S+$/.test(form.clientEmail)) e.clientEmail = "Invalid email";
      if (!form.eventType) e.eventType = "Select event type";
    } else if (step === 2) {
      if (!form.hallId)    e.hallId    = "Select a hall";
      if (!form.eventDate) e.eventDate = "Select a date";
      else if (new Date(form.eventDate) < new Date().setHours(0,0,0,0)) e.eventDate = "Cannot be in the past";
      if (!form.timeSlot)  e.timeSlot  = "Select a time slot";
      if (!form.guests || form.guests < 1) e.guests = "At least 1 guest";
      else if (selectedHall && Number(form.guests) > selectedHall.totalSeats)
        e.guests = `Exceeds capacity of ${selectedHall.totalSeats.toLocaleString()}`;
    } else if (step === 3) {
      if (!form.cateringOption) e.cateringOption = "Select a catering option";
      else if (form.cateringOption === "our-menu" && form.selectedDishes.length === 0)
        e.cateringOption = "Select at least one dish or choose Self-Catering";
    } else if (step === 4) {
      if (!form.paymentMethod) e.paymentMethod = "Select payment method";
      if (!form.transactionId.trim()) e.transactionId = "Transaction ID required";
    }
    return e;
  };

  const next = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErr(e); return; }
    if (step === 4) {
      setLoading(true);
      try {
        const res = await api.post("/bookings", { ...form });
        const ref = res.data.booking.bookingRef;
        setBookingRef(ref);
        // Auto-confirm since it's created by admin
        await api.put(`/bookings/${res.data.booking._id}`, { status: "Confirmed" });
        setStep(5);
        if (onSaved) onSaved();
      } catch (ex) {
        setErr({ submit: ex.response?.data?.message || "Failed to create booking." });
      }
      setLoading(false);
    } else {
      setStep(s => s + 1);
    }
  };

  const toggleDish = (id, category) => {
    if (form.selectedDishes.includes(id)) {
      set("selectedDishes", form.selectedDishes.filter(x => x !== id));
      return;
    }
    const catIds   = dishes.filter(d => d.category === category).map(d => d._id);
    const catCount = form.selectedDishes.filter(x => catIds.includes(x)).length;
    if (catCount >= MAX_PER_CAT) { setErr(e => ({...e, dishes:`Max ${MAX_PER_CAT} from this category`})); return; }
    set("selectedDishes", [...form.selectedDishes, id]);
  };

  const tabDishes = dishes.filter(d => d.category === dishTab);

  return (
    <>
      <style>{CSS}</style>
      <div className="ab-ov" onClick={e => e.target === e.currentTarget && step !== 5 && onClose()}>
        <div className="ab-box">

          {/* ══ HEADER ══ */}
          <div className="ab-head">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".75rem" }}>
              <div>
                <h3 style={{ fontFamily:"'Sora',sans-serif", color:"white", fontSize:"1.3rem", fontWeight:600, margin:"0 0 2px" }}>
                  {step === 5 ? "Booking Created ✓" : "Add New Booking"}
                </h3>
                <p style={{ color:"rgba(255,255,255,.28)", fontSize:".72rem", margin:0 }}>
                  {step < 5 ? `Step ${step} of 4 — ${STEPS[step-1]}` : "Auto-confirmed by admin"}
                </p>
              </div>
              {step !== 5 && (
                <button onClick={onClose} style={{ width:28, height:28, borderRadius:"7px", border:"1px solid rgba(255,255,255,.1)", background:"#1e2433", color:"rgba(255,255,255,.42)", cursor:"pointer", fontSize:".85rem", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
              )}
            </div>

            {/* Progress bar */}
            <div className="ab-step-bar">
              {[1,2,3,4,5].map((s,i) => (
                <React.Fragment key={s}>
                  <div className="ab-step-dot" style={{
                    background: s < step ? "#10b981" : s === step ? "linear-gradient(135deg,#4f46e5,#6366f1)" : "rgba(99,102,241,.2)",
                    width: s === step ? 24 : 8,
                    borderRadius: s === step ? "999px" : "50%",
                  }} />
                  {i < 4 && <div className="ab-step-line" style={{ background: s < step ? "#10b981" : "rgba(99,102,241,.15)" }} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* ══ BODY ══ */}
          <div className="ab-body">

            {/* ── Step 1: Client Details ── */}
            {step === 1 && (
              <div className="ab-g3">
                <div>
                  <Lbl>Full Name *</Lbl>
                  <input className={`ab-inp${err.clientName?" err":""}`} value={form.clientName}
                    onChange={e => set("clientName", e.target.value)} placeholder="e.g. Ahmed Khan" />
                  <ErrTxt msg={err.clientName} />
                </div>
                <div className="ab-grid">
                  <div>
                    <Lbl>Phone Number *</Lbl>
                    <input className={`ab-inp${err.clientPhone?" err":""}`} value={form.clientPhone}
                      onChange={e => set("clientPhone", e.target.value.replace(/[^\d]/g,""))}
                      placeholder="03001234567" maxLength={11} inputMode="numeric" />
                    <ErrTxt msg={err.clientPhone} />
                  </div>
                  <div>
                    <Lbl>Email (optional)</Lbl>
                    <input className={`ab-inp${err.clientEmail?" err":""}`} type="email" value={form.clientEmail}
                      onChange={e => set("clientEmail", e.target.value)} placeholder="example@mail.com" />
                    <ErrTxt msg={err.clientEmail} />
                  </div>
                </div>
                <div>
                  <Lbl>Event Type *</Lbl>
                  <Dropdown value={form.eventType} onChange={v => set("eventType",v)}
                    options={EVENT_TYPES} placeholder="Select event type"
                    icons={EVENT_ICONS} error={err.eventType} />
                  <ErrTxt msg={err.eventType} />
                </div>
              </div>
            )}

            {/* ── Step 2: Hall & Date ── */}
            {step === 2 && (
              <div className="ab-g3">
                <div>
                  <Lbl>Select Hall *</Lbl>
                  <Dropdown value={form.hallId} onChange={v => { set("hallId",v); set("timeSlot",""); }}
                    options={halls.map(h => ({value:h._id, label:h.name}))}
                    placeholder="Choose a venue" error={err.hallId} />
                  <ErrTxt msg={err.hallId} />
                </div>

                {selectedHall && (
                  <div style={{ padding:".75rem 1rem", borderRadius:"10px", background:"rgba(99,102,241,.08)", border:"1px solid rgba(99,102,241,.2)" }}>
                    <p style={{ color:"white", fontWeight:600, fontSize:".86rem", margin:"0 0 3px" }}>{selectedHall.name}</p>
                    <p style={{ color:"rgba(255,255,255,.38)", fontSize:".75rem", margin:0 }}>
                      📍 {selectedHall.location} · PKR {selectedHall.pricePerHead?.toLocaleString()}/guest · {selectedHall.totalSeats?.toLocaleString()} capacity
                    </p>
                  </div>
                )}

                <div className="ab-grid">
                  <div>
                    <Lbl>Number of Guests *</Lbl>
                    <input className={`ab-inp${err.guests?" err":""}`} type="number" value={form.guests}
                      onChange={e => set("guests", e.target.value)}
                      placeholder={selectedHall ? `Max ${selectedHall.totalSeats}` : "e.g. 250"} />
                    <ErrTxt msg={err.guests} />
                  </div>
                  <div>
                    <Lbl>Event Date *</Lbl>
                    <input className={`ab-inp${err.eventDate?" err":""}`} type="date" value={form.eventDate}
                      onChange={e => { set("eventDate", e.target.value); set("timeSlot",""); }}
                      min={new Date().toISOString().split("T")[0]} />
                    <ErrTxt msg={err.eventDate} />
                  </div>
                </div>

                <div>
                  <Lbl>Time Slot * {slotsLoading && <span style={{ color:"#f59e0b", fontWeight:400, textTransform:"none", letterSpacing:0 }}>· checking availability…</span>}</Lbl>
                  <div style={{ display:"flex", flexDirection:"column", gap:".45rem" }}>
                    {TIME_SLOTS.map(s => {
                      const booked = bookedSlots.includes(s.id);
                      const active = form.timeSlot === s.id;
                      return (
                        <button key={s.id} type="button"
                          className={`ab-slot-btn${active?" sel":""}`}
                          disabled={booked || (!form.hallId || !form.eventDate)}
                          onClick={() => set("timeSlot", s.id)}
                          style={{ opacity: booked ? .4 : (!form.hallId||!form.eventDate) ? .35 : 1 }}
                        >
                          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", gap:2 }}>
                            <span style={{ color: booked ? "#f87171" : active ? "white" : "rgba(255,255,255,.82)", fontWeight:600, fontSize:".84rem" }}>
                              {s.label}
                            </span>
                            <span style={{ color:"rgba(255,255,255,.35)", fontSize:".72rem" }}>{s.time}</span>
                          </div>
                          {booked
                            ? <span style={{ padding:"2px 8px", borderRadius:"999px", fontSize:".62rem", fontWeight:700, background:"rgba(239,68,68,.12)", color:"#f87171", border:"1px solid rgba(239,68,68,.25)" }}>Booked</span>
                            : active
                            ? <span style={{ color:"#6366f1", fontSize:"1rem" }}>✓</span>
                            : <span style={{ width:18, height:18, borderRadius:"50%", border:"1px solid rgba(99,102,241,.25)", display:"inline-block" }} />
                          }
                        </button>
                      );
                    })}
                  </div>
                  {!form.hallId || !form.eventDate
                    ? <p style={{ color:"rgba(255,255,255,.25)", fontSize:".7rem", marginTop:".35rem" }}>Select hall and date first to check availability</p>
                    : null
                  }
                  <ErrTxt msg={err.timeSlot} />
                </div>
              </div>
            )}

            {/* ── Step 3: Menu ── */}
            {step === 3 && (
              <div className="ab-g3">
                <div>
                  <Lbl>Catering Preference *</Lbl>
                  <div style={{ display:"flex", gap:".6rem" }}>
                    {[
                      { val:"our-menu",      icon:"🍽️", title:"Our Menu",      sub:"Choose from our menu" },
                      { val:"self-catering", icon:"👨‍🍳", title:"Self-Catering", sub:"Client's own catering"  },
                    ].map(opt => (
                      <button key={opt.val} type="button"
                        className={`ab-catering-btn${form.cateringOption===opt.val?" sel":""}`}
                        onClick={() => { set("cateringOption",opt.val); if(opt.val==="self-catering") set("selectedDishes",[]); }}>
                        <div style={{ fontSize:"1.4rem", marginBottom:".35rem" }}>{opt.icon}</div>
                        <p style={{ color:"white", fontWeight:600, fontSize:".84rem", margin:"0 0 3px" }}>{opt.title}</p>
                        <p style={{ color:"rgba(255,255,255,.35)", fontSize:".72rem", margin:0 }}>{opt.sub}</p>
                      </button>
                    ))}
                  </div>
                  <ErrTxt msg={err.cateringOption} />
                </div>

                {form.cateringOption === "our-menu" && (
                  <div style={{ border:"1px solid rgba(99,102,241,.2)", borderRadius:"12px", overflow:"hidden", background:"rgba(99,102,241,.06)" }}>
                    {/* Category tabs */}
                    <div style={{ display:"flex", gap:".35rem", padding:".75rem .85rem .5rem" }}>
                      {DISH_CATS.map(c => {
                        const catIds   = dishes.filter(d => d.category===c.key).map(d=>d._id);
                        const catSel   = form.selectedDishes.filter(x=>catIds.includes(x)).length;
                        const isActive = dishTab === c.key;
                        return (
                          <button key={c.key} type="button" className={`ab-dish-tab${isActive?" sel":""}`}
                            onClick={() => setDishTab(c.key)}>
                            <span style={{ fontSize:"1rem" }}>{c.icon}</span>
                            <span style={{ fontSize:".65rem", fontWeight:600, color: isActive?"white":"rgba(255,255,255,.5)" }}>{c.short}</span>
                            {catSel > 0 && <span style={{ fontSize:".58rem", padding:"0 4px", borderRadius:3, background:"#4f46e5", color:"white", fontWeight:700 }}>{catSel}</span>}
                          </button>
                        );
                      })}
                    </div>
                    {err.dishes && <p className="ab-err" style={{ padding:"0 .85rem .4rem" }}>⚠ {err.dishes}</p>}
                    {/* Dish list */}
                    <div style={{ padding:"0 .85rem .85rem", display:"flex", flexDirection:"column", gap:".35rem" }}>
                      {tabDishes.length === 0
                        ? <p style={{ color:"rgba(255,255,255,.22)", fontSize:".78rem", textAlign:"center", padding:".75rem 0" }}>No items in this category</p>
                        : tabDishes.map(d => {
                          const checked  = form.selectedDishes.includes(d._id);
                          const catIds   = dishes.filter(x=>x.category===d.category).map(x=>x._id);
                          const catCount = form.selectedDishes.filter(x=>catIds.includes(x)).length;
                          const blocked  = !checked && catCount >= MAX_PER_CAT;
                          return (
                            <button key={d._id} type="button"
                              className={`ab-dish-item${checked?" sel":""}${blocked?" blocked":""}`}
                              onClick={() => !blocked && toggleDish(d._id, d.category)}>
                              <div style={{ width:30, height:30, borderRadius:6, overflow:"hidden", background:"rgba(79,70,229,.15)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                {d.image
                                  ? <img src={d.image} alt={d.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                                  : <span style={{ fontSize:".9rem", opacity:.45 }}>{DISH_CATS.find(c=>c.key===d.category)?.icon||"🍽️"}</span>
                                }
                              </div>
                              <span style={{ flex:1, fontSize:".82rem", fontWeight:checked?600:400, color: checked?"white":"rgba(255,255,255,.72)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                {d.name}
                              </span>
                              {checked && <div style={{ width:16, height:16, borderRadius:"50%", background:"#4f46e5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".6rem", color:"white", fontWeight:700, flexShrink:0 }}>✓</div>}
                            </button>
                          );
                        })
                      }
                    </div>
                    <div style={{ padding:".5rem .85rem .75rem", borderTop:"1px solid rgba(99,102,241,.12)", fontSize:".72rem", color:"rgba(255,255,255,.28)" }}>
                      {form.selectedDishes.length} dish{form.selectedDishes.length!==1?"es":""} selected · Max {MAX_PER_CAT} per category
                    </div>
                  </div>
                )}

                {form.cateringOption === "self-catering" && (
                  <div style={{ padding:"1.25rem", borderRadius:"10px", textAlign:"center", background:"rgba(99,102,241,.06)", border:"1px solid rgba(99,102,241,.18)" }}>
                    <div style={{ fontSize:"2rem", marginBottom:".5rem" }}>👨‍🍳</div>
                    <p style={{ color:"white", fontWeight:600, fontSize:".86rem", margin:"0 0 4px" }}>Self-Catering Selected</p>
                    <p style={{ color:"rgba(255,255,255,.35)", fontSize:".75rem", margin:0 }}>Client will arrange their own catering</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 4: Payment ── */}
            {step === 4 && (
              <div className="ab-g3">
                {/* Summary card */}
                <div style={{ padding:".95rem 1.1rem", borderRadius:"12px", background:"linear-gradient(135deg,rgba(99,102,241,.12),rgba(79,70,229,.06))", border:"1px solid rgba(99,102,241,.22)" }}>
                  <p style={{ color:"#818cf8", fontSize:".62rem", fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", margin:"0 0 .6rem" }}>Booking Summary</p>
                  {[
                    ["Client",    form.clientName],
                    ["Hall",      selectedHall?.name],
                    ["Date",      form.eventDate ? new Date(form.eventDate+"T12:00:00").toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"}) : "—"],
                    ["Slot",      TIME_SLOTS.find(s=>s.id===form.timeSlot)?.label || "—"],
                    ["Event",     form.eventType],
                    ["Guests",    form.guests],
                    ["Catering",  form.cateringOption==="self-catering" ? "Self-Catering" : `${form.selectedDishes.length} dish${form.selectedDishes.length!==1?"es":""}` ],
                  ].map(([k,v]) => (
                    <div key={k} className="ab-sumrow">
                      <span style={{ color:"rgba(255,255,255,.38)" }}>{k}</span>
                      <span style={{ color:"rgba(255,255,255,.85)", fontWeight:500 }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:".6rem", paddingTop:".6rem", borderTop:"1px solid rgba(99,102,241,.18)" }}>
                    <span style={{ color:"#818cf8", fontWeight:700, fontSize:".88rem" }}>Grand Total</span>
                    <span style={{ color:"white", fontWeight:700, fontSize:"1.05rem" }}>PKR {grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <Lbl>Payment Method *</Lbl>
                  <Dropdown value={form.paymentMethod} onChange={v => set("paymentMethod",v)}
                    options={PAY_METHODS} placeholder="Select method" icons={PAY_ICONS} error={err.paymentMethod} />
                  <ErrTxt msg={err.paymentMethod} />
                </div>
                <div>
                  <Lbl>Transaction ID *</Lbl>
                  <input className={`ab-inp${err.transactionId?" err":""}`} value={form.transactionId}
                    onChange={e => set("transactionId", e.target.value)} placeholder="e.g. TXN123456789" />
                  <ErrTxt msg={err.transactionId} />
                </div>
                <div>
                  <Lbl>Special Requests (optional)</Lbl>
                  <textarea className="ab-inp" style={{ resize:"vertical", minHeight:72 }}
                    value={form.specialRequests} onChange={e => set("specialRequests", e.target.value)}
                    placeholder="Any special requirements…" />
                </div>
                {err.submit && (
                  <div style={{ padding:".55rem .85rem", borderRadius:"9px", background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.22)", color:"#f87171", fontSize:".78rem" }}>
                    ✕ {err.submit}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 5: Done ── */}
            {step === 5 && (
              <div style={{ textAlign:"center", padding:"1rem 0" }}>
                <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(16,185,129,.15)", border:"2px solid #10b981", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.6rem", margin:"0 auto .9rem" }}>✓</div>
                <h4 style={{ fontFamily:"'Sora',sans-serif", color:"white", fontSize:"1.2rem", fontWeight:600, margin:"0 0 .3rem" }}>Booking Confirmed!</h4>
                <p style={{ color:"#4ade80", fontSize:".78rem", margin:"0 0 1.1rem" }}>Auto-confirmed since this was created by admin.</p>
                <div style={{ padding:".75rem 1.1rem", borderRadius:"10px", background:"rgba(99,102,241,.1)", border:"1px solid rgba(99,102,241,.25)", marginBottom:".9rem" }}>
                  <p style={{ color:"rgba(255,255,255,.38)", fontSize:".62rem", letterSpacing:".1em", textTransform:"uppercase", margin:"0 0 4px" }}>Booking Reference</p>
                  <p style={{ color:"white", fontWeight:700, fontSize:"1.3rem", letterSpacing:".12em", fontFamily:"'Sora',sans-serif", margin:0 }}>{bookingRef}</p>
                </div>
                <p style={{ color:"rgba(255,255,255,.25)", fontSize:".74rem" }}>The booking list has been updated automatically.</p>
              </div>
            )}
          </div>

          {/* ══ FOOTER ══ */}
          <div className="ab-foot">
            {step > 1 && step < 5 && (
              <button className="ab-btn-back" onClick={() => setStep(s => s - 1)}>← Back</button>
            )}
            {step < 5 ? (
              <button className="ab-btn-next" onClick={next} disabled={loading}>
                {loading
                  ? <><span style={{ width:12, height:12, borderRadius:"50%", border:"2px solid rgba(255,255,255,.3)", borderTopColor:"white", animation:"abSpin .7s linear infinite", display:"inline-block" }} /> Saving…</>
                  : step === 4 ? "Confirm Booking" : "Next →"
                }
              </button>
            ) : (
              <button className="ab-btn-next" onClick={onClose}>Done</button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

// ── BOOKINGS TAB ──────────────────────────────────────────────────────────────
export default function BookingsTab({ toast }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("All");
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const [showAdd, setShowAdd]   = useState(false);
  const PER_PAGE = 10;

  const fetchBookings = () => {
    api.get("/bookings").then(r => setBookings(r.data.bookings||[])).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(() => { fetchBookings(); }, []);
  useEffect(() => { setPage(1); }, [filter, search]);

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

  const handleSaved = () => {
    toast("Booking created & confirmed","success");
    fetchBookings();
  };

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
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const counts     = { All:bookings.length, Pending:bookings.filter(b=>b.status==="Pending").length, Confirmed:bookings.filter(b=>b.status==="Confirmed").length, Cancelled:bookings.filter(b=>b.status==="Cancelled").length };

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.5rem", flexWrap:"wrap", gap:".75rem" }}>
        <div>
          <h2 style={{ fontFamily:"'Sora',sans-serif", color:"white", fontSize:"1.75rem", fontWeight:600, margin:"0 0 4px" }}>
            All <em style={{ color:"#6366f1", fontStyle:"italic" }}>Bookings</em>
          </h2>
          <p style={{ color:"rgba(255,255,255,0.3)", fontSize:".8rem", margin:0 }}>
            {filtered.length!==bookings.length?`${filtered.length} of ${bookings.length} bookings`:`${bookings.length} total bookings`}
          </p>
        </div>
        <div style={{ display:"flex", gap:".6rem", alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:".8rem", top:"50%", transform:"translateY(-50%)", color:"rgba(99,102,241,0.4)", fontSize:".85rem" }}>🔍</span>
            <input className="a-input" value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search name, ref, phone…" style={{ paddingLeft:"2.2rem", width:220, fontSize:".82rem" }} />
          </div>
          <button style={btnPrimary} onClick={()=>setShowAdd(true)}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(79,70,229,0.4)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
            + Add Booking
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-row" style={{ display:"flex", gap:".4rem", marginBottom:"1.25rem" }}>
        {["All","Pending","Confirmed","Cancelled","Completed"].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{
            padding:".38rem .9rem", borderRadius:"999px", fontSize:".75rem",
            fontFamily:"'Inter',sans-serif", fontWeight:600,
            border:`1px solid ${filter===s?"rgba(99,102,241,0.55)":"rgba(99,102,241,0.2)"}`,
            background:filter===s?"linear-gradient(135deg,rgba(79,70,229,0.4),rgba(99,102,241,0.25))":"transparent",
            color:filter===s?"white":"#94a3b8",
            cursor:"pointer", transition:"all 0.15s",
            display:"flex", alignItems:"center", gap:".35rem",
          }}>
            {s}
            <span style={{ background:filter===s?"#94a3b8":"rgba(99,102,241,0.2)", borderRadius:"999px", padding:"0 5px", fontSize:".65rem", fontWeight:700 }}>
              {counts[s]??""}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign:"center", padding:"4rem", color:"#94a3b8" }}>
          <div style={{ fontSize:"2rem", marginBottom:".75rem", opacity:.4 }}>📋</div>Loading bookings…
        </div>
      ) : filtered.length===0 ? (
        <div style={{ textAlign:"center", padding:"4rem 2rem", border:"1px solid rgba(99,102,241,0.12)", borderRadius:"18px" }}>
          <p style={{ fontSize:"2rem", marginBottom:".6rem" }}>🔍</p>
          <p style={{ color:"rgba(255,255,255,0.28)", fontSize:".9rem" }}>No bookings match your filter</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
          {paginated.map(b => {
            const ds=getDisplayStatus(b), sc=statusColor[ds]||"#888", sbg=statusBg[ds]||"transparent", sbd=statusBorder[ds]||"transparent";
            const dateStr=b.eventDate?new Date(b.eventDate).toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"}):"—";
            const slot=b.timeSlot?b.timeSlot.charAt(0).toUpperCase()+b.timeSlot.slice(1):"—";
            return (
              <div key={b._id} onClick={()=>setSelected(b)}
                style={{ display:"flex", alignItems:"stretch", borderRadius:12, overflow:"hidden", cursor:"pointer", border:"1px solid rgba(99,102,241,0.13)", background:"#1e2433", transition:"all 0.16s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(99,102,241,0.38)";e.currentTarget.style.background="rgba(79,70,229,0.07)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(99,102,241,0.13)";e.currentTarget.style.background="#1e2433";}}>
                <div style={{ width:3, flexShrink:0, background:sc }} />
                <div style={{ flex:1, padding:"12px 16px", minWidth:0, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                  <div style={{ minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                      <span style={{ color:"white", fontWeight:600, fontSize:".88rem" }}>{b.clientName}</span>
                      <span style={{ fontSize:".6rem", fontWeight:700, padding:"2px 7px", borderRadius:99, textTransform:"uppercase", letterSpacing:".07em", background:sbg, color:sc, border:`1px solid ${sbd}`, flexShrink:0 }}>{ds}</span>
                      {b.bookingRef&&<span style={{ fontSize:".63rem", fontWeight:600, padding:"2px 7px", borderRadius:99, background:"rgba(99,102,241,0.1)", color:"#94a3b8", border:"1px solid rgba(99,102,241,0.2)", flexShrink:0 }}>{b.bookingRef}</span>}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                      <span style={{ fontSize:".75rem", color:"#cbd5e1" }}>{b.hallId?.name||"—"}</span>
                      <span style={{ color:"rgba(255,255,255,0.18)", fontSize:".65rem" }}>·</span>
                      <span style={{ fontSize:".75rem", color:"#cbd5e1" }}>{dateStr}</span>
                      <span style={{ color:"rgba(255,255,255,0.18)", fontSize:".65rem" }}>·</span>
                      <span style={{ fontSize:".75rem", color:"#cbd5e1" }}>{slot}</span>
                      <span style={{ color:"rgba(255,255,255,0.18)", fontSize:".65rem" }}>·</span>
                      <span style={{ fontSize:".75rem", color:"#94a3b8" }}>{b.guests} guests</span>
                    </div>
                  </div>
                  <span style={{ color:"#a5b4fc", fontWeight:700, fontSize:".9rem", flexShrink:0 }}>PKR {b.totalPrice?.toLocaleString()}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6, padding:"0 14px", borderLeft:"1px solid rgba(99,102,241,0.1)", flexShrink:0 }} onClick={e=>e.stopPropagation()}>
                  {ds==="Pending"&&<button onClick={()=>updateStatus(b._id,"Confirmed")} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 13px", borderRadius:8, fontSize:".75rem", fontWeight:600, cursor:"pointer", border:"1px solid rgba(16,185,129,0.4)", background:"rgba(16,185,129,0.12)", color:"#4ade80", whiteSpace:"nowrap" }} onMouseEnter={e=>{e.currentTarget.style.background="rgba(16,185,129,0.25)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(16,185,129,0.12)";}}>✓ Confirm</button>}
                  {ds!=="Cancelled"&&ds!=="Completed"&&<button onClick={()=>updateStatus(b._id,"Cancelled")} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 13px", borderRadius:8, fontSize:".75rem", fontWeight:600, cursor:"pointer", border:"1px solid rgba(239,68,68,0.35)", background:"rgba(239,68,68,0.1)", color:"#f87171", whiteSpace:"nowrap" }} onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.22)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(239,68,68,0.1)";}}>✕ Cancel</button>}
                  <button onClick={()=>deleteBooking(b._id)} style={{ display:"flex", alignItems:"center", justifyContent:"center", width:32, height:32, borderRadius:8, cursor:"pointer", border:"1px solid rgba(239,68,68,0.25)", background:"rgba(239,68,68,0.07)", color:"#f87171", fontSize:".85rem" }} onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.2)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(239,68,68,0.07)";}}>🗑</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length>PER_PAGE && (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"1.25rem", flexWrap:"wrap", gap:".5rem" }}>
          <p style={{ color:"rgba(255,255,255,0.28)", fontSize:".78rem", margin:0 }}>Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE,filtered.length)} of {filtered.length}</p>
          <div style={{ display:"flex", alignItems:"center", gap:".35rem" }}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ padding:".38rem .75rem", borderRadius:9, border:"1px solid rgba(99,102,241,0.22)", background:"#1e2433", color:page===1?"#94a3b8":"#94a3b8", fontSize:".78rem", cursor:page===1?"not-allowed":"pointer", fontWeight:600 }}>← Prev</button>
            {Array.from({length:totalPages},(_,i)=>i+1).filter(n=>n===1||n===totalPages||Math.abs(n-page)<=1).reduce((acc,n,idx,arr)=>{if(idx>0&&n-arr[idx-1]>1)acc.push("...");acc.push(n);return acc;},[]).map((n,idx)=>n==="..."?<span key={`d${idx}`} style={{ color:"#94a3b8", fontSize:".78rem", padding:"0 2px" }}>…</span>:<button key={n} onClick={()=>setPage(n)} style={{ width:34, height:34, borderRadius:9, border:`1px solid ${page===n?"rgba(99,102,241,0.6)":"rgba(99,102,241,0.2)"}`, background:page===n?"linear-gradient(135deg,rgba(79,70,229,0.5),rgba(99,102,241,0.3))":"#1e2433", color:page===n?"white":"#94a3b8", fontSize:".8rem", fontWeight:page===n?700:500, cursor:"pointer" }}>{n}</button>)}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ padding:".38rem .75rem", borderRadius:9, border:"1px solid rgba(99,102,241,0.22)", background:"#1e2433", color:page===totalPages?"#94a3b8":"#94a3b8", fontSize:".78rem", cursor:page===totalPages?"not-allowed":"pointer", fontWeight:600 }}>Next →</button>
          </div>
        </div>
      )}

      {selected && <BookingDetailModal booking={selected} onClose={()=>setSelected(null)} onStatusChange={updateStatus} />}
      {showAdd   && <AddBookingModal onClose={()=>setShowAdd(false)} onSaved={handleSaved} />}
    </div>
  );
}