import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import Sidebar from "../../components/Sidebar";
import StudentTopbar from "../../components/StudentTopbar";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";

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
    <div className="ip-app-wrapper" style={{ display: "flex", height: "100vh", background: "var(--bg)", fontFamily: "var(--sans)" }}>
      <Sidebar role="company" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <StudentTopbar title="Company Profile" />
        
        <main style={{ flex: 1, overflowY: "auto" }}>
          <PageHeader title="Company Profile" subtitle="View your CareerSync company profile data" />

          <div style={{ maxWidth: 1180, margin: "-24px auto 0", padding: "0 24px 24px" }}>
            
            <div style={{ maxWidth: 700, margin: "0 auto", marginTop: "var(--space-6)" }}>
              {loading ? (
                <p style={{ textAlign: "center", color: "var(--text-secondary)" }}>Loading profile...</p>
              ) : error || !profile ? (
                <Card style={{ padding: "var(--space-10) var(--space-6)", textAlign: "center" }}>
                  <div style={{ width: 64, height: 64, background: "var(--danger-bg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--space-4)" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--danger-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <h2 style={{ fontSize: 24, fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-2)" }}>Profile Not Found</h2>
                  <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: "var(--space-6)", maxWidth: 400, margin: "0 auto var(--space-6)" }}>
                    It looks like your company is not registered on CareerSync. You need a CareerSync account to view your full profile and recruit candidates.
                  </p>
                  <Button variant="primary" onClick={handleRegister}>
                    Register on CareerSync
                  </Button>
                </Card>
              ) : (
                <Card style={{ overflow: "hidden" }}>
                  <div style={{ height: 120, background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}></div>
                  <div style={{ padding: "0 var(--space-6) var(--space-6)", position: "relative" }}>
                    <div style={{ width: 100, height: 100, borderRadius: "var(--radius-lg)", background: "var(--color-bg-panel)", border: "4px solid var(--color-bg-panel)", marginTop: -50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 600, color: "#1e293b", boxShadow: "var(--shadow-sm)", marginBottom: "var(--space-4)" }}>
                      {profile.name?.charAt(0)?.toUpperCase() || "C"}
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>
                      {profile.name || "Company"}
                    </h2>
                    <p style={{ fontSize: 15, color: "var(--text-secondary)", margin: "0 0 var(--space-6)" }}>
                      {profile.email}
                    </p>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-6)" }}>
                      <div style={{ padding: "var(--space-4)", background: "var(--color-bg-panel-sunken)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border-subtle)" }}>
                        <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", margin: "0 0 var(--space-2)", fontWeight: 600 }}>Role</p>
                        <p style={{ fontSize: 15, color: "var(--text-primary)", margin: 0, fontWeight: 500 }}>{profile.role || "Recruiter / Company"}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
