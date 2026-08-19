import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Sidebar from "../../components/Sidebar";
import StudentTopbar from "../../components/StudentTopbar";
import { getStudentDashboard } from "../../services/interviewService";

import { IconArrowRight, IconReport, IconPlay, IconCheck } from "../../components/ui/icons";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";

const IconTrophy = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/>
    <path d="M7 4H4a2 2 0 0 0-2 2v2c0 2.8 2.2 5 5 5"/><path d="M17 4h3a2 2 0 0 1 2 2v2c0 2.8-2.2 5-5 5"/>
    <rect x="7" y="2" width="10" height="9" rx="2"/>
  </svg>
);

const scoreColor = (s) => {
  if (s >= 75) return { text: "var(--success-text)", bg: "var(--success-bg)", border: "var(--success-border)", variant: "success" };
  if (s >= 50) return { text: "var(--text-secondary)", bg: "var(--bg-subtle)", border: "var(--border)", variant: "neutral" };
  return { text: "var(--danger-text)", bg: "var(--danger-bg)", border: "var(--danger-border)", variant: "danger" };
};

const ScoreArc = ({ score }) => {
  const c = scoreColor(score);
  const r = 28, cx = 36, cy = 36;
  const circ = Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <svg width="72" height="44" viewBox="0 0 72 44">
      <path d={`M${cx - r},${cy} A${r},${r} 0 0,1 ${cx + r},${cy}`} fill="none" stroke="var(--color-border-subtle)" strokeWidth="5" strokeLinecap="round"/>
      <path d={`M${cx - r},${cy} A${r},${r} 0 0,1 ${cx + r},${cy}`} fill="none" stroke={c.text} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${fill} ${circ}`} style={{ transition: "stroke-dasharray 0.7s ease" }}/>
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize="13" fontWeight="800" fill={c.text}>{score}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fontWeight="600" fill="var(--text-disabled)">/100</text>
    </svg>
  );
};

const DiffBadge = ({ diff }) => {
  const v = diff === "easy" ? "success" : diff === "hard" ? "danger" : "neutral";
  return <Badge variant={v} style={{ textTransform: "uppercase", fontSize: 10 }}>{diff || "medium"}</Badge>;
};

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
    const s = r.report?.overallScore || 0;
    if (filter === "high") return s >= 70;
    if (filter === "low")  return s < 50;
    return true;
  });

  const avgScore = reports.length ? Math.round(reports.reduce((a, r) => a + (r.report?.overallScore || 0), 0) / reports.length) : 0;
  const bestScore = reports.length ? Math.max(...reports.map(r => r.report?.overallScore || 0)) : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="ip-app-wrapper" style={{ display:"flex", minHeight:"100vh", background: "var(--bg)", overflow: "hidden", fontFamily: "var(--sans)", fontSize: 14 }}>
      <Sidebar role="student" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <StudentTopbar title="My Reports" sub="Review scores, feedback and improvement areas" />

        <main style={{ flex: 1, overflowY: "auto" }}>
          <PageHeader title="Evaluation Reports" subtitle="AI feedback, strengths, and weaknesses from all your completed interviews" />

          <div style={{ maxWidth: 1180, margin: "-24px auto 0", padding: "0 24px 24px" }}>
            
            {error && (
              <div style={{ padding: "var(--space-3)", borderRadius: "var(--radius-sm)", background: "var(--danger-bg)", color: "var(--danger-text)", fontSize: 13, border: "1px solid var(--danger-border)", marginBottom: "var(--space-6)" }}>
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
                <Skeleton height={100} />
                <Skeleton height={100} />
                <Skeleton height={100} />
              </div>
            ) : reports.length === 0 ? (
              <EmptyState 
                icon={IconTrophy} 
                title="No reports yet" 
                subtext="Complete a practice session or a company interview to see your detailed AI evaluation here." 
              />
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
                  <StatCard label="Total Reports" value={reports.length} sub="completed" accentColor="var(--text-secondary)" />
                  <StatCard label="Avg Score" value={avgScore} sub="/ 100" accentColor="var(--warning-text)" />
                  <StatCard label="Best Score" value={bestScore} sub="/ 100" accentColor="var(--success-text)" />
                </div>

                {reports.length > 1 && (
                  <Card style={{ marginBottom: "var(--space-6)" }}>
                    <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--color-border-subtle)", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Score Trend</span>
                      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>across your last {Math.min(reports.length, 10)} interviews</span>
                    </div>
                    <div style={{ padding: "16px 12px 8px" }}>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={reports.slice(0, 10).reverse().map((r, i) => ({ name: `#${i+1} ${r.role?.split(' ')[0] || ''}`, score: r.report?.overallScore || 0 }))} barSize={28}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} width={32} />
                          <Tooltip formatter={(v) => [`${v}/100`, 'Score']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-panel)' }} />
                          <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                            {reports.slice(0, 10).reverse().map((r, i) => (
                              <Cell key={i} fill={(r.report?.overallScore || 0) >= 75 ? 'var(--success-text)' : (r.report?.overallScore || 0) >= 50 ? 'var(--warning-text)' : 'var(--danger-text)'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    {filtered.length} report{filtered.length !== 1 ? "s" : ""}
                    {filter !== "all" && <span style={{ color: "var(--text-disabled)", fontWeight: 400 }}> · filtered</span>}
                  </p>
                  <div style={{ display: "flex", gap: 4, background: "var(--color-border-subtle)", padding: 3, borderRadius: "var(--radius-md)" }}>
                    {[ { key: "all", label: "All" }, { key: "high", label: "≥ 70" }, { key: "low", label: "< 50" } ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setFilter(key)}
                        style={{
                          padding: "5px 14px", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", transition: "all 0.15s",
                          background: filter === key ? "var(--color-bg-panel)" : "transparent",
                          color: filter === key ? "var(--accent)" : "var(--text-secondary)",
                          boxShadow: filter === key ? "var(--shadow-sm)" : "none"
                        }}
                      >{label}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: "var(--space-4)" }}>
                  {filtered.map((session, idx) => {
                    const score = session.report?.overallScore;
                    const hasScore = score !== undefined;
                    const sc = hasScore ? scoreColor(score) : null;
                    const strengths = session.report?.strengths?.slice(0, 2) || [];
                    const weaknesses = session.report?.weaknesses?.slice(0, 1) || [];

                    return (
                      <Card key={session._id} interactive style={{ display: "flex", flexDirection: "column", animationDelay: `${idx * 0.04}s` }} className="sp-fade-up">
                        <div style={{ height: 3, background: hasScore ? sc.text : "var(--color-border-subtle)" }}/>
                        
                        <div style={{ padding: "var(--space-4)", flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ margin: "0 0 5px 0", fontSize: 15, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {session.role || "Software Engineer"}
                              </p>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{session.companyName || "Practice Round"}</span>
                                <span style={{ color: "var(--color-border-subtle)", fontSize: 10 }}>·</span>
                                <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{session.createdAt ? new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                                <DiffBadge diff={session.difficulty} />
                              </div>
                            </div>
                            {hasScore && <ScoreArc score={score} />}
                          </div>

                          {session.report?.summary ? (
                            <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {session.report.summary}
                            </p>
                          ) : (
                            <p style={{ margin: 0, fontSize: 12, color: "var(--text-disabled)", fontStyle: "italic" }}>
                              No summary available for this session.
                            </p>
                          )}

                          {(strengths.length > 0 || weaknesses.length > 0) && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {strengths.map((s, i) => <Badge key={i} variant="neutral" style={{ color: "var(--accent)" }}>+ {s}</Badge>)}
                              {weaknesses.map((w, i) => <Badge key={i} variant="danger">− {w}</Badge>)}
                            </div>
                          )}

                          {hasScore && (
                            <div style={{ marginTop: "auto" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-disabled)" }}>Overall Score</span>
                                <Badge variant={sc.variant}>{score}/100</Badge>
                              </div>
                              <div style={{ height: 5, background: "var(--color-bg-panel-sunken)", borderRadius: 99, overflow: "hidden" }}>
                                <div style={{ height: "100%", borderRadius: 99, background: sc.text, width: `${score}%`, transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)" }}/>
                              </div>
                            </div>
                          )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid var(--color-border-subtle)", background: "var(--color-bg-panel-hover)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }}/>
                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)" }}>Completed</span>
                          </div>
                          <Button size="sm" variant="primary" onClick={() => navigate(`/interview/${session._id}/report`)}>
                            View Report <IconArrowRight />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </motion.div>
  );
}