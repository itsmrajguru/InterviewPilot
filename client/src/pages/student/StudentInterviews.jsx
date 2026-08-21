import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import StudentTopbar from "../../components/StudentTopbar";
import { getStudentDashboard } from "../../services/interviewService";

import { IconArrowRight, IconClock, IconCheck, IconCircleCheck, IconTrendUp, IconStar } from "../../components/ui/icons";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";

const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const scoreColor = (s) => {
  if (s >= 75) return "success";
  if (s >= 50) return "neutral";
  return "danger";
};

const capitalize = str => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

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

  const completedWithScore = completedSessions.filter(s => s.report?.overallScore !== undefined);
  const avgScore = completedWithScore.length > 0
    ? Math.round(completedWithScore.reduce((acc, curr) => acc + (curr.report?.overallScore || 0), 0) / completedWithScore.length)
    : null;

  return (
    <div className="ip-app-wrapper" style={{ display:"flex", minHeight:"100vh", background: "#F8FAFC", overflow: "hidden", fontFamily: "var(--sans)", fontSize: 13 }}>
      <Sidebar role="student" pendingCount={pendingSessions.length} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <StudentTopbar title="My Interviews" sub="" />

        <main style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          <div style={{ maxWidth: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Welcome banner */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
                  My Interviews 🎯
                </h1>
                <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
                  Track your pending invitations and review your completed session history.
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

            {/* 4 Top Stat Cards Grid */}
            <div className="ip-stat-cards-grid">
              <StatCard 
                label="Action Required" 
                value={loading ? <Skeleton width={30} height={22} /> : pendingSessions.length} 
                sub={pendingSessions.length > 0 ? "Action needed" : "All clear"} 
                icon={IconClock}
                hue="amber"
              />
              <StatCard 
                label="Completed" 
                value={loading ? <Skeleton width={30} height={22} /> : completedSessions.length} 
                sub={completedSessions.length > 0 ? "Keep going!" : "No sessions"} 
                icon={IconCircleCheck}
                hue="emerald"
              />
              <StatCard 
                label="Total Activity" 
                value={loading ? <Skeleton width={30} height={22} /> : sessions.length} 
                sub={sessions.length > 0 ? "All time total" : "No activity"} 
                icon={IconCalendar}
                hue="blue"
              />
              <StatCard 
                label="Average Score" 
                value={loading ? <Skeleton width={30} height={22} /> : (avgScore !== null ? avgScore : "—")} 
                sub={avgScore !== null ? "out of 100" : "Keep going!"} 
                icon={IconTrendUp}
                hue="purple"
              />
            </div>

            {/* Main 2-column Grid */}
            <div className="ip-grid-main">

              {/* Left Column: Pending Invitations Card */}
              <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
                    <IconClock style={{ color: "#D97706", width: 18, height: 18 }} /> Pending Invitations
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#D97706", background: "#FEF3C7", padding: "2px 8px", borderRadius: 10 }}>
                    {pendingSessions.length} pending
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[1,2].map(i => <Skeleton key={i} height={56} />)}
                    </div>
                  ) : pendingSessions.length === 0 ? (
                    <EmptyState 
                      title="No pending invitations"
                      subtext="You're all caught up! Practice interviews will appear here."
                    />
                  ) : (
                    pendingSessions.map(session => (
                      <div key={session._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 12, background: "#F8FAFC", border: "1px solid #F1F5F9" }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          background: "#FEF3C7", color: "#D97706", fontWeight: 700, fontSize: 14
                        }}>
                          {(session.role || "I").charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {session.role || "Software Engineer"}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                            {session.companyName || "Practice Round"} · {capitalize(session.difficulty || "Medium")} · {session.createdAt ? new Date(session.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
                          </div>
                        </div>
                        <button 
                          onClick={() => navigate(`/interview/join/${session.inviteToken || session._id}`, { state: { session } })}
                          style={{ padding: "6px 18px", borderRadius: 8, background: "#FFFFFF", color: "#2563EB", border: "1px solid #2563EB", fontWeight: 600, fontSize: 12.5, cursor: "pointer", transition: "all 0.15s", flexShrink: 0 }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#2563EB"; e.currentTarget.style.color = "#FFFFFF"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.color = "#2563EB"; }}
                        >
                          Join
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Completed History Card */}
              <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
                    <IconCircleCheck style={{ color: "#059669", width: 18, height: 18 }} /> Recent History
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#059669", background: "#ECFDF5", padding: "2px 8px", borderRadius: 10 }}>
                    {completedSessions.length} finished
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[1,2].map(i => <Skeleton key={i} height={56} />)}
                    </div>
                  ) : completedSessions.length === 0 ? (
                    <EmptyState 
                      title="No completed interviews yet"
                      subtext="Complete your first practice session to see detailed evaluations."
                    />
                  ) : (
                    completedSessions.map(session => {
                      const score = session.report?.overallScore;
                      return (
                        <div key={session._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 12, background: "#F8FAFC", border: "1px solid #F1F5F9" }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            background: "#EFF6FF", color: "#2563EB", fontWeight: 700, fontSize: 14
                          }}>
                            {(session.role || "I").charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {session.role || "Software Engineer"}
                            </div>
                            <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                              {session.companyName || "Practice Round"} · {session.createdAt ? new Date(session.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
                            </div>
                          </div>

                          {score !== undefined ? (
                            <span style={{ fontSize: 12, fontWeight: 700, color: score >= 75 ? "#059669" : "#2563EB", background: score >= 75 ? "#ECFDF5" : "#EFF6FF", padding: "4px 8px", borderRadius: 8 }}>
                              {score}/100
                            </span>
                          ) : null}

                          <button 
                            onClick={() => navigate(`/interview/${session._id}/report`, { state: { session } })}
                            style={{ padding: "6px 16px", borderRadius: 8, background: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0", fontWeight: 600, fontSize: 12.5, cursor: "pointer", flexShrink: 0 }}
                          >
                            Report →
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
