import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import Sidebar from "../../components/Sidebar";
import { createInterviewSession, getCompanySessions } from "../../services/interviewService";

import { IconPlus, IconUsers, IconClock, IconCheck, IconArrowRight, IconStar, IconSend } from "../../components/ui/icons";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Badge from "../../components/ui/Badge";
import PageHeader from "../../components/ui/PageHeader";

function CandidateRow({ session, onViewReport }) {
  const isCompleted = session.status === "completed";
  const isPending = session.status === "pending";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid var(--color-border-subtle)" }}>
      <div style={{
        width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15,
        background: isCompleted ? "var(--success-bg)" : isPending ? "var(--warning-bg)" : "var(--color-bg-panel-sunken)",
        color: isCompleted ? "var(--success-text)" : isPending ? "var(--warning-text)" : "var(--text-disabled)",
      }}>
        {isCompleted ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {session.studentEmail}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
          {session.role} · <span style={{ textTransform: "capitalize" }}>{session.difficulty}</span> ·{" "}
          {session.createdAt ? new Date(session.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {isCompleted && session.report?.overallScore !== undefined && (
          <Badge variant="success">{session.report.overallScore}/100</Badge>
        )}
        {isCompleted ? (
          <Button variant="secondary" size="sm" onClick={() => onViewReport(session._id)}>
            Report <IconArrowRight />
          </Button>
        ) : isPending ? (
          <Badge variant="warning">Pending</Badge>
        ) : (
          <Badge variant="neutral">{session.status}</Badge>
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
  const activeNow = sessions.filter(s => s.status === "active").length;
  const completed = sessions.filter(s => s.status === "completed").length;
  const pending = sessions.filter(s => s.status === "pending").length;

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="ip-app-wrapper" style={{ display:"flex", minHeight:"100vh", background: "var(--bg)", fontFamily: "var(--sans)", fontSize: 14 }}>
      <Sidebar role="company" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative" }}>

        <header style={{ padding: "0 var(--space-6)", height: 56, background: "var(--color-bg-panel)", borderBottom: "1px solid var(--color-border-subtle)", position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, fontFamily: "var(--sans)" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.04em", textTransform: "uppercase" }}>Recruiter workspace</span>
            <span style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>Dashboard</span>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <IconPlus /> Create Interview
          </Button>
        </header>

        <main style={{ flex: 1, overflowY: "auto" }}>
          <PageHeader title="Talent Pipeline" subtitle={`Track and manage all your ${companyName} interview candidates in one place.`} />

          <div style={{ maxWidth: 1180, margin: "-24px auto 0", padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)" }}>
              <StatCard label="TOTAL INVITED" icon={<IconUsers />} value={loadingSessions ? "—" : totalInvited} sub="All-time candidates" />
              <StatCard label="ACTIVE NOW" icon={<IconClock />} value={loadingSessions ? "—" : activeNow} sub={activeNow > 0 ? "Currently interviewing" : "None right now"} accentColor={activeNow > 0 ? "var(--warning-text)" : undefined} />
              <StatCard label="COMPLETED" icon={<IconCheck />} value={loadingSessions ? "—" : completed} sub="Awaiting your review" />
              <StatCard label="PENDING" icon={<IconClock />} value={loadingSessions ? "—" : pending} sub="Invites sent" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "var(--space-4)" }}>
              
              {/* left: candidates pipeline list */}
              <Card>
                <div style={{ padding: "16px 20px 14px", borderBottom: "1px solid var(--color-border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}><IconUsers /> Recent Candidates</span>
                  <Badge variant="neutral">{totalInvited} total</Badge>
                </div>
                <div style={{ padding: "8px 20px" }}>
                    {loadingSessions ? (
                      <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-secondary)", fontSize: 13 }}>Loading...</div>
                    ) : sessions.length === 0 ? (
                      <EmptyState
                        icon="👥"
                        title="No candidates yet"
                        subtext="Click 'Create Interview' to generate a secure link and send it to a candidate."
                        action={
                          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                            <IconPlus /> Create First Interview
                          </Button>
                        }
                      />
                    ) : (
                      <>
                        {sessions.slice(0, 8).map((session) => (
                          <CandidateRow key={session._id} session={session} onViewReport={(id) => navigate(`/interview/${id}/report`)} />
                        ))}
                        {sessions.length > 8 && (
                          <div style={{ textAlign: "center", marginTop: 12 }}>
                            <Link to="/company/interviews" style={{ fontSize: 12, color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", gap: 3, textDecoration: "none", fontWeight: 500 }}>
                              View all candidates <IconArrowRight />
                            </Link>
                          </div>
                        )}
                      </>
                    )}
                </div>
              </Card>

              {/* right: quick actions and tips */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                
                <Card>
                  <div style={{ padding: "16px 20px 14px", borderBottom: "1px solid var(--color-border-subtle)", display: "flex", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}><IconStar /> Quick Actions</span>
                  </div>
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div
                        onClick={() => setShowCreateModal(true)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-subtle)", background: "var(--color-bg-panel-sunken)", cursor: "pointer", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--color-bg-panel-hover)"; e.currentTarget.querySelectorAll(".qa-label").forEach(el => el.style.color = "var(--accent)"); }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border-subtle)"; e.currentTarget.style.background = "var(--color-bg-panel-sunken)"; e.currentTarget.querySelectorAll(".qa-label").forEach(el => el.style.color = "var(--text-primary)"); }}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--color-bg-panel-hover)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--accent)" }}>
                          <IconPlus />
                        </div>
                        <div>
                          <div className="qa-label" style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500, transition: "color 0.15s" }}>Send New Invite</div>
                          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>Select role and difficulty</div>
                        </div>
                      </div>
                      
                      <div
                        onClick={() => navigate("/company/interviews")}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-subtle)", background: "var(--color-bg-panel-sunken)", cursor: "pointer", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--color-bg-panel-hover)"; e.currentTarget.querySelectorAll(".qa-label").forEach(el => el.style.color = "var(--accent)"); }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border-subtle)"; e.currentTarget.style.background = "var(--color-bg-panel-sunken)"; e.currentTarget.querySelectorAll(".qa-label").forEach(el => el.style.color = "var(--text-primary)"); }}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--color-bg-panel-hover)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--accent)" }}>
                          <IconUsers />
                        </div>
                        <div>
                          <div className="qa-label" style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500, transition: "color 0.15s" }}>View All Candidates</div>
                          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>Manage your pipeline</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div style={{ padding: "16px 20px 14px", borderBottom: "1px solid var(--color-border-subtle)", display: "flex", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}><IconCheck /> Hiring Workflow</span>
                  </div>
                  <div style={{ padding: "16px 20px" }}>
                    {[
                      { icon: "1", title: "Create Interview", desc: "Select a role and difficulty. We'll email the candidate a secure, one-time link." },
                      { icon: "2", title: "AI Evaluation", desc: "The AI conducts technical and HR rounds, grading responses in real-time." },
                      { icon: "3", title: "Review Report", desc: "Get a comprehensive breakdown of their strengths, weaknesses, and a final score." },
                    ].map((item) => (
                      <div key={item.icon} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, marginTop: 2, background: "var(--color-bg-panel-sunken)", color: "var(--text-secondary)", fontWeight: 700, border: "1px solid var(--color-border-subtle)" }}>
                          {item.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{item.title}</div>
                          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.5 }}>{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => { setShowCreateModal(false); setCreateError(""); setCreateSuccess(""); }}>
          <div style={{ width: "100%", maxWidth: 448, borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", overflow: "hidden", background: "var(--color-bg-panel)", border: "1px solid var(--color-border-subtle)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--color-border-subtle)" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Create New Interview</span>
              <button style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, background: "transparent", color: "var(--text-secondary)", border: "none", cursor: "pointer" }} onMouseOver={(e) => e.currentTarget.style.background = "var(--color-bg-panel-sunken)"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"} onClick={() => { setShowCreateModal(false); setCreateError(""); setCreateSuccess(""); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {createError && (
              <div style={{ margin: "20px 24px 0", padding: "10px 12px", borderRadius: 4, fontSize: 12, display: "flex", alignItems: "center", gap: 8, background: "var(--danger-bg)", color: "var(--danger-text)", border: "1px solid var(--danger-border)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--danger-text)", flexShrink: 0 }} />
                <span>{createError}</span>
              </div>
            )}
            {createSuccess && (
              <div style={{ margin: "20px 24px 0", padding: "10px 12px", borderRadius: 4, fontSize: 12, display: "flex", alignItems: "center", gap: 8, background: "var(--success-bg)", color: "var(--success-text)", border: "1px solid var(--success-border)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success-text)", flexShrink: 0 }} />
                <span style={{ fontWeight: 500, wordBreak: "break-all" }}>{createSuccess}</span>
              </div>
            )}
            
            {!createSuccess && (
              <form onSubmit={handleCreateInterview}>
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>Candidate Email</label>
                    <input type="email" style={{ padding: "8px 12px", borderRadius: 8, fontSize: 14, width: "100%", outline: "none", background: "var(--color-bg-panel-sunken)", border: "1px solid var(--color-border-subtle)", color: "var(--text-primary)" }} placeholder="candidate@email.com" value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} required />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>Job Role</label>
                    <input type="text" style={{ padding: "8px 12px", borderRadius: 8, fontSize: 14, width: "100%", outline: "none", background: "var(--color-bg-panel-sunken)", border: "1px solid var(--color-border-subtle)", color: "var(--text-primary)" }} placeholder="e.g. Frontend Engineer" value={jobRole} onChange={(e) => setJobRole(e.target.value)} required />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>Difficulty</label>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: 4, padding: 4, borderRadius: 8, background: "var(--color-bg-panel-sunken)" }}>
                      {["easy", "medium", "hard"].map(d => (
                        <button key={d} type="button" onClick={() => setDifficulty(d)} style={{ padding: "6px 0", borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: "capitalize", border: "none", cursor: "pointer", transition: "all 0.2s", background: difficulty === d ? "var(--color-bg-panel)" : "transparent", color: difficulty === d ? "var(--text-primary)" : "var(--text-secondary)", boxShadow: difficulty === d ? "var(--shadow-sm)" : "none" }}>{d}</button>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: 11, marginTop: 4, color: "var(--text-secondary)" }}>
                    An invite email will be sent to the candidate immediately. The secure link will expire in 48 hours.
                  </p>
                </div>
                <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, background: "var(--color-bg-panel-sunken)", borderTop: "1px solid var(--color-border-subtle)" }}>
                  <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" disabled={createLoading}>
                    {createLoading ? "Sending..." : <><IconSend /> Send Link</>}
                  </Button>
                </div>
              </form>
            )}

            {createSuccess && (
              <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "flex-end", background: "var(--color-bg-panel-sunken)", borderTop: "1px solid var(--color-border-subtle)" }}>
                <Button variant="primary" style={{ width: "100%" }} onClick={() => { setShowCreateModal(false); setCreateSuccess(""); }}>Done</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
