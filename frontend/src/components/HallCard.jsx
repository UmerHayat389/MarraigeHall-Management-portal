import React from "react";

// Function tags shown on each hall card
const FUNCTION_TAGS = {
  "Royal Banquet Hall":  ["Walima", "Barat", "Reception"],
  "Garden Pavilion":     ["Nikkah", "Anniversary", "Outdoor"],
  "Grand Ballroom":      ["Conference", "Birthday", "Gala"],
  "Crystal Suite":       ["Intimate", "Nikkah", "Custom"],
};

const CAPACITY_LABELS = {
  "Royal Banquet Hall": "Up to 800 guests",
  "Garden Pavilion":    "Up to 300 guests",
  "Grand Ballroom":     "Up to 1,200 guests",
  "Crystal Suite":      "Up to 150 guests",
};

export default function HallCard({ hall, onBook, index = 0 }) {
  const tags     = hall.functions || FUNCTION_TAGS[hall.name]  || ["Events"];
  const capacity = hall.capacityLabel || CAPACITY_LABELS[hall.name] || `${hall.totalSeats} seats`;

  return (
    <div
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid rgba(245,158,11,0.12)",
        background: "rgba(255,255,255,0.02)",
        cursor: "pointer",
        transition: "transform 0.3s, box-shadow 0.3s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 20px 40px rgba(245,158,11,0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Image */}
      <div style={{ height: "200px", overflow: "hidden", position: "relative" }}>
        <img
          src={hall.image || `https://images.unsplash.com/photo-${["1519225421980-715cb0215aed","1464366400600-7168b8af9bc3","1510076857177-7470076d4098","1478146059778-26028b07395a"][index % 4]}?w=600&q=80`}
          alt={hall.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
        {/* Capacity badge */}
        <div style={{
          position: "absolute", top: "10px", right: "10px",
          background: "rgba(7,5,15,0.75)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: "999px", padding: "3px 10px",
          color: "#fcd34d", fontSize: "0.65rem", letterSpacing: "0.08em",
        }}>
          {capacity}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "1.25rem" }}>
        <p style={{ color: "#fbbf24", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.3rem" }}>
          Premium Venue
        </p>
        <h3 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: "1.15rem", marginBottom: "0.6rem" }}>
          {hall.name}
        </h3>

        {/* Function tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "1rem" }}>
          {tags.map((tag) => (
            <span key={tag} style={{
              fontSize: "0.65rem", padding: "3px 10px", borderRadius: "999px",
              border: "1px solid rgba(245,158,11,0.25)",
              color: "rgba(245,158,11,0.85)", letterSpacing: "0.06em",
              background: "rgba(245,158,11,0.12)",
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Price + Book */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            {hall.pricePerHead ? (
              <>
                <p style={{ color: "#fcd34d", fontWeight: 600, fontSize: "0.9rem" }}>
                  PKR {hall.pricePerHead?.toLocaleString()}/head
                </p>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.7rem" }}>
                  {hall.location || "Karachi"}
                </p>
              </>
            ) : (
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.75rem" }}>
                Contact for pricing
              </p>
            )}
          </div>
          <button
            onClick={() => onBook(hall)}
            style={{
              padding: "0.45rem 1.2rem", borderRadius: "999px", fontSize: "0.78rem",
              fontWeight: 600, color: "white", border: "none", cursor: "pointer",
              background: "linear-gradient(135deg,#d97706,#fbbf24)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(245,158,11,0.5)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}