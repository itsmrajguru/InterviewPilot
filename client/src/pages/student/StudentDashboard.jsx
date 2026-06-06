import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import StudentTopbar from "../../components/StudentTopbar";
import TextPracticeTerminal from "../../components/TextPracticeTerminal";
import { getStudentDashboard } from "../../services/interviewService";

/* icons */
const IconPlay = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
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
const IconTrophy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="18" width="12" height="4"/>
  </svg>
);
const IconCode = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);
const IconStar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

/* stat card component */
function StatCard({ label, value, sub, accent }) {
  return (
    <div className="ip-card p-5">
      <div className="ip-stat-label mb-2">{label}</div>
      <div
        className="text-3xl font-bold tracking-tight leading-none mb-1"
        style={{ color: accent ? "var(--accent)" : "var(--text)" }}
      >
        {value}
      </div>
      {sub && <div className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</div>}
    </div>
  );
}

/* interview row component */
function InterviewRow({ interview, onJoin }) {
  const statusMap = {
    pending:   { cls: "ip-badge ip-badge-warning", label: "Pending",   dot: "#f57f17" },
    active:    { cls: "ip-badge ip-badge-info",    label: "Active",    dot: "#0d47a1" },
    completed: { cls: "ip-badge ip-badge-success", label: "Completed", dot: "#00796b" },
    expired:   { cls: "ip-badge ip-badge-neutral", label: "Expired",   dot: "#636866" },
  };
  const s = statusMap[interview.status] || statusMap.pending;

  return (
    <div className="ip-activity-row">
      <div
        className="ip-activity-icon flex-shrink-0"
        style={{
          background: interview.status === "completed" ? "var(--color-success-bg)"
            : interview.status === "pending" ? "var(--color-warning-bg)"
            : "var(--accent-light)",
          color: interview.status === "completed" ? "var(--color-success-text)"
            : interview.status === "pending" ? "var(--color-warning-text)"
            : "var(--accent)",
        }}
      >
        {interview.status === "completed" ? <IconCheck /> : <IconClock />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
          {interview.role || "Software Engineer"} Interview
        </div>
        <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {interview.companyName || "Company"} · {interview.difficulty || "Medium"} ·{" "}
          {interview.createdAt
            ? new Date(interview.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
            : "—"}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {interview.report?.overallScore !== undefined && (
          <div className="flex items-center gap-1 text-xs font-bold" style={{ color: "var(--accent)" }}>
            <IconStar />
            {interview.report.overallScore}/100
          </div>
        )}
        <span className={s.cls}>{s.label}</span>
        {interview.status === "pending" && (
          <button
            onClick={() => onJoin(interview._id)}
            className="btn-primary py-1.5 px-3 text-xs"
          >
            Join
          </button>
        )}
        {interview.status === "completed" && (
          <Link
            to={`/interview/${interview._id}/report`}
            className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
          >
            Report <IconArrow />
          </Link>
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

/* main dashboard page */
export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //get user from localstorage
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();
  const firstName = user?.name?.split(" ")[0] || "there";

  useEffect(() => {
    (async () => {
      try {
        const res = await getStudentDashboard();
        setData(res);
      } catch (err) {
        setError("Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pending   = data?.pendingInterviews   || [];
  const completed = data?.completedInterviews || [];
  const avgScore  = data?.avgScore ?? null;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar role="student" />

        {/* main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* top bar */}
        <StudentTopbar
          title="Dashboard"
          sub="Track interviews, scores and practice progress"
        />

        {/* page body */}
        <main className="flex-1 p-8">

          {/* welcome banner */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: "var(--text)" }}>
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Here's what's happening with your interviews today.
            </p>
          </div>

          {/* error banner */}
          {error && (
            <div
              className="mb-6 flex items-center gap-2 text-sm px-4 py-3 rounded"
              style={{ background: "var(--color-danger-bg)", color: "var(--color-danger-text)", border: "1px solid var(--color-danger-border)" }}
            >
              {error}
            </div>
          )}

          {/* stat cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard
              label="PENDING INTERVIEWS"
              value={loading ? "—" : pending.length}
              sub={pending.length === 1 ? "1 awaiting response" : pending.length > 0 ? `${pending.length} awaiting response` : "All clear"}
            />
            <StatCard
              label="COMPLETED"
              value={loading ? "—" : completed.length}
              sub={completed.length > 0 ? "View your history below" : "Complete your first interview"}
            />
            <StatCard
              label="AVG. SCORE"
              value={loading ? "—" : avgScore !== null ? `${avgScore}` : "—"}
              sub={avgScore !== null ? "out of 100" : "No interviews yet"}
              accent={avgScore !== null}
            />
          </div>

          {/* two column layout */}
          <div className="grid grid-cols-5 gap-6">

            {/* left: interviews list */}
            <div className="col-span-3 flex flex-col gap-5">

              {/* pending interviews list */}
              <div className="ip-card">
                <div className="ip-card-header">
                  <span className="ip-card-title">Pending Interviews</span>
                  <span className="ip-badge ip-badge-warning">{pending.length} pending</span>
                </div>
                <div className="ip-card-body">
                  {loading ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="ip-spinner ip-spinner-dark" />
                    </div>
                  ) : pending.length === 0 ? (
                    <EmptyState
                      icon="📋"
                      title="No pending interviews"
                      sub="When a company sends you an interview link, it will appear here."
                    />
                  ) : (
                    <div>
                      {pending.map((iv) => (
                        <InterviewRow
                          key={iv._id}
                          interview={iv}
                          onJoin={(id) => navigate(`/interview/${id}`)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* interview history list */}
              <div className="ip-card">
                <div className="ip-card-header">
                  <span className="ip-card-title">Interview History</span>
                  {completed.length > 0 && (
                    <Link
                      to="/student/interviews"
                      className="text-xs font-semibold flex items-center gap-1"
                      style={{ color: "var(--accent)" }}
                    >
                      View all <IconArrow />
                    </Link>
                  )}
                </div>
                <div className="ip-card-body">
                  {loading ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="ip-spinner ip-spinner-dark" />
                    </div>
                  ) : completed.length === 0 ? (
                    <EmptyState
                      icon="🎯"
                      title="No interviews yet"
                      sub="Complete your first interview to see your history and scores here."
                      action={
                        <button
                          onClick={() => navigate("/student/practice")}
                          className="btn-primary py-2 px-4 text-xs mt-1"
                        >
                          Try a Practice Interview
                        </button>
                      }
                    />
                  ) : (
                    <div>
                      {completed.slice(0, 5).map((iv) => (
                        <InterviewRow
                          key={iv._id}
                          interview={iv}
                          onJoin={(id) => navigate(`/interview/${id}`)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* right: quick actions and tips */}
            <div className="col-span-2 flex flex-col gap-5">

              {/* quick actions card */}
              <div className="ip-card">
                <div className="ip-card-header">
                  <span className="ip-card-title">Quick Actions</span>
                </div>
                <div className="ip-card-body flex flex-col gap-2">
                  <button
                    onClick={() => navigate("/student/practice")}
                    className="btn-primary w-full py-2.5 text-sm justify-start gap-2.5 px-4"
                  >
                    <IconPlay /> 📹 Start Video Practice
                  </button>
                  <button
                    onClick={() => navigate("/student/interviews")}
                    className="btn-secondary w-full py-2.5 text-sm justify-start gap-2.5 px-4"
                  >
                    <IconInterviews /> View All Interviews
                  </button>
                  <button
                    onClick={() => navigate("/student/reports")}
                    className="btn-secondary w-full py-2.5 text-sm justify-start gap-2.5 px-4"
                  >
                    <IconTrophy /> My Performance Reports
                  </button>
                </div>
              </div>

              {/* how to prepare card */}
              <div className="ip-card">
                <div className="ip-card-header">
                  <span className="ip-card-title">How it works</span>
                </div>
                <div className="ip-card-body flex flex-col gap-4">
                  {[
                    { icon: "📩", step: "1", title: "Get invited", desc: "Company shortlists you on CareerSync and sends an interview link." },
                    { icon: "🤖", step: "2", title: "AI interview", desc: "Answer HR and technical questions. AI evaluates your responses live." },
                    { icon: "💻", step: "3", title: "Code round", desc: "Solve a coding problem in Monaco Editor with real test cases." },
                    { icon: "📊", step: "4", title: "Get your report", desc: "Receive a detailed score breakdown and improvement roadmap." },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                        style={{ background: "var(--accent-light)", color: "var(--accent)", fontWeight: 700, fontSize: 12 }}
                      >
                        {item.step}
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>{item.title}</div>
                        <div className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <TextPracticeTerminal />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* inline icon component for buttons */
function IconInterviews() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
