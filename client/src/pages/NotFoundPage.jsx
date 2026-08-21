//Har Har Mahadev

import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "1rem", background: "#e4e8ee", fontFamily: "var(--font-sans)", fontSize: 14 }}>

        
        {/* main container of the 404 page...
        designed this block to match the clean and modern card aesthetics 
        of the careersync platform */}
        <div style={{
          background: "var(--bg-card)",
          border: "0.5px solid var(--border)",
          borderRadius: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          width: "100%",
          maxWidth: 400,
          padding: 40,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16
        }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔍</div>
          <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 500, background: "var(--danger-bg)", color: "var(--danger-text)", border: "0.5px solid var(--danger-border)" }}>Error 404</span>
          
          <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>
            Lost in <span style={{ color: "var(--accent)" }}>Space?</span>
          </h1>
          
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5, maxWidth: 280 }}>
            The page you are looking for does not exist or has been moved to a different coordinate.
          </p>

          <div style={{ display: "flex", gap: 12, marginTop: 16, width: "100%", justifyContent: "center" }}>
            <button 
              onClick={() => navigate(-1)}
              style={{ fontSize: 12, color: "var(--text-secondary)", background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 500 }}
            >
              ← Go Back
            </button>
            <button 
              onClick={() => navigate("/login")}
              style={{ fontSize: 12, color: "var(--bg-card)", background: "var(--accent)", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 500 }}
            >
              Go to Login
            </button>
          </div>
        </div>

        <div style={{ marginTop: 40 }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            InterviewPilot
          </p>
        </div>
      </div>
  );
}
