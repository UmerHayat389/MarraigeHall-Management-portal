import React, { useState, useEffect } from "react";
import api from "../services/api";

const STEP_LABELS = ["Details", "Hall & Date", "Payment", "Confirmed"];
const EVENT_TYPES = ["Nikkah", "Walima", "Barat", "Birthday", "Conference", "Anniversary", "Other"];
const PAY_METHODS = ["JazzCash", "EasyPaisa", "Card", "Bank Transfer", "Cash", "Crypto"];

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

/* ─── Time Slot Picker Sub-modal ─────────────────────────────────────────── */
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
  const [payVerified, setPayVerified] = useState(false);
  const [verifying, setVerifying]     = useState(false);
  const [bookingRef, setBookingRef]   = useState("");
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

  /* Fetch booked dates when hall changes */
  useEffect(() => {
    if (!form.hallId) return;
    api.get(`/bookings/slots/${form.hallId}`)
      .then((res) => {
        const data = res.data.bookedDates || [];
        setBookedDates(data.map((b) => b.eventDate?.split("T")[0]));
      })
      .catch(() => {});
    const found = halls.find((h) => h._id === form.hallId);
    if (found) setSelectedHall(found);
  }, [form.hallId, halls]);

  /* When date is picked, fetch booked time slots for that date & open time-slot modal */
  const handleDateChange = (dateVal) => {
    set("eventDate", dateVal);
    set("timeSlot", "");
    set("timeSlotLabel", "");
    if (!dateVal) return;
    if (form.hallId) {
      api.get(`/bookings/slots/${form.hallId}?date=${dateVal}`)
        .then((res) => setBookedSlots(res.data.bookedSlots || []))
        .catch(() => setBookedSlots([]));
    } else {
      setBookedSlots([]); // No hall yet — all slots available
    }
    setShowTimeSlots(true); // Always open time slot picker when date chosen
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
      if (!form.timeSlot)  e.timeSlot  = "Please select a time slot";
      if (form.eventDate && bookedDates.includes(form.eventDate))
        e.eventDate = "This date is fully booked";
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

  const handleVerify = () => {
    if (!form.transactionId.trim()) { setErrors({ transactionId: "Enter transaction ID first" }); return; }
    setVerifying(true);
    setTimeout(() => { setVerifying(false); setPayVerified(true); }, 1500);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post("/bookings", { ...form, totalPrice: grandTotal });
      if (res.data.success) {
        setBookingRef("NM-" + Math.random().toString(36).substr(2, 6).toUpperCase());
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
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(7,5,15,0.88)", backdropFilter: "blur(10px)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="relative w-full max-w-lg rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg,#1a1035,#120d2a)",
            border: "1px solid rgba(167,139,250,0.2)",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div className="p-6 pb-0">
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
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
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
                      className="text-[10px] mt-1 tracking-wider uppercase"
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
          <div className="px-6 pb-2">

            {/* ── STEP 1: Contact Details ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Full Name *" error={errors.clientName}>
                    <input
                      className={inputClass(errors.clientName)}
                      placeholder="Ahmed Khan"
                      value={form.clientName}
                      onChange={(e) => set("clientName", e.target.value)}
                    />
                  </Field>
                  <Field label="Phone *" error={errors.clientPhone}>
                    <input
                      className={inputClass(errors.clientPhone)}
                      placeholder="+92 300 1234567"
                      value={form.clientPhone}
                      onChange={(e) => set("clientPhone", e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Email" error={errors.clientEmail}>
                  <input
                    className={inputClass(errors.clientEmail)}
                    type="email"
                    placeholder="ahmed@email.com"
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
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Event Type">
                    <select
                      className={inputClass()}
                      value={form.eventType}
                      onChange={(e) => set("eventType", e.target.value)}
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      {EVENT_TYPES.map((t) => (
                        <option key={t} style={{ background: "#1a1035" }}>{t}</option>
                      ))}
                    </select>
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
                  <select
                    className={inputClass(errors.hallId)}
                    value={form.hallId}
                    onChange={(e) => { set("hallId", e.target.value); set("timeSlot", ""); set("eventDate", ""); }}
                    style={{ background: errors.hallId ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.05)" }}
                  >
                    <option value="" style={{ background: "#1a1035" }}>-- Choose a Hall --</option>
                    {halls.map((h) => (
                      <option key={h._id} value={h._id} style={{ background: "#1a1035" }}>
                        {h.name} · {h.totalSeats} seats · PKR {h.pricePerHead?.toLocaleString()}/head
                      </option>
                    ))}
                  </select>
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
                  <input
                    className={inputClass(errors.eventDate)}
                    type="date"
                    min={today}
                    value={form.eventDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
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
                    ["Hall",       selectedHall?.name],
                    ["Date",       form.eventDate],
                    ["Time Slot",  form.timeSlotLabel],
                    ["Event",      form.eventType],
                    ["Guests",     form.guests],
                    ["Room Rate",  `PKR ${totalPrice.toLocaleString()}`],
                    ["Tax (16%)",  `PKR ${tax.toLocaleString()}`],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between px-4 py-2 text-sm"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      <span style={{ color: "rgba(255,255,255,0.35)" }}>{k}</span>
                      <span style={{ color: "rgba(255,255,255,0.75)" }}>{v}</span>
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
                </div>

                <Field label="Payment Method *" error={errors.paymentMethod}>
                  <div className="grid grid-cols-3 gap-2">
                    {PAY_METHODS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => { set("paymentMethod", m); setPayVerified(false); }}
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
                  <Field label={`${form.paymentMethod} Transaction ID *`} error={errors.transactionId}>
                    <div className="flex gap-2">
                      <input
                        className={`${inputClass(errors.transactionId)} flex-1`}
                        placeholder="Enter reference / transaction ID"
                        value={form.transactionId}
                        onChange={(e) => set("transactionId", e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={handleVerify}
                        disabled={verifying || payVerified}
                        className="px-3 rounded-lg text-xs font-semibold whitespace-nowrap text-white transition-all"
                        style={{
                          background: payVerified ? "#16a34a" : "linear-gradient(135deg,#7c3aed,#a855f7)",
                          opacity: verifying ? 0.7 : 1,
                        }}
                      >
                        {verifying ? "..." : payVerified ? "✓ Done" : "Verify"}
                      </button>
                    </div>
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

            {/* ── STEP 4: Confirmation ── */}
            {step === 4 && (
              <div className="text-center py-2">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
                  style={{ background: "rgba(124,58,237,0.2)", border: "2px solid #7c3aed" }}
                >
                  ✓
                </div>
                <div
                  className="rounded-xl p-4 mb-4"
                  style={{ background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.2)" }}
                >
                  <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#a855f7" }}>
                    Booking Reference
                  </p>
                  <p
                    className="text-white font-bold text-2xl tracking-widest"
                    style={{ fontFamily: "'Playfair Display',serif" }}
                  >
                    {bookingRef}
                  </p>
                </div>
                {[
                  ["Guest",      form.clientName],
                  ["Phone",      form.clientPhone],
                  ["Hall",       selectedHall?.name],
                  ["Date",       form.eventDate],
                  ["Time Slot",  form.timeSlotLabel],
                  ["Event",      form.eventType],
                  ["Guests",     form.guests],
                  ["Payment",    form.paymentMethod],
                  ["Total Paid", `PKR ${grandTotal.toLocaleString()}`],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between py-1.5 text-sm"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <span style={{ color: "rgba(255,255,255,0.35)" }}>{k}</span>
                    <span className="font-medium text-white">{v}</span>
                  </div>
                ))}
                <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Confirmation sent to your phone. Thank you for choosing Noor Mahal!
                </p>
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="p-6 pt-4 flex gap-3 justify-end">
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