import React from "react";

/**
 * Card Component
 * Base surface for all panels, forms, and data displays.
 * @param {boolean} interactive - Adds hover elevation and transition if true.
 * @param {string} className - Optional extra classes.
 */
export default function Card({ children, interactive = false, className = "", style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`ip-card ${interactive ? "ip-card-interactive" : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
