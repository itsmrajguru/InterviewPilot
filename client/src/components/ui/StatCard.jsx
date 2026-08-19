import React from "react";
import Card from "./Card";

const HUES = {
  amber: { bg: "#fffbeb", text: "#f59e0b" },
  emerald: { bg: "#ecfdf5", text: "#10b981" },
  sky: { bg: "#f0f9ff", text: "#0ea5e9" },
  rose: { bg: "#fff1f2", text: "#f43f5e" },
  brand: { bg: "var(--color-primary-50)", text: "var(--color-primary-500)" },
};

/**
 * StatCard Component
 * Wraps Card for metric displays with a semantic accent color.
 */
export default function StatCard({ label, value, sub, icon: Icon, hue = "brand", badge }) {
  const color = HUES[hue] || HUES.brand;

  return (
    <div style={{ 
      background: "#FFFFFF",
      borderRadius: "12px",
      padding: "14px 16px", 
      display: "flex", 
      alignItems: "center", 
      gap: "14px", 
      borderLeft: `3px solid ${color.text}`,
      borderTop: "1px solid #E2E8F0",
      borderRight: "1px solid #E2E8F0",
      borderBottom: "1px solid #E2E8F0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      position: "relative"
    }}>
      <div style={{ 
        width: 36, height: 36, borderRadius: 10, 
        background: color.bg, color: color.text, 
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 
      }}>
        {Icon && <Icon style={{ width: 18, height: 18 }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {label}
          </span>
          {badge}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", lineHeight: 1.2, marginTop: 2 }}>
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: "#64748B", display: "flex", alignItems: "center", marginTop: 2 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
