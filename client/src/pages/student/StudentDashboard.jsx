import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import StudentTopbar from "../../components/StudentTopbar";
import TextPracticeTerminal from "../../components/TextPracticeTerminal";
import { getStudentDashboard } from "../../services/interviewService";

const S = {
  metric: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
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
    border: "1px solid var(--border)",
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

const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconCircleCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
  </svg>
);
const IconStar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconFlame = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);
const IconMessages = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconBolt = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconTarget = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IconArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconVideo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-hover)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const IconTerminal = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-hover)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
  </svg>
);
const IconChartBar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-hover)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const IconUpload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-hover)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconTrendUp = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);

function ScoreRing({ score }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <svg style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)" }} width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="none" stroke="var(--border-input)" strokeWidth="4"/>
      <circle cx="22" cy="22" r={r} fill="none" stroke="var(--accent)" strokeWidth="4"
        strokeDasharray={circ.toFixed(1)} strokeDashoffset={offset.toFixed(1)}
        strokeLinecap="round" transform="rotate(-90 22 22)" opacity="0.6"/>
    </svg>
  );
}

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
  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

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

  const skillBreakdown = useMemo(() => {
    if (!completed.length) return null;
    const allAnswers = completed.flatMap(s => s.answers || []);
    const avg = (arr, key = "score") => arr.length ? Math.round(arr.reduce((s, a) => s + (a[key] || 0), 0) / arr.length * 10) : null;
    const hrA    = allAnswers.filter(a => a.type === "hr");
    const techA  = allAnswers.filter(a => a.type === "technical");
    const codeA  = allAnswers.filter(a => a.type === "coding");
    const commA  = allAnswers.filter(a => a.communicationScore !== undefined);
    return {
      hr:   avg(hrA),
      tech: avg(techA),
      code: avg(codeA),
      comm: commA.length ? Math.round(commA.reduce((s, a) => s + (a.communicationScore || 0), 0) / commA.length * 10) : null,
    };
  }, [completed]);

  const recentSessions = useMemo(() => {
    const all = [...pending, ...completed].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return all.slice(0, 3);
  }, [pending, completed]);

  const today = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const qaActions = [
    { icon: <IconVideo />, label: "Video practice", sub: "Mock round", onClick: () => navigate("/student/practice") },
    { icon: <IconTerminal />, label: "Text practice", sub: "DSA + concepts", onClick: () => navigate("/student/practice") },
    { icon: <IconChartBar />, label: "View reports", sub: "All sessions", onClick: () => navigate("/student/reports") },
    { icon: <IconUpload />, label: "Upload resume", sub: "Update profile", onClick: () => navigate("/student/profile") },
  ];

  const skillRows = skillBreakdown ? [
    { label: "HR / Behavioural", pct: skillBreakdown.hr, color: "var(--accent)" },
    { label: "Technical", pct: skillBreakdown.tech, color: "var(--text-secondary)" },
    { label: "Coding", pct: skillBreakdown.code, color: "var(--text-muted)" },
    { label: "Communication", pct: skillBreakdown.comm, color: "var(--accent)" },
  ] : [
    { label: "HR / Behavioural", pct: null, color: "var(--accent)" },
    { label: "Technical", pct: null, color: "var(--text-secondary)" },
    { label: "Coding", pct: null, color: "var(--text-muted)" },
    { label: "Communication", pct: null, color: "var(--accent)" },
  ];

  return (
    <div className="ip-app-wrapper" style={{ display:"flex", minHeight:"100vh", background: "var(--bg)", overflow: "hidden", fontFamily: "var(--font-sans)", fontSize: 14 }}>
      <Sidebar role="student" pendingCount={pending.length} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <StudentTopbar title="Dashboard" sub="" />

        <div style={{ flex: 1, overflowY: "auto", padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--color-danger-bg)", color: "var(--color-danger-text)", fontSize: 13, border: "0.5px solid var(--color-danger-border)" }}>
              {error}
            </div>
          )}

          <div className="ip-header-flex" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-primary)" }}>Welcome back, {firstName} 👋</h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Here's a snapshot of your interview activity today.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: "var(--radius)", padding: "6px 12px", fontSize: 12, color: "var(--text-secondary)", flexShrink: 0 }}>
              <IconCalendar /> {today}
            </div>
          </div>

          <div className="ip-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            <div style={{ ...S.metric, borderLeft: "2px solid var(--accent)" }}>
              <div style={S.metricLabel}><IconClock /> Pending</div>
              <div style={S.metricValue}>{loading ? "—" : pending.length}</div>
              <div style={{ ...S.metricSub, color: "var(--text-muted)" }}>
                <IconCheck style={{ fontSize: 13 }} /> All clear
              </div>
            </div>

            <div style={S.metric}>
              <div style={S.metricLabel}><IconCircleCheck /> Completed</div>
              <div style={S.metricValue}>{loading ? "—" : completed.length}</div>
              {completed.length > 0 ? (
                <div style={{ ...S.metricSub, color: "var(--accent)" }}>
                  <IconTrendUp /> +{completed.length} total
                </div>
              ) : (
                <div style={S.metricSub}>Complete your first interview</div>
              )}
            </div>

            <div style={S.metric}>
              <div style={S.metricLabel}><IconStar /> Avg. score</div>
              <div style={{ ...S.metricValue, color: avgScore !== null ? "var(--accent)" : "var(--text-primary)" }}>
                {loading ? "—" : avgScore !== null ? avgScore : "—"}
              </div>
              <div style={S.metricSub}>{avgScore !== null ? "out of 100" : "No interviews yet"}</div>
              {!loading && avgScore !== null && <ScoreRing score={avgScore} />}
            </div>

            <div style={S.metric}>
              <div style={S.metricLabel}><IconFlame /> Practice streak</div>
              <div style={S.metricValue}>—</div>
              <div style={S.metricSub}>Start today</div>
            </div>
          </div>

          <div className="ip-grid-2-col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 16 }}>
            <div style={S.card}>
              <div style={S.cardHeader}>
                <span style={S.cardTitle}><IconMessages /> Recent interviews</span>
                {completed.length > 0 && (
                  <Link to="/student/interviews" style={{ fontSize: 12, color: "var(--accent)", display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}>
                    View all <IconArrowRight />
                  </Link>
                )}
              </div>
              <div style={{ padding: "8px 20px" }}>
                {loading ? (
                  <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
                ) : recentSessions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 13 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
                    No interviews yet
                  </div>
                ) : (
                  <>
                    {recentSessions.map((iv) => (
                      <div key={iv._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "0.5px solid var(--border)" }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15,
                          background: iv.status === "completed" ? "#e1f5ee" : iv.status === "pending" ? "#faeeda" : "var(--surface-1)",
                          color: iv.status === "completed" ? "var(--accent-hover)" : iv.status === "pending" ? "#854f0b" : "var(--text-muted)",
                        }}>
                          {iv.status === "completed" ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {iv.role || "Software Engineer"} interview
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                            Company · {iv.difficulty || "Medium"} · {iv.createdAt ? new Date(iv.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          {iv.report?.overallScore !== undefined && (
                            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--accent-hover)", background: "#e1f5ee", padding: "3px 10px", borderRadius: 20 }}>
                              {iv.report.overallScore}/100
                            </span>
                          )}
                          {iv.status === "completed" && (
                            <Link
                              to={`/interview/${iv._id}/report`}
                              style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-secondary)", background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: "var(--radius)", padding: "4px 10px", textDecoration: "none" }}
                            >
                              Report <IconArrowRight />
                            </Link>
                          )}
                          {iv.status === "pending" && (
                            <button
                              onClick={() => navigate(`/interview/${iv._id}`)}
                              style={{ fontSize: 12, color: "var(--accent-hover)", background: "#e1f5ee", border: "none", borderRadius: "var(--radius)", padding: "4px 10px", cursor: "pointer", fontWeight: 500 }}
                            >
                              Join
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {pending.length === 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0" }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: "#faeeda", color: "#854f0b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>No pending interviews</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>You're all caught up</div>
                        </div>
                        <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 500, background: "var(--surface-1)", color: "var(--text-secondary)", border: "0.5px solid var(--border)" }}>
                          0 pending
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={S.card}>
                <div style={S.cardHeader}>
                  <span style={S.cardTitle}><IconBolt /> Quick actions</span>
                </div>
                <div style={{ ...S.cardBody, paddingTop: 12 }}>
                  <div className="ip-stats-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 10 }}>
                    {qaActions.map((a) => (
                      <div
                        key={a.label}
                        onClick={a.onClick}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", borderRadius: 10, border: "0.5px solid var(--border)", background: "var(--surface-1)", cursor: "pointer", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "#e1f5ee"; e.currentTarget.querySelectorAll(".qa-label").forEach(el => el.style.color = "#085041"); }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface-1)"; e.currentTarget.querySelectorAll(".qa-label").forEach(el => el.style.color = "var(--text-primary)"); }}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#e1f5ee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {a.icon}
                        </div>
                        <div>
                          <div className="qa-label" style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{a.label}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{a.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={S.card}>
                <div style={S.cardHeader}>
                  <span style={S.cardTitle}><IconTarget /> Skill breakdown</span>
                  <span style={{ fontSize: 12, color: "var(--accent)", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
                    onClick={() => navigate("/student/reports")}>
                    Improve ↗
                  </span>
                </div>
                <div style={S.cardBody}>
                  {skillRows.map((row) => (
                    <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 13 }}>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)", width: 100, flexShrink: 0 }}>{row.label}</span>
                      <div style={{ flex: 1, height: 5, background: "var(--surface-1)", borderRadius: 10, overflow: "hidden", border: "0.5px solid var(--border)" }}>
                        <div style={{ height: "100%", borderRadius: 10, background: row.color, width: `${row.pct ?? 0}%`, transition: "width 0.6s ease" }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", width: 34, textAlign: "right", flexShrink: 0 }}>
                        {row.pct !== null ? `${row.pct}%` : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
