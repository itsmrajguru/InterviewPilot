import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import StudentTopbar from "../../components/StudentTopbar";
import { createInterviewSession } from "../../services/interviewService";

import { IconBriefcase, IconCheck, IconFile, IconArrowRight } from "../../components/ui/icons";
import Skeleton from "../../components/ui/Skeleton";

const POPULAR_ROLES = [
  "Software Engineer",
  "Product Manager",
  "Data Scientist",
  "Frontend Developer",
  "Backend Engineer",
  "Marketing Manager",
  "Financial Analyst",
  "UX/UI Designer",
];

const POPULAR_SKILLS = [
  "React.js",
  "Python",
  "System Design",
  "Node.js",
  "SQL",
  "Machine Learning",
  "AWS / Cloud",
  "Java",
];

const EXPERIENCE_OPTIONS = [
  {
    id: "internship",
    title: "Internship",
    sub: "No experience / student",
    note: "Focused on basics and potential",
    diff: "easy",
  },
  {
    id: "fresher",
    title: "Fresher",
    sub: "Less than 1 year experience",
    note: "Focused on core knowledge",
    diff: "medium",
  },
  {
    id: "experienced",
    title: "Experienced",
    sub: "More than 1 year experience",
    note: "Focused on depth and experience",
    diff: "hard",
  },
];

const DURATION_OPTIONS = [
  {
    id: "quick",
    title: "Quick (10 mins)",
    sub: "4-5 questions",
  },
  {
    id: "indepth",
    title: "In-depth (20 mins)",
    sub: "7-8 questions",
  },
];

export default function StudentPractice() {
  const navigate = useNavigate();
  const [tabMode, setTabMode]               = useState("role"); // 'role' | 'skill' | 'jd'
  const [jobRole, setJobRole]               = useState("");
  const [selectedExp, setSelectedExp]       = useState("fresher");
  const [selectedDuration, setSelectedDuration] = useState("indepth");
  const [resumeText, setResumeText]         = useState("");
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState("");

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();

  const handleStartPractice = async (e) => {
    if (e) e.preventDefault();
    if (!jobRole.trim() && tabMode !== "jd") {
      setError("Please select or enter a target role or skill.");
      return;
    }

    setLoading(true);
    setError("");

    const chosenExpObj = EXPERIENCE_OPTIONS.find(e => e.id === selectedExp);
    const difficulty = chosenExpObj ? chosenExpObj.diff : "medium";

    try {
      const res = await createInterviewSession({
        studentEmail: user.email,
        role: jobRole || (tabMode === "jd" ? "Job Description Simulation" : "Software Engineer"),
        difficulty,
        resumeText
      });
      if (res.success && res.session) {
        navigate(`/interview/join/${res.session.inviteToken}`);
      } else {
        setError(res.message || "Failed to prepare your practice session.");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ip-app-wrapper" style={{ display:"flex", minHeight:"100vh", background: "#F8FAFC", overflow: "hidden", fontFamily: "var(--sans)", fontSize: 13 }}>
      <Sidebar role="student" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowY: "auto" }}>
        <StudentTopbar title="Practice Arena" sub="" />

        <main className="ip-main-pad" style={{ maxWidth: 1040, margin: "0 auto", width: "100%" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Header Banner */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", margin: 0, letterSpacing: "-0.02em" }}>
                Let's set up your practice
              </h1>
              <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
                Customize the AI to simulate your target role or skill perfectly
              </p>
            </div>

            {error && (
              <div style={{ padding: "12px 16px", borderRadius: 10, background: "var(--danger-bg)", color: "var(--danger-text)", fontSize: 13, border: "1px solid var(--danger-border)" }}>
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid #EEF2FF", borderTopColor: "#2563EB", animation: "sp-spin 0.8s linear infinite" }} />
                <style>{`@keyframes sp-spin { to { transform: rotate(360deg); } }`}</style>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 4px 0" }}>Preparing your custom AI interview...</h3>
                  <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Generating tailored questions & coding prompts for {jobRole || "your role"}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleStartPractice} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                
                {/* ══ CARD 1: Mode & Role Input ══ */}
                <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
                  
                  {/* Mode Tabs */}
                  <div className="ip-flex-wrap" style={{ display: "flex", gap: 16, alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: 12 }}>
                    {[
                      { id: "role", label: "Select a Role" },
                      { id: "skill", label: "Select a Skill" },
                      { id: "jd", label: "Paste job description" },
                    ].map(tab => {
                      const active = tabMode === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => { setTabMode(tab.id); setJobRole(""); }}
                          style={{
                            background: "none", border: "none", padding: "4px 0", cursor: "pointer",
                            fontSize: 14, fontWeight: active ? 700 : 500,
                            color: active ? "#2563EB" : "#64748B",
                            position: "relative", transition: "color 0.15s"
                          }}
                        >
                          {tab.label}
                          {active && (
                            <div style={{ position: "absolute", bottom: -13, left: 0, right: 0, height: 2, background: "#2563EB", borderRadius: 2 }} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Input Box */}
                  {tabMode === "jd" ? (
                    <textarea
                      value={jobRole}
                      onChange={e => setJobRole(e.target.value)}
                      placeholder="Paste the full job description here..."
                      style={{
                        width: "100%", height: 110, padding: "12px 16px", borderRadius: 10,
                        border: "1px solid #E2E8F0", background: "#F8FAFC", outline: "none",
                        fontSize: 13.5, color: "#0F172A", resize: "none", fontFamily: "inherit"
                      }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={jobRole}
                      onChange={e => setJobRole(e.target.value)}
                      placeholder={tabMode === "role" ? "e.g. Full Stack Developer, Product Manager, Data Scientist..." : "e.g. React.js, Python, System Design, SQL..."}
                      style={{
                        width: "100%", padding: "12px 16px", borderRadius: 10,
                        border: "1px solid #E2E8F0", background: "#F8FAFC", outline: "none",
                        fontSize: 14, color: "#0F172A", transition: "all 0.15s"
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.background = "#FFFFFF"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#F8FAFC"; }}
                    />
                  )}

                  {/* Trending Pills */}
                  {tabMode !== "jd" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B", display: "flex", alignItems: "center", gap: 6 }}>
                        <span>💡</span> {tabMode === "role" ? "Popular roles to practice" : "Popular skills to practice"}
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {(tabMode === "role" ? POPULAR_ROLES : POPULAR_SKILLS).map(item => {
                          const isSelected = jobRole === item;
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setJobRole(item)}
                              style={{
                                padding: "7px 14px", borderRadius: 99,
                                background: isSelected ? "#EEF2FF" : "#F8FAFC",
                                border: isSelected ? "1px solid #2563EB" : "1px solid #E2E8F0",
                                color: isSelected ? "#2563EB" : "#475569",
                                fontSize: 12.5, fontWeight: isSelected ? 600 : 500,
                                cursor: "pointer", transition: "all 0.15s"
                              }}
                              onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = "#CBD5E1"; e.currentTarget.style.background = "#FFFFFF"; } }}
                              onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#F8FAFC"; } }}
                            >
                              {item}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>

                {/* ══ CARD 2: Experience Level ══ */}
                <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: 0 }}>Experience level</h3>
                  <div className="ip-flex-col-mobile" style={{ display: "flex", gap: 14 }}>
                    {EXPERIENCE_OPTIONS.map(exp => {
                      const active = selectedExp === exp.id;
                      return (
                        <div
                          key={exp.id}
                          onClick={() => setSelectedExp(exp.id)}
                          style={{
                            flex: 1, minWidth: 0,
                            padding: "16px", borderRadius: 12,
                            background: active ? "#EEF2FF" : "#F8FAFC",
                            border: active ? "1.5px solid #2563EB" : "1px solid #E2E8F0",
                            cursor: "pointer", transition: "all 0.15s",
                            display: "flex", flexDirection: "column", gap: 4, position: "relative"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: active ? "#2563EB" : "#0F172A" }}>{exp.title}</span>
                            {active && (
                              <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#2563EB", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <IconCheck style={{ width: 11, height: 11 }} />
                              </div>
                            )}
                          </div>
                          <span style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{exp.sub}</span>
                          <span style={{ fontSize: 11, color: active ? "#2563EB" : "#94A3B8", marginTop: 4, fontWeight: 500 }}>{exp.note}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ══ CARD 3: Duration ══ */}
                <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: 0 }}>Duration</h3>
                  <div className="ip-grid-2col" style={{ gap: 14 }}>
                    {DURATION_OPTIONS.map(dur => {
                      const active = selectedDuration === dur.id;
                      return (
                        <div
                          key={dur.id}
                          onClick={() => setSelectedDuration(dur.id)}
                          style={{
                            padding: "16px", borderRadius: 12,
                            background: active ? "#EEF2FF" : "#F8FAFC",
                            border: active ? "1.5px solid #2563EB" : "1px solid #E2E8F0",
                            cursor: "pointer", transition: "all 0.15s",
                            display: "flex", flexDirection: "column", gap: 4
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: active ? "#2563EB" : "#0F172A" }}>{dur.title}</span>
                            {active && (
                              <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#2563EB", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <IconCheck style={{ width: 11, height: 11 }} />
                              </div>
                            )}
                          </div>
                          <span style={{ fontSize: 12, color: "#64748B" }}>{dur.sub}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ══ CARD 4: Upload / Paste Resume ══ */}
                <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 2px 0" }}>
                      Upload your resume <span style={{ fontSize: 12, fontWeight: 500, color: "#94A3B8" }}>(Optional)</span>
                    </h3>
                    <p style={{ fontSize: 12.5, color: "#64748B", margin: 0 }}>
                      Uploading or pasting your resume helps the AI ask personalized questions about your projects and experience
                    </p>
                  </div>

                  <textarea
                    value={resumeText}
                    onChange={e => setResumeText(e.target.value)}
                    placeholder="Paste your resume text or project highlights here..."
                    style={{
                      width: "100%", height: 90, padding: "12px 16px", borderRadius: 10,
                      border: "1px solid #E2E8F0", background: "#F8FAFC", outline: "none",
                      fontSize: 13, color: "#0F172A", resize: "none", fontFamily: "inherit"
                    }}
                  />
                </div>

                {/* ══ BOTTOM CTA BUTTON ══ */}
                <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
                  <button
                    type="submit"
                    style={{
                      padding: "14px 36px", borderRadius: 12,
                      background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                      color: "#FFFFFF", border: "none", fontWeight: 700, fontSize: 15,
                      cursor: "pointer", boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
                      display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(37, 99, 235, 0.4)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(37, 99, 235, 0.3)"; }}
                  >
                    <span>✨</span> Start new interview
                  </button>
                </div>

              </form>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}