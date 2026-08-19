import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import Sidebar from "../../components/Sidebar";
import StudentTopbar from "../../components/StudentTopbar";

import { IconCheck, IconFile, IconBriefcase } from "../../components/ui/icons";
import Skeleton from "../../components/ui/Skeleton";

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const navigate              = useNavigate();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();

  const rawName     = user?.name || user?.email || "dev.msrajguru";
  const displayName = rawName.includes("@") ? rawName.split("@")[0] : rawName;
  const initials    = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await api.get('/careersync/student/profile');
        setProfile(data.student || data);
      } catch (err) {
        // Fallback to local profile details if backend endpoints differ
        setProfile({
          name: displayName,
          email: user?.email || "dev.msrajguru@example.com",
          role: "Software Development Engineer",
          phone: "+91 98765 43210",
          location: "India",
          skills: ["React.js", "Node.js", "Python", "System Design", "MongoDB", "SQL"],
          resumeLink: "#"
        });
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  return (
    <div className="ip-app-wrapper" style={{ display:"flex", minHeight:"100vh", background: "#F8FAFC", overflow: "hidden", fontFamily: "var(--sans)", fontSize: 13 }}>
      <Sidebar role="student" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <StudentTopbar title="My Profile" sub="" />

        <main style={{ flex: 1, overflowY: "auto", padding: "20px 24px 40px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Banner Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
                  My Profile 👤
                </h1>
                <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
                  Manage your personal details, academic background, resume, and account preferences.
                </p>
              </div>

              <button
                onClick={() => navigate("/student/settings")}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 10,
                  background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", color: "#FFFFFF",
                  border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)", transition: "all 0.15s"
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(37, 99, 235, 0.35)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.25)"; }}
              >
                <span>⚙️</span> Edit Settings
              </button>
            </div>

            {loading ? (
              <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
                <Skeleton height={120} />
                <Skeleton height={200} />
              </div>
            ) : (
              <>
                {/* Profile Hero Header Card */}
                <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", overflow: "hidden" }}>
                  <div style={{ height: 100, background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", padding: "16px 24px" }} />
                  <div style={{ padding: "0 24px 24px", position: "relative" }}>
                    
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: -40, marginBottom: 16 }}>
                      <div style={{
                        width: 72, height: 72, borderRadius: "50%", background: "#FFFFFF", border: "4px solid #FFFFFF",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700,
                        color: "#2563EB", boxShadow: "0 4px 12px rgba(15,23,42,0.08)"
                      }}>
                        {initials}
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#2563EB", background: "#EEF2FF", border: "1px solid #C7D2FE", padding: "4px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
                          <IconCheck style={{ width: 12, height: 12 }} /> Verified Candidate
                        </span>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#059669", background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "4px 10px", borderRadius: 20 }}>
                          Active Student
                        </span>
                      </div>
                    </div>

                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", margin: "0 0 2px 0" }}>
                        {profile?.name || displayName}
                      </h2>
                      <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
                        {profile?.role || "Software Engineer Student"} · {profile?.email || user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2-Column Info Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>

                  {/* Left Column: Personal Information */}
                  <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #F1F5F9", paddingBottom: 12 }}>
                      <IconUser style={{ color: "#2563EB", width: 18, height: 18 }} />
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Personal Information</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Full Name</span>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F172A", marginTop: 2 }}>{profile?.name || displayName}</div>
                      </div>

                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email Address</span>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F172A", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                          <IconMail style={{ color: "#64748B" }} /> {profile?.email || user?.email}
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Target Role</span>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F172A", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                          <IconBriefcase style={{ color: "#64748B" }} /> {profile?.role || "Software Engineer"}
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Location</span>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F172A", marginTop: 2 }}>{profile?.location || "India"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Resume & Skills */}
                  <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #F1F5F9", paddingBottom: 12 }}>
                      <IconFile style={{ color: "#2563EB", width: 18, height: 18 }} />
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Resume & Skills</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Resume</span>
                        <div style={{ marginTop: 6, padding: "10px 14px", borderRadius: 10, background: "#F8FAFC", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <IconFile style={{ color: "#2563EB", width: 16, height: 16 }} />
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#0F172A" }}>Resume_2026.pdf</span>
                          </div>
                          <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 12, fontWeight: 600, color: "#2563EB", textDecoration: "none" }}>
                            View ↗
                          </a>
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Technical Skills</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                          {(profile?.skills || ["React.js", "Node.js", "Python", "System Design", "MongoDB", "SQL"]).map(skill => (
                            <span key={skill} style={{ fontSize: 12, fontWeight: 600, color: "#2563EB", background: "#EEF2FF", border: "1px solid #C7D2FE", padding: "4px 10px", borderRadius: 99 }}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginTop: 4, padding: "12px 14px", borderRadius: 10, background: "#EFF6FF", border: "1px solid #BFDBFE", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 16 }}>⚡</span>
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1D4ED8" }}>CareerSync Account Sync</div>
                          <div style={{ fontSize: 11, color: "#2563EB", marginTop: 1 }}>Your profile details and mock stats are synced across InterviewPilot.</div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
