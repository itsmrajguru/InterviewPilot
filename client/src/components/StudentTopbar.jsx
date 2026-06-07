import { useNavigate } from "react-router-dom";

/* icons */
const IconHome = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5 12 3l9 7.5" /><path d="M5 10v10h14V10" />
  </svg>
);

const IconPlay = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

/* student top bar component */
export default function StudentTopbar({ title, sub }) {
  const navigate = useNavigate();

  return (
    <header
      className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-8 py-4 md:py-0 flex-shrink-0 gap-3 md:gap-0"
      style={{
        minHeight: 68,
        background: "rgba(255,255,255,0.92)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(14px)",
      }}
    >
      <div className="flex flex-col">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
          Student Workspace
        </span>
        <span className="text-[18px] font-black tracking-tight leading-tight" style={{ color: "var(--text)" }}>
          {title}
        </span>
        {sub && (
          <span className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {sub}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/student/dashboard")}
          className="btn-secondary py-2 px-4 text-xs flex items-center gap-1.5"
        >
          <IconHome /> Dashboard
        </button>
        <button
          onClick={() => navigate("/student/practice")}
          className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
        >
          <IconPlay /> Start Practice
        </button>
      </div>
    </header>
  );
}
