import React from "react";

/**
 * Button Component
 * Standardized button with variants.
 */
export default function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
  const baseClass = "ui-btn";
  const sizeClass = size === "sm" ? "ui-btn-sm" : "ui-btn-md";
  const variantClass = `ui-btn-${variant}`;
  
  return (
    <button className={`${baseClass} ${sizeClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
