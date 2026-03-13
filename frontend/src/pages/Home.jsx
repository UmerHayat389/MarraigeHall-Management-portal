import React, { useEffect, useState } from "react";
import api from "../services/api";
import HallCard from "../components/HallCard";
import BookingModal from "../components/BookingModal";
import Navbar from "../components/Navbar";

const hallImages = [
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80",
  "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=600&q=80",
  "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=80",
];

const packages = [
  { name: "Nikkah", icon: "☪️", desc: "Sacred nikah ceremonies with traditional décor, floral arrangements & sound system.", price: "PKR 180,000", guests: "Up to 200 guests" },
  { name: "Walima", icon: "🌸", desc: "Grand walima receptions with premium catering, stage setup & photography.", price: "PKR 350,000", guests: "Up to 500 guests" },
  { name: "Birthday", icon: "🎂", desc: "Memorable birthday celebrations with custom themes, cake & entertainment.", price: "PKR 80,000", guests: "Up to 150 guests" },
  { name: "Conference", icon: "🎤", desc: "Professional corporate events with AV equipment & full catering service.", price: "PKR 120,000", guests: "Up to 300 guests" },
  { name: "Anniversary", icon: "💍", desc: "Romantic anniversary dinners with candlelight, flowers & live music.", price: "PKR 95,000", guests: "Up to 100 guests" },
  { name: "Custom", icon: "✨", desc: "Fully customizable packages tailored exactly to your unique vision.", price: "Contact us", guests: "Any size" },
];

const testimonials = [
  { name: "Fatima & Bilal", event: "Walima 2024", text: "The hall was breathtaking. Every detail was perfect — from the floral arrangements to the lighting. Our guests couldn't stop complimenting the venue.", stars: 5 },
  { name: "Ayesha Malik", event: "Birthday Party", text: "Booked online in minutes and the team executed everything flawlessly. The booking system is incredibly easy to use!", stars: 5 },
  { name: "Tariq Industries", event: "Annual Conference", text: "Professional setup, excellent AV equipment and the catering was outstanding. Will book again for our next corporate event.", stars: 5 },
];

export default function Home() {
  const [halls, setHalls] = useState([]);
  const [selectedHall, setSelectedHall] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get("/halls")
      .then((res) => setHalls(res.data.halls || res.data))
      .catch(() => {});
  }, []);

  const openModal = (hall = null) => {
    setSelectedHall(hall);
    setShowModal(true);
  };

  return (
    <div style={{ background: "#07050f", minHeight: "100vh", color: "white", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .anim-1 { opacity:0; animation: fadeUp 0.8s 0.2s forwards; }
        .anim-2 { opacity:0; animation: fadeUp 0.8s 0.5s forwards; }
        .anim-3 { opacity:0; animation: fadeUp 0.8s 0.8s forwards; }
        .anim-4 { opacity:0; animation: fadeUp 0.8s 1.0s forwards; }
        .gold-dot::before { content:''; display:inline-block; width:5px; height:5px; background:#a855f7; transform:rotate(45deg); margin-right:10px; vertical-align:middle; }
        select option { background:#1a1035; color:white; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(167,139,250,0.3); border-radius:2px; }
      `}</style>

      <Navbar onBookNow={() => openModal()} />

      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80') center/cover no-repeat" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(7,5,15,0.65) 0%,rgba(7,5,15,0.35) 50%,rgba(7,5,15,0.97) 100%)" }} />
        <div style={{ position: "absolute", top: "25%", left: "20%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.15),transparent)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "30%", right: "20%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle,rgba(168,85,247,0.12),transparent)", filter: "blur(40px)" }} />

        <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: "900px", padding: "0 1.5rem" }}>
          <p className="anim-1 gold-dot" style={{ color: "#a855f7", fontSize: "0.7rem", letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
            Karachi's Premier Marriage Hall
          </p>
          <h1 className="anim-2" style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(3rem,7vw,5.5rem)", fontWeight: 300, lineHeight: 1.08, marginBottom: "1.5rem" }}>
            Where Every<br />
            <em style={{ color: "#a855f7", fontStyle: "italic", fontWeight: 600 }}>Dream</em> Begins
          </h1>
          <p className="anim-3" style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.1rem", maxWidth: "520px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
            Exquisite venues for Nikkah, Walima, and every celebration that deserves to be remembered forever.
          </p>
          <div className="anim-4" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => openModal()}
              style={{ padding: "1rem 2.5rem", borderRadius: "9999px", background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "white", fontWeight: 600, fontSize: "0.95rem", border: "none", cursor: "pointer", boxShadow: "0 8px 30px rgba(124,58,237,0.4)", transition: "transform 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
              Book Your Event
            </button>
            <a href="#halls"
              style={{ padding: "1rem 2.5rem", borderRadius: "9999px", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.65)", fontSize: "0.95rem", cursor: "pointer", transition: "all 0.2s", textDecoration: "none" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}>
              View Our Halls
            </a>
          </div>
        </div>

        {/* Stats */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 1.5rem 2rem" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(167,139,250,0.15)" }}>
            {[["500+", "Events Hosted"], ["15+", "Years Excellence"], ["50,000+", "Happy Guests"]].map(([n, l]) => (
              <div key={l} style={{ textAlign: "center", padding: "1rem", background: "rgba(7,5,15,0.7)" }}>
                <p style={{ fontFamily: "'Playfair Display',serif", color: "#a855f7", fontSize: "1.4rem", fontWeight: 700 }}>{n}</p>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", marginTop: "2px" }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HALLS ── */}
      <section id="halls" style={{ padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p className="gold-dot" style={{ color: "#a855f7", fontSize: "0.7rem", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Our Venues</p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 300 }}>
              Halls Built for <em style={{ color: "#a855f7" }}>Grandeur</em>
            </h2>
          </div>
          {halls.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.5rem" }}>
              {halls.map((h, i) => (
                <HallCard key={h._id} hall={h} onBook={openModal} index={i} />
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.5rem" }}>
              {hallImages.map((img, i) => (
                <div key={i} style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(167,139,250,0.12)", background: "rgba(255,255,255,0.02)", cursor: "pointer", transition: "transform 0.3s" }}
                  onClick={() => openModal()}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
                  <div style={{ height: "200px", overflow: "hidden" }}>
                    <img src={img} alt="Hall" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: "1.25rem" }}>
                    <p style={{ color: "#a855f7", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Premium Venue</p>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: "1.1rem" }}>
                      {["Royal Banquet Hall", "Garden Pavilion", "Grand Ballroom", "Crystal Suite"][i]}
                    </h3>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.78rem", marginTop: "0.5rem" }}>Add halls from Admin panel →</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── PACKAGES ── */}
      <section id="packages" style={{ padding: "6rem 1.5rem", background: "rgba(124,58,237,0.04)" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p className="gold-dot" style={{ color: "#a855f7", fontSize: "0.7rem", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.75rem" }}>What We Offer</p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 300 }}>
              Event <em style={{ color: "#a855f7" }}>Packages</em>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.25rem" }}>
            {packages.map((pkg, i) => (
              <div key={i} style={{ borderRadius: "16px", padding: "1.5rem", border: "1px solid rgba(167,139,250,0.12)", background: "rgba(255,255,255,0.02)", transition: "transform 0.3s, box-shadow 0.3s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(124,58,237,0.15)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{pkg.icon}</div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: "1.2rem", marginBottom: "0.5rem" }}>{pkg.name}</h3>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "1rem" }}>{pkg.desc}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <p style={{ color: "#c084fc", fontWeight: 600 }}>{pkg.price}</p>
                    <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.72rem" }}>{pkg.guests}</p>
                  </div>
                  <button onClick={() => openModal()}
                    style={{ fontSize: "0.75rem", padding: "0.4rem 1rem", borderRadius: "9999px", border: "1px solid rgba(167,139,250,0.3)", color: "#c084fc", background: "transparent", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#7c3aed"; e.currentTarget.style.color = "white"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#c084fc"; }}>
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
          <div>
            <p className="gold-dot" style={{ color: "#a855f7", fontSize: "0.7rem", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Our Story</p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 300, marginBottom: "1.5rem", lineHeight: 1.2 }}>
              15 Years Creating<br /><em style={{ color: "#a855f7" }}>Unforgettable</em> Moments
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.8, marginBottom: "1rem" }}>
              Noor Mahal has been Karachi's most trusted venue for over a decade. From intimate nikkahs to grand walima receptions, we bring your vision to life with meticulous attention to detail.
            </p>
            <p style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.8, marginBottom: "2rem" }}>
              Our dedicated team of event specialists, decorators and chefs work tirelessly to ensure every moment of your special day is absolutely perfect.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {[["5-Star", "Google Rating"], ["100%", "Client Satisfaction"], ["In-House", "Catering Team"], ["24/7", "Event Support"]].map(([n, l]) => (
                <div key={l} style={{ borderRadius: "12px", padding: "1rem", background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.12)" }}>
                  <p style={{ color: "#c084fc", fontWeight: 700, fontSize: "1.1rem" }}>{n}</p>
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem", marginTop: "2px" }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <img src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=700&q=80"
              alt="About" style={{ borderRadius: "16px", width: "100%", height: "400px", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: "-1rem", left: "-1rem", borderRadius: "12px", padding: "1rem 1.5rem", background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
              <p style={{ color: "white", fontWeight: 700, fontSize: "1.5rem" }}>500+</p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.72rem" }}>Events Celebrated</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ padding: "6rem 1.5rem", background: "rgba(124,58,237,0.04)" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p className="gold-dot" style={{ color: "#a855f7", fontSize: "0.7rem", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Happy Clients</p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 300 }}>
              What Our <em style={{ color: "#a855f7" }}>Guests</em> Say
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.25rem" }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ borderRadius: "16px", padding: "1.75rem", border: "1px solid rgba(167,139,250,0.12)", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", gap: "3px", marginBottom: "1rem" }}>
                  {[...Array(t.stars)].map((_, j) => <span key={j} style={{ color: "#a855f7", fontSize: "0.9rem" }}>★</span>)}
                </div>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.88rem", lineHeight: 1.7, marginBottom: "1.25rem", fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc", fontSize: "0.85rem", fontWeight: 700 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p style={{ color: "white", fontSize: "0.88rem", fontWeight: 500 }}>{t.name}</p>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem" }}>{t.event}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p className="gold-dot" style={{ color: "#a855f7", fontSize: "0.7rem", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Get In Touch</p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 300 }}>
              Plan Your <em style={{ color: "#a855f7" }}>Dream Event</em>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1.25rem", marginBottom: "3rem" }}>
            {[["📍", "Location", "Clifton Block 5, Karachi"], ["📞", "Phone", "+92 21 3456 7890"], ["✉️", "Email", "bookings@noormahal.pk"]].map(([icon, label, val]) => (
              <div key={label} style={{ borderRadius: "16px", padding: "1.75rem", textAlign: "center", border: "1px solid rgba(167,139,250,0.12)", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>{icon}</div>
                <p style={{ color: "#a855f7", fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.3rem" }}>{label}</p>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.88rem" }}>{val}</p>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div style={{ borderRadius: "24px", padding: "4rem 2rem", textAlign: "center", position: "relative", overflow: "hidden", border: "1px solid rgba(167,139,250,0.2)", background: "linear-gradient(135deg,rgba(124,58,237,0.25),rgba(168,85,247,0.15))" }}>
            <p className="gold-dot" style={{ color: "#c084fc", fontSize: "0.68rem", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Ready to begin?</p>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.6rem,3vw,2.5rem)", fontWeight: 300, marginBottom: "1rem" }}>
              Book Your Event <em style={{ color: "#a855f7" }}>Today</em>
            </h3>
            <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "2rem", maxWidth: "440px", margin: "0 auto 2rem", lineHeight: 1.7 }}>
              Complimentary consultation included. Our specialists will make your vision come to life.
            </p>
            <button onClick={() => openModal()}
              style={{ padding: "1rem 3rem", borderRadius: "9999px", background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "white", fontWeight: 600, fontSize: "0.95rem", border: "none", cursor: "pointer", boxShadow: "0 8px 30px rgba(124,58,237,0.4)", transition: "transform 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
              Reserve Now
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(167,139,250,0.1)", padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem" }}>
            <span style={{ color: "#a855f7" }}>Noor</span>
            <span style={{ color: "white" }}> Mahal</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.8rem" }}>© 2025 Noor Mahal. All rights reserved.</p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <a href="/admin" style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8rem", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.target.style.color = "#a855f7")}
              onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.25)")}>
              Admin Panel
            </a>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      {showModal && (
        <BookingModal hall={selectedHall} onClose={() => { setShowModal(false); setSelectedHall(null); }} />
      )}
    </div>
  );
}