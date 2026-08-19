import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";

/* icons */
const IconHome = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/>
  </svg>
);

const IconPlay = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

/* student top bar component */
export default function StudentTopbar({ title, sub }) {
  const navigate = useNavigate();

  return (
    <div className="ip-hidden-mobile"
      style={{
        padding: "0 var(--space-6)",
        height: 56,
        borderBottom: "1px solid #E2E8F0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#FFFFFF",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 50,
        fontFamily: "var(--sans)",
        fontSize: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>
          {title}
        </span>
        <span style={{ fontSize: 14, color: "#94A3B8" }}>|</span>
        <span style={{ fontSize: 12, color: "#64748B", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 600 }}>
          Student workspace
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => navigate("/student/practice")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: "8px",
            background: "#0284C7",
            color: "#FFFFFF",
            border: "none",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            transition: "background 0.15s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#0369A1"}
          onMouseLeave={e => e.currentTarget.style.background = "#0284C7"}
        >
          <IconPlay /> Start practice
        </button>
      </div>
    </div>
  );
}
