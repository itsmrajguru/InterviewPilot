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
      <circle cx="22" cy="22" r={r} fill="none" stroke="var(--color-bg-panel-sunken)" strokeWidth="4" />
      <circle cx="22" cy="22" r={r} fill="none" stroke="var(--accent)" strokeWidth="4"
        strokeDasharray={circ.toFixed(1)} strokeDashoffset={offset.toFixed(1)}
        strokeLinecap="round" transform="rotate(-90 22 22)" opacity="0.6" />
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

  const pending = data?.pendingInterviews || [];
  const completed = data?.completedInterviews || [];
  const avgScore = data?.avgScore ?? null;

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
    const hrA = allAnswers.filter(a => a.type === "hr");
    const techA = allAnswers.filter(a => a.type === "technical");
    const commA = allAnswers.filter(a => a.communicationScore !== undefined);
    return {
      hr: avg(hrA),
      tech: avg(techA),
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
    { label: "Communication", pct: skillBreakdown.comm, color: "#f43f5e" },
  ] : [
    { label: "HR / Behavioural", pct: null, color: "#f59e0b" },
    { label: "Technical", pct: null, color: "#0ea5e9" },
    { label: "Communication", pct: null, color: "#f43f5e" },
  ];

  const IconCalendar = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );

  const IconMedal = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );

  return (
    <div className="ip-app-wrapper" style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC", overflow: "hidden", fontFamily: "var(--sans)", fontSize: 13 }}>
      <Sidebar role="student" pendingCount={pending.length} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <StudentTopbar title="Dashboard" sub="" />

        <main style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          <div style={{ maxWidth: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Welcome banner */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
                  Good evening, <span style={{ color: "#2563EB" }}>{firstName}</span> 👋
                </h1>
                <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
                  Let's ace your next interview. You've got this! 💪
                </p>
              </div>

              <button
                onClick={() => navigate("/student/practice")}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 10,
                  background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", color: "#FFFFFF",
                  border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)", transition: "all 0.15s"
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(37, 99, 235, 0.35)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.25)"; }}
              >
                <span>✨</span> Start Practice
              </button>
            </div>

            {error && (
              <div style={{ padding: "12px 16px", borderRadius: "10px", background: "var(--danger-bg)", color: "var(--danger-text)", fontSize: 13, border: "1px solid var(--danger-border)" }}>
                {error}
              </div>
            )}

            {/* Top Stat Cards Grid (4 Cards) */}
            <div className="ip-stat-cards-grid">
              <StatCard 
                label="Pending Interviews" 
                value={loading ? <Skeleton width={30} height={22} /> : pending.length}
                sub={pending.length > 0 ? "Action needed" : "All clear"}
                icon={IconCalendar}
                hue="blue"
                onClick={() => navigate("/student/interviews")}
              />
              <StatCard 
                label="Completed" 
                value={loading ? <Skeleton width={30} height={22} /> : completed.length}
                sub={completed.length > 0 ? `${completed.length} total` : "Keep going!"}
                icon={IconCircleCheck}
                hue="emerald"
                onClick={() => navigate("/student/interviews")}
              />
              <StatCard 
                label="Average Score" 
                value={loading ? <Skeleton width={30} height={22} /> : (avgScore !== null ? avgScore : "—")}
                sub={avgScore !== null ? "out of 100" : "No score yet"}
                icon={IconTrendUp}
                hue="purple"
                onClick={() => navigate("/student/reports")}
              />
              <StatCard 
                label="Rank" 
                value="—"
                sub="Keep going!"
                icon={IconMedal}
                hue="amber"
                onClick={() => navigate("/student/reports")}
              />
            </div>

            {/* Main 2-column Section (50% / 50% matching 2 stat cards each) */}
            <div className="ip-grid-main">

              {/* Left Column: Recent Interviews Card */}
              <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
                    <IconMessages style={{ color: "#2563EB", width: 18, height: 18 }} /> Recent Interviews
                  </span>
                  <span style={{ fontSize: 12.5, color: "#2563EB", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/student/interviews")}>
                    View all →
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[1, 2, 3].map(i => (
                        <Skeleton key={i} height={54} />
                      ))}
                    </div>
                  ) : recentSessions.length === 0 ? (
                    <EmptyState
                      icon={IconEmptyInbox}
                      title="No interviews yet"
                      subtext="Start a practice interview or wait for an invitation."
                    />
                  ) : (
                    recentSessions.map((iv, index) => {
                      const avatarColors = [
                        { bg: "#F3E8FF", color: "#7C3AED" },
                        { bg: "#FEF3C7", color: "#D97706" },
                        { bg: "#EFF6FF", color: "#2563EB" },
                      ];
                      const avatarStyle = avatarColors[index % avatarColors.length];
                      const initial = (iv.role || iv.companyName || "I").charAt(0).toUpperCase();

                      return (
                        <div key={iv._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 12, background: "#F8FAFC", border: "1px solid #F1F5F9" }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            background: avatarStyle.bg, color: avatarStyle.color, fontWeight: 700, fontSize: 14
                          }}>
                            {initial}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {iv.role || "Software Engineer Mock"}
                            </div>
                            <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                              {capitalize(iv.difficulty || "Medium")} · {iv.createdAt ? new Date(iv.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "19 Aug 2026"} · 25 min
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                            {iv.status === "pending" ? (
                              <button
                                onClick={() => navigate(`/interview/join/${iv.inviteToken || iv._id}`)}
                                style={{ padding: "6px 18px", borderRadius: 8, background: "#FFFFFF", color: "#2563EB", border: "1px solid #2563EB", fontWeight: 600, fontSize: 12.5, cursor: "pointer", transition: "all 0.15s" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#2563EB"; e.currentTarget.style.color = "#FFFFFF"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.color = "#2563EB"; }}
                              >
                                Join
                              </button>
                            ) : (
                              <button
                                onClick={() => navigate(`/interview/${iv._id}/report`)}
                                style={{ padding: "6px 16px", borderRadius: 8, background: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}
                              >
                                Report
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* View all interviews row banner */}
                <div
                  onClick={() => navigate("/student/interviews")}
                  style={{
                    background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 10, padding: "10px",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#2563EB",
                    fontSize: 12.5, fontWeight: 600, cursor: "pointer", transition: "all 0.15s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#E0E7FF"}
                  onMouseLeave={e => e.currentTarget.style.background = "#EEF2FF"}
                >
                  <IconMessages style={{ width: 14, height: 14 }} /> View all interviews →
                </div>
              </div>

              {/* Right Column: Quick actions & Keep practicing card */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Quick actions Card */}
                <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 20 }}>
                  <div style={{ marginBottom: 14 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
                      <IconBolt style={{ color: "#2563EB", width: 18, height: 18 }} /> Quick Actions
                    </span>
                  </div>
                  <div className="ip-grid-2col" style={{ gap: 12 }}>
                    {qaActions.map((a) => (
                      <div
                        key={a.label}
                        onClick={a.onClick}
                        style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "12px",
                          borderRadius: 12, border: "1px solid #E2E8F0", background: "#FFFFFF",
                          cursor: "pointer", transition: "all 0.15s"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.08)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}
                      >
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: a.bg, color: a.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {a.icon}
                        </div>
                        <div style={{ minWidth: 0, overflow: "hidden" }}>
                          <div style={{ fontSize: 12.5, color: "#0F172A", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.label}</div>
                          <div style={{ fontSize: 11, color: "#64748B", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Keep practicing Progress Card */}
                <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#FFF3E0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                    🏆
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Keep practicing!</div>
                    <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2 }}>Consistency is the key to success.</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                      <div style={{ flex: 1, height: 6, background: "#E2E8F0", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 99, background: "#2563EB", width: "30%" }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#64748B" }}>2/7 this week</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Section: Recommended for you */}
            <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <IconStar style={{ color: "#F59E0B", width: 18, height: 18 }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Recommended for you</span>
              </div>
              <div className="ip-grid-sub" style={{ gap: 14 }}>
                <div
                  onClick={() => navigate("/student/practice")}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px",
                    borderRadius: 12, border: "1px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", transition: "all 0.15s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.background = "#FFFFFF"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#F8FAFC"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F3E8FF", color: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      DSA
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F172A" }}>DSA: Arrays & Strings</div>
                      <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2 }}>Essential practice module</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 16, color: "#94A3B8" }}>›</span>
                </div>

                <div
                  onClick={() => navigate("/student/practice")}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px",
                    borderRadius: 12, border: "1px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", transition: "all 0.15s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.background = "#FFFFFF"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#F8FAFC"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EEF2FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      SYS
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F172A" }}>System Design Basics</div>
                      <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2 }}>Architecture fundamentals</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 16, color: "#94A3B8" }}>›</span>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
