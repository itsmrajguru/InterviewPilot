import { useNavigate } from "react-router-dom";

/* icons */
const IconHamburger = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const IconChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

/* modern top bar component */
export default function StudentTopbar({ title, sub, rightContent }) {
  const navigate = useNavigate();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();
  const displayName = user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleOpenSidebar = () => {
    window.dispatchEvent(new Event("openSidebar"));
  };

  return (
    <header 
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 68,
        padding: "0 24px",
        background: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        position: "sticky",
        top: 0,
        zIndex: 50,
        flexShrink: 0,
        fontFamily: "var(--sans)"
      }}
    >
      {/* LEFT: Mobile Hamburger & Page Context */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Mobile Hamburger - Only visible on small screens */}
        <button
          className="ip-mobile-hamburger"
          onClick={handleOpenSidebar}
          style={{
            background: "transparent",
            border: "none",
            color: "#64748B",
            cursor: "pointer",
            padding: 4,
            display: "none", /* Hidden by default, shown via CSS on mobile */
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Open menu"
        >
          <IconHamburger />
        </button>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500, color: "#94A3B8" }}>
            <span 
              onClick={() => navigate("/student/dashboard")}
              style={{ cursor: "pointer", transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#0F172A"}
              onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}
            >
              Home
            </span>
            <span style={{ fontSize: 12 }}>/</span>
            <span style={{ color: "#0F172A", fontWeight: 600 }}>
              {title || "Dashboard"}
            </span>
          </div>
          {sub && (
            <span 
              className="ip-desktop-only" 
              style={{ 
                fontSize: 13, 
                color: "#64748B", 
                marginTop: 2 
              }}
            >
              {sub}
            </span>
          )}
        </div>
      </div>

      {/* RIGHT: Notifications & Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        
        {rightContent && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginRight: 8, paddingRight: 16, borderRight: "1px solid #E2E8F0" }}>
            {rightContent}
          </div>
        )}
        
        {/* Notification Bell */}
        <button 
          onClick={() => navigate("/student/interviews")}
          style={{ 
            position: "relative",
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#F8FAFC",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#475569",
            cursor: "pointer",
            transition: "all 0.15s ease",
            outline: "none"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#F1F5F9"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#F8FAFC"; }}
          onFocus={e => { e.currentTarget.style.boxShadow = "0 0 0 2px #BFDBFE"; }}
          onBlur={e => { e.currentTarget.style.boxShadow = "none"; }}
          aria-label="Notifications"
        >
          <IconBell />
          {/* Notification Badge */}
          <span style={{
            position: "absolute", 
            top: -2, 
            right: -2, 
            background: "#EF4444", 
            color: "#FFFFFF",
            fontSize: 10, 
            fontWeight: 700, 
            minWidth: 16, 
            height: 16, 
            padding: "0 4px",
            borderRadius: 8,
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            border: "2px solid #FFFFFF",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
          }}>
            2
          </span>
        </button>

        {/* Profile Dropdown Trigger */}
        <button 
          onClick={() => navigate("/student/profile")}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 10, 
            cursor: "pointer",
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            padding: "4px 12px 4px 4px",
            borderRadius: 99,
            transition: "all 0.15s ease",
            outline: "none"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#F1F5F9"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#F8FAFC"; }}
          onFocus={e => { e.currentTarget.style.boxShadow = "0 0 0 2px #BFDBFE"; }}
          onBlur={e => { e.currentTarget.style.boxShadow = "none"; }}
          aria-label="User profile"
        >
          <div style={{
            width: 32, 
            height: 32, 
            borderRadius: "50%", 
            background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
            color: "#FFFFFF", 
            fontSize: 12, 
            fontWeight: 700, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
          }}>
            {initials}
          </div>
          <div className="ip-desktop-only" style={{ display: "flex", alignItems: "center", marginRight: 4 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0F172A" }}>{displayName}</span>
          </div>
          <div style={{ color: "#94A3B8" }}>
            <IconChevronDown />
          </div>
        </button>

      </div>
    </header>
  );
}
