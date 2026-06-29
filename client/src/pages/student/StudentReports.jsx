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
    <div style={{ display: "flex", minHeight: "100vh", background: "#e4e8ee", fontFamily: "var(--font-sans)", fontSize: 14 }}>
      <Sidebar role="student" />

      {/* main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* top bar */}
        <StudentTopbar
          title="My Reports"
          sub="Review scores, feedback and improvement areas"
        />

        {/* page body */}
        <main style={{ flex: 1, padding: "24px 32px" }}>

          {/* welcome banner */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, marginBottom: 4 }}>
              Evaluation Reports
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
              review detailed ai feedback, strengths, and weaknesses from all your completed sessions
            </p>
          </div>

          {/* error banner */}
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "12px 16px", borderRadius: 8, background: "#fef2f2", color: "#b91c1c", border: "0.5px solid #fecaca", marginBottom: 24 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* reports grid list */}
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
              <div style={{ width: 24, height: 24, border: "2px solid #1d9e75", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            </div>
          ) : reports.length === 0 ? (
            <div style={{ background: "#ffffff", border: "0.5px solid #dde1e8", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              <div style={{ padding: 24 }}>
                <EmptyState
                  icon="🎯"
                  title="no reports ready"
                  sub="complete a practice session or company interview to see your detailed performance grade here"
                  action={
                    <button
                      onClick={() => navigate("/student/practice")}
                      style={{ fontSize: 12, color: "#ffffff", background: "#1d9e75", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 500, marginTop: 8 }}
                    >
                      Start Practice Interview
                    </button>
                  }
                />
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {reports.map((session) => {
                const hasScore = session.report?.overallScore !== undefined;
                return (
                  <div key={session._id} style={{ background: "#ffffff", border: "0.5px solid #dde1e8", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
                    <div>
                      {/* header */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 190 }}>
                            {session.role || "Software Engineer"}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                            {session.companyName || "Practice Round"} ·{" "}
                            {session.createdAt
                              ? new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                              : "—"}
                          </div>
                        </div>

                        {/* score card */}
                        {hasScore && (
                          <div
                            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 8, borderRadius: 8, textAlign: "center", background: "#f0fdf4", minWidth: 54 }}
                          >
                            <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Score</span>
                            <span style={{ fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 2, lineHeight: 1, marginTop: 4, color: "#15803d" }}>
                              <IconStar /> {session.report.overallScore}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* summary text description */}
                      {session.report?.summary && (
                        <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {session.report.summary}
                        </p>
                      )}
                    </div>

                    {/* actions footer */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4, paddingTop: 12, borderTop: "0.5px solid var(--border)" }}>
                      <span style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)" }}>
                        Status: Completed
                      </span>
                      <button
                        onClick={() => navigate(`/interview/${session._id}/report`)}
                        style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-primary)", background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 500 }}
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
