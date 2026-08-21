import { useState, useEffect, useRef } from "react";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();

  const rawName     = user?.name || user?.email || "dev.msrajguru";
  const displayName = rawName.includes("@") ? rawName.split("@")[0] : rawName;

  useEffect(() => {
    async function fetchProfile() {
      try {
        // First check local storage for edits
        const localData = localStorage.getItem("mockStudentProfile");
        if (localData) {
          setProfile(JSON.parse(localData));
          setLoading(false);
          return;
        }

        const { data } = await api.get('/careersync/student/profile');
        setProfile(data.student || data);
      } catch (err) {
        // Fallback
        setProfile({
          name: displayName,
          email: user?.email || "dev.msrajguru@example.com",
          role: "Software Development Engineer",
          location: "India",
          skills: ["React.js", "Node.js", "Python", "System Design", "MongoDB", "SQL"],
          resumeFile: "Resume_2026.pdf"
        });
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setEditForm({
        ...profile,
        skillsStr: profile?.skills?.join(", ") || ""
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    const updatedProfile = {
      ...profile,
      ...editForm,
      skills: editForm.skillsStr.split(",").map(s => s.trim()).filter(Boolean)
    };
    
    // Save to local state and localStorage
    setProfile(updatedProfile);
    localStorage.setItem("mockStudentProfile", JSON.stringify(updatedProfile));
    setIsEditing(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      // Simulate upload delay
      setTimeout(() => {
        const updatedProfile = { ...profile, resumeFile: file.name };
        setProfile(updatedProfile);
        localStorage.setItem("mockStudentProfile", JSON.stringify(updatedProfile));
        setIsUploading(false);
      }, 1500);
    }
  };

  const handleViewResume = (e) => {
    e.preventDefault();
    const fileName = profile?.resumeFile || "Resume_2026.pdf";
    const blob = new Blob([`Dummy Resume File: ${fileName}\n\n(In a full production build, this would serve the actual PDF file from secure cloud storage.)`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const initials = (profile?.name || displayName).slice(0, 2).toUpperCase();

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #CBD5E1",
    fontSize: 13.5,
    fontFamily: "var(--sans)",
    color: "#0F172A",
    outline: "none",
    marginTop: 4
  };

  return (
    <div className="ip-app-wrapper" style={{ display:"flex", minHeight:"100vh", background: "#F8FAFC", overflow: "hidden", fontFamily: "var(--sans)", fontSize: 13 }}>
      <Sidebar role="student" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
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
                <span>⚙️</span> Account Settings
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
                <div className="ip-flex-wrap" style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 24, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20 }}>
                  
                  <div style={{
                    width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700,
                    color: "#FFFFFF", boxShadow: "0 4px 12px rgba(37,99,235,0.25)", flexShrink: 0
                  }}>
                    {initials}
                  </div>

                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
                      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                        {profile?.name || displayName}
                      </h2>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: "#2563EB", background: "#EEF2FF", border: "1px solid #C7D2FE", padding: "4px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
                        <IconCheck style={{ width: 12, height: 12 }} /> Verified Candidate
                      </span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: "#059669", background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "4px 10px", borderRadius: 20 }}>
                        Active Student
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: "#64748B", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {profile?.role || "Software Engineer Student"} · {profile?.email || user?.email}
                    </p>
                  </div>

                  {isEditing ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={handleEditToggle}
                        style={{
                          padding: "9px 18px", borderRadius: 10, background: "#FFFFFF", color: "#64748B",
                          border: "1px solid #E2E8F0", fontWeight: 600, fontSize: 13, cursor: "pointer"
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        style={{
                          padding: "9px 18px", borderRadius: 10, background: "#10B981", color: "#FFFFFF",
                          border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(16,185,129,0.25)"
                        }}
                      >
                        💾 Save Changes
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleEditToggle}
                      style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 10,
                        background: "#FFFFFF", color: "#0F172A",
                        border: "1px solid #E2E8F0", fontWeight: 600, fontSize: 13, cursor: "pointer",
                        boxShadow: "0 1px 2px rgba(15,23,42,0.05)", transition: "all 0.15s", flexShrink: 0
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#F8FAFC"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#FFFFFF"; }}
                    >
                      ✏️ Edit Profile
                    </button>
                  )}

                </div>

                {/* Content Grid */}
                <div className="ip-grid-main" style={{ gap: 16 }}>

                  {/* Left Column: Personal Information */}
                  <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #F1F5F9", paddingBottom: 12 }}>
                      <IconUser style={{ color: "#2563EB", width: 18, height: 18 }} />
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Personal Information</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Full Name</span>
                        {isEditing ? (
                          <input style={inputStyle} value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                        ) : (
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F172A", marginTop: 2 }}>{profile?.name || displayName}</div>
                        )}
                      </div>

                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email Address</span>
                        {isEditing ? (
                          <input style={inputStyle} type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                        ) : (
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F172A", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                            <IconMail style={{ color: "#64748B" }} /> {profile?.email || user?.email}
                          </div>
                        )}
                      </div>



                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Target Role</span>
                        {isEditing ? (
                          <input style={inputStyle} value={editForm.role || ""} onChange={e => setEditForm({...editForm, role: e.target.value})} />
                        ) : (
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F172A", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                            <IconBriefcase style={{ color: "#64748B" }} /> {profile?.role || "Software Engineer"}
                          </div>
                        )}
                      </div>

                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Location</span>
                        {isEditing ? (
                          <input style={inputStyle} value={editForm.location || ""} onChange={e => setEditForm({...editForm, location: e.target.value})} />
                        ) : (
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F172A", marginTop: 2 }}>{profile?.location || "India"}</div>
                        )}
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
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Resume</span>
                          
                          <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            style={{ background: "transparent", border: "none", color: "#2563EB", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "color 0.15s" }} 
                            onMouseEnter={e => e.currentTarget.style.color = "#1D4ED8"} 
                            onMouseLeave={e => e.currentTarget.style.color = "#2563EB"}
                            disabled={isUploading}
                          >
                            {isUploading ? "Uploading..." : "+ Update Resume"}
                          </button>
                        </div>
                        <div style={{ marginTop: 6, padding: "10px 14px", borderRadius: 10, background: "#F8FAFC", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <IconFile style={{ color: "#2563EB", width: 16, height: 16 }} />
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#0F172A", maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {profile?.resumeFile || "Resume_2026.pdf"}
                            </span>
                          </div>
                          <a href="#" onClick={handleViewResume} style={{ fontSize: 12, fontWeight: 600, color: "#2563EB", textDecoration: "none" }}>
                            View ↗
                          </a>
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Technical Skills</span>
                        {isEditing ? (
                          <>
                            <textarea 
                              style={{...inputStyle, minHeight: 60, resize: "vertical"}} 
                              value={editForm.skillsStr || ""} 
                              onChange={e => setEditForm({...editForm, skillsStr: e.target.value})}
                              placeholder="Comma separated (e.g. React.js, Node.js)"
                            />
                            <div style={{ fontSize: 10.5, color: "#94A3B8", marginTop: 4 }}>Separate skills with commas</div>
                          </>
                        ) : (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                            {(profile?.skills || ["React.js", "Node.js", "Python", "System Design", "MongoDB", "SQL"]).map((skill, idx) => (
                              <span key={idx} style={{ fontSize: 12, fontWeight: 600, color: "#2563EB", background: "#EEF2FF", border: "1px solid #C7D2FE", padding: "4px 10px", borderRadius: 99 }}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
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
