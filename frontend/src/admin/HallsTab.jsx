import React, { useState, useEffect } from "react";
import api from "../services/api";
import { btnPrimary, btnGhost, btnDanger } from "./adminTheme";

function HallModal({ hall, onClose, onSave }) {
  const [form, setForm]   = useState(hall || { name:"", location:"Karachi", pricePerHead:"", totalSeats:"", description:"", image:"" });
  const [err, setErr]     = useState({});
  const [loading, setLoading] = useState(false);
  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setErr(e=>({...e,[k]:""})); };

  const submit = async () => {
    const e={};
    if (!form.name.trim()) e.name="Required";
    if (!form.pricePerHead) e.pricePerHead="Required";
    if (!form.totalSeats) e.totalSeats="Required";
    if (Object.keys(e).length) { setErr(e); return; }
    setLoading(true);
    try {
      const res = hall?._id ? await api.put(`/halls/${hall._id}`,form) : await api.post("/halls",form);
      onSave(res.data.hall, !hall?._id);
    } catch(ex) { setErr({submit:ex.response?.data?.message||"Error saving"}); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box" style={{ maxWidth:500 }}>
        <div style={{ padding:"1.75rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
            <h3 style={{ fontFamily:"'Sora',sans-serif", color:"white", fontSize:"1.5rem", fontWeight:600, margin:0 }}>
              {hall?._id ? "Edit Hall" : "Add New Hall"}
            </h3>
            <button onClick={onClose} style={{ background:"#1e2433", border:"1px solid #252d3d", borderRadius:"10px", color:"#cbd5e1", fontSize:"1rem", cursor:"pointer", width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
            <div style={{ gridColumn:"1/-1" }}>
              <label className="a-label">Hall Name *</label>
              <input className="a-input" value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Royal Banquet Hall" />
              {err.name && <p style={{ color:"#f87171", fontSize:"0.72rem", marginTop:3 }}>{err.name}</p>}
            </div>
            <div>
              <label className="a-label">Price / Head (PKR) *</label>
              <input className="a-input" type="number" value={form.pricePerHead} onChange={e=>set("pricePerHead",e.target.value)} placeholder="1500" />
              {err.pricePerHead && <p style={{ color:"#f87171", fontSize:"0.72rem", marginTop:3 }}>{err.pricePerHead}</p>}
            </div>
            <div>
              <label className="a-label">Total Seats *</label>
              <input className="a-input" type="number" value={form.totalSeats} onChange={e=>set("totalSeats",e.target.value)} placeholder="500" />
              {err.totalSeats && <p style={{ color:"#f87171", fontSize:"0.72rem", marginTop:3 }}>{err.totalSeats}</p>}
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label className="a-label">Location</label>
              <input className="a-input" value={form.location} onChange={e=>set("location",e.target.value)} placeholder="Clifton, Karachi" />
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label className="a-label">Image URL</label>
              <input className="a-input" value={form.image} onChange={e=>set("image",e.target.value)} placeholder="https://images.unsplash.com/…" />
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label className="a-label">Description</label>
              <textarea className="a-input" style={{ resize:"vertical", minHeight:72 }} value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Hall description…" />
            </div>
          </div>

          {err.submit && <p style={{ color:"#f87171", fontSize:"0.8rem", margin:"0.75rem 0", textAlign:"center" }}>{err.submit}</p>}

          <div style={{ display:"flex", gap:"0.75rem", justifyContent:"flex-end", marginTop:"1.4rem" }}>
            <button style={btnGhost} onClick={onClose}>Cancel</button>
            <button style={{ ...btnPrimary, opacity:loading?0.6:1 }} onClick={submit} disabled={loading}>{loading?"Saving…":hall?._id?"Save Changes":"Add Hall"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HallsTab({ toast }) {
  const [halls, setHalls]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);

  useEffect(() => {
    api.get("/halls").then(r=>setHalls(r.data.halls||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const handleSave = (hall, isNew) => {
    if (isNew) setHalls(h=>[hall,...h]); else setHalls(h=>h.map(x=>x._id===hall._id?hall:x));
    setModal(null);
    toast(isNew?"Hall added successfully":"Hall updated","success");
  };

  const deleteHall = async id => {
    if (!window.confirm("Delete this hall?")) return;
    try { await api.delete(`/halls/${id}`); setHalls(h=>h.filter(x=>x._id!==id)); toast("Hall deleted","success"); }
    catch { toast("Failed to delete","error"); }
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap", gap:"0.75rem" }}>
        <div>
          <h2 style={{ fontFamily:"'Sora',sans-serif", color:"white", fontSize:"1.75rem", fontWeight:600, margin:"0 0 4px" }}>
            Manage <em style={{ color:"#6366f1", fontStyle:"italic" }}>Halls</em>
          </h2>
          <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.8rem", margin:0 }}>{halls.length} venue{halls.length!==1?"s":""} configured</p>
        </div>
        <button style={btnPrimary} onClick={()=>setModal("new")}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(79,70,229,0.4)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
          + Add Hall
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:"4rem", color:"#94a3b8" }}>
          <div style={{ fontSize:"2rem", marginBottom:"0.75rem", opacity:0.4 }}>🏛️</div>Loading halls…
        </div>
      ) : halls.length===0 ? (
        <div style={{ textAlign:"center", padding:"4rem 2rem", border:"1px solid rgba(99,102,241,0.12)", borderRadius:"18px" }}>
          <p style={{ fontSize:"2.5rem", marginBottom:"0.75rem" }}>🏛️</p>
          <p style={{ color:"#94a3b8", marginBottom:"1.25rem" }}>No halls yet. Add your first venue.</p>
          <button style={btnPrimary} onClick={()=>setModal("new")}>+ Add First Hall</button>
        </div>
      ) : (
        <div className="halls-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"1.1rem" }}>
          {halls.map(h => (
            <div key={h._id} className="hall-card">
              {h.image
                ? <img src={h.image} alt={h.name} style={{ width:"100%", height:160, objectFit:"cover" }} />
                : <div style={{ width:"100%", height:160, background:"linear-gradient(135deg,#252d3d,#252d3d)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"3rem" }}>🏛️</div>
              }
              <div style={{ padding:"1.15rem" }}>
                <h3 style={{ fontFamily:"'Sora',sans-serif", color:"white", fontSize:"1.15rem", fontWeight:600, margin:"0 0 0.3rem" }}>{h.name}</h3>
                <div style={{ display:"flex", gap:"0.5rem", marginBottom:"0.4rem", flexWrap:"wrap" }}>
                  <span style={{ background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:"999px", padding:"2px 9px", color:"#a5b4fc", fontSize:"0.72rem", fontWeight:600 }}>
                    PKR {h.pricePerHead?.toLocaleString()}/head
                  </span>
                  <span style={{ background:"rgba(6,182,212,0.1)", border:"1px solid rgba(6,182,212,0.25)", borderRadius:"999px", padding:"2px 9px", color:"rgba(103,232,249,0.85)", fontSize:"0.72rem" }}>
                    {h.totalSeats?.toLocaleString()} seats
                  </span>
                </div>
                <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.76rem", margin:"0 0 1rem" }}>📍 {h.location}</p>
                <div style={{ display:"flex", gap:"0.5rem" }}>
                  <button style={btnGhost} onClick={()=>setModal(h)}>✏ Edit</button>
                  <button style={btnDanger} onClick={()=>deleteHall(h._id)}>🗑 Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(modal==="new"||modal?._id) && <HallModal hall={modal==="new"?null:modal} onClose={()=>setModal(null)} onSave={handleSave} />}
    </div>
  );
}