import React from "react";
import Card from "./Card";

const HUES = {
  amber: { bg: "#FFFBEB", iconColor: "#D97706" },
  emerald: { bg: "#ECFDF5", iconColor: "#059669" },
  purple: { bg: "#F3E8FF", iconColor: "#7C3AED" },
  blue: { bg: "#EFF6FF", iconColor: "#2563EB" },
  sky: { bg: "#EFF6FF", iconColor: "#2563EB" },
  brand: { bg: "#EEF2FF", iconColor: "#2563EB" },
};

/**
 * StatCard Component
 * Wraps Card for metric displays with a soft tinted icon chip and right arrow action button.
 */
export default function StatCard({ label, value, sub, icon: Icon, hue = "brand", onClick }) {
  const color = HUES[hue] || HUES.brand;

  return (
    <div 
      onClick={onClick}
      style={{ 
        background: "#FFFFFF",
        borderRadius: "14px",
        padding: "16px 18px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        gap: "12px", 
        border: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.15s ease"
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 23, 42, 0.06)"; e.currentTarget.style.borderColor = "#CBD5E1"; } }}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.boxShadow = "0 1px 3px rgba(15, 23, 42, 0.03)"; e.currentTarget.style.borderColor = "#E2E8F0"; } }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: 0 }}>
        <div style={{ 
          width: 40, height: 40, borderRadius: 12, 
          background: color.bg, color: color.iconColor, 
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 
        }}>
          {Icon && typeof Icon === "function" ? <Icon style={{ width: 20, height: 20 }} /> : Icon}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {label}
          </span>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", lineHeight: 1.2, marginTop: 2 }}>
            {value}
          </div>
          {sub && (
            <div style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {sub}
            </div>
          )}
        </div>
      </div>

      {/* Right Arrow Action Circle */}
      <div style={{
        width: 24, height: 24, borderRadius: "50%", background: "#F8FAFC", border: "1px solid #E2E8F0",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", flexShrink: 0
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </div>
    </div>
  );
}
