import React, { useState, useEffect } from "react";
import api from "../services/api";

const STEP_LABELS = ["Details", "Hall & Date", "Menu", "Payment", "Confirmed"];
const EVENT_TYPES = ["Nikkah", "Walima", "Barat", "Birthday", "Conference", "Anniversary", "Other"];
const PAY_METHODS = ["JazzCash", "EasyPaisa", "Bank Transfer", "Cash"];

// Time slots definition
const ALL_TIME_SLOTS = [
  { id: "afternoon", label: "Afternoon",  startTime: "12:00 PM", endTime: "4:00 PM"  },
  { id: "evening",   label: "Evening",    startTime: "5:00 PM",  endTime: "9:00 PM"  },
  { id: "latenight", label: "Late Night", startTime: "10:00 PM", endTime: "2:00 AM"  },
];

const inputClass = (err) =>
  `w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none transition-all ${
    err
      ? "border border-red-500/60 bg-red-500/5"
      : "border border-purple-500/20 bg-white/5 focus:border-purple-400"
  }`;

function Field({ label, error, children }) {
  return (
    <div>
      <label
        className="block text-xs font-medium mb-1.5 tracking-wider uppercase"
        style={{ color: "rgba(192,132,252,0.7)" }}
      >
        {label}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

/* ─── Custom Dropdown ────────────────────────────────────────────────────── */
const EVENT_ICONS = { Nikkah: "☪️", Walima: "🌸", Barat: "💐", Birthday: "🎂", Conference: "🎤", Anniversary: "💍", Other: "✨" };

function CustomSelect({ value, onChange, options, placeholder = "Select...", error, icons = {} }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => (o.value ?? o) === value);
  const label = selected ? (selected.label ?? selected) : null;
  const icon = icons[label] || icons[value] || null;

  return (
    <div ref={ref} style={{ position: "relative", userSelect: "none" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none transition-all flex items-center justify-between"
        style={{
          border: `1px solid ${error ? "rgba(239,68,68,0.5)" : open ? "rgba(167,139,250,0.5)" : "rgba(167,139,250,0.2)"}`,
          background: error ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.05)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "8px", color: label ? "white" : "rgba(255,255,255,0.3)" }}>
          {icon && <span style={{ fontSize: "1rem" }}>{icon}</span>}
          {label || placeholder}
        </span>
        <span style={{ color: "rgba(167,139,250,0.6)", fontSize: "0.7rem", transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 999,
          background: "linear-gradient(145deg,#1e1240,#160e35)",
          border: "1px solid rgba(167,139,250,0.25)", borderRadius: "12px",
          overflow: "hidden", boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
        }}>
          {options.map((opt) => {
            const val = opt.value ?? opt;
            const lbl = opt.label ?? opt;
            const ico = icons[lbl] || icons[val] || null;
            const isActive = val === value;
            return (
              <button
                key={val}
                type="button"
                onClick={() => { onChange(val); setOpen(false); }}
                className="w-full px-3 py-2.5 text-sm text-left flex items-center gap-3 transition-all"
                style={{
                  background: isActive ? "rgba(124,58,237,0.3)" : "transparent",
                  color: isActive ? "white" : "rgba(255,255,255,0.7)",
                  borderLeft: isActive ? "2px solid #a855f7" : "2px solid transparent",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(124,58,237,0.15)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                {ico && <span style={{ fontSize: "1rem", width: "20px", textAlign: "center" }}>{ico}</span>}
                <span>{lbl}</span>
                {isActive && <span style={{ marginLeft: "auto", color: "#a855f7", fontSize: "0.75rem" }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}


function TimeSlotModal({ date, hallName, bookedSlots = [], loading = false, onSelect, onClose }) {
  const [selected, setSelected] = useState(null);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(7,5,15,0.45)", backdropFilter: "blur(4px)" }}
      onClick={undefined}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(145deg,#1a1035,#120d2a)",
          border: "1px solid rgba(167,139,250,0.22)",
        }}
      >
        {/* Header */}
        <div className="p-5 pb-3">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3
                className="text-lg font-semibold text-white"
                style={{ fontFamily: "'Playfair Display',serif" }}
              >
                Available Time Slots
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "rgba(192,132,252,0.6)" }}>
                {hallName} · {date}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-lg leading-none transition-colors"
              style={{ color: "rgba(167,139,250,0.45)" }}
              onMouseEnter={(e) => (e.target.style.color = "white")}
              onMouseLeave={(e) => (e.target.style.color = "rgba(167,139,250,0.45)")}
            >
              ✕
            </button>
          </div>
          <div
            className="h-px mt-3"
            style={{ background: "rgba(167,139,250,0.12)" }}
          />
          {/* Live availability indicator */}
          <div className="flex items-center gap-1.5 mt-2">
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: loading ? "#f59e0b" : "#22c55e",
              animation: "pulse 1.2s ease-in-out infinite",
            }}/>
            <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>
              {loading ? "CHECKING AVAILABILITY..." : "LIVE AVAILABILITY"}
            </span>
          </div>
        </div>

        {/* Slots */}
        <div className="px-5 pb-2 space-y-2.5">
          {ALL_TIME_SLOTS.map((slot) => {
            const booked = bookedSlots.includes(slot.id);
            const active = selected === slot.id;
            return (
              <button
                key={slot.id}
                type="button"
                disabled={booked}
                onClick={() => setSelected(slot.id)}
                className="w-full p-3.5 rounded-xl text-left transition-all"
                style={{
                  border: `1px solid ${
                    booked
                      ? "rgba(239,68,68,0.3)"
                      : active
                      ? "rgba(147,51,234,0.65)"
                      : "rgba(167,139,250,0.18)"
                  }`,
                  background: booked
                    ? "rgba(239,68,68,0.08)"
                    : active
                    ? "linear-gradient(135deg,rgba(124,58,237,0.35),rgba(147,51,234,0.2))"
                    : "rgba(255,255,255,0.03)",
                  cursor: booked ? "not-allowed" : "pointer",
                  opacity: booked ? 0.5 : 1,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: booked ? "#f87171" : active ? "white" : "rgba(255,255,255,0.85)" }}
                  >
                    {slot.label}
                  </span>
                  {booked && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
                      Booked
                    </span>
                  )}
                  {active && !booked && <span style={{ color: "#a855f7" }}>✓</span>}
                </div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {slot.startTime} – {slot.endTime}
                </p>
              </button>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="p-5 pt-3 flex gap-2.5 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm transition-all"
            style={{ border: "1px solid rgba(167,139,250,0.2)", color: "#c084fc" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Cancel
          </button>
          <button
            onClick={() => { if (selected) { onSelect(selected); } }}
            disabled={!selected}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
            style={{
              background: selected ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "rgba(124,58,237,0.3)",
              opacity: selected ? 1 : 0.6,
              cursor: selected ? "pointer" : "not-allowed",
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   INLINE DISH SELECTOR — embedded in Step 2 below the time slot field
   Mirrors the hall card style: same purple border, same card background.
   ══════════════════════════════════════════════════════════════════════════ */
const CATEGORY_META = [
  { key: "Starter Menu",      icon: "🥗", short: "Starters"  },
  { key: "Main Course Menu",  icon: "🍛", short: "Main"      },
  { key: "Dessert Menu",      icon: "🍰", short: "Desserts"  },
  { key: "Drinks Menu",       icon: "🥤", short: "Drinks"    },
];

const MAX_PER_CATEGORY = 2;

function InlineDishSelector({ selected, onChange }) {
  const [dishes, setDishes]       = useState([]);
  const [loadingDishes, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Starter Menu");
  const [catError, setCatError]   = useState("");

  useEffect(() => {
    api.get("/dishes")
      .then(r => setDishes(r.data.dishes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id, category) => {
    setCatError("");
    if (selected.includes(id)) {
      onChange(selected.filter(x => x !== id));
      return;
    }
    const catIds = dishes.filter(d => d.category === category).map(d => d._id);
    const catCount = selected.filter(x => catIds.includes(x)).length;
    if (catCount >= MAX_PER_CATEGORY) {
      setCatError(`Max ${MAX_PER_CATEGORY} items from ${category.replace(" Menu", "")}`);
      return;
    }
    onChange([...selected, id]);
  };

  const tabDishes = dishes.filter(d => d.category === activeTab);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(147,51,234,0.2)", background: "rgba(147,51,234,0.08)" }}
    >
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px 8px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:15 }}>🍽️</span>
          <span style={{ fontSize:13, fontWeight:600, color:"white" }}>Menu Selection</span>
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>(max {MAX_PER_CATEGORY}/category)</span>
        </div>
        {selected.length > 0 && (
          <span style={{ fontSize:11, padding:"2px 8px", borderRadius:99, background:"rgba(147,51,234,0.25)", color:"#c084fc" }}>
            {selected.length} selected
          </span>
        )}
      </div>

      {/* Category tabs — 4 equal columns, no wrap */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:4, padding:"0 16px 8px" }}>
        {CATEGORY_META.map(cat => {
          const catIds = dishes.filter(d => d.category === cat.key).map(d => d._id);
          const catSelected = selected.filter(x => catIds.includes(x)).length;
          const isActive = activeTab === cat.key;
          const atLimit = catSelected >= MAX_PER_CATEGORY && dishes.filter(d => d.category === cat.key).length > 0;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => { setActiveTab(cat.key); setCatError(""); }}
              style={{
                background: isActive ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${isActive ? "rgba(147,51,234,0.6)" : atLimit ? "rgba(239,68,68,0.35)" : "rgba(167,139,250,0.12)"}`,
                borderRadius: 8,
                padding: "6px 2px",
                color: isActive ? "white" : "rgba(255,255,255,0.45)",
                display:"flex", flexDirection:"column", alignItems:"center", gap:2,
                cursor:"pointer", transition:"all 0.15s", minWidth:0,
              }}
            >
              <span style={{ fontSize:14, lineHeight:1 }}>{cat.icon}</span>
              <span style={{ fontSize:10, fontWeight:600, lineHeight:1, whiteSpace:"nowrap" }}>{cat.short}</span>
              {catSelected > 0 && (
                <span style={{
                  fontSize: 9, lineHeight:"1.4", padding:"0 3px", borderRadius:3,
                  background: atLimit ? "#ef4444" : "#7c3aed", color:"white"
                }}>
                  {catSelected}/{MAX_PER_CATEGORY}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Error banner */}
      {catError && (
        <div style={{ margin:"0 16px 8px", padding:"6px 10px", borderRadius:8, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)" }}>
          <p style={{ fontSize:11, color:"#f87171", margin:0 }}>⚠ {catError}</p>
        </div>
      )}

      {/* Dish grid — 2 columns, image on top like hall card */}
      <div style={{ padding:"0 16px 16px" }}>
        {loadingDishes ? (
          <p style={{ fontSize:11, textAlign:"center", padding:"12px 0", color:"rgba(255,255,255,0.3)" }}>Loading menu...</p>
        ) : tabDishes.length === 0 ? (
          <p style={{ fontSize:11, textAlign:"center", padding:"12px 0", color:"rgba(255,255,255,0.25)" }}>No items in this category yet</p>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:4 }}>
            {tabDishes.map(dish => {
              const checked = selected.includes(dish._id);
              const catIds = dishes.filter(d => d.category === dish.category).map(d => d._id);
              const catCount = selected.filter(x => catIds.includes(x)).length;
              const blocked = !checked && catCount >= MAX_PER_CATEGORY;
              return (
                <button
                  key={dish._id}
                  type="button"
                  onClick={() => !blocked && toggle(dish._id, dish.category)}
                  style={{
                    border: `1px solid ${checked ? "#9333ea" : blocked ? "rgba(239,68,68,0.2)" : "rgba(167,139,250,0.14)"}`,
                    background: checked ? "rgba(124,58,237,0.18)" : blocked ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.03)",
                    borderRadius:6, padding:"4px 8px 4px 4px",
                    textAlign:"left", cursor: blocked ? "not-allowed" : "pointer",
                    opacity: blocked ? 0.5 : 1, transition:"all 0.15s",
                    display:"flex", alignItems:"center", gap:7, width:"100%",
                  }}
                >
                  {/* 28×28 thumbnail */}
                  <div style={{
                    width:28, height:28, borderRadius:4, overflow:"hidden",
                    background:"rgba(124,58,237,0.15)", flexShrink:0,
                  }}>
                    {dish.image ? (
                      <img src={dish.image} alt={dish.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                    ) : (
                      <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <span style={{ fontSize:12, opacity:0.4 }}>{CATEGORY_META.find(c => c.key === dish.category)?.icon || "🍽️"}</span>
                      </div>
                    )}
                  </div>
                  {/* Name */}
                  <p style={{ flex:1, fontSize:11, fontWeight:600, color: checked ? "white" : "rgba(255,255,255,0.8)", margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {dish.name}
                  </p>
                  {/* Check */}
                  {checked && (
                    <div style={{ width:14, height:14, borderRadius:"50%", flexShrink:0, background:"#7c3aed", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color:"white", fontWeight:700 }}>✓</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


export default function BookingModal({ hall: initialHall, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    eventType: "",
    guests: "",
    hallId: initialHall?._id || "",
    eventDate: "",
    timeSlot: "",
    timeSlotLabel: "",
    paymentMethod: "",
    transactionId: "",
    specialRequests: "",
    selectedDishes: [],
    cateringOption: "", // "our-menu" | "self-catering"
  });
  const [errors, setErrors] = useState({});
  const [bookingRef, setBookingRef] = useState("");
  const [confirmedStatus, setConfirmedStatus] = useState("Pending");
  const [selectedHall, setSelectedHall] = useState(initialHall || null);
  const [halls, setHalls] = useState([]);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  useEffect(() => {
    if (!initialHall) {
      api.get("/halls").then((r) => setHalls(r.data.halls || []));
    } else {
      setHalls([initialHall]);
    }
  }, [initialHall]);

  // Fetch booked slots whenever hallId or date changes, and poll every 10s while slot modal is open
  useEffect(() => {
    if (!form.hallId || !form.eventDate) return;

    const fetchSlots = () => {
      setSlotsLoading(true);
      api.get(`/bookings/slots/${form.hallId}?date=${form.eventDate}`)
        .then((r) => setBookedSlots(r.data.bookedSlots || []))
        .catch(() => setBookedSlots([]))
        .finally(() => setSlotsLoading(false));
    };

    fetchSlots(); // immediate fetch on hallId/date change

    // Poll every 10s only while the time slot modal is open (real-time updates)
    if (showTimeSlots) {
      const interval = setInterval(fetchSlots, 10000);
      return () => clearInterval(interval);
    }
  }, [form.hallId, form.eventDate, showTimeSlots]);

  useEffect(() => {
    if (step === 5 && bookingRef) {
      const interval = setInterval(() => {
        api.get(`/bookings/ref/${bookingRef}`)
          .then((r) => {
            if (r.data.booking?.status) setConfirmedStatus(r.data.booking.status);
          })
          .catch(() => {});
      }, 12000);
      return () => clearInterval(interval);
    }
  }, [step, bookingRef]);

  const handleSlotSelected = (slotId) => {
    const slot = ALL_TIME_SLOTS.find((s) => s.id === slotId);
    if (slot) {
      set("timeSlot", slot.id);
      set("timeSlotLabel", `${slot.label} (${slot.startTime} – ${slot.endTime})`);
    }
    setShowTimeSlots(false);
  };

  // If a previously-selected slot gets booked by someone else, clear it
  useEffect(() => {
    if (form.timeSlot && bookedSlots.includes(form.timeSlot)) {
      set("timeSlot", "");
      set("timeSlotLabel", "");
    }
  }, [bookedSlots]);

  const next = () => {
    const e = {};

    if (step === 1) {
      if (!form.clientName.trim()) e.clientName = "Name required";
      if (!form.clientPhone.trim()) e.clientPhone = "Phone required";
      else if (!/^03\d{9}$/.test(form.clientPhone.replace(/\s/g, "")))
        e.clientPhone = "Must be 11 digits starting with 03 (e.g. 03001234567)";
      if (form.clientEmail && !/^\S+@\S+\.\S+$/.test(form.clientEmail))
        e.clientEmail = "Invalid email";
      if (!form.eventType) e.eventType = "Event type required";

    } else if (step === 2) {
      if (!form.hallId) e.hallId = "Select a hall";
      if (!form.eventDate) e.eventDate = "Select a date";
      else if (new Date(form.eventDate) < new Date().setHours(0, 0, 0, 0))
        e.eventDate = "Cannot book past dates";
      if (!form.timeSlot) e.timeSlot = "Select a time slot";
      if (!form.guests || form.guests < 1) e.guests = "At least 1 guest required";
      else if (selectedHall && Number(form.guests) > selectedHall.totalSeats)
        e.guests = `Exceeds hall capacity of ${selectedHall.totalSeats.toLocaleString()} guests`;

    } else if (step === 3) {
      // Must choose catering option; if "our-menu" must pick at least 1 dish
      if (!form.cateringOption) e.cateringOption = "Please select a catering option";
      else if (form.cateringOption === "our-menu" && form.selectedDishes.length === 0)
        e.cateringOption = "Please select at least one dish, or choose Self-Catering";

    } else if (step === 4) {
      if (!form.paymentMethod) e.paymentMethod = "Select payment method";
      if (!form.transactionId.trim()) e.transactionId = "Transaction ID required";
    }

    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    if (step === 4) {
      submitBooking();
    } else {
      setStep((s) => s + 1);
    }
  };

  const submitBooking = async () => {
    setLoading(true);
    try {
      const payload = { ...form };
      const res = await api.post("/bookings", payload);
      setBookingRef(res.data.booking.bookingRef);
      setConfirmedStatus(res.data.booking.status);
      setStep(5);
      if (onSuccess) onSuccess();
    } catch (ex) {
      setErrors({ submit: ex.response?.data?.message || "Booking failed. Please try again." });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (form.hallId) {
      const h = halls.find((x) => x._id === form.hallId);
      setSelectedHall(h || null);
    }
  }, [form.hallId, halls]);

  const roomRate = selectedHall?.pricePerHead
    ? selectedHall.pricePerHead * (parseInt(form.guests) || 0)
    : 0;
  const tax = Math.round(roomRate * 0.16);
  const grandTotal = roomRate + tax;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(7,5,15,0.45)", backdropFilter: "blur(4px)" }}
        onClick={undefined}
      >
        <style>
          {`
            .bm-scroll::-webkit-scrollbar { width: 3px; }
            .bm-scroll::-webkit-scrollbar-thumb { background: rgba(147,51,234,0.4); border-radius: 2px; }
            @media (max-width: 480px) {
              .bm-modal { border-radius: 16px !important; margin: 0 8px; }
              .bm-header { padding: 16px 16px 14px !important; }
              .bm-content { padding: 14px 14px !important; }
              .bm-footer { padding: 12px 14px !important; flex-direction: column; }
              .bm-footer button { width: 100% !important; justify-content: center; }
              .bm-summary-row { flex-direction: column; align-items: flex-start; gap: 2px; }
              .bm-summary-val { font-size: 0.9rem !important; }
              .bm-catering-grid { grid-template-columns: 1fr !important; }
            }
          `}
        </style>

        <div
          className="w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden bm-scroll bm-modal"
          style={{
            background: "linear-gradient(145deg,#1b1142,#12093a)",
            border: "1px solid rgba(167,139,250,0.25)",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div
            className="p-6 pb-5 bm-header"
            style={{
              background: "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(147,51,234,0.08))",
              borderBottom: "1px solid rgba(167,139,250,0.15)",
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2
                  className="text-2xl font-semibold text-white"
                  style={{ fontFamily: "'Playfair Display',serif" }}
                >
                  Reserve Your Event
                </h2>
                <p className="text-xs mt-1.5 uppercase tracking-widest" style={{ color: "#a855f7" }}>
                  Step {step} of 4
                </p>
              </div>
              {step !== 5 && (
                <button
                  onClick={onClose}
                  className="text-xl leading-none transition-colors"
                  style={{ color: "rgba(167,139,250,0.5)" }}
                  onMouseEnter={(e) => (e.target.style.color = "white")}
                  onMouseLeave={(e) => (e.target.style.color = "rgba(167,139,250,0.5)")}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <React.Fragment key={s}>
                  <div
                    className="transition-all"
                    style={{
                      width: s === step ? "32px" : "8px",
                      height: "8px",
                      borderRadius: "999px",
                      background:
                        s < step
                          ? "#10b981"
                          : s === step
                          ? "linear-gradient(90deg,#7c3aed,#a855f7)"
                          : "rgba(167,139,250,0.2)",
                    }}
                  />
                  {s < 5 && (
                    <div
                      className="flex-1 h-px"
                      style={{ background: s < step ? "#10b981" : "rgba(167,139,250,0.15)" }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 bm-content">
            {/* ── STEP 1: Client details ── */}
            {step === 1 && (
              <div className="space-y-4">
                <Field label="Full Name *" error={errors.clientName}>
                  <input
                    className={inputClass(errors.clientName)}
                    value={form.clientName}
                    onChange={(e) => set("clientName", e.target.value)}
                    placeholder="e.g. Ahmed Khan"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Phone Number *" error={errors.clientPhone}>
                    <input
                      className={inputClass(errors.clientPhone)}
                      value={form.clientPhone}
                      onChange={(e) => {
                        // Strip everything except digits, then set
                        const digits = e.target.value.replace(/[^\d]/g, "");
                        set("clientPhone", digits);
                      }}
                      placeholder="03001234567"
                      inputMode="numeric"
                      maxLength={11}
                    />
                  </Field>
                  <Field label="Email (optional)" error={errors.clientEmail}>
                    <input
                      className={inputClass(errors.clientEmail)}
                      type="email"
                      value={form.clientEmail}
                      onChange={(e) => set("clientEmail", e.target.value)}
                      placeholder="example@mail.com"
                    />
                  </Field>
                </div>

                <Field label="Event Type *" error={errors.eventType}>
                  <CustomSelect
                    value={form.eventType}
                    onChange={(v) => set("eventType", v)}
                    options={EVENT_TYPES}
                    placeholder="Select event type"
                    icons={EVENT_ICONS}
                    error={errors.eventType}
                  />
                </Field>

              </div>
            )}

            {/* ── STEP 2: Hall & Date ── */}
            {step === 2 && (
              <div className="space-y-4">
                {!initialHall && (
                  <Field label="Select Hall *" error={errors.hallId}>
                    <CustomSelect
                      value={form.hallId}
                      onChange={(v) => set("hallId", v)}
                      options={halls.map((h) => ({ value: h._id, label: h.name }))}
                      placeholder="Choose a venue"
                      error={errors.hallId}
                    />
                  </Field>
                )}

                {selectedHall && (
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: "rgba(147,51,234,0.08)",
                      border: "1px solid rgba(147,51,234,0.2)",
                    }}
                  >
                    <div className="flex gap-3">
                      {selectedHall.image && (
                        <img
                          src={selectedHall.image}
                          alt={selectedHall.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm mb-1">
                          {selectedHall.name}
                        </h4>
                        <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                          📍 {selectedHall.location || "Karachi"}
                        </p>
                        <p className="text-xs font-semibold" style={{ color: "#c084fc" }}>
                          PKR {selectedHall.pricePerHead?.toLocaleString()}/guest · {selectedHall.totalSeats} capacity
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Field label="Number of Guests *" error={errors.guests}>
                  <input
                    className={inputClass(errors.guests)}
                    type="number"
                    value={form.guests}
                    onChange={(e) => set("guests", e.target.value)}
                    placeholder={selectedHall ? `Max ${selectedHall.totalSeats.toLocaleString()} guests` : "e.g. 250"}
                  />
                  {selectedHall && form.guests && !errors.guests && Number(form.guests) <= selectedHall.totalSeats && (
                    <p style={{ fontSize:"0.7rem", marginTop:4, color:"rgba(167,139,250,0.5)" }}>
                      ✓ Within capacity · Max <span style={{ color:"#c084fc", fontWeight:600 }}>{selectedHall.totalSeats.toLocaleString()}</span> guests
                    </p>
                  )}
                </Field>

                <Field label="Event Date *" error={errors.eventDate}>
                  <input
                    className={inputClass(errors.eventDate)}
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => set("eventDate", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </Field>

                <Field label="Time Slot *" error={errors.timeSlot}>
                  <button
                    type="button"
                    onClick={() => {
                      if (form.hallId && form.eventDate) setShowTimeSlots(true);
                      else setErrors({ timeSlot: "Select hall & date first" });
                    }}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-left transition-all"
                    style={{
                      border: `1px solid ${errors.timeSlot ? "rgba(239,68,68,0.5)" : "rgba(167,139,250,0.2)"}`,
                      background: errors.timeSlot ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.05)",
                      color: form.timeSlotLabel ? "white" : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {form.timeSlotLabel || "Click to select a time slot"}
                  </button>
                </Field>
              </div>
            )}

            {/* ── STEP 3: Menu Selection ── */}
            {step === 3 && (
              <div className="space-y-4">
                {/* Catering choice cards */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(192,132,252,0.7)" }}>
                    Catering Preference
                  </p>
                  <div className="grid grid-cols-2 gap-3 bm-catering-grid">
                    {[
                      { val: "our-menu",      icon: "🍽️", title: "Our Menu",      sub: "Select dishes from our curated menu" },
                      { val: "self-catering", icon: "👨‍🍳", title: "Self-Catering", sub: "I'll arrange my own catering"         },
                    ].map(opt => {
                      const active = form.cateringOption === opt.val;
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => { set("cateringOption", opt.val); if (opt.val === "self-catering") set("selectedDishes", []); }}
                          className="p-4 rounded-xl text-left transition-all"
                          style={{
                            border: `2px solid ${active ? "#9333ea" : "rgba(167,139,250,0.2)"}`,
                            background: active ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.03)",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span style={{ fontSize: 22 }}>{opt.icon}</span>
                            <span className="text-sm font-semibold text-white">{opt.title}</span>
                            {active && <span className="ml-auto" style={{ color: "#a855f7" }}>✓</span>}
                          </div>
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{opt.sub}</p>
                        </button>
                      );
                    })}
                  </div>
                  {errors.cateringOption && (
                    <p className="text-red-400 text-xs mt-2">{errors.cateringOption}</p>
                  )}
                </div>

                {/* Dish tabs — only when "Our Menu" is selected */}
                {form.cateringOption === "our-menu" && (
                  <InlineDishSelector
                    selected={form.selectedDishes}
                    onChange={(v) => set("selectedDishes", v)}
                  />
                )}

                {/* Self-catering confirmation */}
                {form.cateringOption === "self-catering" && (
                  <div
                    className="p-4 rounded-xl text-center"
                    style={{ background: "rgba(147,51,234,0.08)", border: "1px solid rgba(147,51,234,0.2)" }}
                  >
                    <div style={{ fontSize: 32 }} className="mb-2">👨‍🍳</div>
                    <p className="text-sm font-medium text-white mb-1">Self-Catering Selected</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      You'll arrange your own catering for the event
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 4: Payment ── */}
            {step === 4 && (
              <div className="space-y-4">
                {/* Estimated Budget */}
                <div
                  className="p-5 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg,rgba(147,51,234,0.15),rgba(124,58,237,0.08))",
                    border: "1px solid rgba(147,51,234,0.25)",
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ color: "#a855f7" }}
                  >
                    Estimated Budget
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>Guest</span>
                      <span className="text-white font-medium">{form.clientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>Hall</span>
                      <span className="text-white font-medium">{selectedHall?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>Date</span>
                      <span className="text-white font-medium">
                        {new Date(form.eventDate + "T12:00:00").toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>Time Slot</span>
                      <span className="text-white font-medium">{form.timeSlotLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>Event</span>
                      <span className="text-white font-medium">{form.eventType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>Guests</span>
                      <span className="text-white font-medium">{form.guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>Menu</span>
                      <span className="text-white font-medium">
                        {form.cateringOption === "self-catering"
                          ? "Self-Catering"
                          : `${form.selectedDishes.length} dish${form.selectedDishes.length !== 1 ? "es" : ""} selected`}
                      </span>
                    </div>

                    <div className="pt-2 mt-2" style={{ borderTop: "1px solid rgba(167,139,250,0.15)" }}>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>Room Rate</span>
                        <span className="text-white font-semibold">PKR {roomRate.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>Tax (16%)</span>
                        <span className="text-white font-semibold">PKR {tax.toLocaleString()}</span>
                      </div>
                    </div>
                    <div
                      className="flex justify-between pt-3 mt-2"
                      style={{ borderTop: "1px solid rgba(167,139,250,0.2)" }}
                    >
                      <span className="text-base font-semibold" style={{ color: "#a855f7" }}>
                        Grand Total
                      </span>
                      <span className="text-lg font-bold text-white">PKR {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Field label="Payment Method *" error={errors.paymentMethod}>
                  <CustomSelect
                    value={form.paymentMethod}
                    onChange={(v) => set("paymentMethod", v)}
                    options={PAY_METHODS}
                    placeholder="Select payment method"
                    error={errors.paymentMethod}
                  />
                </Field>

                <Field label="Transaction ID *" error={errors.transactionId}>
                  <input
                    className={inputClass(errors.transactionId)}
                    value={form.transactionId}
                    onChange={(e) => set("transactionId", e.target.value)}
                    placeholder="e.g. TXN123456789"
                  />
                </Field>

                <Field label="Special Requests (optional)">
                  <textarea
                    className={inputClass()}
                    style={{ resize: "vertical", minHeight: "80px" }}
                    value={form.specialRequests}
                    onChange={(e) => set("specialRequests", e.target.value)}
                    placeholder="Any special requirements or notes..."
                  />
                </Field>

                {errors.submit && (
                  <p
                    className="text-sm text-center rounded-lg p-2"
                    style={{ color: "#f87171", background: "rgba(239,68,68,0.08)" }}
                  >
                    {errors.submit}
                  </p>
                )}
              </div>
            )}

            {/* ── STEP 5: Confirmed ── */}
            {step === 5 && (
              <div className="py-2">
                {confirmedStatus === "Confirmed" ? (
                  <div className="text-center mb-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-3"
                      style={{ background: "rgba(34,197,94,0.2)", border: "2px solid #22c55e" }}
                    >
                      ✓
                    </div>
                    <p
                      className="text-lg font-semibold text-white"
                      style={{ fontFamily: "'Playfair Display',serif" }}
                    >
                      Booking Confirmed!
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#4ade80" }}>
                      Manager has approved your booking. An SMS has been sent to your number.
                    </p>
                  </div>
                ) : confirmedStatus === "Cancelled" ? (
                  <div className="text-center mb-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-3"
                      style={{ background: "rgba(239,68,68,0.2)", border: "2px solid #ef4444" }}
                    >
                      ✕
                    </div>
                    <p
                      className="text-lg font-semibold text-white"
                      style={{ fontFamily: "'Playfair Display',serif" }}
                    >
                      Booking Cancelled
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#f87171" }}>
                      Your booking has been cancelled. Please contact us for more details.
                    </p>
                  </div>
                ) : (
                  <div className="text-center mb-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-3"
                      style={{ background: "rgba(245,158,11,0.2)", border: "2px solid #f59e0b" }}
                    >
                      ⏳
                    </div>
                    <p
                      className="text-lg font-semibold text-white"
                      style={{ fontFamily: "'Playfair Display',serif" }}
                    >
                      Awaiting Manager Approval
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#fcd34d" }}>
                      Your request has been received. You will receive an SMS on{" "}
                      <strong style={{ color: "white" }}>{form.clientPhone}</strong> once the manager
                      confirms.
                    </p>
                    <div className="flex items-center justify-center gap-1.5 mt-3">
                      {[0, 150, 300].map((d) => (
                        <div
                          key={d}
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#f59e0b",
                            animation: `pulse 1.2s ${d}ms ease-in-out infinite`,
                          }}
                        />
                      ))}
                    </div>
                    <style>{`@keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }`}</style>
                  </div>
                )}

                <div
                  className="rounded-xl p-4 mb-4"
                  style={{ background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.2)" }}
                >
                  <p
                    className="text-xs tracking-widest uppercase mb-1 text-center"
                    style={{ color: "#a855f7" }}
                  >
                    Booking Reference
                  </p>
                  <p
                    className="text-white font-bold text-2xl tracking-widest text-center"
                    style={{ fontFamily: "'Playfair Display',serif" }}
                  >
                    {bookingRef}
                  </p>
                  <p className="text-xs text-center mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Save this reference for your records
                  </p>
                </div>

                <div className="flex justify-center mb-3">
                  <span
                    className="text-xs px-3 py-1.5 rounded-full font-medium"
                    style={{
                      background:
                        confirmedStatus === "Confirmed"
                          ? "rgba(34,197,94,0.15)"
                          : confirmedStatus === "Cancelled"
                          ? "rgba(239,68,68,0.15)"
                          : "rgba(245,158,11,0.15)",
                      color:
                        confirmedStatus === "Confirmed"
                          ? "#4ade80"
                          : confirmedStatus === "Cancelled"
                          ? "#f87171"
                          : "#fcd34d",
                      border: `1px solid ${
                        confirmedStatus === "Confirmed"
                          ? "rgba(34,197,94,0.3)"
                          : confirmedStatus === "Cancelled"
                          ? "rgba(239,68,68,0.3)"
                          : "rgba(245,158,11,0.3)"
                      }`,
                    }}
                  >
                    Status: {confirmedStatus}
                  </span>
                </div>

                {[
                  ["Guest", form.clientName],
                  ["Phone", form.clientPhone],
                  ["Hall", selectedHall?.name],
                  [
                    "Date",
                    new Date(form.eventDate).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                  ],
                  ["Time Slot", form.timeSlotLabel],
                  ["Event", form.eventType],
                  ["Guests", form.guests],
                  ["Dishes", form.cateringOption === "self-catering" ? "Self-Catering" : `${form.selectedDishes.length} dish${form.selectedDishes.length !== 1 ? "es" : ""} selected`],
                  ["Payment", form.paymentMethod],
                  ["Total", `PKR ${grandTotal.toLocaleString()}`],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between py-1.5 text-sm bm-summary-row"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <span style={{ color: "rgba(255,255,255,0.35)" }}>{k}</span>
                    <span className="font-medium text-white bm-summary-val">{v}</span>
                  </div>
                ))}

                {confirmedStatus === "Pending" && (
                  <p className="text-xs mt-3 text-center" style={{ color: "rgba(255,255,255,0.2)" }}>
                    This page checks for updates automatically every 12 seconds.
                  </p>
                )}
                <div style={{ textAlign: "center", marginTop: "0.75rem" }}>
                  <a
                    href="/booking-status"
                    style={{
                      color: "#a855f7",
                      fontSize: "0.78rem",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    🔖 Check status anytime at noormahal.pk/booking-status
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 pt-4 flex gap-3 justify-end bm-footer">
            {step > 1 && step < 5 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-5 py-2.5 rounded-xl text-sm transition-all"
                style={{ border: "1px solid rgba(167,139,250,0.2)", color: "#c084fc" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                ← Back
              </button>
            )}
            {step < 5 ? (
              <button
                onClick={next}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Booking..." : step === 4 ? "Confirm Booking →" : "Next →"}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Time Slot Modal */}
      {showTimeSlots && (
        <TimeSlotModal
          date={form.eventDate}
          hallName={selectedHall?.name || "Hall"}
          bookedSlots={bookedSlots}
          loading={slotsLoading}
          onSelect={handleSlotSelected}
          onClose={() => setShowTimeSlots(false)}
        />
      )}
    </>
  );
}