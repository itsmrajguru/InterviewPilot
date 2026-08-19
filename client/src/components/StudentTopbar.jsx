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

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();
  const displayName = user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="ip-hidden-mobile"
      style={{
        padding: "0 20px",
        height: 60,
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
      {/* Search Input Box */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: 8,
        width: 260,
        color: "#64748B",
        fontSize: 12.5,
        cursor: "text"
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span style={{ color: "#94A3B8", flex: 1 }}>Search anything...</span>
        <span style={{
          fontSize: 10.5,
          fontWeight: 600,
          color: "#94A3B8",
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 4,
          padding: "1px 5px"
        }}>⌘ K</span>
      </div>

      {/* Right side notification & profile avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Notification bell */}
        <div style={{ position: "relative", cursor: "pointer" }} onClick={() => navigate("/student/interviews")}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", background: "#F8FAFC", border: "1px solid #E2E8F0",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B"
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <span style={{
            position: "absolute", top: -2, right: -2, background: "#EF4444", color: "#FFFFFF",
            fontSize: 9.5, fontWeight: 700, width: 15, height: 15, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #FFFFFF"
          }}>
            2
          </span>
        </div>

        {/* User profile avatar pill */}
        <div 
          onClick={() => navigate("/student/profile")}
          style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
            color: "#FFFFFF", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 6px rgba(37, 99, 235, 0.25)"
          }}>
            {initials}
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
