import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import Sidebar from "../../components/Sidebar";
import { createInterviewSession, getCompanySessions } from "../../services/interviewService";

import { IconPlus, IconUsers, IconClock, IconCheck, IconArrowRight, IconStar, IconSend, IconCircleCheck } from "../../components/ui/icons";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Badge from "../../components/ui/Badge";
import PageHeader from "../../components/ui/PageHeader";

function CandidateRow({ session, onViewReport }) {
  const isCompleted = session.status === "completed";
  const isPending = session.status === "pending";
  const isActive = session.status === "active";

  const initial = (session.studentEmail || "C").charAt(0).toUpperCase();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 12, background: "#F8FAFC", border: "1px solid #F1F5F9" }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        background: isCompleted ? "#ECFDF5" : isPending ? "#FEF3C7" : "#EFF6FF",
        color: isCompleted ? "#059669" : isPending ? "#D97706" : "#2563EB", fontWeight: 700, fontSize: 14
      }}>
        {initial}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {session.studentEmail}
        </div>
        <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2 }}>
          {session.role || "Software Engineer"} · <span style={{ textTransform: "capitalize" }}>{session.difficulty}</span> ·{" "}
          {session.createdAt ? new Date(session.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {isCompleted && session.report?.overallScore !== undefined && (
          <span style={{ fontSize: 12, fontWeight: 700, color: session.report.overallScore >= 75 ? "#059669" : "#2563EB", background: session.report.overallScore >= 75 ? "#ECFDF5" : "#EFF6FF", padding: "4px 8px", borderRadius: 8 }}>
            {session.report.overallScore}/100
          </span>
        )}
        {isCompleted ? (
          <button 
            onClick={() => onViewReport(session._id)}
            style={{ padding: "6px 16px", borderRadius: 8, background: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}
          >
            Report →
          </button>
        ) : isPending ? (
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#D97706", background: "#FEF3C7", padding: "3px 10px", borderRadius: 10 }}>
            Pending
          </span>
        ) : (
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#2563EB", background: "#EEF2FF", padding: "3px 10px", borderRadius: 10 }}>
            {session.status}
          </span>
        )}
      </div>
    </div>
  );
}

export default function CompanyDashboard() {
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [candidateEmail, setCandidateEmail] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();
  const companyName = user?.name || "Company";

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await getCompanySessions();
        if (data.success) setSessions(data.sessions);
      } catch (e) {
        console.error("Failed to load sessions:", e);
      } finally {
        setLoadingSessions(false);
      }
    };
    loadSessions();
  }, []);

  useEffect(() => {
    if (!sessions.length) return;
    const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
      : 'http://localhost:7878';
    const socket = io(SOCKET_URL, { withCredentials: true });

    sessions.forEach(s => socket.emit('join:session', s._id));

    socket.on('session:started', ({ sessionId }) => {
      setSessions(prev => prev.map(s => s._id === sessionId ? { ...s, status: 'active' } : s));
    });

    socket.on('session:progress', ({ sessionId, answeredCount, totalQuestions }) => {
      setSessions(prev => prev.map(s => s._id === sessionId ? { ...s, _answeredCount: answeredCount, _totalQuestions: totalQuestions } : s));
    });

    socket.on('session:completed', ({ sessionId, overallScore }) => {
      setSessions(prev => prev.map(s => s._id === sessionId ? { ...s, status: 'completed', report: { overallScore } } : s));
    });

    return () => { socket.disconnect(); };
  }, [sessions.length]);

  const totalInvited = sessions.length;
  const activeNow    = sessions.filter(s => s.status === "active").length;
  const completed    = sessions.filter(s => s.status === "completed").length;
  const pending      = sessions.filter(s => s.status === "pending").length;

  const handleCreateInterview = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    setCreateLoading(true);

    try {
      const data = await createInterviewSession({
        studentEmail: candidateEmail,
        role: jobRole,
        difficulty
      });

      if (data.success) {
        setCreateSuccess(`Invite sent to ${candidateEmail}! Link: ${data.session.joinURL}`);
        setSessions(prev => [data.session, ...prev]);
        setCandidateEmail("");
        setJobRole("");
        setDifficulty("medium");
      } else {
        setCreateError(data.message || "Failed to create interview.");
      }
    } catch (e) {
      console.error("createSession error:", e);
      setCreateError(e.response?.data?.message || "Connection error. Please try again.");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="ip-app-wrapper" style={{ display:"flex", minHeight:"100vh", background: "#F8FAFC", overflow: "hidden", fontFamily: "var(--sans)", fontSize: 13 }}>
      <Sidebar role="company" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* Recruiter Topbar */}
        <div style={{
          padding: "0 20px", height: 60, borderBottom: "1px solid #E2E8F0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#FFFFFF", flexShrink: 0, position: "sticky", top: 0, zIndex: 50
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Dashboard</span>
            <span style={{ fontSize: 14, color: "#94A3B8" }}>|</span>
            <span style={{ fontSize: 11.5, color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
              Recruiter workspace
            </span>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10,
              background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", color: "#FFFFFF",
              border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)"
            }}
          >
            <IconPlus style={{ width: 14, height: 14 }} /> Create Interview
          </button>
        </div>

        <main style={{ flex: 1, overflowY: "auto", padding: "20px 24px 40px" }}>
          <div style={{ maxWidth: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Banner Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
                  Good evening, <span style={{ color: "#2563EB" }}>{companyName}</span> 👋
                </h1>
                <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
                  Track and manage all your talent candidates and interview invitations in real-time.
                </p>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 10,
                  background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", color: "#FFFFFF",
                  border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)", transition: "all 0.15s"
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(37, 99, 235, 0.35)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.25)"; }}
              >
                <span>✨</span> Send New Invite
              </button>
            </div>

            {/* 4 Top Stat Cards Grid */}
            <div className="ip-stat-cards-grid">
              <StatCard label="Total Invited" icon={IconUsers} value={loadingSessions ? "—" : totalInvited} sub="All time total" hue="blue" />
              <StatCard label="Active Now" icon={IconClock} value={loadingSessions ? "—" : activeNow} sub={activeNow > 0 ? "Currently interviewing" : "All clear"} hue="amber" />
              <StatCard label="Completed" icon={IconCheck} value={loadingSessions ? "—" : completed} sub="Awaiting review" hue="emerald" />
              <StatCard label="Pending" icon={IconClock} value={loadingSessions ? "—" : pending} sub="Invites sent" hue="purple" />
            </div>

            {/* Main 2-Column Grid (50% / 50% matching 2 stat cards each) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "start" }}>
              
              {/* Left Column: Recent Candidates Pipeline */}
              <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
                    <IconUsers style={{ color: "#2563EB", width: 18, height: 18 }} /> Recent Candidates
                  </span>
                  <span style={{ fontSize: 12.5, color: "#2563EB", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/company/interviews")}>
                    View all →
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {loadingSessions ? (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "#64748B", fontSize: 13 }}>Loading pipeline...</div>
                  ) : sessions.length === 0 ? (
                    <EmptyState
                      icon={IconUsers}
                      title="No candidates yet"
                      subtext="Click 'Send New Invite' to generate a secure link for a candidate."
                    />
                  ) : (
                    sessions.slice(0, 5).map((session) => (
                      <CandidateRow key={session._id} session={session} onViewReport={(id) => navigate(`/interview/${id}/report`)} />
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Quick Actions & Workflow */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                
                {/* Quick actions Card */}
                <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 20 }}>
                  <div style={{ marginBottom: 14 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
                      <IconStar style={{ color: "#2563EB", width: 18, height: 18 }} /> Quick Actions
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div
                      onClick={() => setShowCreateModal(true)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "12px", borderRadius: 12,
                        border: "1px solid #E2E8F0", background: "#FFFFFF", cursor: "pointer", transition: "all 0.15s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.08)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: "#EEF2FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <IconPlus style={{ width: 16, height: 16 }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12.5, color: "#0F172A", fontWeight: 600 }}>Send New Invite</div>
                        <div style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>Role & difficulty</div>
                      </div>
                    </div>

                    <div
                      onClick={() => navigate("/company/interviews")}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "12px", borderRadius: 12,
                        border: "1px solid #E2E8F0", background: "#FFFFFF", cursor: "pointer", transition: "all 0.15s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.08)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <IconUsers style={{ width: 16, height: 16 }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12.5, color: "#0F172A", fontWeight: 600 }}>View Candidates</div>
                        <div style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>Manage pipeline</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workflow Summary Card */}
                <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 20 }}>
                  <div style={{ marginBottom: 14 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
                      <IconCircleCheck style={{ color: "#059669", width: 18, height: 18 }} /> Hiring Workflow
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { num: "1", title: "Create Interview", desc: "Select role and difficulty. Candidate gets a secure link." },
                      { num: "2", title: "AI Evaluation", desc: "AI conducts technical & HR rounds, evaluating answers in real time." },
                      { num: "3", title: "Review Report", desc: "Access comprehensive scores, transcript analysis, and recommendation." },
                    ].map((step) => (
                      <div key={step.num} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#EEF2FF", color: "#2563EB", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                          {step.num}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{step.title}</div>
                          <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 1 }}>{step.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        </main>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }} onClick={() => { setShowCreateModal(false); setCreateError(""); setCreateSuccess(""); }}>
          <div style={{ width: "100%", maxWidth: 440, borderRadius: 16, boxShadow: "0 10px 25px rgba(0,0,0,0.15)", overflow: "hidden", background: "#FFFFFF", border: "1px solid #E2E8F0" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Create New Interview</span>
              <button style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 16 }} onClick={() => { setShowCreateModal(false); setCreateError(""); setCreateSuccess(""); }}>✕</button>
            </div>

            {createError && (
              <div style={{ margin: "16px 20px 0", padding: "10px 12px", borderRadius: 8, fontSize: 12, background: "var(--danger-bg)", color: "var(--danger-text)", border: "1px solid var(--danger-border)" }}>
                {createError}
              </div>
            )}
            {createSuccess && (
              <div style={{ margin: "16px 20px 0", padding: "10px 12px", borderRadius: 8, fontSize: 12, background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0", wordBreak: "break-all" }}>
                {createSuccess}
              </div>
            )}
            
            {!createSuccess && (
              <form onSubmit={handleCreateInterview}>
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748B" }}>Candidate Email</label>
                    <input type="email" style={{ padding: "10px 12px", borderRadius: 8, fontSize: 13.5, width: "100%", outline: "none", background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#0F172A" }} placeholder="candidate@email.com" value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} required />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748B" }}>Job Role</label>
                    <input type="text" style={{ padding: "10px 12px", borderRadius: 8, fontSize: 13.5, width: "100%", outline: "none", background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#0F172A" }} placeholder="e.g. Frontend React Engineer" value={jobRole} onChange={(e) => setJobRole(e.target.value)} required />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748B" }}>Difficulty</label>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: 6, padding: 4, borderRadius: 8, background: "#F1F5F9" }}>
                      {["easy", "medium", "hard"].map(d => (
                        <button key={d} type="button" onClick={() => setDifficulty(d)} style={{ padding: "6px 0", borderRadius: 6, fontSize: 11.5, fontWeight: 700, textTransform: "capitalize", border: "none", cursor: "pointer", transition: "all 0.15s", background: difficulty === d ? "#FFFFFF" : "transparent", color: difficulty === d ? "#2563EB" : "#64748B" }}>{d}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, background: "#F8FAFC", borderTop: "1px solid #E2E8F0" }}>
                  <button type="button" style={{ padding: "8px 16px", borderRadius: 8, background: "#FFFFFF", border: "1px solid #E2E8F0", color: "#64748B", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }} onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" disabled={createLoading} style={{ padding: "8px 20px", borderRadius: 8, background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", color: "#FFFFFF", border: "none", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
                    {createLoading ? "Sending..." : "Send Link"}
                  </button>
                </div>
              </form>
            )}

            {createSuccess && (
              <div style={{ padding: "14px 20px", display: "flex", justifyContent: "flex-end", background: "#F8FAFC", borderTop: "1px solid #E2E8F0" }}>
                <button style={{ padding: "8px 24px", borderRadius: 8, background: "#2563EB", color: "#FFFFFF", border: "none", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }} onClick={() => { setShowCreateModal(false); setCreateSuccess(""); }}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
