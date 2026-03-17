import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";

// ── Constants ──────────────────────────────────────────────────────────────────
const ROLES = ["manager", "waiter", "chef", "security", "cleaner", "decorator"];

const ROLE_META = {
  manager:   { icon: "👔", color: "#a855f7", bg: "rgba(168,85,247,0.14)", border: "rgba(168,85,247,0.38)" },
  waiter:    { icon: "🍽️", color: "#06b6d4", bg: "rgba(6,182,212,0.14)",  border: "rgba(6,182,212,0.38)"  },
  chef:      { icon: "👨‍🍳", color: "#f59e0b", bg: "rgba(245,158,11,0.14)", border: "rgba(245,158,11,0.38)" },
  security:  { icon: "🛡️", color: "#10b981", bg: "rgba(16,185,129,0.14)", border: "rgba(16,185,129,0.38)" },
  cleaner:   { icon: "🧹", color: "#94a3b8", bg: "rgba(148,163,184,0.14)",border: "rgba(148,163,184,0.38)"},
  decorator: { icon: "🎨", color: "#ec4899", bg: "rgba(236,72,153,0.14)", border: "rgba(236,72,153,0.38)" },
};

const PER_PAGE = 10;

// ── Validation Rules ───────────────────────────────────────────────────────────
const RULES = {
  name:     { required: true,  max: 15,  label: "Full Name"  },
  email:    { required: true,  max: 50,  label: "Email"      },
  phone:    { required: false, max: 15,  label: "Phone"      },
  salary:   { required: false, max: 10,  label: "Salary"     },
  password: { required: false, max: 30,  label: "Password"   },
};

function validate(form, isEdit) {
  const e = {};
  if (!form.name?.trim())         e.name = "Name is required";
  else if (form.name.length > 15) e.name = "Max 15 characters";

  if (!form.email?.trim())        e.email = "Email is required";
  else if (form.email.length > 50) e.email = "Max 50 characters";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format";

  if (form.phone && form.phone.length > 15) e.phone = "Max 15 characters";

  if (!isEdit && !form.password)  e.password = "Password is required";
  if (form.password && form.password.length < 6)  e.password = "Min 6 characters";
  if (form.password && form.password.length > 30) e.password = "Max 30 characters";

  if (form.salary && isNaN(form.salary)) e.salary = "Must be a number";
  return e;
}

// ── Global CSS ─────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes empIn   { from{opacity:0;transform:translateY(14px) scale(.98)} to{opacity:1;transform:none} }
  @keyframes empBg   { from{opacity:0} to{opacity:1} }
  @keyframes empSpin { to{transform:rotate(360deg)} }

  /* ── Overlay ── */
  .emp-ov {
    position:fixed;inset:0;z-index:600;
    background:rgba(2,1,8,.52);
    backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);
    display:flex;align-items:center;justify-content:center;
    padding:.75rem;animation:empBg .15s ease;
  }

  /* ── Modal box ── */
  .emp-box {
    width:100%;max-width:460px;
    background:#0f0a28;
    border:1px solid rgba(139,92,246,.22);
    border-radius:16px;overflow:hidden;
    box-shadow:0 28px 80px rgba(0,0,0,.78);
    animation:empIn .2s cubic-bezier(.22,1,.36,1);
    display:flex;flex-direction:column;
    max-height:calc(100vh - 1.5rem);
  }

  /* ── Scrollable body ── */
  .emp-scroll {
    overflow-y:auto;flex:1;
  }
  .emp-scroll::-webkit-scrollbar{width:3px}
  .emp-scroll::-webkit-scrollbar-thumb{background:rgba(147,51,234,.3);border-radius:2px}

  /* ── Header ── */
  .emp-hd {
    padding:1.1rem 1.2rem .95rem;
    display:flex;gap:.85rem;align-items:flex-start;
    border-bottom:1px solid rgba(139,92,246,.12);
    transition:background .3s;
    flex-shrink:0;
  }

  /* ── Photo ── */
  .emp-av {
    width:56px;height:56px;border-radius:50%;
    overflow:hidden;cursor:pointer;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    position:relative;transition:border-color .3s;
  }
  .emp-av-cam {
    position:absolute;inset:0;border-radius:50%;
    background:rgba(0,0,0,.55);
    display:flex;align-items:center;justify-content:center;
    font-size:1rem;opacity:0;transition:opacity .18s;
  }
  .emp-av:hover .emp-av-cam{opacity:1}

  /* ── Form fields ── */
  .emp-form { padding:.95rem 1.2rem 1.1rem; }
  .emp-grid { display:grid;grid-template-columns:1fr 1fr;gap:.65rem; }
  .emp-full { grid-column:1/-1; }

  .emp-lbl {
    display:flex;justify-content:space-between;align-items:center;
    font-size:.59rem;font-weight:700;letter-spacing:.12em;
    text-transform:uppercase;color:rgba(196,139,252,.5);
    margin-bottom:.22rem;
  }
  .emp-lbl-cnt { color:rgba(196,139,252,.28);font-weight:400;letter-spacing:0;text-transform:none;font-size:.59rem; }

  .emp-inp {
    width:100%;padding:.58rem .8rem;border-radius:8px;
    background:rgba(255,255,255,.05);
    border:1px solid rgba(139,92,246,.18);
    color:white;font-size:.83rem;outline:none;
    font-family:'Plus Jakarta Sans',sans-serif;
    transition:border-color .15s,background .15s;
    box-sizing:border-box;
  }
  .emp-inp:focus  { border-color:rgba(147,51,234,.55);background:rgba(255,255,255,.07); }
  .emp-inp.err    { border-color:rgba(239,68,68,.5);background:rgba(239,68,68,.04); }
  .emp-inp::placeholder { color:rgba(255,255,255,.17); }
  .emp-inp[type=date]   { color-scheme:dark; }

  .emp-err { color:#f87171;font-size:.64rem;margin:2px 0 0; }

  /* ── Custom dropdown ── */
  .emp-dd { position:relative; }
  .emp-dd-btn {
    width:100%;padding:.58rem .8rem;border-radius:8px;
    background:rgba(255,255,255,.05);
    border:1px solid rgba(139,92,246,.18);
    color:white;cursor:pointer;outline:none;
    font-family:'Plus Jakarta Sans',sans-serif;
    display:flex;align-items:center;justify-content:space-between;
    transition:all .15s;box-sizing:border-box;
  }
  .emp-dd-btn:focus,.emp-dd-btn.open {
    border-color:rgba(147,51,234,.55);background:rgba(255,255,255,.07);
  }
  .emp-dd-list {
    position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:9999;
    background:#100929;border:1px solid rgba(139,92,246,.22);
    border-radius:10px;overflow:hidden;
    box-shadow:0 18px 50px rgba(0,0,0,.7);
  }
  .emp-dd-opt {
    width:100%;padding:.52rem .8rem;border:none;
    background:transparent;border-left:3px solid transparent;
    display:flex;align-items:center;gap:.55rem;
    cursor:pointer;transition:background .1s;
    font-family:'Plus Jakarta Sans',sans-serif;
  }
  .emp-dd-opt:hover   { background:rgba(255,255,255,.04); }
  .emp-dd-opt.sel     { background:var(--dbg);border-left-color:var(--dc); }

  /* ── Toggle ── */
  .emp-tog {
    width:34px;height:19px;border-radius:999px;border:none;
    cursor:pointer;position:relative;transition:background .25s;flex-shrink:0;
  }
  .emp-tog-dot {
    width:13px;height:13px;border-radius:50%;background:white;
    position:absolute;top:3px;transition:left .22s;
    box-shadow:0 1px 4px rgba(0,0,0,.4);
  }

  /* ── Actions ── */
  .emp-acts { display:flex;gap:.55rem;justify-content:flex-end;margin-top:.9rem; }
  .emp-cancel {
    padding:.55rem 1.1rem;border-radius:8px;cursor:pointer;
    border:1px solid rgba(139,92,246,.2);background:transparent;
    color:rgba(196,139,252,.5);font-size:.82rem;font-weight:500;
    font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s;
  }
  .emp-cancel:hover { border-color:rgba(139,92,246,.4);color:rgba(196,139,252,.8); }
  .emp-save {
    padding:.55rem 1.3rem;border-radius:8px;border:none;cursor:pointer;
    background:linear-gradient(135deg,#6d28d9,#9333ea);
    color:white;font-size:.82rem;font-weight:700;
    font-family:'Plus Jakarta Sans',sans-serif;
    min-width:115px;display:flex;align-items:center;justify-content:center;gap:.38rem;
    box-shadow:0 4px 16px rgba(109,40,217,.38);transition:all .15s;
  }
  .emp-save:hover:not(:disabled) { transform:translateY(-1px);box-shadow:0 6px 22px rgba(109,40,217,.52); }
  .emp-save:disabled { opacity:.5;cursor:not-allowed;transform:none; }

  /* ── Employee row ── */
  .emp-row {
    display:flex;align-items:center;gap:.8rem;
    padding:.75rem 1rem;border-radius:12px;
    border:1px solid rgba(139,92,246,.1);
    background:rgba(255,255,255,.02);
    transition:all .14s;cursor:pointer;
  }
  .emp-row:hover { border-color:rgba(147,51,234,.28);background:rgba(109,40,217,.07); }

  /* ── Responsive ── */
  @media(max-width:500px) {
    .emp-box   { border-radius:14px; }
    .emp-hd    { padding:.9rem 1rem .8rem;gap:.7rem; }
    .emp-av    { width:48px;height:48px; }
    .emp-form  { padding:.85rem .95rem .95rem; }
    .emp-grid  { grid-template-columns:1fr; }
    .emp-full  { grid-column:1; }
    .emp-acts  { flex-direction:column; }
    .emp-cancel,.emp-save { width:100%;justify-content:center; }
  }
  @media(max-width:380px) {
    .emp-hd-title { font-size:1.05rem !important; }
  }
`;

// ── Char Counter Label ─────────────────────────────────────────────────────────
function FieldLabel({ label, value = "", max, required }) {
  const len = (value || "").length;
  const over = max && len > max;
  return (
    <label className="emp-lbl">
      <span>{label}{required && " *"}</span>
      {max && <span className="emp-lbl-cnt" style={{ color: over ? "#f87171" : undefined }}>{len}/{max}</span>}
    </label>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────────
function Avatar({ employee, size = 40 }) {
  const m = ROLE_META[employee.role] || ROLE_META.waiter;
  if (employee.image) return (
    <img src={employee.image} alt={employee.name}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: `2px solid ${m.border}`, flexShrink: 0 }} />
  );
  const initials = employee.name ? employee.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: m.bg, border: `2px solid ${m.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.32, fontWeight: 700, color: m.color, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      {initials}
    </div>
  );
}

// ── Role Dropdown ──────────────────────────────────────────────────────────────
function RoleDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const sel = ROLE_META[value] || ROLE_META.waiter;

  return (
    <div className="emp-dd" ref={ref}>
      <button type="button" className={`emp-dd-btn${open ? " open" : ""}`} onClick={() => setOpen(o => !o)}>
        <span style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
          {/* Icon box */}
          <span style={{ width: 26, height: 26, borderRadius: "7px", background: sel.bg, border: `1px solid ${sel.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".88rem", flexShrink: 0 }}>
            {sel.icon}
          </span>
          {/* Role name — colored, updates on change */}
          <span style={{ color: sel.color, fontWeight: 700, fontSize: ".84rem", textTransform: "capitalize" }}>
            {value}
          </span>
        </span>
        <span style={{ color: "rgba(167,139,250,.4)", fontSize: ".58rem", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform .18s" }}>▼</span>
      </button>

      {open && (
        <div className="emp-dd-list">
          {ROLES.map(r => {
            const m = ROLE_META[r];
            const active = r === value;
            return (
              <button key={r} type="button"
                className={`emp-dd-opt${active ? " sel" : ""}`}
                style={{ "--dc": m.color, "--dbg": m.bg }}
                onClick={() => { onChange(r); setOpen(false); }}
              >
                <span style={{ width: 26, height: 26, borderRadius: "7px", background: m.bg, border: `1px solid ${m.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".88rem", flexShrink: 0 }}>
                  {m.icon}
                </span>
                <span style={{ color: active ? m.color : "rgba(255,255,255,.62)", fontWeight: active ? 700 : 400, fontSize: ".83rem", textTransform: "capitalize" }}>
                  {r}
                </span>
                {active && <span style={{ marginLeft: "auto", color: m.color, fontSize: ".7rem" }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── EMPLOYEE MODAL ─────────────────────────────────────────────────────────────
function EmployeeModal({ employee, onClose, onSave }) {
  const isEdit  = !!employee?._id;
  const fileRef = useRef();

  const blank = {
    name: "", email: "", phone: "", role: "waiter",
    salary: "", joiningDate: new Date().toISOString().split("T")[0],
    isActive: true, image: "", password: "",
  };

  const [form, setForm] = useState(
    employee
      ? { ...employee, password: "", joiningDate: (employee.joiningDate || "").split("T")[0] || new Date().toISOString().split("T")[0] }
      : blank
  );
  const [err, setErr]         = useState({});
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(employee?.image || "");

  const meta = ROLE_META[form.role] || ROLE_META.waiter; // live — updates header band

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErr(e => ({ ...e, [k]: "" })); };

  const handleFile = e => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = ev => { setPreview(ev.target.result); set("image", ev.target.result); };
    r.readAsDataURL(file);
  };

  const submit = async () => {
    const e = validate(form, isEdit);
    if (Object.keys(e).length) { setErr(e); return; }
    setLoading(true);
    try {
      const payload = { ...form, salary: form.salary ? Number(form.salary) : 0 };
      if (isEdit && !payload.password) delete payload.password;
      const res = isEdit
        ? await api.put(`/employees/${employee._id}`, payload)
        : await api.post("/employees", payload);
      onSave(res.data.employee, !isEdit);
    } catch (ex) { setErr({ submit: ex.response?.data?.message || "Something went wrong." }); }
    setLoading(false);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="emp-ov" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="emp-box">

          {/* ══ HEADER — color shifts with role ══ */}
          <div className="emp-hd" style={{ background: `linear-gradient(135deg,${meta.bg} 0%,rgba(15,10,40,0) 70%)` }}>

            {/* Photo — click to upload */}
            <div className="emp-av"
              style={{ border: `2.5px solid ${meta.border}`, background: preview ? "transparent" : meta.bg }}
              onClick={() => fileRef.current?.click()}
            >
              {preview
                ? <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>{meta.icon}</span>
              }
              <div className="emp-av-cam">📷</div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
            </div>

            {/* Info column */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Title row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".5rem", marginBottom: ".35rem" }}>
                <h3 className="emp-hd-title" style={{ fontFamily: "'Cormorant Garamond',serif", color: "white", fontSize: "1.15rem", fontWeight: 600, margin: 0, lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {isEdit ? "Edit Employee" : "Add New Employee"}
                </h3>
                <button onClick={onClose} style={{ width: 26, height: 26, borderRadius: "7px", flexShrink: 0, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.42)", cursor: "pointer", fontSize: ".82rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>

              {/* Designation badge + active toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: ".45rem", flexWrap: "wrap" }}>
                {/* Badge — shows selected role, colored, updates live */}
                <span style={{ display: "inline-flex", alignItems: "center", gap: ".22rem", padding: "2px 9px", borderRadius: "999px", fontSize: ".67rem", fontWeight: 700, textTransform: "capitalize", background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, transition: "all .25s" }}>
                  {meta.icon}&nbsp;{form.role}
                </span>

                {/* Toggle */}
                <button type="button" className="emp-tog"
                  style={{ background: form.isActive ? "#10b981" : "rgba(255,255,255,.12)" }}
                  onClick={() => set("isActive", !form.isActive)}
                >
                  <div className="emp-tog-dot" style={{ left: form.isActive ? 18 : 3 }} />
                </button>
                <span style={{ color: form.isActive ? "#10b981" : "rgba(255,255,255,.25)", fontSize: ".67rem", fontWeight: 600, transition: "color .2s" }}>
                  {form.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Photo URL or remove */}
              <div style={{ marginTop: ".38rem" }}>
                {preview ? (
                  <button type="button" onClick={() => { setPreview(""); set("image", ""); }} style={{ padding: "1px 8px", borderRadius: "999px", fontSize: ".62rem", border: "1px solid rgba(239,68,68,.28)", background: "rgba(239,68,68,.08)", color: "#f87171", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                    ✕ Remove photo
                  </button>
                ) : (
                  <input className="emp-inp"
                    style={{ fontSize: ".71rem", padding: ".3rem .65rem" }}
                    value={form.image && !form.image.startsWith("data:") ? form.image : ""}
                    onChange={e => { set("image", e.target.value); setPreview(e.target.value); }}
                    placeholder="Paste photo URL…"
                  />
                )}
              </div>
            </div>
          </div>

          {/* ══ SCROLLABLE FORM BODY ══ */}
          <div className="emp-scroll">
            <div className="emp-form">
              <div className="emp-grid">

                {/* Full name */}
                <div className="emp-full">
                  <FieldLabel label="Full Name" value={form.name} max={15} required />
                  <input className={`emp-inp${err.name ? " err" : ""}`}
                    value={form.name} maxLength={15}
                    onChange={e => set("name", e.target.value)}
                    placeholder="Muhammad Ali" />
                  {err.name && <p className="emp-err">⚠ {err.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <FieldLabel label="Email" value={form.email} max={50} required />
                  <input className={`emp-inp${err.email ? " err" : ""}`}
                    type="email" value={form.email} maxLength={50}
                    onChange={e => set("email", e.target.value)}
                    placeholder="ali@noormahal.com" />
                  {err.email && <p className="emp-err">⚠ {err.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <FieldLabel label="Phone" value={form.phone} max={15} />
                  <input className={`emp-inp${err.phone ? " err" : ""}`}
                    value={form.phone || ""} maxLength={15}
                    onChange={e => set("phone", e.target.value)}
                    placeholder="03001234567" />
                  {err.phone && <p className="emp-err">⚠ {err.phone}</p>}
                </div>

                {/* Designation — full width, updates header badge + color instantly */}
                <div className="emp-full">
                  <FieldLabel label="Designation" required />
                  <RoleDropdown value={form.role} onChange={v => set("role", v)} />
                </div>

                {/* Salary */}
                <div>
                  <FieldLabel label="Salary (PKR/mo)" value={String(form.salary || "")} max={10} />
                  <input className="emp-inp"
                    type="number" value={form.salary || ""} maxLength={10}
                    onChange={e => set("salary", e.target.value)}
                    placeholder="25000" />
                </div>

                {/* Joining date */}
                <div>
                  <FieldLabel label="Joining Date" />
                  <input className="emp-inp" type="date"
                    value={form.joiningDate || ""}
                    onChange={e => set("joiningDate", e.target.value)}
                    style={{ colorScheme: "dark" }} />
                </div>

                {/* Password */}
                <div className="emp-full">
                  <FieldLabel
                    label={isEdit ? "New Password" : "Password"}
                    value={form.password}
                    max={30}
                    required={!isEdit ? true : false}
                  />
                  {isEdit && (
                    <p style={{ color: "rgba(255,255,255,.2)", fontSize: ".62rem", margin: "0 0 .22rem" }}>
                      Leave blank to keep current password
                    </p>
                  )}
                  <input className={`emp-inp${err.password ? " err" : ""}`}
                    type="password" value={form.password || ""} maxLength={30}
                    onChange={e => set("password", e.target.value)}
                    placeholder={isEdit ? "Leave blank to keep unchanged" : "Min 6 characters"} />
                  {err.password && <p className="emp-err">⚠ {err.password}</p>}
                </div>

              </div>

              {/* Submit error */}
              {err.submit && (
                <div style={{ marginTop: ".7rem", padding: ".52rem .8rem", borderRadius: "8px", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", color: "#f87171", fontSize: ".77rem" }}>
                  ✕ {err.submit}
                </div>
              )}

              {/* Buttons */}
              <div className="emp-acts">
                <button className="emp-cancel" onClick={onClose}>Cancel</button>
                <button className="emp-save" onClick={submit} disabled={loading}>
                  {loading
                    ? <><span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "white", animation: "empSpin .7s linear infinite", display: "inline-block" }} /> Saving…</>
                    : isEdit ? "Save Changes" : "Add Employee"
                  }
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// ── View Modal ─────────────────────────────────────────────────────────────────
function EmployeeViewModal({ employee, onClose, onEdit }) {
  const meta   = ROLE_META[employee.role] || ROLE_META.waiter;
  const joined = employee.joiningDate
    ? new Date(employee.joiningDate).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  const rows = [
    { label: "Email",     value: employee.email || "—",                                                         icon: "✉️" },
    { label: "Phone",     value: employee.phone || "—",                                                         icon: "📞" },
    { label: "Role",      value: (employee.role?.charAt(0).toUpperCase() + employee.role?.slice(1)) || "—",     icon: meta.icon },
    { label: "Salary",    value: employee.salary ? `PKR ${Number(employee.salary).toLocaleString()}/mo` : "—", icon: "💰" },
    { label: "Joined",    value: joined,                                                                        icon: "📅" },
    { label: "Status",    value: employee.isActive ? "Active" : "Inactive",                                    icon: employee.isActive ? "🟢" : "🔴" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="emp-ov" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="emp-box" style={{ maxWidth: 380 }}>
          {/* Header */}
          <div style={{ padding: "1.2rem 1.2rem .9rem", textAlign: "center", background: `linear-gradient(135deg,${meta.bg},rgba(15,10,40,0))`, borderBottom: `1px solid ${meta.border}`, position: "relative", flexShrink: 0 }}>
            <button onClick={onClose} style={{ position: "absolute", top: ".85rem", right: ".85rem", width: 26, height: 26, borderRadius: "7px", border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.42)", cursor: "pointer", fontSize: ".82rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            <Avatar employee={employee} size={62} />
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", color: "white", fontSize: "1.2rem", fontWeight: 600, margin: ".55rem 0 .25rem" }}>{employee.name}</h3>
            <span style={{ display: "inline-flex", alignItems: "center", gap: ".22rem", padding: "2px 10px", borderRadius: "999px", fontSize: ".67rem", fontWeight: 700, textTransform: "capitalize", background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
              {meta.icon} {employee.role}
            </span>
          </div>

          <div className="emp-scroll">
            <div style={{ padding: ".9rem 1.1rem 1.1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: ".38rem", marginBottom: ".9rem" }}>
                {rows.map(r => (
                  <div key={r.label} style={{ display: "flex", alignItems: "center", gap: ".6rem", padding: ".42rem .72rem", borderRadius: "8px", background: "rgba(255,255,255,.03)", border: "1px solid rgba(139,92,246,.09)" }}>
                    <span style={{ fontSize: ".82rem", width: 19, textAlign: "center", flexShrink: 0 }}>{r.icon}</span>
                    <div>
                      <p style={{ color: "rgba(255,255,255,.22)", fontSize: ".57rem", textTransform: "uppercase", letterSpacing: ".1em", margin: 0 }}>{r.label}</p>
                      <p style={{ color: "rgba(255,255,255,.78)", fontSize: ".79rem", margin: 0 }}>{r.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: ".5rem" }}>
                <button onClick={onClose} style={{ flex: 1, padding: ".52rem", borderRadius: "8px", border: "1px solid rgba(139,92,246,.18)", background: "transparent", color: "rgba(196,139,252,.5)", fontSize: ".8rem", fontFamily: "'Plus Jakarta Sans',sans-serif", cursor: "pointer" }}>Close</button>
                <button onClick={() => { onClose(); onEdit(employee); }} style={{ flex: 1, padding: ".52rem", borderRadius: "8px", border: "none", background: "linear-gradient(135deg,#6d28d9,#9333ea)", color: "white", fontSize: ".8rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", cursor: "pointer" }}>✏ Edit</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main EmployeesTab ──────────────────────────────────────────────────────────
export default function EmployeesTab({ toast }) {
  const [employees, setEmployees]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [page, setPage]             = useState(1);
  const [modal, setModal]           = useState(null);
  const [viewEmp, setViewEmp]       = useState(null);

  useEffect(() => {
    api.get("/employees")
      .then(r => setEmployees(r.data.employees || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setPage(1); }, [search, roleFilter]);

  const handleSave = (emp, isNew) => {
    if (isNew) setEmployees(e => [emp, ...e]);
    else setEmployees(e => e.map(x => x._id === emp._id ? emp : x));
    setModal(null);
    toast(isNew ? "Employee added successfully" : "Employee updated", "success");
  };

  const handleDelete = async id => {
    if (!window.confirm("Remove this employee?")) return;
    try { await api.delete(`/employees/${id}`); setEmployees(e => e.filter(x => x._id !== id)); toast("Employee removed", "success"); }
    catch { toast("Failed to delete", "error"); }
  };

  const filtered = employees.filter(e => {
    const matchRole   = roleFilter === "All" || e.role === roleFilter;
    const q           = search.toLowerCase();
    const matchSearch = !search || e.name?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q) || e.phone?.includes(q) || e.role?.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const roleCounts = { All: employees.length };
  ROLES.forEach(r => { roleCounts[r] = employees.filter(e => e.role === r).length; });
  const active      = employees.filter(e => e.isActive).length;
  const totalSalary = employees.filter(e => e.isActive).reduce((s, e) => s + (Number(e.salary) || 0), 0);

  return (
    <div>
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.3rem", flexWrap: "wrap", gap: ".7rem" }}>
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", color: "white", fontSize: "clamp(1.4rem,4vw,1.75rem)", fontWeight: 600, margin: "0 0 3px" }}>
            Manage <em style={{ color: "#9333ea" }}>Employees</em>
          </h2>
          <p style={{ color: "rgba(255,255,255,.27)", fontSize: ".77rem", margin: 0 }}>
            {filtered.length !== employees.length ? `${filtered.length} of ${employees.length}` : employees.length} team member{employees.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Search + Add */}
        <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: ".72rem", top: "50%", transform: "translateY(-50%)", color: "rgba(167,139,250,.35)", fontSize: ".82rem", pointerEvents: "none" }}>🔍</span>
            <input className="a-input" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              style={{ paddingLeft: "2rem", width: "clamp(140px,30vw,210px)", fontSize: ".8rem" }} />
          </div>
          <button
            style={{ padding: ".58rem 1.1rem", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#6d28d9,#9333ea)", color: "white", fontWeight: 600, fontSize: ".82rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: "0 4px 14px rgba(109,40,217,.38)", whiteSpace: "nowrap", transition: "all .15s" }}
            onClick={() => setModal("new")}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(109,40,217,.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 14px rgba(109,40,217,.38)"; }}
          >
            + Add Employee
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: ".75rem", marginBottom: "1.2rem" }}>
        {[
          { label: "Total Staff",     value: employees.length,                         icon: "👥", color: "#9333ea" },
          { label: "Active",          value: active,                                   icon: "🟢", color: "#10b981" },
          { label: "Inactive",        value: employees.length - active,                icon: "🔴", color: "#ef4444" },
          { label: "Monthly Payroll", value: `${(totalSalary / 1000).toFixed(0)}K PKR`, icon: "💰", color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding: ".85rem .95rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: `${s.color}1a`, border: `1px solid ${s.color}2e`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>{s.icon}</div>
            <div>
              <p style={{ color: "rgba(255,255,255,.27)", fontSize: ".6rem", letterSpacing: ".1em", textTransform: "uppercase", margin: "0 0 1px" }}>{s.label}</p>
              <p style={{ color: "white", fontSize: "1.25rem", fontWeight: 700, fontFamily: "'Cormorant Garamond',serif", margin: 0, lineHeight: 1 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Role filter pills ── */}
      <div style={{ display: "flex", gap: ".32rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {["All", ...ROLES].map(r => {
          const m = r !== "All" ? ROLE_META[r] : null;
          const on = roleFilter === r;
          return (
            <button key={r} onClick={() => setRoleFilter(r)} style={{
              padding: ".28rem .72rem", borderRadius: "999px", fontSize: ".71rem",
              fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, cursor: "pointer",
              border: `1px solid ${on ? (m?.border || "rgba(147,51,234,.5)") : "rgba(139,92,246,.15)"}`,
              background: on ? (m ? m.bg : "rgba(109,40,217,.22)") : "transparent",
              color: on ? (m?.color || "white") : "rgba(196,139,252,.42)",
              transition: "all .13s", display: "flex", alignItems: "center", gap: ".27rem",
            }}>
              {m && <span style={{ fontSize: ".74rem" }}>{m.icon}</span>}
              <span style={{ textTransform: "capitalize" }}>{r}</span>
              <span style={{ background: on ? "rgba(255,255,255,.15)" : "rgba(139,92,246,.12)", borderRadius: "999px", padding: "0 5px", fontSize: ".59rem", fontWeight: 700 }}>
                {roleCounts[r] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Employee list ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "rgba(255,255,255,.17)" }}>
          <div style={{ fontSize: "2.2rem", marginBottom: ".7rem", opacity: .25 }}>👥</div>
          Loading employees…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 2rem", border: "1px solid rgba(139,92,246,.09)", borderRadius: "13px" }}>
          <p style={{ fontSize: "2rem", marginBottom: ".6rem" }}>🔍</p>
          <p style={{ color: "rgba(255,255,255,.2)", fontSize: ".86rem", marginBottom: ".9rem" }}>
            {employees.length === 0 ? "No employees yet. Add your first team member." : "No employees match your search."}
          </p>
          {employees.length === 0 && (
            <button style={{ padding: ".58rem 1.2rem", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#6d28d9,#9333ea)", color: "white", fontWeight: 600, fontSize: ".82rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
              onClick={() => setModal("new")}>
              + Add First Employee
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
            {paginated.map(emp => {
              const m = ROLE_META[emp.role] || ROLE_META.waiter;
              const joined = emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString("en-PK", { month: "short", year: "numeric" }) : "—";
              return (
                <div key={emp._id} className="emp-row" onClick={() => setViewEmp(emp)}>
                  <div style={{ width: 3, height: 36, borderRadius: 3, flexShrink: 0, background: emp.isActive ? "#10b981" : "#ef4444" }} />
                  <Avatar employee={emp} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".35rem", marginBottom: "2px", flexWrap: "wrap" }}>
                      <span style={{ color: "white", fontWeight: 600, fontSize: ".84rem" }}>{emp.name}</span>
                      <span style={{ padding: "1px 7px", borderRadius: "999px", fontSize: ".59rem", fontWeight: 700, textTransform: "capitalize", background: m.bg, color: m.color, border: `1px solid ${m.border}` }}>{m.icon} {emp.role}</span>
                      {!emp.isActive && <span style={{ padding: "1px 7px", borderRadius: "999px", fontSize: ".59rem", fontWeight: 700, background: "rgba(239,68,68,.09)", color: "#f87171", border: "1px solid rgba(239,68,68,.2)" }}>Inactive</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: ".28rem", flexWrap: "wrap" }}>
                      <span style={{ color: "rgba(255,255,255,.3)", fontSize: ".7rem" }}>{emp.email}</span>
                      {emp.phone && <><span style={{ color: "rgba(255,255,255,.1)", fontSize: ".62rem" }}>·</span><span style={{ color: "rgba(255,255,255,.25)", fontSize: ".7rem" }}>{emp.phone}</span></>}
                      {emp.salary > 0 && <><span style={{ color: "rgba(255,255,255,.1)", fontSize: ".62rem" }}>·</span><span style={{ color: "rgba(245,158,11,.58)", fontSize: ".68rem", fontWeight: 600 }}>PKR {Number(emp.salary).toLocaleString()}/mo</span></>}
                      <span style={{ color: "rgba(255,255,255,.1)", fontSize: ".62rem" }}>·</span>
                      <span style={{ color: "rgba(255,255,255,.18)", fontSize: ".68rem" }}>Since {joined}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: ".28rem", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => setModal(emp)} style={{ padding: ".26rem .6rem", borderRadius: "6px", border: "1px solid rgba(167,139,250,.18)", background: "transparent", color: "#c084fc", fontSize: ".7rem", fontFamily: "'Plus Jakarta Sans',sans-serif", cursor: "pointer" }}>✏</button>
                    <button onClick={() => handleDelete(emp._id)} style={{ padding: ".26rem .6rem", borderRadius: "6px", border: "1px solid rgba(239,68,68,.16)", background: "rgba(239,68,68,.06)", color: "#f87171", fontSize: ".7rem", fontFamily: "'Plus Jakarta Sans',sans-serif", cursor: "pointer" }}>🗑</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: ".32rem", marginTop: "1.3rem", flexWrap: "wrap" }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: ".32rem .72rem", borderRadius: "7px", fontSize: ".72rem", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, cursor: page === 1 ? "not-allowed" : "pointer", border: "1px solid rgba(139,92,246,.17)", background: "transparent", color: page === 1 ? "rgba(196,139,252,.15)" : "#c084fc" }}>
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  style={{ width: 29, height: 29, borderRadius: "7px", fontSize: ".72rem", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, cursor: "pointer", border: `1px solid ${page === n ? "rgba(147,51,234,.46)" : "rgba(139,92,246,.13)"}`, background: page === n ? "linear-gradient(135deg,rgba(109,40,217,.4),rgba(147,51,234,.25))" : "transparent", color: page === n ? "white" : "rgba(196,139,252,.36)" }}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ padding: ".32rem .72rem", borderRadius: "7px", fontSize: ".72rem", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, cursor: page === totalPages ? "not-allowed" : "pointer", border: "1px solid rgba(139,92,246,.17)", background: "transparent", color: page === totalPages ? "rgba(196,139,252,.15)" : "#c084fc" }}>
                Next →
              </button>
            </div>
          )}
          <p style={{ textAlign: "center", color: "rgba(255,255,255,.13)", fontSize: ".67rem", marginTop: ".42rem" }}>
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </p>
        </>
      )}

      {/* Modals */}
      {(modal === "new" || modal?._id) && (
        <EmployeeModal employee={modal === "new" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {viewEmp && (
        <EmployeeViewModal employee={viewEmp} onClose={() => setViewEmp(null)} onEdit={emp => { setViewEmp(null); setModal(emp); }} />
      )}
    </div>
  );
}