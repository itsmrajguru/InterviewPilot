import React from "react";

/**
 * Skeleton Component
 * Pulsing block for loading states.
 */
export default function Skeleton({ width = "100%", height = "100%", className = "", style = {} }) {
  return (
    <div 
      className={`ui-skeleton ${className}`} 
      style={{ width, height, ...style }} 
    />
  );
}
