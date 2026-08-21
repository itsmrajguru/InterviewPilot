import React from "react";

/**
 * PageHeader Component
 * Standard page title and subtitle block.
 */
export default function PageHeader({ title, subtitle, rightContent, style }) {
  return (
    <div style={{
      padding: "24px 28px 16px 28px",
      color: "#0F172A",
      ...style
    }}>
      <div className="ip-flex-wrap" style={{ maxWidth: 1180, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 4px 0", letterSpacing: "-0.02em", color: "#0F172A" }}>{title}</h1>
          {subtitle && <p style={{ fontSize: "13.5px", color: "#64748B", margin: 0 }}>{subtitle}</p>}
        </div>
        {rightContent && <div style={{ flexShrink: 0 }}>{rightContent}</div>}
      </div>
    </div>
  );
}
