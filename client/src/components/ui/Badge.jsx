import React from "react";

/**
 * Badge Component
 * Status indicator pill.
 * @param {string} variant - success | warning | danger | neutral
 */
export default function Badge({ children, variant = "neutral", className = "", ...props }) {
  return (
    <span className={`ip-badge ip-badge-${variant} ${className}`} {...props}>
      {children}
    </span>
  );
}
