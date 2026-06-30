import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { createInterviewSession, getCompanySessions } from "../../services/interviewService";

/* icons */
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconUsers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconStar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconSend = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const S = {
  metric: {
    background: "var(--bg-card)",
    border: "0.5px solid var(--border)",
    borderRadius: 12,
    padding: "18px 20px",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
  },
  metricLabel: {
    fontSize: 11,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 500,
    color: "var(--text-primary)",
    lineHeight: 1,
  },
  metricSub: {
    fontSize: 12,
    color: "var(--text-muted)",
    marginTop: 6,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  card: {
    background: "var(--bg-card)",
    border: "0.5px solid var(--border)",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
  },
  cardHeader: {
    padding: "16px 20px 14px",
    borderBottom: "0.5px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  cardBody: {
    padding: "16px 20px",
  },
};

/* stat card component */
function StatCard({ label, value, sub, icon, accent, subIcon }) {
  return (
    <div style={{ ...S.metric, borderLeft: accent ? "2px solid var(--accent)" : "0.5px solid var(--border)" }}>
      <div style={S.metricLabel}>{icon} {label}</div>
      <div style={{ ...S.metricValue, color: accent ? "var(--accent)" : "var(--text-primary)" }}>{value}</div>
      <div style={{ ...S.metricSub, color: accent ? "var(--accent)" : "var(--text-muted)" }}>
        {subIcon} {sub}
      </div>
    </div>
  );
}

/* candidate row component */
function CandidateRow({ session, onViewReport }) {
  const isCompleted = session.status === "completed";
  const isPending = session.status === "pending";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "0.5px solid var(--border)" }}>
      <div style={{
        width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15,
        background: isCompleted ? "var(--accent-light)" : isPending ? "#faeeda" : "var(--surface-1)",
        color: isCompleted ? "var(--accent-hover)" : isPending ? "#854f0b" : "var(--text-muted)",
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
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
          {session.role} · <span className="capitalize">{session.difficulty}</span> ·{" "}
          {session.createdAt
            ? new Date(session.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
            : "—"}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {isCompleted && session.report?.overallScore !== undefined && (
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--accent-hover)", background: "var(--accent-light)", padding: "3px 10px", borderRadius: 20 }}>
            {session.report.overallScore}/100
          </span>
        )}
        {isCompleted ? (
          <button
            onClick={() => onViewReport(session._id)}
            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-secondary)", background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: "var(--radius)", padding: "4px 10px", textDecoration: "none", cursor: "pointer" }}
          >
            Report <IconArrow />
          </button>
        ) : isPending ? (
          <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 500, background: "#faeeda", color: "#854f0b", border: "0.5px solid var(--border)" }}>
            Pending
          </span>
        ) : (
          <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 500, background: "var(--surface-1)", color: "var(--text-secondary)", border: "0.5px solid var(--border)" }}>
            {session.status}
          </span>
        )}
      </div>
    </div>
  );
}

/* empty state component */
function EmptyState({ icon, title, sub, action }) {
  return (
    <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)", fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{title}</div>
      <div style={{ fontSize: 12 }}>{sub}</div>
      {action}
    </div>
  );
}

/* main recruiter dashboard page */
export default function CompanyDashboard() {
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  //modal state variables
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [candidateEmail, setCandidateEmail] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  //get user from localstorage
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
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-sans)", fontSize: 14 }}>
      <Sidebar role="company" />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* top bar */}
        <header
          style={{
            padding: "0 28px",
            height: 56,
            background: "var(--bg-card)",
            borderBottom: "0.5px solid var(--border)",
            position: "sticky",
            top: 0,
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            fontFamily: "var(--font-sans)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>Recruiter workspace</span>
            <span style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>Dashboard</span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{ fontSize: 12, color: "#ffffff", background: "var(--accent)", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}
          >
            <IconPlus /> Create Interview
          </button>
        </header>

        {/* page body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

          {/* welcome banner */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-primary)" }}>
                Talent Pipeline
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>
                Track and manage all your {companyName} interview candidates in one place.
              </p>
            </div>
          </div>

          {/* stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            <StatCard
              label="TOTAL INVITED"
              icon={<IconUsers />}
              value={loadingSessions ? "—" : totalInvited}
              sub="All-time candidates"
            />
            <StatCard
              label="ACTIVE NOW"
              icon={<IconClock />}
              value={loadingSessions ? "—" : activeNow}
              sub={activeNow > 0 ? "Currently interviewing" : "None right now"}
              accent={activeNow > 0}
            />
            <StatCard
              label="COMPLETED"
              icon={<IconCheck />}
              value={loadingSessions ? "—" : completed}
              sub="Awaiting your review"
            />
            <StatCard
              label="PENDING"
              icon={<IconClock />}
              value={loadingSessions ? "—" : pending}
              sub="Invites sent"
            />
          </div>

          {/* two column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>

            {/* left: candidates pipeline list */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <span style={S.cardTitle}><IconUsers /> Recent Candidates</span>
                <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 500, background: "var(--surface-1)", color: "var(--text-secondary)", border: "0.5px solid var(--border)" }}>{totalInvited} total</span>
              </div>
              <div style={{ padding: "8px 20px" }}>
                  {loadingSessions ? (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
                  ) : sessions.length === 0 ? (
                    <EmptyState
                      icon="👥"
                      title="No candidates yet"
                      sub="Click 'Create Interview' to generate a secure link and send it to a candidate."
                      action={
                        <button
                          onClick={() => setShowCreateModal(true)}
                          style={{ fontSize: 12, color: "#ffffff", background: "var(--accent)", border: "none", borderRadius: "var(--radius)", padding: "6px 12px", cursor: "pointer", fontWeight: 500, marginTop: 8 }}
                        >
                          + Create First Interview
                        </button>
                      }
                    />
                  ) : (
                    <>
                      {sessions.slice(0, 8).map((session) => (
                        <CandidateRow
                          key={session._id}
                          session={session}
                          onViewReport={(id) => navigate(`/interview/${id}/report`)}
                        />
                      ))}
                      {sessions.length > 8 && (
                        <div style={{ textAlign: "center", marginTop: 12 }}>
                          <Link
                            to="/company/interviews"
                            style={{ fontSize: 12, color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", gap: 3, textDecoration: "none", fontWeight: 500 }}
                          >
                            View all candidates <IconArrow />
                          </Link>
                        </div>
                      )}
                    </>
                  )}
              </div>
            </div>

            {/* right: quick actions and tips */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* quick actions card */}
              <div style={S.card}>
                <div style={S.cardHeader}>
                  <span style={S.cardTitle}><IconStar /> Quick Actions</span>
                </div>
                <div style={{ ...S.cardBody, paddingTop: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div
                      onClick={() => setShowCreateModal(true)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", borderRadius: 10, border: "0.5px solid var(--border)", background: "var(--surface-1)", cursor: "pointer", transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--accent-light)"; e.currentTarget.querySelectorAll(".qa-label").forEach(el => el.style.color = "#085041"); }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface-1)"; e.currentTarget.querySelectorAll(".qa-label").forEach(el => el.style.color = "var(--text-primary)"); }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <IconPlus />
                      </div>
                      <div>
                        <div className="qa-label" style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>Send New Invite</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Select role and difficulty</div>
                      </div>
                    </div>
                    
                    <div
                      onClick={() => navigate("/company/interviews")}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", borderRadius: 10, border: "0.5px solid var(--border)", background: "var(--surface-1)", cursor: "pointer", transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--accent-light)"; e.currentTarget.querySelectorAll(".qa-label").forEach(el => el.style.color = "#085041"); }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface-1)"; e.currentTarget.querySelectorAll(".qa-label").forEach(el => el.style.color = "var(--text-primary)"); }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <IconUsers />
                      </div>
                      <div>
                        <div className="qa-label" style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>View All Candidates</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Manage your pipeline</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* how it works step card */}
              <div style={S.card}>
                <div style={S.cardHeader}>
                  <span style={S.cardTitle}><IconCheck /> Hiring Workflow</span>
                </div>
                <div style={S.cardBody}>
                  {[
                    { icon: "1", title: "Create Interview", desc: "Select a role and difficulty. We'll email the candidate a secure, one-time link." },
                    { icon: "2", title: "AI Evaluation", desc: "The AI conducts technical and HR rounds, grading responses in real-time." },
                    { icon: "3", title: "Review Report", desc: "Get a comprehensive breakdown of their strengths, weaknesses, and a final score." },
                  ].map((item) => (
                    <div key={item.icon} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                      <div
                        style={{ width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, marginTop: 2, background: "var(--surface-1)", color: "var(--text-secondary)", fontWeight: 700, border: "0.5px solid var(--border)" }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{item.title}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.5 }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* create interview modal popup */}
      {showCreateModal && (
        <div 
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => { setShowCreateModal(false); setCreateError(""); setCreateSuccess(""); }}
        >
          <div 
            style={{ width: "100%", maxWidth: 448, borderRadius: 12, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden", background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* modal header */}
            <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "0.5px solid var(--border)" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Create New Interview</span>
              <button
                style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, background: "transparent", color: "var(--text-muted)", border: "none", cursor: "pointer" }}
                onMouseOver={(e) => e.currentTarget.style.background = "var(--surface-1)"}
                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                onClick={() => { setShowCreateModal(false); setCreateError(""); setCreateSuccess(""); }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {/* modal alerts */}
            {createError && (
              <div style={{ margin: "20px 24px 0", padding: "10px 12px", borderRadius: 4, fontSize: 12, display: "flex", alignItems: "center", gap: 8, background: "var(--color-danger-bg)", color: "var(--color-danger-text)", border: "0.5px solid var(--color-danger-border)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
                <span>{createError}</span>
              </div>
            )}
            {createSuccess && (
              <div style={{ margin: "20px 24px 0", padding: "10px 12px", borderRadius: 4, fontSize: 12, display: "flex", alignItems: "center", gap: 8, background: "var(--color-success-bg)", color: "var(--color-success-text)", border: "0.5px solid var(--color-success-border)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                <span style={{ fontWeight: 500, wordBreak: "break-all" }}>{createSuccess}</span>
              </div>
            )}
            {/* modal body form */}
            {!createSuccess && (
              <form onSubmit={handleCreateInterview}>
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Candidate Email</label>
                    <input
                      type="email"
                      style={{ padding: "8px 12px", borderRadius: 8, fontSize: 14, width: "100%", outline: "none", background: "var(--surface-1)", border: "0.5px solid var(--border)", color: "var(--text-primary)" }}
                      placeholder="candidate@email.com"
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Job Role</label>
                    <input
                      type="text"
                      style={{ padding: "8px 12px", borderRadius: 8, fontSize: 14, width: "100%", outline: "none", background: "var(--surface-1)", border: "0.5px solid var(--border)", color: "var(--text-primary)" }}
                      placeholder="e.g. Frontend Engineer"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Difficulty</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, padding: 4, borderRadius: 8, background: "var(--surface-1)" }}>
                      {["easy", "medium", "hard"].map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDifficulty(d)}
                          style={{
                            padding: "6px 0", borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: "capitalize", border: "none", cursor: "pointer", transition: "all 0.2s",
                            background: difficulty === d ? "var(--bg-card)" : "transparent",
                            color: difficulty === d ? "var(--text-primary)" : "var(--text-secondary)",
                            boxShadow: difficulty === d ? "0 1px 2px rgba(0,0,0,0.05)" : "none"
                          }}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <p style={{ fontSize: 11, marginTop: 4, color: "var(--text-muted)" }}>
                    An invite email will be sent to the candidate immediately. The secure link will expire in 48 hours.
                  </p>
                </div>

                {/* modal footer buttons */}
                <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, background: "var(--surface-1)", borderTop: "0.5px solid var(--border)" }}>
                  <button type="button" style={{ fontSize: 12, color: "var(--text-primary)", background: "transparent", border: "0.5px solid var(--border)", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 500 }} onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" style={{ fontSize: 12, color: "#ffffff", background: "var(--accent)", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }} disabled={createLoading}>
                    {createLoading ? "Sending..." : <><IconSend /> Send Link</>}
                  </button>
                </div>
              </form>
            )}

            {createSuccess && (
              <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "flex-end", background: "var(--surface-1)", borderTop: "0.5px solid var(--border)" }}>
                <button style={{ fontSize: 12, color: "#ffffff", background: "var(--accent)", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 500, width: "100%" }} onClick={() => { setShowCreateModal(false); setCreateSuccess(""); }}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
