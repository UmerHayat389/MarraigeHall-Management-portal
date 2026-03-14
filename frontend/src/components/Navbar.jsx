import React, { useState, useEffect } from "react";

export default function Navbar({ onBookNow }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = ["Halls", "Packages", "About", "Testimonials", "Contact"];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(7,5,15,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(167,139,250,0.12)" : "none",
        padding: scrolled ? "0.75rem 0" : "1.25rem 0",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="/" style={{ fontFamily: "'Playfair Display',serif" }} className="text-xl font-semibold">
          <span style={{ color: "#a855f7" }}>Noor</span>
          <span className="text-white"> Mahal</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em" }}
              onMouseEnter={(e) => (e.target.style.color = "#c084fc")}
              onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.5)")}
            >
              {l}
            </a>
          ))}
          <a
            href="/booking-status"
            className="text-sm transition-colors"
            style={{ color: "rgba(167,139,250,0.6)", letterSpacing: "0.05em" }}
            onMouseEnter={(e) => (e.target.style.color = "#c084fc")}
            onMouseLeave={(e) => (e.target.style.color = "rgba(167,139,250,0.6)")}
          >
            Track Booking
          </a>
        </div>

        {/* Book Now */}
        <button
          onClick={onBookNow}
          className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all"
          style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Book Now
        </button>
      </div>
    </nav>
  );
}