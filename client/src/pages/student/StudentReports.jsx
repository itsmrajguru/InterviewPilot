import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Sidebar from "../../components/Sidebar";
import StudentTopbar from "../../components/StudentTopbar";
import { getStudentDashboard } from "../../services/interviewService";
import Skeleton from "../../components/ui/Skeleton";

/*tiny helpers*/
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

const scoreColor = score => {
  if (score >= 75) return { pill: "#DCFCE7", text: "#15803D", bar: "#22C55E", badge: "#166534" };
  if (score >= 50) return { pill: "#FEF9C3", text: "#A16207", bar: "#EAB308", badge: "#854D0E" };
  return         { pill: "#FEE2E2", text: "#B91C1C", bar: "#EF4444", badge: "#991B1B" };
};

const diffColor = d => {
  if (d === "easy") return { bg: "#DCFCE7", text: "#15803D" };
  if (d === "hard") return { bg: "#FEE2E2", text: "#B91C1C" };
  return { bg: "#F1F5F9", text: "#475569" };
};

/*ScoreBadge :matches the stat-card style*/
function ScoreBadge({ score }) {
  const c = scoreColor(score);
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minWidth: 64, height: 64, borderRadius: 16,
      background: c.pill, border: `1.5px solid ${c.bar}30`,
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 22, fontWeight: 800, color: c.text, lineHeight: 1 }}>{score}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: c.text, opacity: 0.7 }}>/100</span>
    </div>
  );
}

/*ScoreBar*/
function ScoreBar({ score }) {
  const c = scoreColor(score);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 99, background: "#F1F5F9", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: "100%", borderRadius: 99, background: c.bar }}
        />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: c.badge, minWidth: 36, textAlign: "right" }}>
        {score}/100
      </span>
    </div>
  );
}


function EmptyReports() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", background: "#FFFFFF", borderRadius: 20, border: "1px solid #E2E8F0" }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 28 }}>🏆</div>
      <p style={{ margin: "0 0 6px 0", fontSize: 17, fontWeight: 700, color: "#0F172A" }}>No reports yet</p>
      <p style={{ margin: 0, fontSize: 14, color: "#64748B", textAlign: "center", maxWidth: 340, lineHeight: 1.6 }}>
        Complete a practice session or a company interview to see your detailed AI evaluation here.
      </p>
    </div>
  );
}


function TopStat({ icon, label, value, sub, color }) {
  return (
    <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 46, height: 46, borderRadius: 14, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#64748B", marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function StudentReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [filter, setFilter]   = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const res = await getStudentDashboard();
        setReports(res.completedInterviews || []);
      } catch {
        setError("Could not load reports. Please refresh.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = reports.filter(r => {
    const s = r.report?.overallScore ?? 0;
    if (filter === "high") return s >= 70;
    if (filter === "low")  return s < 50;
    return true;
  });

  const avgScore  = reports.length ? Math.round(reports.reduce((a, r) => a + (r.report?.overallScore ?? 0), 0) / reports.length) : 0;
  const bestScore = reports.length ? Math.max(...reports.map(r => r.report?.overallScore ?? 0)) : 0;
  const passRate  = reports.length ? Math.round((reports.filter(r => (r.report?.overallScore ?? 0) >= 50).length / reports.length) * 100) : 0;

  const FILTERS = [
    { key: "all",  label: "All" },
    { key: "high", label: "≥ 70" },
    { key: "low",  label: "< 50" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC", overflow: "hidden", fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Sidebar role="student" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <StudentTopbar title="My Reports" sub="Review scores, feedback and improvement areas" />

        <main className="ip-main-pad" style={{ flex: 1, overflowY: "auto" }}>

      
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>Evaluation Reports</h1>
            <p style={{ margin: "4px 0 0 0", fontSize: 14, color: "#64748B" }}>AI feedback, strengths, and weaknesses from all your completed interviews</p>
          </div>

         
          {error && (
            <div style={{ padding: "12px 16px", borderRadius: 12, background: "#FEF2F2", color: "#B91C1C", fontSize: 13, border: "1px solid #FECACA", marginBottom: 24 }}>
              {error}
            </div>
          )}

          
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                <Skeleton height={88} /><Skeleton height={88} /><Skeleton height={88} />
              </div>
              <Skeleton height={200} />
              <Skeleton height={140} />
              <Skeleton height={140} />
            </div>
          )}

        
          {!loading && reports.length === 0 && <EmptyReports />}

    
          {!loading && reports.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

       
              <div className="ip-stat-cards-grid">
                <TopStat icon="📋" label="Total Reports" value={reports.length} sub="completed" color="#2563EB" />
                <TopStat icon="📊" label="Average Score" value={`${avgScore}`} sub="out of 100" color="#D97706" />
                <TopStat icon="🏆" label="Best Score"    value={`${bestScore}`} sub="out of 100" color="#16A34A" />
                <TopStat icon="🎯" label="Pass Rate"     value={`${passRate}%`} sub="score ≥ 50" color="#7C3AED" />
              </div>

              {/* Chart */}
              {reports.length > 1 && (
                <div style={{ background: "#FFFFFF", borderRadius: 20, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Score Trend</span>
                      <span style={{ fontSize: 13, color: "#94A3B8", marginLeft: 8 }}>Last {Math.min(reports.length, 10)} sessions</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart
                      data={reports.slice(0, 10).reverse().map((r, i) => ({
                        name: `#${i+1} ${r.role?.split(" ")[0] || ""}`,
                        score: r.report?.overallScore ?? 0,
                      }))}
                      barSize={32}
                      margin={{ top: 0, right: 0, left: -16, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip
                        formatter={v => [`${v}/100`, "Score"]}
                        contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #E2E8F0", background: "#FFFFFF", boxShadow: "0 4px 12px rgba(15,23,42,0.1)" }}
                      />
                      <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                        {reports.slice(0, 10).reverse().map((r, i) => {
                          const s = r.report?.overallScore ?? 0;
                          return <Cell key={i} fill={s >= 75 ? "#22C55E" : s >= 50 ? "#EAB308" : "#EF4444"} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Filter row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }} className="sr-filter-row">
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0F172A" }}>
                  {filtered.length} report{filtered.length !== 1 ? "s" : ""}
                  {filter !== "all" && <span style={{ color: "#94A3B8", fontWeight: 400, marginLeft: 6 }}>· filtered</span>}
                </p>
                <div style={{ display: "flex", gap: 4, background: "#E2E8F0", padding: 4, borderRadius: 12 }}>
                  {FILTERS.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      style={{
                        padding: "6px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                        border: "none", cursor: "pointer", transition: "all 0.15s",
                        background: filter === key ? "#FFFFFF" : "transparent",
                        color:      filter === key ? "#2563EB" : "#64748B",
                        boxShadow:  filter === key ? "0 1px 4px rgba(15,23,42,0.08)" : "none",
                      }}
                    >{label}</button>
                  ))}
                </div>
              </div>

              {/* Report cards – 2 per row */}
              <div className="ip-grid-2col-responsive">
                <AnimatePresence>
                  {filtered.map((session, idx) => {
                    const score     = session.report?.overallScore;
                    const hasScore  = score !== undefined && score !== null;
                    const sc        = hasScore ? scoreColor(score) : null;
                    const strengths = session.report?.strengths?.slice(0, 2) || [];
                    const weak      = session.report?.weaknesses?.slice(0, 1) || [];
                    const summary   = session.report?.summary || "";
                    const diff      = diffColor(session.difficulty);

                    return (
                      <motion.div
                        key={session._id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ delay: idx * 0.05, duration: 0.25 }}
                        style={{
                          background: "#FFFFFF", borderRadius: 20,
                          border: "1px solid #E2E8F0",
                          boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
                          display: "flex", flexDirection: "column",
                          overflow: "hidden",
                        }}
                      >
                        {/* Colour top accent */}
                        <div style={{ height: 4, background: hasScore ? sc.bar : "#E2E8F0" }} />

                        {/* Card body */}
                        <div style={{ padding: "22px 24px", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>

                          {/* Header: role + score badge */}
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <p style={{ margin: "0 0 6px 0", fontSize: 17, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>
                                {session.role || "Software Engineer"}
                              </p>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#334155" }}>
                                  {session.companyName || "Practice Round"}
                                </span>
                                <span style={{ fontSize: 11, color: "#CBD5E1" }}>·</span>
                                <span style={{ fontSize: 12.5, color: "#64748B" }}>
                                  {session.createdAt
                                    ? new Date(session.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                                    : "—"}
                                </span>
                                <span style={{ fontSize: 11, color: "#CBD5E1" }}>·</span>
                                <span style={{
                                  fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                                  letterSpacing: "0.05em", padding: "2px 8px", borderRadius: 6,
                                  background: diff.bg, color: diff.text
                                }}>
                                  {cap(session.difficulty) || "Medium"}
                                </span>
                              </div>
                            </div>
                            {hasScore && <ScoreBadge score={score} />}
                          </div>

                          {/* Summary */}
                          {summary ? (
                            <p style={{ margin: 0, fontSize: 13.5, color: "#475569", lineHeight: 1.65,
                              display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {summary}
                            </p>
                          ) : (
                            <p style={{ margin: 0, fontSize: 13, color: "#94A3B8", fontStyle: "italic" }}>
                              No summary generated for this session.
                            </p>
                          )}

                          {/* Strengths & weaknesses pills */}
                          {(strengths.length > 0 || weak.length > 0) && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {strengths.map((s, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 12px", borderRadius: 10, background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                                  <span style={{ color: "#16A34A", fontWeight: 800, fontSize: 14, lineHeight: 1.4 }}>+</span>
                                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#15803D", lineHeight: 1.4 }}>{s}</span>
                                </div>
                              ))}
                              {weak.map((w, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 12px", borderRadius: 10, background: "#FFF1F2", border: "1px solid #FECDD3" }}>
                                  <span style={{ color: "#DC2626", fontWeight: 800, fontSize: 14, lineHeight: 1.4 }}>−</span>
                                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#B91C1C", lineHeight: 1.4 }}>{w}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Score bar */}
                          {hasScore && (
                            <div style={{ marginTop: "auto" }}>
                              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94A3B8", marginBottom: 6 }}>Overall Score</div>
                              <ScoreBar score={score} />
                            </div>
                          )}
                        </div>

                        {/* Card footer */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderTop: "1px solid #F1F5F9", background: "#FAFAFA" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}>Completed</span>
                          </div>
                          <button
                            onClick={() => navigate(`/interview/${session._id}/report`)}
                            style={{
                              display: "flex", alignItems: "center", gap: 6,
                              padding: "8px 18px", borderRadius: 10,
                              background: "#EFF6FF", color: "#2563EB",
                              border: "1px solid #BFDBFE", fontWeight: 700,
                              fontSize: 13, cursor: "pointer", transition: "all 0.15s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#2563EB"; e.currentTarget.style.color = "#FFFFFF"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#EFF6FF"; e.currentTarget.style.color = "#2563EB"; }}
                          >
                            View Report →
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

            </div>
          )}
        </main>
      </div>
    </motion.div>
  );
}