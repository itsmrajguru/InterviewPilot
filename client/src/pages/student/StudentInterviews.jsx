import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import StudentTopbar from "../../components/StudentTopbar";
import { getStudentDashboard } from "../../services/interviewService";

const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconPlay = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
const IconTrophy = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/>
    <path d="M7 4H4a2 2 0 0 0-2 2v2c0 2.8 2.2 5 5 5"/><path d="M17 4h3a2 2 0 0 1 2 2v2c0 2.8-2.2 5-5 5"/>
    <rect x="7" y="2" width="10" height="9" rx="2"/>
  </svg>
);
const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const scoreColor = (s) => {
  if (s >= 75) return { text: "var(--success-text)", bg: "var(--success-bg)", border: "var(--success-border)" };
  if (s >= 50) return { text: "var(--text-secondary)", bg: "var(--bg-subtle)", border: "var(--border)" };
  return { text: "var(--danger-text)", bg: "var(--danger-bg)", border: "var(--danger-border)" };
};

const ScoreBadge = ({ score }) => {
  const c = scoreColor(score);
  return (
    <span style={{
      fontSize: 13, fontWeight: 800, padding: "4px 10px", borderRadius: 20,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      letterSpacing: "-0.01em", whiteSpace: "nowrap"
    }}>{score}<span style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}>/100</span></span>
  );
};

const DiffBadge = ({ diff }) => {
  const map = {
    easy:   { bg: "var(--success-bg)", color: "var(--success-text)", border: "var(--success-border)" },
    medium: { bg: "var(--warning-bg)", color: "var(--warning-text)", border: "var(--warning-border)" },
    hard:   { bg: "var(--danger-bg)", color: "var(--danger-text)", border: "var(--danger-border)" },
  };
  const s = map[diff] || map.medium;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
      padding: "2px 8px", borderRadius: 20,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`
    }}>{diff || "medium"}</span>
  );
};

const StatsBar = ({ pending, completed, total }) => {
  const items = [
    { label: "Action Required", value: pending, sub: "pending invites" },
    { label: "Completed",       value: completed, sub: "sessions finished" },
    { label: "Total Activity",  value: total,     sub: "all time interviews" },
  ];
  return (
    <div className="ip-stats-row" style={{
      display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
      marginBottom: 32
    }}>
      {items.map(({ label, value, sub }) => (
        <div key={label} style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>{label}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1 }}>{value}</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function StudentInterviews() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getStudentDashboard();
        const allList = [
          ...(res.pendingInterviews || []),
          ...(res.completedInterviews || [])
        ];
        allList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setSessions(allList);
      } catch (err) {
        setError("could not load interviews list");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pendingSessions = sessions.filter(s => s.status === "pending");
  const completedSessions = sessions.filter(s => s.status === "completed");

  return (
    <>
      <style>{`
        @keyframes sr-spin { to { transform: rotate(360deg); } }
        @keyframes sr-fade-up { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .sr-fade-up { animation: sr-fade-up 0.3s cubic-bezier(0.22,1,0.36,1) both; }
        .ticket-card { transition: transform 0.2s, box-shadow 0.2s; }
        .ticket-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important; }
        .list-row { transition: background 0.15s; }
        .list-row:hover { background: var(--bg-hover) !important; }
        .sr-join-btn:hover { background: var(--accent-hover) !important; }
      `}</style>

      <div className="ip-app-wrapper" style={{ display:"flex", minHeight:"100vh", background: "var(--bg)", overflow: "hidden", fontFamily: "var(--font-sans)", fontSize: 14 }}>
        <Sidebar role="student" />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <StudentTopbar title="My Interviews" sub="Manage invitations and review past sessions" />

          <main className="ip-main-container" style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>
                Interview Dashboard
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
                Keep track of your pending invitations and review your completed history
              </p>
            </div>

            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 16px", borderRadius: 10, marginBottom: 20,
                background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", fontSize: 13
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }}/>
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
                <div style={{ width: 28, height: 28, border: "3px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%", animation: "sr-spin 0.7s linear infinite" }}/>
              </div>

            ) : sessions.length === 0 ? (
              <div style={{
                background: "var(--bg-card)", borderRadius: 16, border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", padding: "72px 24px", textAlign: "center"
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: "var(--accent-light)", border: "1px solid var(--accent-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16, color: "var(--accent)"
                }}>
                  <IconTrophy />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)", margin: "0 0 6px 0" }}>No interviews found</p>
                <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 300, margin: "0 0 20px 0", lineHeight: 1.6 }}>
                  Start a practice interview or wait for a company invitation to see it here.
                </p>
                <button
                  onClick={() => navigate("/student/practice")}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 16px", borderRadius: 6, fontSize: 12,
                    fontWeight: 600, border: "none", cursor: "pointer",
                    background: "var(--accent)", color: "var(--bg-card)", whiteSpace: "nowrap"
                  }}
                >
                  <IconPlay /> Start Practice Interview
                </button>
              </div>

            ) : (
              <>
                <StatsBar 
                  pending={pendingSessions.length} 
                  completed={completedSessions.length} 
                  total={sessions.length} 
                />

                <div className="ip-responsive-flex-col" style={{ display:"flex", gap:32, alignItems:"flex-start" }}>
                  
                  <div style={{ flex: "1 1 400px", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: pendingSessions.length > 0 ? "var(--accent)" : "var(--text-muted)", boxShadow: pendingSessions.length > 0 ? "0 0 0 3px var(--accent-light)" : "none" }}/>
                      <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Action Required</h2>
                    </div>

                    {pendingSessions.length === 0 ? (
                      <div style={{ padding: "32px 24px", background: "var(--surface-1)", border: "1px dashed var(--border)", borderRadius: 12, textAlign: "center" }}>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>You have no pending invitations. You're all caught up!</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {pendingSessions.map((session, idx) => (
                          <div key={session._id} className="ticket-card sr-fade-up" style={{ animationDelay: `${idx * 0.05}s`, display: "flex", background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                            
                            <div style={{ flex: 1, padding: "20px 24px", position: "relative" }}>
                              <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: "var(--accent)" }}/>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                <DiffBadge diff={session.difficulty} />
                                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>•</span>
                                <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                                  <IconClock /> {session.createdAt ? new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                                </span>
                              </div>
                              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px 0" }}>
                                {session.role || "Software Engineer"}
                              </h3>
                              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
                                {session.companyName || "Practice Round"}
                              </p>
                            </div>

                            <div style={{ width: 140, borderLeft: "2px dashed var(--border-input)", background: "var(--bg-hover)", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)" }}>Pending</span>
                              <button
                                className="sr-join-btn"
                                onClick={() => navigate(`/interview/${session._id}`, { state: { session } })}
                                style={{
                                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                  width: "100%", padding: "8px 0", borderRadius: 8, fontSize: 13,
                                  fontWeight: 600, border: "none", cursor: "pointer",
                                  background: "var(--accent)", color: "var(--bg-card)",
                                  transition: "background 0.15s", whiteSpace: "nowrap"
                                }}
                              >
                                <IconPlay /> Join
                              </button>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ flex: "1 1 400px", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <IconCheck />
                      <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Recent History</h2>
                    </div>

                    {completedSessions.length === 0 ? (
                      <div style={{ padding: "32px 24px", background: "var(--surface-1)", border: "1px dashed var(--border)", borderRadius: 12, textAlign: "center" }}>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>No completed interviews yet.</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {completedSessions.map((session, idx) => {
                          const score = session.report?.overallScore;
                          return (
                            <div key={session._id} className="list-row sr-fade-up" style={{ animationDelay: `${idx * 0.05}s`, display: "flex", alignItems: "center", padding: "16px 20px", background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border)", gap: 16 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {session.role || "Software Engineer"}
                                </h3>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session.companyName || "Practice Round"}</span>
                                  <span style={{ fontSize: 10, color: "var(--border-strong)" }}>•</span>
                                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{session.createdAt ? new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}</span>
                                </div>
                              </div>

                              {score !== undefined ? (
                                <ScoreBadge score={score} />
                              ) : (
                                <span style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic", whiteSpace: "nowrap" }}>No score</span>
                              )}

                              <button
                                onClick={() => navigate(`/interview/${session._id}/report`, { state: { session } })}
                                style={{
                                  display: "flex", alignItems: "center", gap: 4,
                                  padding: "6px 12px", borderRadius: 6, fontSize: 12,
                                  fontWeight: 600, border: "1px solid var(--border-input)", background: "transparent",
                                  color: "#0f172a", cursor: "pointer", transition: "background 0.15s", whiteSpace: "nowrap"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                              >
                                View Report <IconArrow />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
