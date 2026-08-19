import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import StudentTopbar from "../../components/StudentTopbar";
import { getStudentDashboard } from "../../services/interviewService";

import { IconArrowRight, IconClock, IconCheck } from "../../components/ui/icons";
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
  if (s >= 75) return "success";
  if (s >= 50) return "neutral";
  return "danger";
};

const DiffBadge = ({ diff }) => {
  const v = diff === "easy" ? "success" : diff === "hard" ? "danger" : "warning";
  return <Badge variant={v} style={{ textTransform: "uppercase" }}>{diff || "medium"}</Badge>;
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
    <div className="ip-app-wrapper" style={{ display:"flex", minHeight:"100vh", background: "var(--bg)", overflow: "hidden", fontFamily: "var(--sans)", fontSize: 14 }}>
      <Sidebar role="student" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <StudentTopbar title="My Interviews" sub="Manage invitations and review past sessions" />

        <main style={{ flex: 1, overflowY: "auto" }}>
          <PageHeader 
            title="Interview Dashboard" 
            subtitle="Keep track of your pending invitations and review your completed history" 
          />

          <div style={{ maxWidth: 1180, margin: "-24px auto 0", padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            
            {error && (
              <div style={{ padding: "var(--space-3)", borderRadius: "var(--radius-sm)", background: "var(--danger-bg)", color: "var(--danger-text)", fontSize: 13, border: "1px solid var(--danger-border)" }}>
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-4)" }}>
                  <Skeleton height={100} />
                  <Skeleton height={100} />
                  <Skeleton height={100} />
                </div>
                <div style={{ display: "flex", gap: "var(--space-6)" }}>
                  <Skeleton height={400} style={{ flex: 1 }} />
                  <Skeleton height={400} style={{ flex: 1 }} />
                </div>
              </div>
            ) : sessions.length === 0 ? (
              <EmptyState 
                icon={IconTrophy} 
                title="No interviews found"
                subtext="Start a practice interview or wait for a company invitation to see it here."
              />
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-4)" }}>
                  <StatCard 
                    label="Action Required" 
                    value={pendingSessions.length} 
                    sub="pending invites" 
                    icon={IconClock}
                    hue="amber"
                  />
                  <StatCard 
                    label="Completed" 
                    value={completedSessions.length} 
                    sub="sessions finished" 
                    icon={IconCheck}
                    hue="emerald"
                  />
                  <StatCard 
                    label="Total Activity" 
                    value={sessions.length} 
                    sub="all time interviews" 
                    icon={IconArrowRight}
                    hue="sky"
                  />
                </div>

                <div style={{ display: "flex", gap: "var(--space-6)", alignItems: "flex-start" }}>
                  
                  <div style={{ flex: "1 1 400px", minWidth: 0, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: pendingSessions.length > 0 ? "var(--warning-text)" : "var(--text-disabled)" }}/>
                      <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Action Required</h2>
                    </div>

                    {pendingSessions.length === 0 ? (
                      <EmptyState title="No pending invitations" subtext="You're all caught up!" />
                    ) : (
                      pendingSessions.map(session => (
                        <Card interactive key={session._id} style={{ display: "flex", overflow: "hidden", padding: 0 }}>
                          <div style={{ width: 4, background: "#f59e0b" }}/>
                          <div style={{ flex: 1, padding: "var(--space-4)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                              <DiffBadge diff={session.difficulty} />
                              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>•</span>
                              <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                                <IconClock /> {session.createdAt ? new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                              </span>
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px 0" }}>
                              {session.role || "Software Engineer"}
                            </h3>
                            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
                              {session.companyName || "Practice Round"}
                            </p>
                          </div>
                          <div style={{ width: 140, borderLeft: "1px dashed var(--color-border-subtle)", padding: "var(--space-4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-3)" }}>
                            <Badge variant="warning">PENDING</Badge>
                            <Button variant="primary" size="sm" onClick={() => navigate(`/interview/${session._id}`, { state: { session } })}>
                              Join
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>

                  <div style={{ flex: "1 1 400px", minWidth: 0, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                      <IconCheck />
                      <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Recent History</h2>
                    </div>

                    {completedSessions.length === 0 ? (
                      <EmptyState title="No completed interviews yet" />
                    ) : (
                      completedSessions.map(session => {
                        const score = session.report?.overallScore;
                        return (
                          <Card key={session._id} interactive style={{ padding: "var(--space-4)", display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {session.role || "Software Engineer"}
                              </h3>
                              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                                <span style={{ fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session.companyName || "Practice Round"}</span>
                                <span style={{ fontSize: 10, color: "var(--color-border-shadow)" }}>•</span>
                                <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{session.createdAt ? new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}</span>
                              </div>
                            </div>
                            {score !== undefined ? (
                              <Badge variant={scoreColor(score)}>{score}/100</Badge>
                            ) : (
                              <span style={{ fontSize: 11, color: "var(--text-disabled)", fontStyle: "italic" }}>No score</span>
                            )}
                            <Button variant="secondary" size="sm" onClick={() => navigate(`/interview/${session._id}/report`, { state: { session } })}>
                              Report <IconArrowRight />
                            </Button>
                          </Card>
                        );
                      })
                    )}
                  </div>

                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
