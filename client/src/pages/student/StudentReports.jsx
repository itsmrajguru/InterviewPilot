import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import StudentTopbar from "../../components/StudentTopbar";
import { getStudentDashboard } from "../../services/interviewService";

/* icons */
const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

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

/* main page component */
export default function StudentReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getStudentDashboard();
        setReports(res.completedInterviews || []);
      } catch (err) {
        setError("could not load report summaries");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar role="student" />

      {/* main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* top bar */}
        <StudentTopbar
          title="My Reports"
          sub="Review scores, feedback and improvement areas"
        />

        {/* page body */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">

          {/* welcome banner */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: "var(--text)" }}>
              Evaluation Reports
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              review detailed ai feedback, strengths, and weaknesses from all your completed sessions
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

          {/* reports grid list */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="ip-spinner ip-spinner-dark" />
            </div>
          ) : reports.length === 0 ? (
            <div className="ip-card">
              <div className="ip-card-body">
                <EmptyState
                  icon="🎯"
                  title="no reports ready"
                  sub="complete a practice session or company interview to see your detailed performance grade here"
                  action={
                    <button
                      onClick={() => navigate("/student/practice")}
                      className="btn-primary py-2 px-4 text-xs mt-1"
                    >
                      Start Practice Interview
                    </button>
                  }
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {reports.map((session) => {
                const hasScore = session.report?.overallScore !== undefined;
                return (
                  <div key={session._id} className="ip-card p-5 flex flex-col justify-between h-fit gap-4">
                    <div>
                      {/* header */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="text-sm font-bold truncate max-w-[190px]" style={{ color: "var(--text)" }}>
                            {session.role || "Software Engineer"}
                          </div>
                          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {session.companyName || "Practice Round"} ·{" "}
                            {session.createdAt
                              ? new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                              : "—"}
                          </div>
                        </div>

                        {/* score card */}
                        {hasScore && (
                          <div
                            className="flex flex-col items-center justify-center p-2 rounded-lg text-center"
                            style={{ background: "var(--accent-light)", minWidth: 54 }}
                          >
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Score</span>
                            <span className="text-base font-bold flex items-center gap-0.5 leading-none mt-1" style={{ color: "var(--accent)" }}>
                              <IconStar /> {session.report.overallScore}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* summary text description */}
                      {session.report?.summary && (
                        <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--text-secondary)" }}>
                          {session.report.summary}
                        </p>
                      )}
                    </div>

                    {/* actions footer */}
                    <div className="flex items-center justify-between mt-1 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                      <span className="text-[10px] uppercase font-bold" style={{ color: "var(--text-muted)" }}>
                        Status: Completed
                      </span>
                      <button
                        onClick={() => navigate(`/interview/${session._id}/report`)}
                        className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
                      >
                        Full Report <IconArrow />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
