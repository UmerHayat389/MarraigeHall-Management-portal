// ─── Shared theme constants for the admin panel ───────────────────────────────

export const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@400;600;700&display=swap');`;

export const statusColor = {
  Pending:   "#f59e0b",
  Confirmed: "#10b981",
  Cancelled: "#ef4444",
  Completed: "#38bdf8",
};
export const statusBg = {
  Pending:   "rgba(245,158,11,0.15)",
  Confirmed: "rgba(16,185,129,0.15)",
  Cancelled: "rgba(239,68,68,0.15)",
  Completed: "rgba(56,189,248,0.15)",
};
export const statusBorder = {
  Pending:   "rgba(245,158,11,0.5)",
  Confirmed: "rgba(16,185,129,0.5)",
  Cancelled: "rgba(239,68,68,0.5)",
  Completed: "rgba(56,189,248,0.5)",
};

export const getDisplayStatus = (booking) => {
  if (
    booking?.status === "Confirmed" &&
    booking?.eventDate &&
    new Date(booking.eventDate) < new Date(new Date().setHours(0, 0, 0, 0))
  ) return "Completed";
  return booking?.status || "Pending";
};

export const btnPrimary = {
  padding: "0.6rem 1.35rem", borderRadius: "8px", border: "none",
  background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
  color: "white", fontWeight: 600, fontSize: "0.85rem",
  cursor: "pointer", fontFamily: "'Inter',sans-serif",
  transition: "transform 0.15s, box-shadow 0.15s",
  letterSpacing: "0.01em",
};
export const btnDanger = {
  padding: "0.38rem 0.85rem", borderRadius: "6px",
  background: "rgba(239,68,68,0.12)", color: "#fca5a5",
  fontSize: "0.76rem", cursor: "pointer",
  border: "1px solid rgba(239,68,68,0.4)",
  fontFamily: "'Inter',sans-serif",
};
export const btnGhost = {
  padding: "0.38rem 0.85rem", borderRadius: "6px",
  background: "rgba(99,102,241,0.1)", color: "#a5b4fc",
  fontSize: "0.76rem", cursor: "pointer",
  border: "1px solid rgba(99,102,241,0.4)",
  fontFamily: "'Inter',sans-serif",
};
export const cardBase = {
  background: "#1e2433",
  border: "1px solid #2d3548",
  borderRadius: "12px",
};

export const ADMIN_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body, #root { height: 100%; overflow: hidden; }

  .admin-wrap {
    background: #111827;
    height: 100vh; overflow: hidden;
    color: #f1f5f9;
    font-family: 'Inter', sans-serif;
    display: flex; flex-direction: column;
  }
  .admin-layout { display: flex; flex: 1; min-height: 0; overflow: hidden; }

  .admin-sidebar {
    width: 240px; flex-shrink: 0; height: 100%;
    background: #0f1623;
    border-right: 1px solid #2d3548;
    display: flex; flex-direction: column;
    padding: 1.5rem 1rem; overflow: hidden;
    transition: transform 0.3s ease; z-index: 100;
  }
  .admin-sidebar nav { flex: 1; overflow-y: auto; overflow-x: hidden; min-height: 0; }
  .admin-sidebar nav::-webkit-scrollbar { width: 2px; }
  .admin-sidebar nav::-webkit-scrollbar-thumb { background: #3a4560; border-radius: 2px; }

  .admin-main {
    flex: 1; padding: 2rem; overflow-y: auto; overflow-x: hidden;
    min-width: 0; min-height: 0; background: #111827;
  }
  .admin-main::-webkit-scrollbar { width: 4px; }
  .admin-main::-webkit-scrollbar-thumb { background: #3a4560; border-radius: 2px; }

  .admin-topbar {
    display: none; flex-shrink: 0;
    position: sticky; top: 0; z-index: 200;
    background: #0f1623; border-bottom: 1px solid #2d3548;
    padding: 0.85rem 1.1rem;
    align-items: center; justify-content: space-between;
  }
  .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 99; }

  .nav-btn {
    width: 100%; display: flex; align-items: center; gap: 0.75rem;
    padding: 0.65rem 0.85rem; border-radius: 8px; margin-bottom: 2px;
    border: none; cursor: pointer; font-size: 0.84rem; font-weight: 500;
    text-align: left; transition: all 0.15s; background: transparent;
    color: #94a3b8; font-family: 'Inter', sans-serif;
  }
  .nav-btn:hover { background: rgba(99,102,241,0.15); color: #e2e8f0; }
  .nav-btn.active {
    background: rgba(99,102,241,0.22);
    color: #f1f5f9; border-left: 3px solid #6366f1; font-weight: 600;
  }

  .a-input {
    width: 100%; padding: 0.65rem 0.9rem; border-radius: 8px;
    background: #252d3d; color: #f1f5f9; font-size: 0.875rem;
    outline: none; border: 1px solid #3a4560;
    font-family: 'Inter', sans-serif; transition: border-color 0.2s;
  }
  .a-input:focus { border-color: #6366f1; background: #2a3347; }
  .a-label {
    display: block; font-size: 0.7rem; font-weight: 600;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: #94a3b8; margin-bottom: 0.4rem;
  }

  .bk-card {
    background: #1e2433; border: 1px solid #2d3548; border-radius: 10px;
    padding: 1rem 1.2rem; cursor: pointer;
    transition: all 0.18s ease; position: relative; overflow: hidden;
  }
  .bk-card::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
    background: transparent; transition: background 0.2s; border-radius: 10px 0 0 10px;
  }
  .bk-card:hover { border-color: #6366f1; background: #252d3d; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
  .bk-card:hover::before { background: linear-gradient(180deg,#6366f1,#8b5cf6); }

  .hall-card { border-radius: 12px; overflow: hidden; border: 1px solid #2d3548; background: #1e2433; transition: all 0.2s; }
  .hall-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); border-color: #6366f1; }

  .stat-card {
    border-radius: 12px; padding: 1.2rem 1.3rem;
    border: 1px solid #2d3548; background: #1e2433;
    display: flex; align-items: center; gap: 1rem;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); border-color: #3a4560; }

  .badge {
    display: inline-flex; align-items: center; padding: 3px 10px;
    border-radius: 999px; font-size: 0.67rem; font-weight: 700;
    letter-spacing: 0.05em; text-transform: uppercase;
  }

  .cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 4px; }
  .cal-day {
    aspect-ratio: 1; border-radius: 8px; display: flex; flex-direction: column;
    align-items: center; justify-content: center; cursor: pointer;
    border: 1px solid transparent; transition: all 0.12s; position: relative;
    font-size: 0.82rem; color: #cbd5e1;
  }
  .cal-day:hover { border-color: #6366f1; background: rgba(99,102,241,0.12); }
  .cal-day.today { border-color: #6366f1 !important; color: #a5b4fc; font-weight: 700; background: rgba(99,102,241,0.1); }
  .cal-day.selected { background: rgba(99,102,241,0.28) !important; border-color: #6366f1 !important; color: white; font-weight: 600; }
  .cal-day.has-booking { background: rgba(99,102,241,0.18); border-color: rgba(99,102,241,0.6); }
  .cal-day.full { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.5); color: #fca5a5; }
  .cal-day.other-month { opacity: 0.25; pointer-events: none; }

  .modal-overlay {
    position: fixed; inset: 0; z-index: 400;
    background: rgba(0,0,0,0.78); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 1rem;
    animation: fadeIn 0.15s ease;
  }
  .modal-box {
    width: 100%; max-width: 520px; border-radius: 16px;
    background: #1e2433; border: 1px solid #3a4560;
    max-height: 90vh; overflow-y: auto; position: relative;
    box-shadow: 0 24px 60px rgba(0,0,0,0.65);
    animation: slideUp 0.2s ease;
  }
  .modal-box::-webkit-scrollbar { width: 3px; }
  .modal-box::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 2px; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

  @media (max-width: 768px) {
    html, body, #root { height: auto; overflow: auto; }
    .admin-wrap   { height: auto; overflow: visible; flex-direction: column; }
    .admin-layout { flex-direction: column; overflow: visible; height: auto; }
    .admin-topbar { display: flex; }
    .admin-sidebar { position: fixed; top: 0; left: 0; height: 100vh; width: 240px; transform: translateX(-100%); z-index: 200; overflow-y: auto; }
    .admin-sidebar.open { transform: translateX(0); }
    .sidebar-overlay.open { display: block; }
    .admin-main { padding: 1rem; overflow-y: visible; height: auto; }
    .stats-grid   { grid-template-columns: repeat(2,1fr) !important; }
    .charts-row   { grid-template-columns: 1fr !important; }
    .dash-bottom  { grid-template-columns: 1fr !important; }
    .cal-layout   { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 480px) {
    .stats-grid  { grid-template-columns: 1fr !important; }
    .bk-row      { flex-direction: column !important; }
    .bk-actions  { justify-content: flex-start !important; flex-wrap: wrap; }
    .filter-row  { flex-wrap: wrap; }
    .halls-grid  { grid-template-columns: 1fr !important; }
    .modal-box   { border-radius: 12px; }
    .cal-grid    { gap: 2px; }
  }
`;