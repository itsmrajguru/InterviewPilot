import React from "react";

/**
 * PageHeader Component
 * Standard page title and subtitle block.
 */
export default function PageHeader({ title, subtitle, rightContent }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #0EA5E9 100%)",
      padding: "36px var(--space-6) 48px var(--space-6)",
      color: "#FFFFFF"
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0 0 8px 0", letterSpacing: "-0.02em", color: "#FFFFFF" }}>{title}</h1>
          {subtitle && <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.9)", margin: 0 }}>{subtitle}</p>}
        </div>
        {rightContent && <div style={{ flexShrink: 0, marginLeft: "16px" }}>{rightContent}</div>}
      </div>
    </div>
  );
}
