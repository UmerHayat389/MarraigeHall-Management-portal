import React, { useState } from "react";
import api from "../services/api";

export default function AdminLogin({ onLogin }) {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(""); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Please enter email and password"); return; }
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      if (res.data.success) {
        const user = res.data.user;
        if (user.role !== "admin") {
          setError("Access denied. Admin only.");
          setLoading(false);
          return;
        }
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("adminUser",  JSON.stringify(user));
        onLogin(user);
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error. Check your connection.");
    }
    setLoading(false);
  };

  const inputStyle = (hasErr) => ({
    width: "100%", padding: "0.75rem 1rem", borderRadius: "12px",
    background: "rgba(255,255,255,0.05)", color: "white", fontSize: "0.9rem",
    outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box",
    border: `1px solid ${hasErr ? "rgba(239,68,68,0.5)" : "rgba(167,139,250,0.2)"}`,
    transition: "border-color 0.2s",
  });

  return (
    <div style={{
      background: "#07050f", minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans',sans-serif", padding: "1rem",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      {/* Background glow */}
      <div style={{ position: "fixed", top: "20%", left: "30%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.12),transparent)", filter: "blur(60px)", pointerEvents: "none" }} />

      <div style={{
        width: "100%", maxWidth: 420,
        background: "linear-gradient(145deg,#1a1035,#120d2a)",
        border: "1px solid rgba(167,139,250,0.2)",
        borderRadius: "24px", padding: "2.5rem",
        position: "relative",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", marginBottom: "0.25rem" }}>
            <span style={{ color: "#a855f7" }}>Noor</span>
            <span style={{ color: "white" }}> Mahal</span>
          </p>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase" }}>
            Admin Portal
          </p>
          <div style={{ width: 40, height: 1, background: "rgba(167,139,250,0.3)", margin: "1rem auto 0" }} />
        </div>

        <h2 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: "1.3rem", fontWeight: 400, marginBottom: "0.25rem" }}>
          Welcome back
        </h2>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.82rem", marginBottom: "1.75rem" }}>
          Sign in to manage halls and bookings
        </p>

        <form onSubmit={submit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(192,132,252,0.7)", marginBottom: "0.4rem" }}>
              Email Address
            </label>
            <input
              type="email"
              style={inputStyle(!!error)}
              placeholder="umer@gmail.com"
              value={form.email}
              onChange={e => set("email", e.target.value)}
              onFocus={e => e.target.style.borderColor = "rgba(167,139,250,0.5)"}
              onBlur={e => e.target.style.borderColor = error ? "rgba(239,68,68,0.5)" : "rgba(167,139,250,0.2)"}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(192,132,252,0.7)", marginBottom: "0.4rem" }}>
              Password
            </label>
            <input
              type="password"
              style={inputStyle(!!error)}
              placeholder="••••••••"
              value={form.password}
              onChange={e => set("password", e.target.value)}
              onFocus={e => e.target.style.borderColor = "rgba(167,139,250,0.5)"}
              onBlur={e => e.target.style.borderColor = error ? "rgba(239,68,68,0.5)" : "rgba(167,139,250,0.2)"}
            />
          </div>

          {error && (
            <div style={{
              padding: "0.65rem 0.875rem", borderRadius: "10px", marginBottom: "1.25rem",
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
              color: "#f87171", fontSize: "0.82rem",
            }}>
              ✕ {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "0.85rem", borderRadius: "12px", border: "none",
            background: "linear-gradient(135deg,#7c3aed,#a855f7)",
            color: "white", fontWeight: 600, fontSize: "0.9rem",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "transform 0.2s, opacity 0.2s",
            fontFamily: "'DM Sans',sans-serif",
          }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "scale(1.01)"; }}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <a href="/" style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8rem", textDecoration: "none" }}
            onMouseEnter={e => e.target.style.color = "#c084fc"}
            onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.25)"}
          >
            ← Back to site
          </a>
        </p>
      </div>
    </div>
  );
}