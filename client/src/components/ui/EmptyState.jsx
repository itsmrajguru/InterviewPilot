import React from "react";

/**
 * EmptyState Component
 * Standard empty list view with an icon.
 */
export default function EmptyState({ title, subtext, icon: Icon }) {
  return (
    <div className="ui-empty-state">
      {Icon && <div className="ui-empty-icon"><Icon width={32} height={32} strokeWidth={1.5} /></div>}
      <h3 className="ui-empty-title">{title}</h3>
      {subtext && <p className="ui-empty-subtext">{subtext}</p>}
    </div>
  );
}
