import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import StudentTopbar from "../../components/StudentTopbar";
import { getStudentDashboard } from "../../services/interviewService";

import {
  IconClock, IconCircleCheck, IconStar, IconFlame,
  IconMessages, IconBolt, IconTarget, IconArrowRight,
  IconVideo, IconTerminal, IconChartBar, IconUpload,
  IconCalendar, IconCheck, IconTrendUp, IconEmptyInbox
} from "../../components/ui/icons";

import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";

const capitalize = str => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

function ScoreRing({ score }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <svg style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)" }} width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="none" stroke="var(--color-bg-panel-sunken)" strokeWidth="4"/>
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

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();
  const rawName = user?.name || user?.email || "dev.msrajguru";
  const firstName = rawName.includes("@") ? rawName.split("@")[0] : rawName.split(" ")[0];

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

  const streak = useMemo(() => {
    if (!completed.length) return 0;
    const dates = new Set(completed.map(s => {
      if (!s.createdAt) return null;
      const d = new Date(s.createdAt);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    }).filter(Boolean));
    return dates.size;
  }, [completed]);

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
    { icon: <IconVideo />, label: "Video practice", sub: "Mock round", bg: "#EEF0FD", color: "#4F46E5", onClick: () => navigate("/student/practice") },
    { icon: <IconTerminal />, label: "Text practice", sub: "DSA + concepts", bg: "#E6F7F5", color: "#0D9488", onClick: () => navigate("/student/practice") },
    { icon: <IconChartBar />, label: "View reports", sub: "All sessions", bg: "#EEF6FD", color: "#0284C7", onClick: () => navigate("/student/reports") },
    { icon: <IconUpload />, label: "Upload resume", sub: "Update profile", bg: "#FFF8EC", color: "#D97706", onClick: () => navigate("/student/profile") },
  ];

  const skillRows = skillBreakdown ? [
    { label: "HR / Behavioural", pct: skillBreakdown.hr, color: "#f59e0b" },
    { label: "Technical", pct: skillBreakdown.tech, color: "#0ea5e9" },
    { label: "Coding", pct: skillBreakdown.code, color: "#10b981" },
    { label: "Communication", pct: skillBreakdown.comm, color: "#f43f5e" },
  ] : [
    { label: "HR / Behavioural", pct: null, color: "#f59e0b" },
    { label: "Technical", pct: null, color: "#0ea5e9" },
    { label: "Coding", pct: null, color: "#10b981" },
    { label: "Communication", pct: null, color: "#f43f5e" },
  ];

  return (
    <div className="ip-app-wrapper" style={{ display:"flex", minHeight:"100vh", background: "#F1F5F9", overflow: "hidden", fontFamily: "var(--sans)", fontSize: 13 }}>
      <Sidebar role="student" pendingCount={pending.length} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <StudentTopbar title="Dashboard" sub="" />

        <main style={{ flex: 1, overflowY: "auto" }}>
          <PageHeader 
            title={`Welcome back, ${firstName} 👋`} 
            subtitle="Here's a snapshot of your interview activity..."
          />

          <div style={{ maxWidth: 1180, margin: "-24px auto 0", padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

            {error && (
              <div style={{ padding: "10px 14px", borderRadius: "8px", background: "var(--danger-bg)", color: "var(--danger-text)", fontSize: 12, border: "1px solid var(--danger-border)" }}>
                {error}
              </div>
            )}

            {/* 3 Top Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <StatCard 
                label="PENDING" 
                value={loading ? <Skeleton width={30} height={22} /> : pending.length}
                sub={pending.length > 0 ? <><IconClock style={{ marginRight: 4 }}/> {pending.length} awaiting you</> : <><IconCheck style={{ marginRight: 4 }}/> All clear</>}
                icon={IconClock}
                hue="amber"
                badge={
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: "#FEF3C7", color: "#B45309" }}>
                    Action needed
                  </span>
                }
              />
              <StatCard 
                label="COMPLETED" 
                value={loading ? <Skeleton width={30} height={22} /> : completed.length}
                sub={completed.length > 0 ? <><IconTrendUp style={{ marginRight: 4 }}/> +{completed.length} total</> : "Complete your first interview"}
                icon={IconCircleCheck}
                hue="emerald"
                badge={
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: "#D1FAE5", color: "#047857" }}>
                    No sessions
                  </span>
                }
              />
              <StatCard 
                label="AVG. SCORE" 
                value={loading ? <Skeleton width={30} height={22} /> : (avgScore !== null ? avgScore : "—")}
                sub={avgScore !== null ? "out of 100" : "No interviews yet"}
                icon={IconStar}
                hue="sky"
                badge={
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: "#E0F2FE", color: "#0369A1" }}>
                    Benchmark
                  </span>
                }
              />
            </div>

            {/* Main 2-column Section */}
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, alignItems: "start" }}>
              
              {/* Left Column: Recent Interviews Card */}
              <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.03)", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", display: "flex", alignItems: "center", gap: 6 }}>
                    <IconMessages style={{ color: "#0284C7", width: 16, height: 16 }} /> Recent interviews
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[1,2,3].map(i => (
                        <Skeleton key={i} height={50} />
                      ))}
                    </div>
                  ) : recentSessions.length === 0 ? (
                    <EmptyState 
                      icon={IconEmptyInbox} 
                      title="No interviews yet"
                    />
                  ) : (
                    recentSessions.map((iv) => (
                      <div key={iv._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: "#F8FAFC", border: "1px solid #F1F5F9" }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          background: "#FEF3C7", color: "#D97706",
                        }}>
                          <IconClock style={{ width: 16, height: 16 }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {iv.role || "gfd interview"}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>
                            {iv.companyName || iv.role || "gfd"} · {capitalize(iv.difficulty || "Medium")} · {iv.createdAt ? new Date(iv.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "19 Aug 2026"}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          {iv.status === "pending" ? (
                            <button 
                              onClick={() => navigate(`/interview/join/${iv.inviteToken || iv._id}`)}
                              style={{ padding: "5px 14px", borderRadius: 6, background: "#0F172A", color: "#FFFFFF", border: "none", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
                            >
                              Join
                            </button>
                          ) : (
                            <button 
                              onClick={() => navigate(`/interview/${iv._id}/report`)}
                              style={{ padding: "5px 14px", borderRadius: 6, background: "#F1F5F9", color: "#0F172A", border: "none", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
                            >
                              Report
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Quick actions & Skill breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                
                {/* Quick actions Card */}
                <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.03)", padding: 16 }}>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", display: "flex", alignItems: "center", gap: 6 }}>
                      <IconBolt style={{ color: "#0284C7", width: 16, height: 16 }} /> Quick actions
                    </span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 10 }}>
                    {qaActions.map((a) => (
                      <div 
                        key={a.label} 
                        onClick={a.onClick} 
                        style={{ 
                          display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", 
                          borderRadius: 10, border: "1px solid #E2E8F0", background: "#FFFFFF", 
                          cursor: "pointer", transition: "all 0.15s" 
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#0284C7"; e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.04)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: a.bg, color: a.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {a.icon}
                        </div>
                        <div style={{ minWidth: 0, overflow: "hidden" }}>
                          <div style={{ fontSize: 12, color: "#0F172A", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.label}</div>
                          <div style={{ fontSize: 10.5, color: "#64748B", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill breakdown Card */}
                <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.03)", padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", display: "flex", alignItems: "center", gap: 6 }}>
                      <IconTarget style={{ color: "#0284C7", width: 16, height: 16 }} /> Skill breakdown
                    </span>
                    <span style={{ fontSize: 11, color: "#0284C7", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/student/reports")}>Improve ↗</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {skillRows.map((row) => (
                      <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 12, color: "#334155", width: 110, flexShrink: 0, fontWeight: 500 }}>{row.label}</span>
                        <div style={{ flex: 1, height: 6, background: "#E2E8F0", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 99, background: "#0284C7", width: `${row.pct ?? 50}%`, transition: "width 0.6s ease" }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#475569", width: 32, textAlign: "right" }}>{row.pct ?? 50}%</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
