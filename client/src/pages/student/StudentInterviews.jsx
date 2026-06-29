import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import StudentTopbar from "../../components/StudentTopbar";
import { getStudentDashboard } from "../../services/interviewService";

const S = {
  metric: {
    background: "#ffffff",
    border: "0.5px solid #dde1e8",
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
    background: "#ffffff",
    border: "0.5px solid #dde1e8",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
  },
};

const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconReport = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
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

const scoreColor = (s) => {
  if (s >= 75) return { text: "var(--color-success-text)", bg: "var(--color-success-bg)", border: "var(--color-success-border)" };
  if (s >= 50) return { text: "var(--text-secondary)", bg: "var(--bg-body)", border: "var(--border)" };
  return { text: "var(--color-danger-text)", bg: "var(--color-danger-bg)", border: "var(--color-danger-border)" };
};

const ScoreArc = ({ score }) => {
  const c = scoreColor(score);
  const r = 28, cx = 36, cy = 36;
  const circ = Math.PI * r; // semi-circle
  const fill = (score / 100) * circ;
  return (
    <svg width="72" height="44" viewBox="0 0 72 44">
      <path d={`M${cx - r},${cy} A${r},${r} 0 0,1 ${cx + r},${cy}`}
        fill="none" stroke="#e5e7eb" strokeWidth="5" strokeLinecap="round"/>
      <path d={`M${cx - r},${cy} A${r},${r} 0 0,1 ${cx + r},${cy}`}
        fill="none" stroke={c.text} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={`${fill} ${circ}`}
        style={{ transition: "stroke-dasharray 0.7s ease" }}/>
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize="13" fontWeight="800" fill={c.text}>{score}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fontWeight="600" fill="#9ca3af">/100</text>
    </svg>
  );
};

const ScoreBadge = ({ score }) => {
  const c = scoreColor(score);
  return (
    <span style={{
      fontSize: 13, fontWeight: 800, padding: "4px 10px", borderRadius: 20,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      letterSpacing: "-0.01em"
    }}>{score}<span style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}>/100</span></span>
  );
};

const StrengthPill = ({ text }) => (
  <span style={{
    fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
    background: "#e1f5ee", color: "#0f6e56", border: "1px solid #a7dfc9",
    whiteSpace: "nowrap"
  }}>+ {text}</span>
);
const WeaknessPill = ({ text }) => (
  <span style={{
    fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
    background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca",
    whiteSpace: "nowrap"
  }}>− {text}</span>
);

const DiffBadge = ({ diff }) => {
  const map = {
    easy:   { bg: "var(--color-success-bg)", color: "var(--color-success-text)", border: "var(--color-success-border)" },
    medium: { bg: "var(--bg-body)", color: "var(--text-secondary)", border: "var(--border)" },
    hard:   { bg: "var(--color-danger-bg)", color: "var(--color-danger-text)", border: "var(--color-danger-border)" },
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

const StatsBar = ({ reports }) => {
  const avg = reports.length
    ? Math.round(reports.reduce((a, r) => a + (r.report?.overallScore || 0), 0) / reports.length)
    : 0;
  const best = reports.length
    ? Math.max(...reports.map(r => r.report?.overallScore || 0))
    : 0;
  const items = [
    { label: "Total Reports",  value: reports.length,   sub: "completed" },
    { label: "Avg Score",      value: avg,               sub: "/ 100" },
    { label: "Best Score",     value: best,              sub: "/ 100" },
  ];
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
      marginBottom: 28
    }}>
      {items.map(({ label, value, sub }) => (
        <div key={label} style={S.metric}>
          <div style={S.metricLabel}>{label}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={S.metricValue}>{value}</span>
            <span style={S.metricSub}>{sub}</span>
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
  const [filter, setFilter] = useState("all");
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

  const filtered = sessions.filter(session => {
    if (filter === "all") return true;
    return session.status === filter;
  });
  const completedSessions = sessions.filter(s => s.status === "completed");

  return (
    <>
      <style>{`
        @keyframes sr-spin { to { transform: rotate(360deg); } }
        @keyframes sr-fade-up { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .sr-fade-up { animation: sr-fade-up 0.3s cubic-bezier(0.22,1,0.36,1) both; }
        .sr-card { transition: box-shadow 0.18s, transform 0.18s; }
        .sr-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; transform: translateY(-2px); }
        .sr-filter-btn:hover { background: #f1f4f7 !important; }
        .sr-report-btn:hover { background: #000000 !important; }
        .sr-join-btn:hover { background: #000000 !important; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#e4e8ee", overflow: "hidden", fontFamily: "var(--font-sans)", fontSize: 14 }}>
        <Sidebar role="student" />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <StudentTopbar title="My Interviews" sub="Review all company invitations and practice rounds" />

          <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>
                Interview History
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
                manage and view the status of all your company invitations and practice rounds
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
                <div style={{ width: 28, height: 28, border: "3px solid #111827", borderTopColor: "transparent", borderRadius: "50%", animation: "sr-spin 0.7s linear infinite" }}/>
              </div>

            ) : sessions.length === 0 ? (
              <div style={{
                background: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", padding: "72px 24px", textAlign: "center"
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: "#e1f5ee", border: "1px solid #a7dfc9",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16, color: "#111827"
                }}>
                  <IconTrophy />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 6px 0" }}>No interviews found</p>
                <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 300, margin: "0 0 20px 0", lineHeight: 1.6 }}>
                  Start a practice interview or wait for a company invitation to see it here.
                </p>
                <button
                  onClick={() => navigate("/student/practice")}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 16px", borderRadius: 6, fontSize: 12,
                    fontWeight: 600, border: "none", cursor: "pointer",
                    background: "#111827", color: "#ffffff"
                  }}
                >
                  <IconPlay /> Start Practice Interview
                </button>
              </div>

            ) : (
              <>
                <StatsBar reports={completedSessions} />

                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: 16
                }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>
                    {filtered.length} interview{filtered.length !== 1 ? "s" : ""}
                    {filter !== "all" && <span style={{ color: "#9ca3af", fontWeight: 400 }}> · filtered</span>}
                  </p>
                  <div style={{ display: "flex", gap: 4, background: "#e5e7eb", padding: 3, borderRadius: 8 }}>
                    {[
                      { key: "all",       label: "All" },
                      { key: "pending",   label: "Pending" },
                      { key: "completed", label: "Completed" },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        className="sr-filter-btn"
                        onClick={() => setFilter(key)}
                        style={{
                          padding: "5px 14px", borderRadius: 6, fontSize: 12,
                          fontWeight: 700, border: "none", cursor: "pointer",
                          transition: "all 0.15s",
                          background: filter === key ? "#ffffff" : "transparent",
                          color: filter === key ? "#111827" : "#6b7280",
                          boxShadow: filter === key ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                        }}
                      >{label}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  {filtered.map((session, idx) => {
                    const score    = session.report?.overallScore;
                    const hasScore = score !== undefined && session.status === "completed";
                    const sc       = hasScore ? scoreColor(score) : null;
                    const strengths  = session.report?.strengths?.slice(0, 2) || [];
                    const weaknesses = session.report?.weaknesses?.slice(0, 1) || [];

                    return (
                      <div
                        key={session._id}
                        className="sr-card sr-fade-up"
                        style={{
                          animationDelay: `${idx * 0.04}s`,
                          ...S.card,
                          display: "flex", flexDirection: "column"
                        }}
                      >
                        <div style={{
                          height: 3,
                          background: hasScore
                            ? `linear-gradient(90deg, ${sc.text}, ${sc.text}88)`
                            : (session.status === "pending" ? `linear-gradient(90deg, var(--color-primary-500), var(--color-primary-400))` : "#e5e7eb")
                        }}/>

                        <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>

                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                            <div style={{ minWidth: 0 }}>
                              <p style={{
                                margin: "0 0 5px 0", fontSize: 15, fontWeight: 600, color: "var(--text-primary)",
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                              }}>
                                {session.role || "Software Engineer"}
                              </p>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                                  {session.companyName || "Practice Round"}
                                </span>
                                <span style={{ color: "#d1d5db", fontSize: 10 }}>·</span>
                                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                                  {session.createdAt
                                    ? new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                                    : "—"}
                                </span>
                                <DiffBadge diff={session.difficulty} />
                              </div>
                            </div>

                            {hasScore && <ScoreArc score={score} />}
                            {(!hasScore && session.status === "pending") && (
                              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--surface-1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", border: "0.5px solid var(--border)" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                </svg>
                              </div>
                            )}
                          </div>

                          {hasScore ? (
                            session.report?.summary ? (
                              <p style={{
                                margin: 0, fontSize: 12, color: "#6b7280", lineHeight: 1.6,
                                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                              }}>
                                {session.report.summary}
                              </p>
                            ) : (
                              <p style={{ margin: 0, fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
                                Report could not be generated automatically.
                              </p>
                            )
                          ) : (
                            <p style={{ margin: 0, fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
                              This interview is pending. Start when you are ready to be evaluated.
                            </p>
                          )}

                          {(strengths.length > 0 || weaknesses.length > 0) && hasScore && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {strengths.map((s, i) => <StrengthPill key={i} text={s} />)}
                              {weaknesses.map((w, i) => <WeaknessPill key={i} text={w} />)}
                            </div>
                          )}

                          {hasScore && sc && (
                            <div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9ca3af" }}>Overall Score</span>
                                <ScoreBadge score={score} />
                              </div>
                              <div style={{ height: 5, background: "#f1f4f7", borderRadius: 99, overflow: "hidden" }}>
                                <div style={{
                                  height: "100%", borderRadius: 99,
                                  background: sc.text,
                                  width: `${score}%`,
                                  transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)"
                                }}/>
                              </div>
                            </div>
                          )}
                        </div>

                        <div style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "12px 20px",
                          borderTop: "1px solid #f1f4f7",
                          background: "#fafafa"
                        }}>
                          {session.status === "completed" ? (
                            <>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#111827" }}/>
                                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280" }}>
                                  Completed
                                </span>
                              </div>
                              <button
                                className="sr-report-btn"
                                onClick={() => navigate(`/interview/${session._id}/report`)}
                                style={{
                                  display: "flex", alignItems: "center", gap: 5,
                                  padding: "5px 12px", borderRadius: 6, fontSize: 11,
                                  fontWeight: 600, border: "none", cursor: "pointer",
                                  background: "#111827", color: "#ffffff",
                                  transition: "background 0.15s"
                                }}
                              >
                                <IconReport />
                                View Full Report
                                <IconArrow />
                              </button>
                            </>
                          ) : (
                            <>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-secondary)" }}/>
                                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)" }}>
                                  Pending
                                </span>
                              </div>
                              <button
                                className="sr-join-btn"
                                onClick={() => navigate(`/interview/${session._id}`)}
                                style={{
                                  display: "flex", alignItems: "center", gap: 5,
                                  padding: "5px 12px", borderRadius: 6, fontSize: 11,
                                  fontWeight: 600, border: "none", cursor: "pointer",
                                  background: "#111827", color: "#ffffff",
                                  transition: "background 0.15s"
                                }}
                              >
                                <IconPlay />
                                Join
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
