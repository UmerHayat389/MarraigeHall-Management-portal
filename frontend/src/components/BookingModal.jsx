import React, { useState, useEffect } from "react";
import api from "../services/api";

const STEP_LABELS = ["Details", "Hall & Date", "Payment", "Confirmed"];
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


function TimeSlotModal({ date, hallName, bookedSlots = [], onSelect, onClose }) {
  const [selected, setSelected] = useState(null);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(7,5,15,0.75)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
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
   NEW: DISHES SELECTION MODAL
   ══════════════════════════════════════════════════════════════════════════ */
function DishesSelectionModal({ onClose, onConfirm, initialSelection = [] }) {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(initialSelection);
  const [cateringOption, setCateringOption] = useState(initialSelection.length > 0 ? 'provided' : null);

  useEffect(() => {
    // Fetch dishes from backend
    api.get("/dishes")
      .then(r => setDishes(r.data.dishes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleDish = (dishId) => {
    setSelected(prev => 
      prev.includes(dishId) 
        ? prev.filter(id => id !== dishId)
        : [...prev, dishId]
    );
  };

  const groupedDishes = {
    'Starter Menu': dishes.filter(d => d.category === 'Starter Menu'),
    'Main Course Menu': dishes.filter(d => d.category === 'Main Course Menu'),
    'Dessert Menu': dishes.filter(d => d.category === 'Dessert Menu'),
    'Drinks Menu': dishes.filter(d => d.category === 'Drinks Menu'),
  };

  const CATEGORY_ICONS = {
    'Starter Menu': '🥗',
    'Main Course Menu': '🍛',
    'Dessert Menu': '🍰',
    'Drinks Menu': '🥤',
  };

  const handleConfirm = () => {
    if (cateringOption === 'self') {
      onConfirm([]);
    } else {
      onConfirm(selected);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(7,5,15,0.85)", backdropFilter: "blur(10px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "linear-gradient(145deg,#1a1035,#120d2a)",
          border: "1px solid rgba(167,139,250,0.25)",
        }}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b" style={{ borderColor: "rgba(167,139,250,0.12)" }}>
          <div className="flex justify-between items-start">
            <div>
              <h3
                className="text-xl font-semibold text-white mb-1"
                style={{ fontFamily: "'Playfair Display',serif" }}
              >
                Select Menu Options
              </h3>
              <p className="text-xs" style={{ color: "rgba(192,132,252,0.6)" }}>
                Choose dishes from our menu or opt for self-catering
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
        </div>

        {/* Catering Option Selection */}
        <div className="p-6 border-b" style={{ borderColor: "rgba(167,139,250,0.12)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(192,132,252,0.7)" }}>
            Catering Preference
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setCateringOption('provided')}
              className="p-4 rounded-xl text-left transition-all"
              style={{
                border: `2px solid ${cateringOption === 'provided' ? '#9333ea' : 'rgba(167,139,250,0.2)'}`,
                background: cateringOption === 'provided' ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🍽️</span>
                <span className="text-sm font-semibold text-white">Our Menu</span>
                {cateringOption === 'provided' && <span className="ml-auto text-purple-400">✓</span>}
              </div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                Select dishes from our curated menu
              </p>
            </button>

            <button
              onClick={() => setCateringOption('self')}
              className="p-4 rounded-xl text-left transition-all"
              style={{
                border: `2px solid ${cateringOption === 'self' ? '#9333ea' : 'rgba(167,139,250,0.2)'}`,
                background: cateringOption === 'self' ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👨‍🍳</span>
                <span className="text-sm font-semibold text-white">Self-Catering</span>
                {cateringOption === 'self' && <span className="ml-auto text-purple-400">✓</span>}
              </div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                I'll arrange my own catering
              </p>
            </button>
          </div>
        </div>

        {/* Dishes List (only show if "Our Menu" is selected) */}
        {cateringOption === 'provided' && (
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-8" style={{ color: "rgba(255,255,255,0.3)" }}>
                <div className="text-2xl mb-2">🍽️</div>
                Loading menu...
              </div>
            ) : dishes.length === 0 ? (
              <div className="text-center py-8" style={{ color: "rgba(255,255,255,0.3)" }}>
                <div className="text-2xl mb-2">📋</div>
                No dishes available yet
              </div>
            ) : (
              <div className="space-y-5">
                {Object.entries(groupedDishes).map(([category, categoryDishes]) => {
                  if (categoryDishes.length === 0) return null;
                  
                  return (
                    <div key={category}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{CATEGORY_ICONS[category]}</span>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wide">
                          {category}
                        </h4>
                        <div className="flex-1 h-px" style={{ background: "rgba(167,139,250,0.12)" }} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2.5">
                        {categoryDishes.map(dish => (
                          <button
                            key={dish._id}
                            onClick={() => toggleDish(dish._id)}
                            className="p-3 rounded-lg text-left transition-all"
                            style={{
                              border: `1px solid ${selected.includes(dish._id) ? '#9333ea' : 'rgba(167,139,250,0.15)'}`,
                              background: selected.includes(dish._id) ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.02)',
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-medium text-white">{dish.name}</span>
                              {selected.includes(dish._id) && (
                                <span className="text-purple-400 text-sm flex-shrink-0">✓</span>
                              )}
                            </div>
                            {dish.description && (
                              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)", lineHeight: "1.4" }}>
                                {dish.description}
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {cateringOption === 'provided' && selected.length > 0 && (
              <div className="mt-4 p-3 rounded-lg" style={{ background: "rgba(147,51,234,0.1)", border: "1px solid rgba(147,51,234,0.25)" }}>
                <p className="text-xs font-medium" style={{ color: "#c084fc" }}>
                  {selected.length} dish{selected.length !== 1 ? 'es' : ''} selected
                </p>
              </div>
            )}
          </div>
        )}

        {cateringOption === 'self' && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-4xl mb-3">👨‍🍳</div>
              <p className="text-sm font-medium text-white mb-2">Self-Catering Selected</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                You'll arrange your own catering for the event
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t flex gap-3 justify-end" style={{ borderColor: "rgba(167,139,250,0.12)" }}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm transition-all"
            style={{ border: "1px solid rgba(167,139,250,0.2)", color: "#c084fc" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={cateringOption === null}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{
              background: cateringOption !== null ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "rgba(124,58,237,0.3)",
              opacity: cateringOption !== null ? 1 : 0.6,
              cursor: cateringOption !== null ? "pointer" : "not-allowed",
            }}
          >
            {cateringOption === 'self' ? 'Continue without Menu' : 'Confirm Selection'}
          </button>
        </div>
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
    selectedDishes: [], // NEW: Array of dish IDs
  });
  const [errors, setErrors] = useState({});
  const [bookingRef, setBookingRef] = useState("");
  const [confirmedStatus, setConfirmedStatus] = useState("Pending");
  const [selectedHall, setSelectedHall] = useState(initialHall || null);
  const [halls, setHalls] = useState([]);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [showDishesModal, setShowDishesModal] = useState(false); // NEW: Control dishes modal

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

  useEffect(() => {
    if (form.hallId && form.eventDate) {
      api.get(`/bookings/check-slots?hallId=${form.hallId}&date=${form.eventDate}`)
        .then((r) => setBookedSlots(r.data.bookedSlots || []))
        .catch(() => setBookedSlots([]));
    }
  }, [form.hallId, form.eventDate]);

  useEffect(() => {
    if (step === 4 && bookingRef) {
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

  const next = () => {
    const e = {};

    if (step === 1) {
      if (!form.clientName.trim()) e.clientName = "Name required";
      if (!form.clientPhone.trim()) e.clientPhone = "Phone required";
      else if (!/^03\d{9}$/.test(form.clientPhone.replace(/\s/g, "")))
        e.clientPhone = "Format: 03XXXXXXXXX";
      if (form.clientEmail && !/^\S+@\S+\.\S+$/.test(form.clientEmail))
        e.clientEmail = "Invalid email";
      if (!form.eventType) e.eventType = "Event type required";
      if (!form.guests || form.guests < 1) e.guests = "At least 1 guest";
    } else if (step === 2) {
      if (!form.hallId) e.hallId = "Select a hall";
      if (!form.eventDate) e.eventDate = "Select a date";
      else if (new Date(form.eventDate) < new Date().setHours(0, 0, 0, 0))
        e.eventDate = "Cannot book past dates";
      if (!form.timeSlot) e.timeSlot = "Select a time slot";
    } else if (step === 3) {
      // NEW: Dishes selection is optional (user can skip or select self-catering)
      if (!form.paymentMethod) e.paymentMethod = "Select payment method";
      if (!form.transactionId.trim()) e.transactionId = "Transaction ID required";
    }

    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    if (step === 3) {
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
      setStep(4);
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
        style={{ background: "rgba(7,5,15,0.85)", backdropFilter: "blur(10px)" }}
        onClick={(e) => e.target === e.currentTarget && step !== 4 && onClose()}
      >
        <style>
          {`
            .bm-scroll::-webkit-scrollbar { width: 3px; }
            .bm-scroll::-webkit-scrollbar-thumb { background: rgba(147,51,234,0.4); border-radius: 2px; }
            @media (max-width: 640px) {
              .bm-summary-row { flex-direction: column; align-items: flex-start; gap: 2px; }
              .bm-summary-val { font-size: 0.9rem !important; }
              .bm-footer { flex-direction: column; }
              .bm-footer button { width: 100%; }
            }
          `}
        </style>

        <div
          className="w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden bm-scroll"
          style={{
            background: "linear-gradient(145deg,#1b1142,#12093a)",
            border: "1px solid rgba(167,139,250,0.25)",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div
            className="p-6 pb-5"
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
                  Step {step} of 3
                </p>
              </div>
              {step !== 4 && (
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
              {[1, 2, 3, 4].map((s) => (
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
                  {s < 4 && (
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
          <div className="p-6">
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
                      onChange={(e) => set("clientPhone", e.target.value)}
                      placeholder="03001234567"
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

                <Field label="Number of Guests *" error={errors.guests}>
                  <input
                    className={inputClass(errors.guests)}
                    type="number"
                    value={form.guests}
                    onChange={(e) => set("guests", e.target.value)}
                    placeholder="e.g. 250"
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

            {/* ── STEP 3: Payment & Dishes ── */}
            {step === 3 && (
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
                    
                    {/* NEW: Dishes Selection Button */}
                    <div className="pt-2 mt-2" style={{ borderTop: "1px solid rgba(167,139,250,0.15)" }}>
                      <button
                        type="button"
                        onClick={() => setShowDishesModal(true)}
                        className="w-full p-3 rounded-lg transition-all text-left"
                        style={{
                          border: "1px solid rgba(167,139,250,0.25)",
                          background: form.selectedDishes.length > 0 ? "rgba(147,51,234,0.15)" : "rgba(255,255,255,0.05)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = form.selectedDishes.length > 0 ? "rgba(147,51,234,0.15)" : "rgba(255,255,255,0.05)")}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🍽️</span>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {form.selectedDishes.length > 0 
                                  ? `${form.selectedDishes.length} Dishes Selected`
                                  : 'Add Dishes (Optional)'}
                              </p>
                              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                                {form.selectedDishes.length > 0 
                                  ? 'Click to modify selection'
                                  : 'Select from menu or choose self-catering'}
                              </p>
                            </div>
                          </div>
                          <span style={{ color: "#c084fc" }}>→</span>
                        </div>
                      </button>
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

            {/* ── STEP 4: Confirmed ── */}
            {step === 4 && (
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
                  ["Dishes", form.selectedDishes.length > 0 ? `${form.selectedDishes.length} dishes selected` : "Self-catering"],
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
            {step > 1 && step < 4 && (
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
            {step < 4 ? (
              <button
                onClick={next}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Booking..." : step === 3 ? "Confirm Booking →" : "Next →"}
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
          onSelect={handleSlotSelected}
          onClose={() => setShowTimeSlots(false)}
        />
      )}

      {/* NEW: Dishes Selection Modal */}
      {showDishesModal && (
        <DishesSelectionModal
          onClose={() => setShowDishesModal(false)}
          onConfirm={(selectedDishes) => {
            set("selectedDishes", selectedDishes);
            setShowDishesModal(false);
          }}
          initialSelection={form.selectedDishes}
        />
      )}
    </>
  );
}