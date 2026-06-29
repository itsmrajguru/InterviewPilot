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
    pending:   { cls: { fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700, textTransform: "uppercase", background: "#fefce8", color: "#a16207", border: "0.5px solid #fef08a" }, label: "Pending" },
    active:    { cls: { fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700, textTransform: "uppercase", background: "#f0f9ff", color: "#0369a1", border: "0.5px solid #bae6fd" }, label: "Active" },
    completed: { cls: { fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700, textTransform: "uppercase", background: "#f0fdf4", color: "#15803d", border: "0.5px solid #bbf7d0" }, label: "Completed" },
    expired:   { cls: { fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700, textTransform: "uppercase", background: "var(--surface-1)", color: "var(--text-secondary)", border: "0.5px solid var(--border)" }, label: "Expired" },
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#e4e8ee", fontFamily: "var(--font-sans)", fontSize: 14 }}>
      <Sidebar role="student" />

      {/* main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* top bar */}
        <StudentTopbar
          title="My Interviews"
          sub="Review all company invitations and completed rounds"
        />

        {/* page body */}
        <main style={{ flex: 1, padding: "24px 32px" }}>

          {/* welcome banner */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, marginBottom: 4 }}>
              Interview History
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
              manage and view the status of all your company invitations and practice rounds
            </p>
          </div>

          {/* error banner */}
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "12px 16px", borderRadius: 8, background: "#fef2f2", color: "#b91c1c", border: "0.5px solid #fecaca", marginBottom: 24 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* filters list */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 24, padding: 4, borderRadius: 10, background: "var(--surface-1)", border: "0.5px solid var(--border)" }}>
            {["all", "pending", "completed"].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  padding: "6px 16px", borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: "capitalize", cursor: "pointer", transition: "all 0.2s", border: "none",
                  background: filter === tab ? "#ffffff" : "transparent",
                  color: filter === tab ? "var(--text-primary)" : "var(--text-secondary)",
                  boxShadow: filter === tab ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* interviews content table */}
          <div style={{ background: "#ffffff", border: "0.5px solid #dde1e8", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "0.5px solid var(--border)" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>All Sessions</span>
              <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, fontWeight: 500, background: "var(--surface-1)", color: "var(--text-secondary)", border: "0.5px solid var(--border)" }}>{filteredSessions.length} total</span>
            </div>
            <div style={{ padding: 0 }}>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
                  <div style={{ width: 24, height: 24, border: "2px solid #1d9e75", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                </div>
              ) : filteredSessions.length === 0 ? (
                <EmptyState
                  icon="📋"
                  title="no interviews found"
                  sub={`you currently do not have any interviews matching the "${filter}" filter`}
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {filteredSessions.map((session, index) => {
                    return (
                      <div key={session._id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: index < filteredSessions.length - 1 ? "0.5px solid var(--border)" : "none" }}>
                        <div
                          style={{
                            width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            background: session.status === "completed" ? "#f0fdf4"
                              : session.status === "pending" ? "#fefce8"
                              : "var(--surface-1)",
                            color: session.status === "completed" ? "#15803d"
                              : session.status === "pending" ? "#a16207"
                              : "var(--text-primary)"
                          }}
                        >
                          {session.status === "completed" ? <IconCheck /> : <IconClock />}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {session.role || "Software Engineer"} Interview
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                            {session.companyName || "Company"} · {session.difficulty || "Medium"} ·{" "}
                            {session.createdAt
                              ? new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                              : "—"}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                          {session.report?.overallScore !== undefined && (
                            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#a16207" }}>
                              <IconStar />
                              {session.report.overallScore}/100
                            </div>
                          )}
                          <span style={{
                            fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700, textTransform: "uppercase",
                            background: session.status === "completed" ? "#f0fdf4" : (session.status === "pending" ? "#fefce8" : "var(--surface-1)"),
                            color: session.status === "completed" ? "#15803d" : (session.status === "pending" ? "#a16207" : "var(--text-secondary)"),
                            border: session.status === "completed" ? "0.5px solid #bbf7d0" : (session.status === "pending" ? "0.5px solid #fef08a" : "0.5px solid var(--border)")
                          }}>
                            {session.status}
                          </span>
                          {session.status === "pending" && (
                            <button
                              onClick={() => navigate(`/interview/${session._id}`)}
                              style={{ fontSize: 12, color: "#ffffff", background: "#1d9e75", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 500 }}
                            >
                              Join
                            </button>
                          )}
                          {session.status === "completed" && (
                            <Link
                              to={`/interview/${session._id}/report`}
                              style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-primary)", background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 500, textDecoration: "none" }}
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
