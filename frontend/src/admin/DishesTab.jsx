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

const DROPDOWN_ANIM = `
@keyframes dropIn {
  from { opacity: 0; transform: translateY(-8px) scaleY(0.92); }
  to   { opacity: 1; transform: translateY(0)    scaleY(1);    }
}`;

const CAT_COLORS = {
  "Starter Menu":     { dot:"#06b6d4", bg:"rgba(6,182,212,0.12)",  border:"rgba(6,182,212,0.35)",  text:"#67e8f9" },
  "Main Course Menu": { dot:"#f59e0b", bg:"rgba(245,158,11,0.12)", border:"rgba(245,158,11,0.35)", text:"#fcd34d" },
  "Dessert Menu":     { dot:"#ec4899", bg:"rgba(236,72,153,0.12)", border:"rgba(236,72,153,0.35)", text:"#f9a8d4" },
  "Drinks Menu":      { dot:"#10b981", bg:"rgba(16,185,129,0.12)", border:"rgba(16,185,129,0.35)", text:"#6ee7b7" },
};

/* ── Custom category dropdown ── */
function DishCategorySelect({ value, onChange, error }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const selected = CATEGORIES.find(c => c === value);
  return (
    <div ref={ref} style={{ position:"relative", userSelect:"none" }}>
      <style>{DROPDOWN_ANIM}</style>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        width:"100%", padding:"0.7rem 1rem", borderRadius:11,
        background:"rgba(255,255,255,0.05)", color:"white", fontSize:"0.875rem",
        outline:"none", fontFamily:"'Plus Jakarta Sans',sans-serif",
        border:`1px solid ${error?"rgba(239,68,68,0.5)":open?"rgba(147,51,234,0.55)":"rgba(139,92,246,0.2)"}`,
        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", transition:"border-color 0.2s",
      }}>
        <span style={{ display:"flex", alignItems:"center", gap:10 }}>
          {selected ? (
            <>
              <span style={{ width:8, height:8, borderRadius:"50%", background:CAT_COLORS[selected].dot, flexShrink:0 }}/>
              <span style={{ fontSize:"0.85rem" }}>{CATEGORY_ICONS[selected]}</span>
              <span style={{ color:"rgba(255,255,255,0.9)" }}>{selected}</span>
            </>
          ) : <span style={{ color:"rgba(255,255,255,0.3)" }}>Select category</span>}
        </span>
        <span style={{ color:"rgba(167,139,250,0.6)", fontSize:"0.65rem", display:"inline-block", transition:"transform 0.2s", transform:open?"rotate(180deg)":"rotate(0deg)" }}>▼</span>
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 6px)", left:0, right:0, zIndex:9999,
          background:"linear-gradient(160deg,#1a1035,#120d2a)",
          border:"1px solid rgba(147,51,234,0.28)", borderRadius:14,
          overflow:"hidden", boxShadow:"0 20px 50px rgba(0,0,0,0.6)",
          animation:"dropIn 0.18s ease forwards",
        }}>
          {CATEGORIES.map((cat, i) => {
            const clr = CAT_COLORS[cat];
            const isActive = cat === value;
            return (
              <button key={cat} type="button" onClick={() => { onChange(cat); setOpen(false); }} style={{
                width:"100%", padding:"0.65rem 1rem",
                display:"flex", alignItems:"center", gap:12,
                background:isActive ? clr.bg : "transparent",
                borderLeft:`3px solid ${isActive ? clr.dot : "transparent"}`,
                borderTop:i===0?"none":"1px solid rgba(255,255,255,0.04)",
                borderRight:"none", borderBottom:"none",
                cursor:"pointer", textAlign:"left", transition:"background 0.15s",
                fontFamily:"'Plus Jakarta Sans',sans-serif",
              }}
              onMouseEnter={e => { if(!isActive) e.currentTarget.style.background="rgba(109,40,217,0.18)"; }}
              onMouseLeave={e => { if(!isActive) e.currentTarget.style.background="transparent"; }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:clr.dot, flexShrink:0 }}/>
                <span style={{ fontSize:"1rem", width:22, textAlign:"center" }}>{CATEGORY_ICONS[cat]}</span>
                <span style={{ fontSize:"0.875rem", color:isActive?clr.text:"rgba(255,255,255,0.75)", fontWeight:isActive?600:400 }}>{cat}</span>
                {isActive && <span style={{ marginLeft:"auto", color:clr.dot, fontSize:"0.8rem" }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Dish Modal ── */
function DishModal({ dish, onClose, onSave }) {
  const [form, setForm] = useState(dish || { name:"", category:"", description:"", image:"" });
  const [err, setErr]   = useState({});
  const [loading, setLoading] = useState(false);
  const [imgErr, setImgErr]   = useState(false);

  const set = (k, v) => { setForm(f => ({...f,[k]:v})); setErr(e => ({...e,[k]:""})); if(k==="image") setImgErr(false); };

  const submit = async () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.category)    e.category = "Required";
    if (Object.keys(e).length) { setErr(e); return; }
    setLoading(true);
    try {
      const res = dish?._id
        ? await api.put(`/dishes/${dish._id}`, form)
        : await api.post("/dishes", form);
      onSave(res.data.dish, !dish?._id);
    } catch(ex) { setErr({ submit: ex.response?.data?.message || "Error saving" }); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:500 }}>
        <div style={{ padding:"1.75rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", color:"white", fontSize:"1.5rem", fontWeight:600, margin:0 }}>
              {dish?._id ? "Edit Dish" : "Add New Dish"}
            </h3>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", color:"rgba(255,255,255,0.5)", fontSize:"1rem", cursor:"pointer", width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            {/* Name */}
            <div>
              <label className="a-label">Dish Name *</label>
              <input className="a-input" value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Paneer Tikka" />
              {err.name && <p style={{ color:"#f87171", fontSize:"0.72rem", marginTop:3 }}>{err.name}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="a-label">Category *</label>
              <DishCategorySelect value={form.category} onChange={v=>set("category",v)} error={!!err.category} />
              {err.category && <p style={{ color:"#f87171", fontSize:"0.72rem", marginTop:3 }}>{err.category}</p>}
            </div>

            {/* Image URL */}
            <div>
              <label className="a-label">Dish Image URL (optional)</label>
              <input
                className="a-input"
                value={form.image || ""}
                onChange={e=>set("image",e.target.value)}
                placeholder="https://example.com/dish.jpg"
              />
              {form.image && !imgErr && (
                <div style={{ marginTop:8, borderRadius:10, overflow:"hidden", border:"1px solid rgba(139,92,246,0.2)", height:120, position:"relative" }}>
                  <img src={form.image} alt="Preview" onError={()=>setImgErr(true)} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  <div style={{ position:"absolute", top:6, right:6, background:"rgba(0,0,0,0.6)", borderRadius:6, padding:"2px 8px", color:"rgba(255,255,255,0.6)", fontSize:"0.65rem" }}>preview</div>
                </div>
              )}
              {form.image && imgErr && (
                <p style={{ color:"#f87171", fontSize:"0.72rem", marginTop:3 }}>⚠ Could not load image — check the URL</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="a-label">Description (Optional)</label>
              <textarea className="a-input" style={{ resize:"vertical", minHeight:80 }} value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Brief description of the dish..." />
            </div>
          </div>

          {err.submit && <p style={{ color:"#f87171", fontSize:"0.8rem", margin:"0.75rem 0", textAlign:"center" }}>{err.submit}</p>}

          <div style={{ display:"flex", gap:"0.75rem", justifyContent:"flex-end", marginTop:"1.4rem" }}>
            <button style={btnGhost} onClick={onClose}>Cancel</button>
            <button style={{ ...btnPrimary, opacity:loading?0.6:1 }} onClick={submit} disabled={loading}>
              {loading ? "Saving…" : dish?._id ? "Save Changes" : "Add Dish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Dish Card ── */
function DishCard({ dish, clr, onEdit, onDelete }) {
  return (
    <div
      style={{ borderRadius:"16px", overflow:"hidden", border:"1px solid rgba(139,92,246,0.15)", background:"linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))", transition:"all 0.2s", cursor:"pointer" }}
      onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(109,40,217,0.18)"; e.currentTarget.style.borderColor="rgba(147,51,234,0.35)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; e.currentTarget.style.borderColor="rgba(139,92,246,0.15)"; }}
    >
      {dish.image ? (
        <div style={{ height:140, overflow:"hidden", position:"relative" }}>
          <img
            src={dish.image}
            alt={dish.name}
            onError={e=>{
              // swap to placeholder on broken URL
              const wrap = e.currentTarget.parentElement;
              wrap.innerHTML = `<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:linear-gradient(135deg,${clr.bg},rgba(255,255,255,0.02))"><span style="font-size:2.5rem;opacity:0.7">${CATEGORY_ICONS[dish.category]||"🍽️"}</span><span style="font-size:0.65rem;color:${clr.text};opacity:0.6;font-weight:600;letter-spacing:0.08em;text-transform:uppercase">${dish.category}</span></div>`;
            }}
            style={{ width:"100%", height:"100%", objectFit:"cover" }}
          />
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${clr.dot},${clr.dot}55)` }}/>
        </div>
      ) : (
        /* No image — show a pretty placeholder with the category icon */
        <div style={{
          height:120, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6,
          background:`linear-gradient(135deg,${clr.bg},rgba(255,255,255,0.015))`,
          borderBottom:`1px solid ${clr.border}`, position:"relative", overflow:"hidden",
        }}>
          {/* Subtle radial glow */}
          <div style={{ position:"absolute", inset:0, background:`radial-gradient(circle at 50% 60%,${clr.dot}18,transparent 70%)`, pointerEvents:"none" }}/>
          <span style={{ fontSize:"2.8rem", position:"relative", zIndex:1 }}>{CATEGORY_ICONS[dish.category]||"🍽️"}</span>
          <span style={{ fontSize:"0.6rem", color:clr.text, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", opacity:0.7, position:"relative", zIndex:1 }}>
            {dish.category}
          </span>
          {/* "Add image" hint */}
          <span style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.2)", position:"absolute", bottom:6, right:8 }}>no image</span>
        </div>
      )}

      <div style={{ padding:"1.15rem" }}>
        <h4 style={{ fontFamily:"'Cormorant Garamond',serif", color:"white", fontSize:"1.1rem", fontWeight:600, margin:"0 0 0.25rem", overflow:"hidden", textOverflow:"ellipsis" }}>
          {dish.name}
        </h4>
        <div style={{ display:"flex", alignItems:"center", gap:"0.4rem", marginBottom:"0.5rem" }}>
          <span style={{ fontSize:"0.85rem" }}>{CATEGORY_ICONS[dish.category]}</span>
          <span style={{ background:clr.bg, border:`1px solid ${clr.border}`, borderRadius:"999px", padding:"2px 8px", color:clr.text, fontSize:"0.65rem", fontWeight:600 }}>
            {dish.category}
          </span>
        </div>

        {dish.description && (
          <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.78rem", margin:"0 0 1rem", lineHeight:1.5, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
            {dish.description}
          </p>
        )}

        <div style={{ display:"flex", gap:"0.5rem", marginTop:"0.85rem" }}>
          <button style={btnGhost} onClick={onEdit}>✏ Edit</button>
          <button style={btnDanger} onClick={onDelete}>🗑 Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ── Pagination ── */
const PER_PAGE = 12;
function Pagination({ page, total, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  if (totalPages <= 1) return null;
  const pages = Array.from({length:totalPages},(_,i)=>i+1)
    .filter(n=>n===1||n===totalPages||Math.abs(n-page)<=1)
    .reduce((acc,n,idx,arr)=>{ if(idx>0&&n-arr[idx-1]>1)acc.push("..."); acc.push(n); return acc; },[]);
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"1.5rem", flexWrap:"wrap", gap:"0.5rem" }}>
      <p style={{ color:"rgba(255,255,255,0.28)", fontSize:"0.78rem", margin:0 }}>
        Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE,total)} of {total} dishes
      </p>
      <div style={{ display:"flex", alignItems:"center", gap:"0.35rem" }}>
        <button onClick={()=>onChange(Math.max(1,page-1))} disabled={page===1}
          style={{ padding:"0.38rem 0.75rem", borderRadius:9, border:"1px solid rgba(139,92,246,0.22)", background:"rgba(255,255,255,0.03)", color:page===1?"rgba(255,255,255,0.2)":"rgba(192,132,252,0.7)", fontSize:"0.78rem", cursor:page===1?"not-allowed":"pointer", fontWeight:600 }}
          onMouseEnter={e=>{ if(page>1){e.currentTarget.style.background="rgba(109,40,217,0.2)";e.currentTarget.style.color="white";}}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.color=page===1?"rgba(255,255,255,0.2)":"rgba(192,132,252,0.7)";}}>
          ← Prev
        </button>
        {pages.map((n,idx)=>n==="..."?(
          <span key={`d${idx}`} style={{ color:"rgba(255,255,255,0.2)", fontSize:"0.78rem", padding:"0 2px" }}>…</span>
        ):(
          <button key={n} onClick={()=>onChange(n)} style={{
            width:34, height:34, borderRadius:9,
            border:`1px solid ${page===n?"rgba(147,51,234,0.6)":"rgba(139,92,246,0.2)"}`,
            background:page===n?"linear-gradient(135deg,rgba(109,40,217,0.5),rgba(147,51,234,0.3))":"rgba(255,255,255,0.03)",
            color:page===n?"white":"rgba(192,132,252,0.6)", fontSize:"0.8rem", fontWeight:page===n?700:500, cursor:"pointer",
            boxShadow:page===n?"0 0 0 2px rgba(147,51,234,0.2)":"none",
          }}>{n}</button>
        ))}
        <button onClick={()=>onChange(Math.min(Math.ceil(total/PER_PAGE),page+1))} disabled={page===Math.ceil(total/PER_PAGE)}
          style={{ padding:"0.38rem 0.75rem", borderRadius:9, border:"1px solid rgba(139,92,246,0.22)", background:"rgba(255,255,255,0.03)", color:page===Math.ceil(total/PER_PAGE)?"rgba(255,255,255,0.2)":"rgba(192,132,252,0.7)", fontSize:"0.78rem", cursor:page===Math.ceil(total/PER_PAGE)?"not-allowed":"pointer", fontWeight:600 }}
          onMouseEnter={e=>{ if(page<Math.ceil(total/PER_PAGE)){e.currentTarget.style.background="rgba(109,40,217,0.2)";e.currentTarget.style.color="white";}}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.color=page===Math.ceil(total/PER_PAGE)?"rgba(255,255,255,0.2)":"rgba(192,132,252,0.7)";}}>
          Next →
        </button>
      </div>
    </div>
  );
}

/* ── Main DishesTab ── */
export default function DishesTab({ toast }) {
  const [dishes, setDishes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [filter, setFilter]   = useState("All");
  const [page, setPage]       = useState(1);

  useEffect(() => {
    api.get("/dishes").then(r=>setDishes(r.data.dishes||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  useEffect(() => { setPage(1); }, [filter]);

  const handleSave = (dish, isNew) => {
    if (isNew) setDishes(h=>[dish,...h]);
    else setDishes(h=>h.map(x=>x._id===dish._id?dish:x));
    setModal(null);
    toast(isNew?"Dish added successfully":"Dish updated","success");
  };

  const deleteDish = async id => {
    if (!window.confirm("Delete this dish?")) return;
    try { await api.delete(`/dishes/${id}`); setDishes(h=>h.filter(x=>x._id!==id)); toast("Dish deleted","success"); }
    catch { toast("Failed to delete","error"); }
  };

  const filtered  = filter==="All" ? dishes : dishes.filter(d=>d.category===filter);
  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const counts = {
    All: dishes.length,
    ...CATEGORIES.reduce((acc,cat)=>{ acc[cat]=dishes.filter(d=>d.category===cat).length; return acc; },{}),
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap", gap:"0.75rem" }}>
        <div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", color:"white", fontSize:"1.75rem", fontWeight:600, margin:"0 0 4px" }}>
            Manage <em style={{ color:"#9333ea", fontStyle:"italic" }}>Dishes</em>
          </h2>
          <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.8rem", margin:0 }}>
            {filtered.length!==dishes.length?`${filtered.length} of ${dishes.length} dishes`:`${dishes.length} total dish${dishes.length!==1?"es":""}`}
          </p>
        </div>
        <button style={btnPrimary} onClick={()=>setModal("new")}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(109,40,217,0.4)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
          + Add Dish
        </button>
      </div>

      {/* Category filter */}
      <div className="filter-row" style={{ display:"flex", gap:"0.4rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
        {["All",...CATEGORIES].map(cat=>(
          <button key={cat} onClick={()=>setFilter(cat)} style={{
            padding:"0.38rem 0.9rem", borderRadius:"999px", fontSize:"0.75rem",
            fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600,
            border:`1px solid ${filter===cat?"rgba(147,51,234,0.55)":"rgba(139,92,246,0.18)"}`,
            background:filter===cat?"linear-gradient(135deg,rgba(109,40,217,0.4),rgba(147,51,234,0.25))":"transparent",
            color:filter===cat?"white":"rgba(196,139,252,0.55)",
            cursor:"pointer", transition:"all 0.15s", display:"flex", alignItems:"center", gap:"0.35rem",
          }}>
            {cat!=="All"&&<span>{CATEGORY_ICONS[cat]}</span>}
            {cat}
            <span style={{ background:filter===cat?"rgba(255,255,255,0.2)":"rgba(139,92,246,0.2)", borderRadius:"999px", padding:"0 5px", fontSize:"0.65rem", fontWeight:700 }}>
              {counts[cat]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:"4rem", color:"rgba(255,255,255,0.25)" }}>
          <div style={{ fontSize:"2rem", marginBottom:"0.75rem", opacity:0.4 }}>🍽️</div>Loading dishes…
        </div>
      ) : filtered.length===0 ? (
        <div style={{ textAlign:"center", padding:"4rem 2rem", border:"1px solid rgba(139,92,246,0.12)", borderRadius:"18px" }}>
          <p style={{ fontSize:"2.5rem", marginBottom:"0.75rem" }}>🍽️</p>
          <p style={{ color:"rgba(255,255,255,0.4)", marginBottom:"1.25rem" }}>
            {filter==="All"?"No dishes yet. Add your first dish.":`No dishes in ${filter}`}
          </p>
          <button style={btnPrimary} onClick={()=>setModal("new")}>+ Add First Dish</button>
        </div>
      ) : (
        <>
          <div className="dishes-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"1rem" }}>
            {filter==="All" ? (
              CATEGORIES.map(category => {
                const catDishes = paginated.filter(d=>d.category===category);
                if (!catDishes.length) return null;
                const clr = CAT_COLORS[category];
                return (
                  <div key={category} style={{ gridColumn:"1/-1" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1rem" }}>
                      <span style={{ fontSize:"1.5rem" }}>{CATEGORY_ICONS[category]}</span>
                      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", color:"white", fontSize:"1.3rem", fontWeight:600, margin:0 }}>{category}</h3>
                      <div style={{ flex:1, height:"1px", background:"rgba(167,139,250,0.12)" }}/>
                      <span style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.75rem" }}>{catDishes.length} dish{catDishes.length!==1?"es":""}</span>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:"0.85rem" }}>
                      {catDishes.map(dish=><DishCard key={dish._id} dish={dish} clr={clr} onEdit={()=>setModal(dish)} onDelete={()=>deleteDish(dish._id)}/>)}
                    </div>
                  </div>
                );
              })
            ) : (
              paginated.map(dish=>{
                const clr = CAT_COLORS[dish.category]||CAT_COLORS["Starter Menu"];
                return <DishCard key={dish._id} dish={dish} clr={clr} onEdit={()=>setModal(dish)} onDelete={()=>deleteDish(dish._id)}/>;
              })
            )}
          </div>

          <Pagination page={page} total={filtered.length} onChange={setPage} />
        </>
      )}

      {(modal==="new"||modal?._id) && (
        <DishModal dish={modal==="new"?null:modal} onClose={()=>setModal(null)} onSave={handleSave}/>
      )}
    </div>
  );
}