import React, { useState, useEffect } from "react";
import api from "../services/api";

const STEP_LABELS = ["Details", "Hall & Date", "Payment", "Confirmed"];
const EVENT_TYPES = ["Nikkah", "Walima", "Barat", "Birthday", "Conference", "Anniversary", "Other"];
const PAY_METHODS = ["JazzCash", "EasyPaisa", "Bank Transfer", "Cash"];

// Time slots definition — in a real app these would come from the backend
// Format: { id, label, startTime, endTime }
const ALL_TIME_SLOTS = [
  { id: "morning",   label: "Morning",   startTime: "10:00 AM", endTime: "2:00 PM"  },
  { id: "afternoon", label: "Afternoon", startTime: "3:00 PM",  endTime: "7:00 PM"  },
  { id: "evening",   label: "Evening",   startTime: "8:00 PM",  endTime: "12:00 AM" },
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
                onClick={() => !booked && setSelected(slot.id)}
                className="w-full rounded-xl px-4 py-3 flex items-center justify-between transition-all"
                style={{
                  border: `1px solid ${
                    booked
                      ? "rgba(239,68,68,0.2)"
                      : active
                      ? "rgba(167,139,250,0.55)"
                      : "rgba(167,139,250,0.15)"
                  }`,
                  background: booked
                    ? "rgba(239,68,68,0.05)"
                    : active
                    ? "rgba(124,58,237,0.28)"
                    : "rgba(255,255,255,0.02)",
                  cursor: booked ? "not-allowed" : "pointer",
                  opacity: booked ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!booked && !active)
                    e.currentTarget.style.background = "rgba(124,58,237,0.12)";
                }}
                onMouseLeave={(e) => {
                  if (!booked && !active)
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Dot indicator */}
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: booked ? "#ef4444" : active ? "#a855f7" : "#22c55e",
                      flexShrink: 0,
                    }}
                  />
                  <div className="text-left">
                    <p
                      className="text-sm font-medium"
                      style={{ color: booked ? "rgba(255,255,255,0.35)" : "white" }}
                    >
                      {slot.label}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.35)", marginTop: "1px" }}
                    >
                      {slot.startTime} – {slot.endTime}
                    </p>
                  </div>
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: booked
                      ? "rgba(239,68,68,0.15)"
                      : active
                      ? "rgba(124,58,237,0.4)"
                      : "rgba(34,197,94,0.12)",
                    color: booked ? "#f87171" : active ? "#e9d5ff" : "#4ade80",
                    border: `1px solid ${
                      booked
                        ? "rgba(239,68,68,0.25)"
                        : active
                        ? "rgba(167,139,250,0.4)"
                        : "rgba(34,197,94,0.25)"
                    }`,
                  }}
                >
                  {booked ? "Booked" : active ? "Selected" : "Available"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-5 pt-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm transition-all"
            style={{ border: "1px solid rgba(167,139,250,0.2)", color: "#c084fc" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Cancel
          </button>
          <button
            onClick={() => selected && onSelect(selected)}
            disabled={!selected}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              opacity: selected ? 1 : 0.4,
              cursor: selected ? "pointer" : "not-allowed",
            }}
          >
            Confirm Slot →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main BookingModal ──────────────────────────────────────────────────── */
export default function BookingModal({ hall: preselectedHall, onClose }) {
  const [step, setStep]               = useState(1);
  const [halls, setHalls]             = useState([{ _id: "demo_1", name: "Royal Banquet Hall", location: "Karachi", totalSeats: 800, pricePerHead: 1500 }, { _id: "demo_2", name: "Garden Pavilion", location: "Karachi", totalSeats: 300, pricePerHead: 1200 }, { _id: "demo_3", name: "Grand Ballroom", location: "Karachi", totalSeats: 1200, pricePerHead: 1800 }, { _id: "demo_4", name: "Crystal Suite", location: "Karachi", totalSeats: 150, pricePerHead: 2000 }]);
  const [bookedDates, setBookedDates] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]); // slots booked on selected date
  const [selectedHall, setSelectedHall] = useState(preselectedHall || null);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [bookingRef, setBookingRef]   = useState("");
  const [bookingId, setBookingId]     = useState(null);
  const [confirmedStatus, setConfirmedStatus] = useState("Pending"); // tracks polled status
  const [errors, setErrors]           = useState({});

  const [form, setForm] = useState({
    clientName: "", clientPhone: "", clientEmail: "",
    hallId:       preselectedHall?._id || "",
    eventType:    "Walima",
    eventDate:    "",
    timeSlot:     "",        // NEW — selected time slot id
    timeSlotLabel: "",       // human-readable label
    guests:       2,
    paymentMethod: "", transactionId: "",
    specialRequests: "",
  });

  const today = new Date().toISOString().split("T")[0];


  /* Fetch all halls */
  useEffect(() => {
    api.get("/halls")
      .then((res) => {
        const list = res.data.halls || res.data;
        if (Array.isArray(list) && list.length > 0) setHalls(list);
      })
      .catch(() => {});
  }, []);

  /* Poll booking status every 12s once on step 4 */
  useEffect(() => {
    if (step !== 4 || !bookingId || confirmedStatus === "Confirmed" || confirmedStatus === "Cancelled") return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}/status`);
        if (res.data.success) setConfirmedStatus(res.data.status);
      } catch {}
    }, 12000);
    return () => clearInterval(interval);
  }, [step, bookingId, confirmedStatus]);

  /* Fetch booked dates when hall changes */
  useEffect(() => {
    if (!form.hallId) return;
    api.get(`/bookings/slots/${form.hallId}`)
      .then((res) => {
        const data = res.data.bookedDates || [];
        const todayStr = new Date().toISOString().split("T")[0];
        const valid = data
          .map((b) => b.eventDate?.split("T")[0])
          .filter((d) => {
            if (!d || d.length !== 10) return false;
            const year = parseInt(d.split("-")[0]);
            if (year < 2024 || year > 2100) return false; // filter out corrupted years
            return d >= todayStr; // only show future dates
          });
        setBookedDates(valid);
      })
      .catch(() => {});
    const found = halls.find((h) => h._id === form.hallId);
    if (found) setSelectedHall(found);
  }, [form.hallId, halls]);

  /* When date is picked, fetch booked time slots for that date & open time-slot modal */
  const maxDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  })();

  const handleDateChange = (dateVal) => {
    set("eventDate", dateVal);
    set("timeSlot", "");
    set("timeSlotLabel", "");
    setErrors((e) => ({ ...e, eventDate: "" }));

    // Only proceed if date is fully entered (yyyy-mm-dd = 10 chars)
    if (!dateVal || dateVal.length < 10) return;

    const chosen = new Date(dateVal);
    const todayDate = new Date(today);
    todayDate.setHours(0, 0, 0, 0);
    chosen.setHours(0, 0, 0, 0);

    // Past date
    if (chosen < todayDate) {
      setErrors((e) => ({ ...e, eventDate: "Date cannot be in the past" }));
      return;
    }

    // Beyond 30 days
    const maxAllowed = new Date(todayDate);
    maxAllowed.setDate(maxAllowed.getDate() + 30);
    if (chosen > maxAllowed) {
      setErrors((e) => ({ ...e, eventDate: "Bookings only accepted within the next 30 days" }));
      return;
    }

    // Valid date — fetch slots and open picker
    if (form.hallId) {
      api.get(`/bookings/slots/${form.hallId}?date=${dateVal}`)
        .then((res) => setBookedSlots(res.data.bookedSlots || []))
        .catch(() => setBookedSlots([]));
    } else {
      setBookedSlots([]);
    }
    setShowTimeSlots(true);
  };

  const handleSlotSelected = (slotId) => {
    const slot = ALL_TIME_SLOTS.find((s) => s.id === slotId);
    set("timeSlot", slotId);
    set("timeSlotLabel", `${slot.label} (${slot.startTime} – ${slot.endTime})`);
    setShowTimeSlots(false);
  };

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const totalPrice = selectedHall ? selectedHall.pricePerHead * form.guests : 0;
  const tax        = Math.round(totalPrice * 0.16);
  const grandTotal = totalPrice + tax;

  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.clientName.trim())  e.clientName  = "Name is required";
      if (!form.clientPhone.trim()) e.clientPhone = "Phone is required";
      if (form.clientEmail && !/\S+@\S+\.\S+/.test(form.clientEmail))
        e.clientEmail = "Invalid email";
    }
    if (s === 2) {
      if (!form.hallId)    e.hallId    = "Please select a hall";
      if (!form.eventDate) e.eventDate = "Please select a date";
      if (form.eventDate) {
        const chosen = new Date(form.eventDate);
        const todayD = new Date(today);
        todayD.setHours(0,0,0,0); chosen.setHours(0,0,0,0);
        if (chosen < todayD) e.eventDate = "Date cannot be in the past";
        else {
          const max = new Date(todayD); max.setDate(max.getDate() + 30);
          if (chosen > max) e.eventDate = "Bookings only accepted within the next 30 days";
          else if (bookedDates.includes(form.eventDate)) e.eventDate = "This date is fully booked";
        }
      }
      if (!form.timeSlot)  e.timeSlot  = "Please select a time slot";
    }
    if (s === 3) {
      if (form.hallId?.startsWith("demo_")) { e.submit = "⚠️ Demo halls cannot be booked. Please add real halls via the Admin panel or fix your MongoDB connection first."; }
      if (!form.paymentMethod) e.paymentMethod = "Select a payment method";
      if (form.paymentMethod && form.paymentMethod !== "Cash" && !form.transactionId.trim())
        e.transactionId = "Transaction ID is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post("/bookings", { ...form, totalPrice: grandTotal });
      if (res.data.success) {
        // Use ref from backend (name-based) or fallback
        const ref = res.data.booking?.bookingRef ||
          "NM-" + (form.clientName || "GUE").replace(/[^a-zA-Z]/g,"").toUpperCase().slice(0,4) +
          "-" + Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,4);
        setBookingRef(ref);
        setBookingId(res.data.booking?._id || null);
        setStep(4);
      } else {
        setErrors({ submit: res.data.message });
      }
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || "Server error. Try again." });
    }
    setLoading(false);
  };

  const next = () => {
    if (step < 3 && validate(step)) setStep((s) => s + 1);
    else if (step === 3 && validate(3)) handleSubmit();
  };

  return (
    <>
      <style>{`
        .bm-modal-scroll { overflow-y: auto; }
        .bm-modal-scroll::-webkit-scrollbar { width: 3px; }
        .bm-modal-scroll::-webkit-scrollbar-thumb { background: rgba(167,139,250,0.25); border-radius: 2px; }

        /* Step bar — compress on tiny screens */
        @media (max-width: 400px) {
          .bm-step-label { display: none; }
          .bm-step-circle { width: 24px !important; height: 24px !important; font-size: 10px !important; }
        }

        /* Name/Phone row → stack on mobile */
        @media (max-width: 480px) {
          .bm-two-col { grid-template-columns: 1fr !important; }
        }

        /* Payment grid → 2 cols on mobile instead of 3 */
        @media (max-width: 400px) {
          .bm-pay-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        /* Header padding tighter on small screens */
        @media (max-width: 400px) {
          .bm-header { padding: 1rem 1rem 0 !important; }
          .bm-body   { padding: 0 1rem 0.5rem !important; }
          .bm-footer { padding: 1rem !important; }
        }

        /* Confirm/summary row wrap */
        @media (max-width: 380px) {
          .bm-summary-row { flex-direction: column; align-items: flex-start !important; gap: 2px; }
          .bm-summary-val { text-align: left !important; }
        }
      `}</style>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3"
        style={{ background: "rgba(7,5,15,0.72)", backdropFilter: "blur(4px)" }}
      >
        <div
          className="relative w-full max-w-lg rounded-2xl overflow-hidden bm-modal-scroll"
          style={{
            background: "linear-gradient(145deg,#1a1035,#120d2a)",
            border: "1px solid rgba(167,139,250,0.2)",
            maxHeight: "92vh",
            overflowY: "auto",
            width: "100%",
          }}
        >
          {/* Header */}
          <div className="p-6 pb-0 bm-header">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2
                  className="text-xl font-semibold text-white"
                  style={{ fontFamily: "'Playfair Display',serif" }}
                >
                  {step === 4 ? "Booking Confirmed!" : "Reserve Your Event"}
                </h2>
                <p className="text-xs mt-1 tracking-widest uppercase" style={{ color: "#a855f7" }}>
                  {step < 4 ? `Step ${step} of 3` : "We look forward to serving you"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-xl leading-none transition-colors"
                style={{ color: "rgba(167,139,250,0.5)" }}
                onMouseEnter={(e) => (e.target.style.color = "white")}
                onMouseLeave={(e) => (e.target.style.color = "rgba(167,139,250,0.5)")}
              >
                ✕
              </button>
            </div>

            {/* Step bar */}
            <div className="flex items-center mb-6">
              {STEP_LABELS.map((label, i) => (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all bm-step-circle"
                      style={{
                        background:
                          i + 1 < step
                            ? "#7c3aed"
                            : i + 1 === step
                            ? "rgba(124,58,237,0.3)"
                            : "rgba(255,255,255,0.06)",
                        color: i + 1 <= step ? "white" : "rgba(167,139,250,0.5)",
                        border: i + 1 === step ? "2px solid #a855f7" : "none",
                      }}
                    >
                      {i + 1 < step ? "✓" : i + 1}
                    </div>
                    <span
                      className="text-[10px] mt-1 tracking-wider uppercase bm-step-label"
                      style={{ color: i + 1 === step ? "#c084fc" : "rgba(255,255,255,0.25)" }}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div
                      className="flex-1 h-px mx-2 mb-4 transition-all"
                      style={{ background: i + 1 < step ? "#7c3aed" : "rgba(255,255,255,0.08)" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="px-6 pb-2 bm-body">

            {/* ── STEP 1: Contact Details ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 bm-two-col">
                  <Field label="Full Name *" error={errors.clientName}>
                    <input
                      className={inputClass(errors.clientName)}
                      placeholder="Enter your full name"
                      value={form.clientName}
                      onChange={(e) => set("clientName", e.target.value)}
                    />
                  </Field>
                  <Field label="Phone *" error={errors.clientPhone}>
                    <input
                      className={inputClass(errors.clientPhone)}
                      placeholder="+92 3XX XXXXXXX"
                      value={form.clientPhone}
                      onChange={(e) => set("clientPhone", e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Email" error={errors.clientEmail}>
                  <input
                    className={inputClass(errors.clientEmail)}
                    type="email"
                    placeholder="your@email.com"
                    value={form.clientEmail}
                    onChange={(e) => set("clientEmail", e.target.value)}
                  />
                </Field>
                <Field label="Special Requests">
                  <input
                    className={inputClass()}
                    placeholder="Decoration style, dietary needs..."
                    value={form.specialRequests}
                    onChange={(e) => set("specialRequests", e.target.value)}
                  />
                </Field>
              </div>
            )}

            {/* ── STEP 2: Hall & Date ── */}
            {step === 2 && (
              <div className="space-y-4">

                {/* Event Type first — helps user filter */}
                <div className="grid grid-cols-2 gap-3 bm-two-col">
                  <Field label="Event Type">
                    <CustomSelect
                      value={form.eventType}
                      onChange={(val) => set("eventType", val)}
                      options={EVENT_TYPES}
                      icons={EVENT_ICONS}
                    />
                  </Field>
                  <Field label="No. of Guests">
                    <input
                      className={inputClass()}
                      type="number"
                      min="1"
                      value={form.guests}
                      onChange={(e) => set("guests", parseInt(e.target.value) || 1)}
                    />
                  </Field>
                </div>

                {/* Hall selector */}
                <Field label="Select Hall *" error={errors.hallId}>
                  <CustomSelect
                    value={form.hallId}
                    onChange={(val) => { set("hallId", val); set("timeSlot", ""); set("eventDate", ""); }}
                    options={[
                      ...halls.map((h) => ({
                        value: h._id,
                        label: `${h.name} · ${h.totalSeats} seats · PKR ${h.pricePerHead?.toLocaleString()}/head`,
                      }))
                    ]}
                    placeholder="-- Choose a Hall --"
                    error={errors.hallId}
                    icons={{}}
                  />
                </Field>

                {/* Selected hall info card */}
                {selectedHall && (
                  <div
                    className="rounded-xl p-3 text-sm"
                    style={{ background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.18)" }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium" style={{ color: "#c084fc" }}>{selectedHall.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                          {selectedHall.location} · {selectedHall.totalSeats} seats
                        </p>
                      </div>
                      {selectedHall.pricePerHead && (
                        <p className="text-xs font-semibold" style={{ color: "#a855f7" }}>
                          PKR {selectedHall.pricePerHead?.toLocaleString()}/head
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Event Date */}
                <Field label="Event Date *" error={errors.eventDate}>
                  <div style={{ position: "relative" }}>
                    <input
                      className={inputClass(errors.eventDate)}
                      type="date"
                      min={today}
                      max={maxDate}
                      value={form.eventDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      style={{ colorScheme: "dark" }}
                    />
                    <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                      Bookings accepted for the next 30 days only · Latest: {new Date(maxDate).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </Field>

                {/* Time slot display (after selection) */}
                {form.timeSlot ? (
                  <div
                    className="rounded-xl px-4 py-3 flex items-center justify-between"
                    style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(167,139,250,0.3)" }}
                  >
                    <div>
                      <p className="text-xs tracking-wider uppercase mb-0.5" style={{ color: "rgba(192,132,252,0.6)" }}>
                        Selected Time Slot
                      </p>
                      <p className="text-sm font-medium text-white">{form.timeSlotLabel}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowTimeSlots(true)}
                      className="text-xs px-3 py-1.5 rounded-lg transition-all"
                      style={{ border: "1px solid rgba(167,139,250,0.3)", color: "#c084fc" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      Change
                    </button>
                  </div>
                ) : form.eventDate && (
                  /* Prompt to pick time slot if date is selected but no slot yet */
                  <button
                    type="button"
                    onClick={() => setShowTimeSlots(true)}
                    className="w-full rounded-xl px-4 py-3 text-sm transition-all"
                    style={{
                      border: errors.timeSlot ? "1px solid rgba(239,68,68,0.5)" : "1px dashed rgba(167,139,250,0.3)",
                      color: errors.timeSlot ? "#f87171" : "#c084fc",
                      background: errors.timeSlot ? "rgba(239,68,68,0.05)" : "transparent",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = errors.timeSlot ? "rgba(239,68,68,0.05)" : "transparent")}
                  >
                    🕐 {errors.timeSlot ? errors.timeSlot : "Tap to select available time slot"}
                  </button>
                )}

                {bookedDates.length > 0 && (
                  <div className="text-xs rounded-lg p-2.5" style={{ background: "rgba(239,68,68,0.08)", color: "#f87171" }}>
                    ⚠ Already fully booked on: {bookedDates.join(", ")}
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: Payment ── */}
            {step === 3 && (
              <div className="space-y-4">
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid rgba(167,139,250,0.18)" }}
                >
                  <div
                    className="px-4 py-2 text-xs tracking-widest uppercase"
                    style={{ background: "rgba(167,139,250,0.08)", color: "#a855f7" }}
                  >
                    Estimated Budget
                  </div>
                  {[
                    ["Guest",      form.clientName],
                    ["Hall",       selectedHall?.name],
                    ["Date",       form.eventDate ? new Date(form.eventDate).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "—"],
                    ["Time Slot",  form.timeSlotLabel],
                    ["Event",      form.eventType],
                    ["Guests",     form.guests],
                    ["Room Rate",  `PKR ${totalPrice.toLocaleString()}`],
                    ["Tax (16%)",  `PKR ${tax.toLocaleString()}`],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between px-4 py-2 text-sm bm-summary-row"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      <span style={{ color: "rgba(255,255,255,0.35)" }}>{k}</span>
                      <span className="bm-summary-val" style={{ color: "rgba(255,255,255,0.75)" }}>{v}</span>
                    </div>
                  ))}
                  <div
                    className="flex justify-between px-4 py-3"
                    style={{ borderTop: "1px solid rgba(167,139,250,0.25)" }}
                  >
                    <span className="text-white font-semibold">Grand Total</span>
                    <span className="font-bold text-lg" style={{ color: "#c084fc" }}>
                      PKR {grandTotal.toLocaleString()}
                    </span>
                  </div>
                  {/* Ref note — visible on bill before booking is submitted */}
                  <div className="px-4 py-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: "rgba(124,58,237,0.04)" }}>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                      📌 A unique booking reference (e.g. NM-{(form.clientName || "YOU").replace(/[^a-zA-Z]/g,"").toUpperCase().slice(0,4)}-XXXX) will be generated after confirmation. Use it to track your booking at <span style={{ color: "#a855f7" }}>/booking-status</span>
                    </p>
                  </div>
                </div>

                <Field label="Payment Method *" error={errors.paymentMethod}>
                  <div className="grid grid-cols-3 gap-2 bm-pay-grid">
                    {PAY_METHODS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => { set("paymentMethod", m); }}
                        className="py-2 px-1 rounded-lg text-xs font-medium transition-all"
                        style={{
                          border: `1px solid ${form.paymentMethod === m ? "rgba(167,139,250,0.6)" : "rgba(167,139,250,0.15)"}`,
                          background: form.paymentMethod === m ? "rgba(124,58,237,0.4)" : "transparent",
                          color: form.paymentMethod === m ? "white" : "rgba(192,132,252,0.7)",
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </Field>

                {form.paymentMethod && form.paymentMethod !== "Cash" && (
                  <Field label={`${form.paymentMethod} Reference / Transaction ID *`} error={errors.transactionId}>
                    <input
                      className={inputClass(errors.transactionId)}
                      placeholder="Enter reference / transaction ID"
                      value={form.transactionId}
                      onChange={(e) => set("transactionId", e.target.value)}
                    />
                  </Field>
                )}

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

            {/* ── STEP 4: Pending / Confirmed ── */}
            {step === 4 && (
              <div className="py-2">
                {/* Status banner */}
                {confirmedStatus === "Confirmed" ? (
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-3"
                      style={{ background: "rgba(34,197,94,0.2)", border: "2px solid #22c55e" }}>✓</div>
                    <p className="text-lg font-semibold text-white" style={{ fontFamily: "'Playfair Display',serif" }}>Booking Confirmed!</p>
                    <p className="text-xs mt-1" style={{ color: "#4ade80" }}>Manager has approved your booking. An SMS has been sent to your number.</p>
                  </div>
                ) : confirmedStatus === "Cancelled" ? (
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-3"
                      style={{ background: "rgba(239,68,68,0.2)", border: "2px solid #ef4444" }}>✕</div>
                    <p className="text-lg font-semibold text-white" style={{ fontFamily: "'Playfair Display',serif" }}>Booking Cancelled</p>
                    <p className="text-xs mt-1" style={{ color: "#f87171" }}>Your booking has been cancelled. Please contact us for more details.</p>
                  </div>
                ) : (
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-3"
                      style={{ background: "rgba(245,158,11,0.2)", border: "2px solid #f59e0b" }}>⏳</div>
                    <p className="text-lg font-semibold text-white" style={{ fontFamily: "'Playfair Display',serif" }}>Awaiting Manager Approval</p>
                    <p className="text-xs mt-1" style={{ color: "#fcd34d" }}>
                      Your request has been received. You will receive an SMS on <strong style={{ color: "white" }}>{form.clientPhone}</strong> once the manager confirms.
                    </p>
                    {/* Pulsing dot */}
                    <div className="flex items-center justify-center gap-1.5 mt-3">
                      {[0, 150, 300].map((d) => (
                        <div key={d} style={{
                          width: 6, height: 6, borderRadius: "50%", background: "#f59e0b",
                          animation: `pulse 1.2s ${d}ms ease-in-out infinite`,
                        }}/>
                      ))}
                    </div>
                    <style>{`@keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }`}</style>
                  </div>
                )}

                {/* Reference card */}
                <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.2)" }}>
                  <p className="text-xs tracking-widest uppercase mb-1 text-center" style={{ color: "#a855f7" }}>Booking Reference</p>
                  <p className="text-white font-bold text-2xl tracking-widest text-center" style={{ fontFamily: "'Playfair Display',serif" }}>
                    {bookingRef}
                  </p>
                  <p className="text-xs text-center mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Save this reference for your records
                  </p>
                </div>

                {/* Status badge */}
                <div className="flex justify-center mb-3">
                  <span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{
                    background: confirmedStatus === "Confirmed" ? "rgba(34,197,94,0.15)"
                              : confirmedStatus === "Cancelled" ? "rgba(239,68,68,0.15)"
                              : "rgba(245,158,11,0.15)",
                    color: confirmedStatus === "Confirmed" ? "#4ade80"
                         : confirmedStatus === "Cancelled" ? "#f87171"
                         : "#fcd34d",
                    border: `1px solid ${confirmedStatus === "Confirmed" ? "rgba(34,197,94,0.3)"
                           : confirmedStatus === "Cancelled" ? "rgba(239,68,68,0.3)"
                           : "rgba(245,158,11,0.3)"}`,
                  }}>
                    Status: {confirmedStatus}
                  </span>
                </div>

                {/* Summary rows */}
                {[
                  ["Guest",      form.clientName],
                  ["Phone",      form.clientPhone],
                  ["Hall",       selectedHall?.name],
                  ["Date",       new Date(form.eventDate).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })],
                  ["Time Slot",  form.timeSlotLabel],
                  ["Event",      form.eventType],
                  ["Guests",     form.guests],
                  ["Payment",    form.paymentMethod],
                  ["Total",      `PKR ${grandTotal.toLocaleString()}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1.5 text-sm bm-summary-row"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
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
                  <a href="/booking-status"
                    style={{ color: "#a855f7", fontSize: "0.78rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    🔖 Check status anytime at noormahal.pk/booking-status
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Footer buttons */}
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

      {/* Time Slot Sub-modal — rendered outside the main modal so it layers on top */}
      {showTimeSlots && (
        <TimeSlotModal
          date={form.eventDate}
          hallName={selectedHall?.name || "Hall"}
          bookedSlots={bookedSlots}
          onSelect={handleSlotSelected}
          onClose={() => setShowTimeSlots(false)}
        />
      )}
    </>
  );
}