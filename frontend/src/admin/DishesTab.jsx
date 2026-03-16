import React, { useState, useEffect } from "react";
import api from "../services/api";
import { btnPrimary, btnGhost, btnDanger } from "./adminTheme";

const CATEGORIES = ["Starter Menu", "Main Course Menu", "Dessert Menu", "Drinks Menu"];
const CATEGORY_ICONS = {
  "Starter Menu": "🥗",
  "Main Course Menu": "🍛",
  "Dessert Menu": "🍰",
  "Drinks Menu": "🥤",
};

function DishModal({ dish, onClose, onSave }) {
  const [form, setForm] = useState(dish || { name: "", category: "", description: "" });
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);
  
  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErr(e => ({ ...e, [k]: "" }));
  };

  const submit = async () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.category) e.category = "Required";
    if (Object.keys(e).length) {
      setErr(e);
      return;
    }
    setLoading(true);
    try {
      const res = dish?._id
        ? await api.put(`/dishes/${dish._id}`, form)
        : await api.post("/dishes", form);
      onSave(res.data.dish, !dish?._id);
    } catch (ex) {
      setErr({ submit: ex.response?.data?.message || "Error saving" });
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 500 }}>
        <div style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", color: "white", fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>
              {dish?._id ? "Edit Dish" : "Add New Dish"}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                color: "rgba(255,255,255,0.5)",
                fontSize: "1rem",
                cursor: "pointer",
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="a-label">Dish Name *</label>
              <input
                className="a-input"
                value={form.name}
                onChange={e => set("name", e.target.value)}
                placeholder="e.g. Paneer Tikka"
              />
              {err.name && <p style={{ color: "#f87171", fontSize: "0.72rem", marginTop: 3 }}>{err.name}</p>}
            </div>

            <div>
              <label className="a-label">Category *</label>
              <select
                className="a-input"
                value={form.category}
                onChange={e => set("category", e.target.value)}
                style={{ cursor: "pointer" }}
              >
                <option value="">Select category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {CATEGORY_ICONS[cat]} {cat}
                  </option>
                ))}
              </select>
              {err.category && <p style={{ color: "#f87171", fontSize: "0.72rem", marginTop: 3 }}>{err.category}</p>}
            </div>

            <div>
              <label className="a-label">Description (Optional)</label>
              <textarea
                className="a-input"
                style={{ resize: "vertical", minHeight: 80 }}
                value={form.description}
                onChange={e => set("description", e.target.value)}
                placeholder="Brief description of the dish..."
              />
            </div>
          </div>

          {err.submit && (
            <p style={{ color: "#f87171", fontSize: "0.8rem", margin: "0.75rem 0", textAlign: "center" }}>
              {err.submit}
            </p>
          )}

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.4rem" }}>
            <button style={btnGhost} onClick={onClose}>
              Cancel
            </button>
            <button
              style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}
              onClick={submit}
              disabled={loading}
            >
              {loading ? "Saving…" : dish?._id ? "Save Changes" : "Add Dish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DishesTab({ toast }) {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    api.get("/dishes")
      .then(r => setDishes(r.data.dishes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (dish, isNew) => {
    if (isNew) setDishes(h => [dish, ...h]);
    else setDishes(h => h.map(x => x._id === dish._id ? dish : x));
    setModal(null);
    toast(isNew ? "Dish added successfully" : "Dish updated", "success");
  };

  const deleteDish = async id => {
    if (!window.confirm("Delete this dish?")) return;
    try {
      await api.delete(`/dishes/${id}`);
      setDishes(h => h.filter(x => x._id !== id));
      toast("Dish deleted", "success");
    } catch {
      toast("Failed to delete", "error");
    }
  };

  const filtered = filter === "All" ? dishes : dishes.filter(d => d.category === filter);
  
  const counts = {
    All: dishes.length,
    ...CATEGORIES.reduce((acc, cat) => {
      acc[cat] = dishes.filter(d => d.category === cat).length;
      return acc;
    }, {}),
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", color: "white", fontSize: "1.75rem", fontWeight: 600, margin: "0 0 4px" }}>
            Manage <em style={{ color: "#9333ea", fontStyle: "italic" }}>Dishes</em>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", margin: 0 }}>
            {filtered.length !== dishes.length ? `${filtered.length} of ${dishes.length} dishes` : `${dishes.length} total dish${dishes.length !== 1 ? 'es' : ''}`}
          </p>
        </div>
        <button
          style={btnPrimary}
          onClick={() => setModal("new")}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(109,40,217,0.4)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "";
            e.currentTarget.style.boxShadow = "";
          }}
        >
          + Add Dish
        </button>
      </div>

      {/* Category Filter */}
      <div className="filter-row" style={{ display: "flex", gap: "0.4rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {["All", ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: "0.38rem 0.9rem",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              fontWeight: 600,
              border: `1px solid ${filter === cat ? "rgba(147,51,234,0.55)" : "rgba(139,92,246,0.18)"}`,
              background: filter === cat ? "linear-gradient(135deg,rgba(109,40,217,0.4),rgba(147,51,234,0.25))" : "transparent",
              color: filter === cat ? "white" : "rgba(196,139,252,0.55)",
              cursor: "pointer",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            {cat !== "All" && <span>{CATEGORY_ICONS[cat]}</span>}
            {cat}
            <span
              style={{
                background: filter === cat ? "rgba(255,255,255,0.2)" : "rgba(139,92,246,0.2)",
                borderRadius: "999px",
                padding: "0 5px",
                fontSize: "0.65rem",
                fontWeight: 700,
              }}
            >
              {counts[cat]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "rgba(255,255,255,0.25)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem", opacity: 0.4 }}>🍽️</div>
          Loading dishes…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", border: "1px solid rgba(139,92,246,0.12)", borderRadius: "18px" }}>
          <p style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🍽️</p>
          <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "1.25rem" }}>
            {filter === "All" ? "No dishes yet. Add your first dish." : `No dishes in ${filter}`}
          </p>
          <button style={btnPrimary} onClick={() => setModal("new")}>
            + Add First Dish
          </button>
        </div>
      ) : (
        <div className="dishes-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1rem" }}>
          {CATEGORIES.filter(cat => filter === "All" || filter === cat).map(category => {
            const categoryDishes = filtered.filter(d => d.category === category);
            if (categoryDishes.length === 0 && filter === "All") return null;

            return (
              <div key={category} style={{ gridColumn: filter === "All" ? "1/-1" : "auto" }}>
                {filter === "All" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "1.5rem" }}>{CATEGORY_ICONS[category]}</span>
                    <h3 style={{ fontFamily: "'Cormorant Garamond',serif", color: "white", fontSize: "1.3rem", fontWeight: 600, margin: 0 }}>
                      {category}
                    </h3>
                    <div style={{ flex: 1, height: "1px", background: "rgba(167,139,250,0.12)" }} />
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>
                      {categoryDishes.length} dish{categoryDishes.length !== 1 ? 'es' : ''}
                    </span>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: filter === "All" ? "repeat(auto-fill,minmax(260px,1fr))" : "repeat(auto-fill,minmax(280px,1fr))", gap: "0.85rem" }}>
                  {categoryDishes.map(dish => (
                    <div
                      key={dish._id}
                      style={{
                        borderRadius: "16px",
                        overflow: "hidden",
                        border: "1px solid rgba(139,92,246,0.15)",
                        background: "linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))",
                        transition: "all 0.2s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 12px 32px rgba(109,40,217,0.18)";
                        e.currentTarget.style.borderColor = "rgba(147,51,234,0.35)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.borderColor = "rgba(139,92,246,0.15)";
                      }}
                    >
                      {/* Category color bar */}
                      <div style={{ height: "3px", background: "linear-gradient(90deg,#9333ea,#a855f7)" }} />

                      <div style={{ padding: "1.15rem" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ fontFamily: "'Cormorant Garamond',serif", color: "white", fontSize: "1.1rem", fontWeight: 600, margin: "0 0 0.25rem", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {dish.name}
                            </h4>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                              <span style={{ fontSize: "0.85rem" }}>{CATEGORY_ICONS[dish.category]}</span>
                              <span style={{ background: "rgba(147,51,234,0.12)", border: "1px solid rgba(147,51,234,0.28)", borderRadius: "999px", padding: "2px 8px", color: "#c084fc", fontSize: "0.65rem", fontWeight: 600 }}>
                                {dish.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        {dish.description && (
                          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem", margin: "0 0 1rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {dish.description}
                          </p>
                        )}

                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.85rem" }}>
                          <button
                            style={btnGhost}
                            onClick={() => setModal(dish)}
                          >
                            ✏ Edit
                          </button>
                          <button
                            style={btnDanger}
                            onClick={() => deleteDish(dish._id)}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(modal === "new" || modal?._id) && (
        <DishModal
          dish={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}