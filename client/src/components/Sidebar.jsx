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
    color: isActive ? "var(--sidebar-active-text)" : "var(--sidebar-text)",
    fontSize: 13,
    textDecoration: "none",
    background: isActive ? "var(--sidebar-active-bg)" : "transparent",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  });

  return (
    <>
      <aside className="ip-sidebar-container" style={{
          width: 228,
          minWidth: 228,
          background: "var(--sidebar-bg)",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid var(--sidebar-active-bg)",
          minHeight: "100vh",
          flexShrink: 0,
          fontFamily: "var(--font-sans)",
          fontSize: 14,
        }}
      >
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid var(--sidebar-active-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => navigate("/")}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", flexShrink: 0 }}>
              <img src="/logo.svg" alt="CareerSync" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#ffffff", fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}>CareerSync</span>
              <span style={{ color: "var(--accent)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 1 }}>AI Interviews</span>
            </div>
          </div>
          <button
            className="ip-hamburger-btn"
            onClick={() => setIsOpen(true)}
            style={{
              background: "transparent", border: "none", color: "#fff",
              cursor: "pointer", display: "none", padding: 4
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className="ip-sidebar-nav" style={{ padding: "16px 10px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.1em", color: "#3d4f5e", textTransform: "uppercase", padding: "8px 10px 6px", marginTop: 8 }}>
            {role === "student" ? "Student" : "Recruiter"}
          </span>

          {mainLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link className="ip-sidebar-link" key={link.path}
                to={link.path}
                style={navItemStyle(isActive)}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "var(--sidebar-active-bg)"; e.currentTarget.style.color = "var(--sidebar-active-text)"; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--sidebar-text)"; } }}
              >
                {link.icon}
                {link.name}
                {link.badge ? (
                  <span style={{ marginLeft: "auto", background: "var(--accent-light)", color: "var(--accent)", fontSize: 10, padding: "2px 7px", borderRadius: 20, fontWeight: 500 }}>
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}

          {accountLinks.length > 0 && (
            <>
              <span style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--sidebar-text)", textTransform: "uppercase", padding: "8px 10px 6px", marginTop: 8 }}>
                Account
              </span>
              {accountLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link className="ip-sidebar-link" key={link.path}
                    to={link.path}
                    style={navItemStyle(isActive)}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "var(--sidebar-active-bg)"; e.currentTarget.style.color = "var(--sidebar-active-text)"; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--sidebar-text)"; } }}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="ip-sidebar-profile" style={{ padding: "14px 16px", borderTop: "1px solid var(--sidebar-active-bg)",
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
              background: "var(--accent-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent)",
              fontSize: 12,
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ color: "var(--sidebar-active-text)", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {displayName}
            </div>
            <div style={{ color: "var(--sidebar-text)", fontSize: 11 }}>
              {role === "student" ? "Student" : "Recruiter"}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sidebar-text)", padding: 2, display: "flex", alignItems: "center" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div className="ip-mobile-overlay" style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "var(--bg-card)", zIndex: 9999,
          display: "flex", flexDirection: "column",
          fontFamily: "var(--font-sans)"
        }}>
          {/* Header */}
          <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", flexShrink: 0 }}>
                <img src="/logo.svg" alt="CareerSync" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <span style={{ color: "var(--text-primary)", fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>CareerSync</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer", padding: 4 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Profile */}
          <div style={{ padding: "24px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid var(--border)" }}>
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
                    background: isActive ? "#eff6ff" : "transparent",
                    color: isActive ? "#2563eb" : "var(--text-secondary)",
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
          <div style={{ padding: "24px", borderTop: "1px solid var(--border)" }}>
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
