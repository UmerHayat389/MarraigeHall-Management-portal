import React, { useEffect } from "react";

export default function AdminToast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, []);
  const isSuccess = type === "success";
  return (
    <div style={{
      position:"fixed", bottom:"1.5rem", right:"1.5rem", zIndex:9999,
      padding:"0.85rem 1.35rem", borderRadius:"14px", fontSize:"0.86rem",
      fontFamily:"'Inter',sans-serif", fontWeight:500,
      background: isSuccess ? "rgba(10,185,129,0.1)" : "rgba(239,68,68,0.1)",
      border:`1px solid ${isSuccess?"rgba(16,185,129,0.38)":"rgba(239,68,68,0.38)"}`,
      color: isSuccess ? "#34d399" : "#f87171",
      backdropFilter:"blur(16px)",
      boxShadow:"0 8px 32px rgba(0,0,0,0.45)",
      display:"flex", alignItems:"center", gap:"0.6rem",
      animation:"slideInToast 0.25s ease",
    }}>
      <style>{`@keyframes slideInToast { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
      <span style={{ fontSize:"1rem" }}>{isSuccess?"✓":"✕"}</span>
      {msg}
    </div>
  );
}