import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function Sidebar({ role = "student", pendingCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("openSidebar", handleOpen);
    return () => window.removeEventListener("openSidebar", handleOpen);
  }, []);

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
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )
    },
    {
      name: "Practice Arena",
      path: "/student/practice",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      )
    },
    {
      name: "Analytics & Reports",
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
    borderRadius: "10px",
    cursor: "pointer",
    color: isActive ? "#2563EB" : "#64748B",
    fontSize: 13.5,
    fontWeight: isActive ? 600 : 500,
    textDecoration: "none",
    background: isActive ? "#EEF2FF" : "transparent",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
    position: "relative",
    overflow: "hidden"
  });

  return (
    <>
      <aside className="ip-sidebar-container" style={{
          width: 215,
          minWidth: 215,
          background: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #E2E8F0",
          minHeight: "100vh",
          flexShrink: 0,
          fontFamily: "var(--sans)",
          fontSize: 14,
          position: "relative"
        }}
      >
        <div
          style={{
            height: 68,
            boxSizing: "border-box",
            padding: "0 14px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", cursor: "pointer", width: "100%" }} onClick={() => navigate("/")}>
            <img src="/logo-light.png" alt="InterviewPilot" style={{ width: "100%", maxWidth: 155, objectFit: "contain" }} />
          </div>
          <button
            className="ip-hamburger-btn"
            onClick={() => setIsOpen(true)}
            style={{
              background: "transparent", border: "none", color: "#64748B",
              cursor: "pointer", display: "none", padding: 4
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className="ip-sidebar-nav" style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.08em", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, padding: "6px 8px 4px", marginTop: 4 }}>
            {role === "student" ? "STUDENT" : "RECRUITER"}
          </span>

          {mainLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link className="ip-sidebar-link" key={link.path}
                to={link.path}
                style={navItemStyle(isActive)}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.color = "#0F172A"; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748B"; } }}
              >
                {link.icon}
                {link.name}
                {link.badge ? (
                  <span style={{ marginLeft: "auto", background: "#2563EB", color: "#FFFFFF", fontSize: 11, width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}

          {accountLinks.length > 0 && (
            <>
              <span style={{ fontSize: 10, letterSpacing: "0.08em", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, padding: "12px 8px 4px", marginTop: 6 }}>
                ACCOUNT
              </span>
              {accountLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link className="ip-sidebar-link" key={link.path}
                    to={link.path}
                    style={navItemStyle(isActive)}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.color = "#0F172A"; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748B"; } }}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                );
              })}
              <div className="ip-sidebar-link" onClick={handleLogout}
                style={navItemStyle(false)}
                onMouseEnter={e => { e.currentTarget.style.background = "#FEE2E2"; e.currentTarget.style.color = "#DC2626"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748B"; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </div>
            </>
          )}


        </nav>

        {/* Sidebar collapse button */}
        <div style={{ padding: "8px 16px 16px", display: "flex", justifyContent: "flex-end" }}>
          <button style={{ width: 24, height: 24, borderRadius: "50%", background: "#F1F5F9", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748B" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div className="ip-mobile-overlay" style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "var(--color-bg-panel)", zIndex: 9999,
          display: "flex", flexDirection: "column",
          fontFamily: "var(--sans)"
        }}>
          {/* Header */}
          <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <img src="/logo-light.png" alt="InterviewPilot" style={{ width: "100%", maxWidth: 130, objectFit: "contain" }} />
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer", padding: 4 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Profile */}
          <div style={{ padding: "24px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid var(--color-border-subtle)" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent-light)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 600 }}>
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 600 }}>{displayName}</div>
              <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>{user?.email || "user@example.com"}</div>
            </div>
          </div>

          {/* Nav Links */}
          <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {[...mainLinks, ...(accountLinks.length > 0 ? accountLinks : [])].map(link => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, textDecoration: "none",
                    background: isActive ? "var(--accent-light)" : "transparent",
                    color: isActive ? "var(--accent)" : "var(--text-secondary)",
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 15
                  }}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Logout */}
          <div style={{ padding: "24px", borderTop: "1px solid var(--color-border-subtle)" }}>
            <button onClick={handleLogout} style={{
              width: "100%", padding: "14px", borderRadius: 12, background: "var(--danger-bg)", color: "var(--danger-text)",
              border: "1px solid var(--danger-border)", fontWeight: 600, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}
