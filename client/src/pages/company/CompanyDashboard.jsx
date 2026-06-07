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

/* stat card component */
function StatCard({ label, value, sub, accent }) {
  return (
    <div className="ip-card p-5 flex flex-col justify-between">
      <div>
        <div className="ip-stat-label mb-2">{label}</div>
        <div
          className="text-3xl font-bold tracking-tight leading-none mb-1"
          style={{ color: accent ? "var(--accent)" : "var(--text)" }}
        >
          {value}
        </div>
      </div>
      {sub && <div className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{sub}</div>}
    </div>
  );
}

/* candidate row component */
function CandidateRow({ session, onViewReport }) {
  const statusMap = {
    pending:   { cls: "ip-badge ip-badge-warning", label: "Pending" },
    active:    { cls: "ip-badge ip-badge-info",    label: "Active" },
    completed: { cls: "ip-badge ip-badge-success", label: "Completed" },
    expired:   { cls: "ip-badge ip-badge-neutral", label: "Expired" },
  };
  const s = statusMap[session.status] || statusMap.pending;

  return (
    <div className="ip-activity-row">
      <div
        className="ip-activity-icon flex-shrink-0"
        style={{
          background: session.status === "completed" ? "var(--color-success-bg)"
            : session.status === "pending" ? "var(--color-warning-bg)"
            : session.status === "active" ? "var(--color-info-bg)"
            : "var(--bg-subtle)",
          color: session.status === "completed" ? "var(--color-success-text)"
            : session.status === "pending" ? "var(--color-warning-text)"
            : session.status === "active" ? "var(--color-info-text)"
            : "var(--text-muted)",
        }}
      >
        {session.status === "completed" ? <IconCheck /> : session.status === "active" ? <IconPlay /> : <IconClock />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
          {session.studentEmail}
        </div>
        <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {session.role} · <span className="capitalize">{session.difficulty}</span> ·{" "}
          {session.createdAt
            ? new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
            : "—"}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {session.status === "completed" && session.report?.overallScore !== undefined && (
          <div className="flex items-center gap-1 text-xs font-bold" style={{ color: "var(--accent)" }}>
            <IconStar />
            {session.report.overallScore}/100
          </div>
        )}
        <span className={s.cls}>{s.label}</span>
        {session.status === "completed" ? (
          <button
            onClick={() => onViewReport(session._id)}
            className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
          >
            Report <IconArrow />
          </button>
        ) : (
          <div className="w-[74px]"></div> /* Placeholder to align rows */
        )}
      </div>
    </div>
  );
}

/* empty state component */
function EmptyState({ icon, title, sub, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-1"
        style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
      >
        {icon}
      </div>
      <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>{title}</div>
      <div className="text-xs max-w-xs" style={{ color: "var(--text-muted)" }}>{sub}</div>
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
    <div className="flex flex-col md:flex-row min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar role="company" />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* top bar */}
        <header
          className="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-8 py-4 md:py-0 flex-shrink-0 gap-3 md:gap-0"
          style={{
            minHeight: 52,
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            Recruiter Dashboard
          </span>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
          >
            <IconPlus /> Create Interview
          </button>
        </header>

        {/* page body */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">

          {/* welcome banner */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: "var(--text)" }}>
              Talent Pipeline
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Track and manage all your {companyName} interview candidates in one place.
            </p>
          </div>

          {/* stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="TOTAL INVITED"
              value={loadingSessions ? "—" : totalInvited}
              sub="All-time candidates"
            />
            <StatCard
              label="ACTIVE NOW"
              value={loadingSessions ? "—" : activeNow}
              sub={activeNow > 0 ? "Currently interviewing" : "None right now"}
              accent={activeNow > 0}
            />
            <StatCard
              label="COMPLETED"
              value={loadingSessions ? "—" : completed}
              sub="Awaiting your review"
            />
            <StatCard
              label="PENDING"
              value={loadingSessions ? "—" : pending}
              sub="Invites sent"
            />
          </div>

          {/* two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* left: candidates pipeline list */}
            <div className="lg:col-span-3 flex flex-col gap-5">
              <div className="ip-card">
                <div className="ip-card-header">
                  <span className="ip-card-title">Recent Candidates</span>
                  <span className="ip-badge ip-badge-neutral">{totalInvited} total</span>
                </div>
                <div className="ip-card-body">
                  {loadingSessions ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="ip-spinner ip-spinner-dark" />
                    </div>
                  ) : sessions.length === 0 ? (
                    <EmptyState
                      icon="👥"
                      title="No candidates yet"
                      sub="Click 'Create Interview' to generate a secure link and send it to a candidate."
                      action={
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="btn-primary py-2 px-4 text-xs mt-1"
                        >
                          + Create First Interview
                        </button>
                      }
                    />
                  ) : (
                    <div>
                      {sessions.slice(0, 8).map((session) => (
                        <CandidateRow
                          key={session._id}
                          session={session}
                          onViewReport={(id) => navigate(`/interview/${id}/report`)}
                        />
                      ))}
                      {sessions.length > 8 && (
                        <div className="mt-4 text-center">
                          <Link
                            to="/company/interviews"
                            className="text-xs font-semibold"
                            style={{ color: "var(--accent)" }}
                          >
                            View all candidates →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* right: quick actions and tips */}
            <div className="lg:col-span-2 flex flex-col gap-5">

              {/* quick actions card */}
              <div className="ip-card">
                <div className="ip-card-header">
                  <span className="ip-card-title">Quick Actions</span>
                </div>
                <div className="ip-card-body flex flex-col gap-2">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary w-full py-2.5 text-sm justify-start gap-2.5 px-4"
                  >
                    <IconPlus /> Send New Invite
                  </button>
                  <button
                    onClick={() => navigate("/company/interviews")}
                    className="btn-secondary w-full py-2.5 text-sm justify-start gap-2.5 px-4"
                  >
                    <IconUsers /> View All Candidates
                  </button>
                </div>
              </div>

              {/* how it works step card */}
              <div className="ip-card">
                <div className="ip-card-header">
                  <span className="ip-card-title">Hiring Workflow</span>
                </div>
                <div className="ip-card-body flex flex-col gap-4">
                  {[
                    { icon: "1", title: "Create Interview", desc: "Select a role and difficulty. We'll email the candidate a secure, one-time link." },
                    { icon: "2", title: "AI Evaluation", desc: "The AI conducts technical and HR rounds, grading responses in real-time." },
                    { icon: "3", title: "Review Report", desc: "Get a comprehensive breakdown of their strengths, weaknesses, and a final score." },
                  ].map((item) => (
                    <div key={item.icon} className="flex items-start gap-3">
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                        style={{ background: "var(--accent-light)", color: "var(--accent)", fontWeight: 700, fontSize: 12 }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>{item.title}</div>
                        <div className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* create interview modal popup */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => { setShowCreateModal(false); setCreateError(""); setCreateSuccess(""); }}
        >
          <div 
            className="w-full max-w-md rounded-xl shadow-2xl overflow-hidden" 
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* modal header */}
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <span className="text-sm font-bold" style={{ color: "var(--text)" }}>Create New Interview</span>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-md transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseOver={(e) => e.currentTarget.style.background = "var(--bg-subtle)"}
                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                onClick={() => { setShowCreateModal(false); setCreateError(""); setCreateSuccess(""); }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {/* modal alerts */}
            {createError && (
              <div className="mx-6 mt-5 px-3 py-2.5 rounded text-xs flex items-center gap-2" style={{ background: "var(--color-danger-bg)", color: "var(--color-danger-text)", border: "1px solid var(--color-danger-border)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>{createError}</span>
              </div>
            )}
            {createSuccess && (
              <div className="mx-6 mt-5 px-3 py-2.5 rounded text-xs flex items-center gap-2" style={{ background: "var(--color-success-bg)", color: "var(--color-success-text)", border: "1px solid var(--color-success-border)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                <span className="font-medium break-all">{createSuccess}</span>
              </div>
            )}

            {/* modal body form */}
            {!createSuccess && (
              <form onSubmit={handleCreateInterview}>
                <div className="px-6 py-5 flex flex-col gap-4">
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Candidate Email</label>
                    <input
                      type="email"
                      className="px-3 py-2 rounded-lg text-sm w-full outline-none transition-all"
                      style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text)" }}
                      placeholder="candidate@email.com"
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Job Role</label>
                    <input
                      type="text"
                      className="px-3 py-2 rounded-lg text-sm w-full outline-none transition-all"
                      style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text)" }}
                      placeholder="e.g. Frontend Engineer"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Difficulty</label>
                    <div className="grid grid-cols-3 gap-1 p-1 rounded-lg" style={{ background: "var(--bg-subtle)" }}>
                      {["easy", "medium", "hard"].map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDifficulty(d)}
                          className="py-1.5 rounded-md text-[11px] font-bold transition-all capitalize"
                          style={{
                            background: difficulty === d ? "var(--bg-card)" : "transparent",
                            color: difficulty === d ? "var(--text)" : "var(--text-secondary)",
                            boxShadow: difficulty === d ? "0 1px 2px rgba(0,0,0,0.05)" : "none"
                          }}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
                    An invite email will be sent to the candidate immediately. The secure link will expire in 48 hours.
                  </p>
                </div>

                {/* modal footer buttons */}
                <div className="px-6 py-4 flex items-center justify-end gap-3" style={{ background: "var(--bg-subtle)", borderTop: "1px solid var(--border)" }}>
                  <button type="button" className="btn-secondary py-1.5 px-4 text-xs" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5" disabled={createLoading}>
                    {createLoading ? "Sending..." : <><IconSend /> Send Link</>}
                  </button>
                </div>
              </form>
            )}

            {createSuccess && (
              <div className="px-6 py-5 flex items-center justify-end" style={{ background: "var(--bg-subtle)", borderTop: "1px solid var(--border)" }}>
                <button className="btn-primary py-1.5 px-4 text-xs w-full" onClick={() => { setShowCreateModal(false); setCreateSuccess(""); }}>
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
