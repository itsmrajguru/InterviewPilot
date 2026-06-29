import { useNavigate } from "react-router-dom";

/* icons */
const IconBell = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

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

  const ghostBtn = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 14px",
    borderRadius: "var(--radius)",
    border: "0.5px solid var(--border-strong)",
    background: "transparent",
    color: "var(--text-secondary)",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
  };

  const primaryBtn = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 16px",
    borderRadius: "var(--radius)",
    border: "none",
    background: "#1d9e75",
    color: "#fff",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 500,
    fontFamily: "var(--font-sans)",
  };

  return (
    <div
      style={{
        padding: "0 28px",
        height: 56,
        borderBottom: "0.5px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface-2)",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 50,
        fontFamily: "var(--font-sans)",
        fontSize: 14,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Student workspace
        </span>
        <span style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>
          {title}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          style={ghostBtn}
          onMouseEnter={e => e.currentTarget.style.background = "var(--surface-1)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <IconBell />
        </button>
        <button
          onClick={() => navigate("/student/dashboard")}
          style={ghostBtn}
          onMouseEnter={e => e.currentTarget.style.background = "var(--surface-1)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <IconHome /> Dashboard
        </button>
        <button
          onClick={() => navigate("/student/practice")}
          style={primaryBtn}
          onMouseEnter={e => e.currentTarget.style.background = "#0f6e56"}
          onMouseLeave={e => e.currentTarget.style.background = "#1d9e75"}
        >
          <IconPlay /> Start practice
        </button>
      </div>
    </div>
  );
}
