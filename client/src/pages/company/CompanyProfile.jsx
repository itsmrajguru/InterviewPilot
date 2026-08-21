import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import Sidebar from "../../components/Sidebar";
import CompanyTopbar from "../../components/CompanyTopbar";

import { IconUsers, IconBriefcase, IconMail, IconCheckCircle, IconExternalLink } from "../../components/ui/icons";
import Skeleton from "../../components/ui/Skeleton";

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
    window.open("https://careersync.onrender.com", "_blank");
  };

  const companyInitial = profile?.name ? profile.name.charAt(0).toUpperCase() : "C";

  return (
    <div className="ip-app-wrapper" style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC", overflow: "hidden", fontFamily: "var(--sans)", fontSize: 13 }}>
      <Sidebar role="company" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        <CompanyTopbar title="Company Profile" />

        <main style={{ flex: 1, overflowY: "auto", padding: "20px 24px 40px" }}>
          <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

            {loading ? (
              <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", padding: 32 }}>
                <Skeleton height={220} />
              </div>
            ) : error || !profile ? (
              <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", padding: 40, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#FEF2F2", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                  ⚠️
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", margin: 0 }}>CareerSync Profile Not Found</h2>
                <p style={{ fontSize: 13.5, color: "#64748B", margin: 0, maxWidth: 420, lineHeight: 1.5 }}>
                  It looks like your company account is not registered on CareerSync yet. Register on CareerSync to connect recruiter credentials.
                </p>
                <button
                  onClick={handleRegister}
                  style={{ marginTop: 8, padding: "10px 22px", borderRadius: 10, background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", color: "#FFFFFF", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                >
                  Register on CareerSync →
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                
                {/* Profile Banner Card */}
                <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", overflow: "hidden" }}>
                  <div style={{ height: 110, background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)" }} />
                  
                  <div style={{ padding: "0 24px 24px", position: "relative" }}>
                    <div style={{
                      width: 80, height: 80, borderRadius: 16, background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                      color: "#FFFFFF", border: "4px solid #FFFFFF", marginTop: -40, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 32, fontWeight: 700, boxShadow: "0 4px 12px rgba(15,23,42,0.08)", marginBottom: 12
                    }}>
                      {companyInitial}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
                          {profile.name || "Company Recruiter"}
                        </h1>
                        <p style={{ fontSize: 13, color: "#64748B", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                          <IconMail style={{ width: 14, height: 14, color: "#94A3B8" }} /> {profile.email}
                        </p>
                      </div>

                      <span style={{ fontSize: 12, fontWeight: 700, color: "#059669", background: "#ECFDF5", padding: "4px 12px", borderRadius: 10, border: "1px solid #A7F3D0", display: "flex", alignItems: "center", gap: 6 }}>
                        <IconCheckCircle style={{ width: 14, height: 14 }} /> Verified Recruiter
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                    Organization Credentials
                  </h3>

                  <div className="ip-grid-sub" style={{ gap: 16 }}>
                    <div style={{ padding: "14px 16px", borderRadius: 12, background: "#F8FAFC", border: "1px solid #F1F5F9" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748B" }}>
                        Role
                      </span>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", margin: "4px 0 0 0" }}>
                        {profile.role || "Recruiter / Hiring Manager"}
                      </p>
                    </div>

                    <div style={{ padding: "14px 16px", borderRadius: 12, background: "#F8FAFC", border: "1px solid #F1F5F9" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748B" }}>
                        Account Source
                      </span>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#2563EB", margin: "4px 0 0 0", display: "flex", alignItems: "center", gap: 6 }}>
                        CareerSync Integration <IconExternalLink style={{ width: 13, height: 13 }} />
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
