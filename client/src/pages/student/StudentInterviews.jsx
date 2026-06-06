import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import StudentTopbar from "../../components/StudentTopbar";
import { getStudentDashboard } from "../../services/interviewService";

/* icons */
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

/* empty state component */
function EmptyState({ icon, title, sub }) {
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
    </div>
  );
}

/* main page component */
export default function StudentInterviews() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  //get user from localstorage
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();

  useEffect(() => {
    (async () => {
      try {
        const res = await getStudentDashboard();
        //combine pending and completed list
        const allList = [
          ...(res.pendingInterviews || []),
          ...(res.completedInterviews || [])
        ];
        setSessions(allList);
      } catch (err) {
        setError("could not load interviews list");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* filter logic */
  const filteredSessions = sessions.filter(session => {
    if (filter === "all") return true;
    return session.status === filter;
  });

  const statusMap = {
    pending:   { cls: "ip-badge ip-badge-warning", label: "Pending" },
    active:    { cls: "ip-badge ip-badge-info",    label: "Active" },
    completed: { cls: "ip-badge ip-badge-success", label: "Completed" },
    expired:   { cls: "ip-badge ip-badge-neutral", label: "Expired" },
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar role="student" />

      {/* main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* top bar */}
        <StudentTopbar
          title="My Interviews"
          sub="Review all company invitations and completed rounds"
        />

        {/* page body */}
        <main className="flex-1 p-8">

          {/* welcome banner */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: "var(--text)" }}>
              Interview History
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              manage and view the status of all your company invitations and practice rounds
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

          {/* filters list */}
          <div className="flex items-center gap-2 mb-6 p-1 rounded-lg w-fit" style={{ background: "var(--bg-subtle)" }}>
            {["all", "pending", "completed"].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className="py-1.5 px-4 rounded-md text-[11px] font-bold transition-all capitalize"
                style={{
                  background: filter === tab ? "var(--bg-card)" : "transparent",
                  color: filter === tab ? "var(--text)" : "var(--text-secondary)",
                  boxShadow: filter === tab ? "0 1px 2px rgba(0,0,0,0.05)" : "none"
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* interviews content table */}
          <div className="ip-card">
            <div className="ip-card-header">
              <span className="ip-card-title">All Sessions</span>
              <span className="ip-badge ip-badge-neutral">{filteredSessions.length} total</span>
            </div>
            <div className="ip-card-body">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="ip-spinner ip-spinner-dark" />
                </div>
              ) : filteredSessions.length === 0 ? (
                <EmptyState
                  icon="📋"
                  title="no interviews found"
                  sub={`you currently do not have any interviews matching the "${filter}" filter`}
                />
              ) : (
                <div className="flex flex-col">
                  {filteredSessions.map((session) => {
                    const s = statusMap[session.status] || statusMap.pending;
                    return (
                      <div key={session._id} className="ip-activity-row">
                        <div
                          className="ip-activity-icon flex-shrink-0"
                          style={{
                            background: session.status === "completed" ? "var(--color-success-bg)"
                              : session.status === "pending" ? "var(--color-warning-bg)"
                              : "var(--accent-light)",
                            color: session.status === "completed" ? "var(--color-success-text)"
                              : session.status === "pending" ? "var(--color-warning-text)"
                              : "var(--accent)",
                          }}
                        >
                          {session.status === "completed" ? <IconCheck /> : <IconClock />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
                            {session.role || "Software Engineer"} Interview
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                            {session.companyName || "Company"} · {session.difficulty || "Medium"} ·{" "}
                            {session.createdAt
                              ? new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                              : "—"}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {session.report?.overallScore !== undefined && (
                            <div className="flex items-center gap-1 text-xs font-bold" style={{ color: "var(--accent)" }}>
                              <IconStar />
                              {session.report.overallScore}/100
                            </div>
                          )}
                          <span className={s.cls}>{s.label}</span>
                          {session.status === "pending" && (
                            <button
                              onClick={() => navigate(`/interview/${session._id}`)}
                              className="btn-primary py-1.5 px-3 text-xs"
                            >
                              Join
                            </button>
                          )}
                          {session.status === "completed" && (
                            <Link
                              to={`/interview/${session._id}/report`}
                              className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
                            >
                              Report <IconArrow />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
