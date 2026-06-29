import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function Sidebar({ role = "student", pendingCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();
  const displayName = user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (role === "student") {
      navigate("/login");
    } else {
      navigate("/company-login");
    }
  };

  const studentLinks = [
    {
      name: "Dashboard",
      path: "/student/dashboard",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
        </svg>
      )
    },
    {
      name: "My interviews",
      path: "/student/interviews",
      badge: pendingCount > 0 ? pendingCount : null,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )
    },
    {
      name: "Practice",
      path: "/student/practice",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      )
    },
    {
      name: "Reports",
      path: "/student/reports",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      )
    }
  ];

  const companyLinks = [
    {
      name: "Dashboard",
      path: "/company/dashboard",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
        </svg>
      )
    },
    {
      name: "All Candidates",
      path: "/company/interviews",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    },
    {
      name: "Compare",
      path: "/company/compare",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      )
    }
  ];

  const mainLinks = role === "student" ? studentLinks : companyLinks;

  const accountLinks = role === "student" ? [
    {
      name: "Profile",
      path: "/student/profile",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    },
    {
      name: "Settings",
      path: "/student/settings",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      )
    }
  ] : [
    {
      name: "Profile",
      path: "/company/profile",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      )
    }
  ];

  const navItemStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 12px",
    borderRadius: 8,
    cursor: "pointer",
    color: isActive ? "#5dcaa5" : "#7a8a99",
    fontSize: 13,
    textDecoration: "none",
    background: isActive ? "#0f2620" : "transparent",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  });

  return (
    <aside
      style={{
        width: 228,
        minWidth: 228,
        background: "#0d1117",
        display: "flex",
        flexDirection: "column",
        borderRight: "0.5px solid #1e2530",
        minHeight: "100vh",
        flexShrink: 0,
        fontFamily: "var(--font-sans)",
        fontSize: 14,
      }}
    >
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: "0.5px solid #1e2530",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: "linear-gradient(135deg, #0f6e56 0%, #1d9e75 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" fill="rgba(255,255,255,0.15)"/>
            <polyline points="8 12 11 15 16 9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ color: "#e8edf2", fontSize: 14, fontWeight: 500, letterSpacing: "0.01em" }}>InterviewPilot</span>
          <span style={{ color: "#5dcaa5", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 1 }}>AI Interviews</span>
        </div>
      </div>

      <nav style={{ padding: "16px 10px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: 10, letterSpacing: "0.1em", color: "#3d4f5e", textTransform: "uppercase", padding: "8px 10px 6px", marginTop: 8 }}>
          {role === "student" ? "Student" : "Recruiter"}
        </span>

        {mainLinks.map((link) => {
          const isActive = location.pathname.startsWith(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              style={navItemStyle(isActive)}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "#161d26"; e.currentTarget.style.color = "#c8d6e0"; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#7a8a99"; } }}
            >
              {link.icon}
              {link.name}
              {link.badge ? (
                <span style={{ marginLeft: "auto", background: "#0f2620", color: "#5dcaa5", fontSize: 10, padding: "2px 7px", borderRadius: 20, fontWeight: 500 }}>
                  {link.badge}
                </span>
              ) : null}
            </Link>
          );
        })}

        {accountLinks.length > 0 && (
          <>
            <span style={{ fontSize: 10, letterSpacing: "0.1em", color: "#3d4f5e", textTransform: "uppercase", padding: "8px 10px 6px", marginTop: 8 }}>
              Account
            </span>
            {accountLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={navItemStyle(isActive)}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "#161d26"; e.currentTarget.style.color = "#c8d6e0"; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#7a8a99"; } }}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div
        style={{
          padding: "14px 16px",
          borderTop: "0.5px solid #1e2530",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #0f2620 0%, #0f6e56 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#5dcaa5",
            fontSize: 12,
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ color: "#c8d6e0", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {displayName}
          </div>
          <div style={{ color: "#3d4f5e", fontSize: 11 }}>
            {role === "student" ? "Student" : "Recruiter"}
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#3d4f5e", padding: 2, display: "flex", alignItems: "center" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}
