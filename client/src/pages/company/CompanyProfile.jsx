import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import Sidebar from "../../components/Sidebar";
import StudentTopbar from "../../components/StudentTopbar";

export default function CompanyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await api.get('/careersync/company/profile');
        setProfile(data.company || data);
        setLoading(false);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(true);
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleRegister = () => {
    window.open("https://careersync.onrender.com", "_blank"); // placeholder URL
  };

  return (
    <div className="ip-app-wrapper" style={{ display: "flex", height: "100vh", background: "var(--bg-body)" }}>
      <Sidebar role="company" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <StudentTopbar title="Company Profile" />
        
        <div style={{ padding: "32px", overflowY: "auto", flex: 1 }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            {loading ? (
              <p style={{ textAlign: "center", color: "var(--text-muted)", marginTop: 40 }}>Loading profile...</p>
            ) : error || !profile ? (
              <div style={{ textAlign: "center", background: "#fff", padding: "48px 32px", borderRadius: 16, border: "1px solid var(--border)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginTop: 40 }}>
                <div style={{ width: 64, height: 64, background: "#fef2f2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>Profile Not Found</h2>
                <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
                  It looks like your company is not registered on CareerSync. You need a CareerSync account to view your full profile and recruit candidates.
                </p>
                <button 
                  onClick={handleRegister}
                  style={{ background: "var(--primary-color)", color: "#ffffff", border: "none", padding: "12px 24px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}
                  onMouseOver={e => e.currentTarget.style.transform = "translateY(-1px)"}
                  onMouseOut={e => e.currentTarget.style.transform = "none"}
                >
                  Register on CareerSync
                </button>
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                <div style={{ height: 120, background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}></div>
                <div style={{ padding: "0 32px 32px", position: "relative" }}>
                  <div style={{ width: 100, height: 100, borderRadius: 12, background: "#fff", border: "4px solid #fff", marginTop: -50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 600, color: "#1e293b", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 16 }}>
                    {profile.name?.charAt(0)?.toUpperCase() || "C"}
                  </div>
                  <h2 style={{ fontSize: 24, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>
                    {profile.name || "Company"}
                  </h2>
                  <p style={{ fontSize: 15, color: "var(--text-secondary)", margin: "0 0 24px" }}>
                    {profile.email}
                  </p>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
                    <div style={{ padding: 20, background: "var(--bg-body)", borderRadius: 12, border: "1px solid var(--border)" }}>
                      <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", margin: "0 0 8px", fontWeight: 600 }}>Role</p>
                      <p style={{ fontSize: 15, color: "var(--text-primary)", margin: 0, fontWeight: 500 }}>{profile.role || "Recruiter / Company"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
