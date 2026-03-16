// ─── Shared theme constants for the admin panel ───────────────────────────────

export const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');`;

export const statusColor = {
  Pending:   "#f59e0b",
  Confirmed: "#10b981",
  Cancelled: "#ef4444",
  Completed: "#818cf8",
};
export const statusBg = {
  Pending:   "rgba(245,158,11,0.12)",
  Confirmed: "rgba(16,185,129,0.12)",
  Cancelled: "rgba(239,68,68,0.12)",
  Completed: "rgba(129,140,248,0.12)",
};
export const statusBorder = {
  Pending:   "rgba(245,158,11,0.3)",
  Confirmed: "rgba(16,185,129,0.3)",
  Cancelled: "rgba(239,68,68,0.3)",
  Completed: "rgba(129,140,248,0.3)",
};

// Returns "Completed" if Confirmed and event date has passed, otherwise the real status
export const getDisplayStatus = (booking) => {
  if (
    booking?.status === "Confirmed" &&
    booking?.eventDate &&
    new Date(booking.eventDate) < new Date(new Date().setHours(0, 0, 0, 0))
  ) return "Completed";
  return booking?.status || "Pending";
};

export const btnPrimary = {
  padding: "0.6rem 1.35rem", borderRadius: "10px", border: "none",
  background: "linear-gradient(135deg,#6d28d9,#9333ea)",
  color: "white", fontWeight: 600, fontSize: "0.85rem",
  cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif",
  transition: "transform 0.15s, box-shadow 0.15s",
  letterSpacing: "0.01em",
};
export const btnDanger = {
  padding: "0.38rem 0.85rem", borderRadius: "8px",
  background: "rgba(239,68,68,0.1)", color: "#f87171",
  fontSize: "0.76rem", cursor: "pointer",
  border: "1px solid rgba(239,68,68,0.22)",
  fontFamily: "'Plus Jakarta Sans',sans-serif",
};
export const btnGhost = {
  padding: "0.38rem 0.85rem", borderRadius: "8px",
  background: "transparent", color: "#c084fc",
  fontSize: "0.76rem", cursor: "pointer",
  border: "1px solid rgba(167,139,250,0.25)",
  fontFamily: "'Plus Jakarta Sans',sans-serif",
};
export const cardBase = {
  background: "linear-gradient(135deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.015) 100%)",
  border: "1px solid rgba(167,139,250,0.13)",
  borderRadius: "18px",
};

export const ADMIN_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .admin-wrap { background: #080618; min-height: 100vh; color: white; font-family: 'Plus Jakarta Sans',sans-serif; }
  .admin-layout { display: flex; min-height: 100vh; }

  /* ── Sidebar ── */
  .admin-sidebar {
    width: 248px; flex-shrink: 0; position: sticky; top: 0; height: 100vh;
    background: linear-gradient(180deg,#0e0b24 0%,#080618 100%);
    border-right: 1px solid rgba(139,92,246,0.1);
    display: flex; flex-direction: column; padding: 1.75rem 1.1rem;
    transition: transform 0.3s ease; z-index: 100;
  }
  .admin-main {
    flex: 1; padding: 2.25rem 2rem; overflow-y: auto; min-width: 0;
    background: linear-gradient(160deg,#0a0820 0%,#080618 60%);
  }
  .admin-topbar {
    display: none; position: sticky; top: 0; z-index: 200;
    background: #0a0820; border-bottom: 1px solid rgba(139,92,246,0.12);
    padding: 0.85rem 1.1rem; align-items: center; justify-content: space-between;
  }
  .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 99; }

  /* ── Nav buttons ── */
  .nav-btn {
    width: 100%; display: flex; align-items: center; gap: 0.8rem;
    padding: 0.72rem 0.9rem; border-radius: 12px; margin-bottom: 3px;
    border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500;
    text-align: left; transition: all 0.18s; background: transparent;
    color: rgba(255,255,255,0.4); font-family: 'Plus Jakarta Sans',sans-serif;
    letter-spacing: 0.01em;
  }
  .nav-btn:hover { background: rgba(109,40,217,0.18); color: rgba(255,255,255,0.8); }
  .nav-btn.active {
    background: linear-gradient(135deg,rgba(109,40,217,0.35),rgba(147,51,234,0.2));
    color: white; border-left: 3px solid #9333ea;
    box-shadow: inset 0 0 20px rgba(109,40,217,0.1);
  }

  /* ── Inputs ── */
  .a-input {
    width: 100%; padding: 0.7rem 1rem; border-radius: 11px;
    background: rgba(255,255,255,0.05); color: white; font-size: 0.875rem;
    outline: none; border: 1px solid rgba(139,92,246,0.2);
    font-family: 'Plus Jakarta Sans',sans-serif; transition: border-color 0.2s;
    letter-spacing: 0.01em;
  }
  .a-input:focus { border-color: rgba(147,51,234,0.55); background: rgba(255,255,255,0.07); }
  .a-label {
    display: block; font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: rgba(196,139,252,0.65); margin-bottom: 0.38rem;
  }

  /* ── Booking card ── */
  .bk-card {
    background: linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015));
    border: 1px solid rgba(139,92,246,0.12); border-radius: 16px;
    padding: 1.1rem 1.3rem; cursor: pointer;
    transition: all 0.2s ease; position: relative; overflow: hidden;
  }
  .bk-card::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
    background: transparent; transition: background 0.2s; border-radius: 16px 0 0 16px;
  }
  .bk-card:hover { border-color: rgba(147,51,234,0.38); background: rgba(109,40,217,0.08); transform: translateY(-1px); box-shadow: 0 6px 28px rgba(0,0,0,0.25); }
  .bk-card:hover::before { background: linear-gradient(180deg,#9333ea,#6d28d9); }

  /* ── Hall card ── */
  .hall-card { border-radius: 18px; overflow: hidden; border: 1px solid rgba(139,92,246,0.13); background: rgba(255,255,255,0.025); transition: all 0.22s; }
  .hall-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(109,40,217,0.22); border-color: rgba(147,51,234,0.35); }

  /* ── Stat card ── */
  .stat-card {
    border-radius: 18px; padding: 1.3rem 1.4rem;
    border: 1px solid rgba(139,92,246,0.13);
    background: linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01));
    display: flex; align-items: center; gap: 1.1rem;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(109,40,217,0.16); }

  /* ── Badge ── */
  .badge {
    display: inline-flex; align-items: center; padding: 3px 10px;
    border-radius: 999px; font-size: 0.67rem; font-weight: 600;
    letter-spacing: 0.06em; text-transform: uppercase;
  }

  /* ── Calendar ── */
  .cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 5px; }
  .cal-day {
    aspect-ratio: 1; border-radius: 11px; display: flex; flex-direction: column;
    align-items: center; justify-content: center; cursor: pointer;
    border: 1px solid transparent; transition: all 0.15s; position: relative;
    font-size: 0.82rem; color: rgba(255,255,255,0.72);
  }
  .cal-day:hover { border-color: rgba(147,51,234,0.4); background: rgba(109,40,217,0.14); }
  .cal-day.today { border-color: rgba(147,51,234,0.6) !important; color: #c084fc; font-weight: 700; }
  .cal-day.selected { background: linear-gradient(135deg,rgba(109,40,217,0.4),rgba(147,51,234,0.25)) !important; border-color: #9333ea !important; color: white; font-weight: 600; }
  .cal-day.has-booking { background: rgba(109,40,217,0.2); border-color: rgba(147,51,234,0.3); }
  .cal-day.full { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.3); color: rgba(248,113,113,0.85); }
  .cal-day.other-month { opacity: 0.28; pointer-events: none; }

  /* ── Modal ── */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 400;
    background: rgba(4,3,14,0.7);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 1rem;
    animation: fadeIn 0.18s ease;
  }
  .modal-box {
    width: 100%; max-width: 520px; border-radius: 24px;
    background: linear-gradient(145deg,#12093a,#0d0726);
    border: 1px solid rgba(147,51,234,0.28);
    max-height: 90vh; overflow-y: auto; position: relative;
    box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(147,51,234,0.1);
    animation: slideUp 0.22s ease;
  }
  .modal-box::-webkit-scrollbar { width: 3px; }
  .modal-box::-webkit-scrollbar-thumb { background: rgba(147,51,234,0.3); border-radius: 2px; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(18px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .admin-layout { flex-direction: column; }
    .admin-topbar { display: flex; }
    .admin-sidebar { position: fixed; top: 0; left: 0; height: 100vh; width: 260px; transform: translateX(-100%); z-index: 200; }
    .admin-sidebar.open { transform: translateX(0); }
    .sidebar-overlay.open { display: block; }
    .admin-main { padding: 1.1rem; }
    .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
    .charts-row { grid-template-columns: 1fr !important; }
    .dash-bottom { grid-template-columns: 1fr !important; }
    .cal-layout { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 480px) {
    .stats-grid { grid-template-columns: 1fr !important; }
    .bk-row { flex-direction: column !important; }
    .bk-actions { justify-content: flex-start !important; flex-wrap: wrap; }
    .filter-row { flex-wrap: wrap; }
    .halls-grid { grid-template-columns: 1fr !important; }
    .modal-box { border-radius: 18px; }
    .cal-grid { gap: 3px; }
  }
`;