import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { getCompanySessions } from "../../services/interviewService";

import { IconStar, IconArrowRight } from "../../components/ui/icons";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";

export default function CompanyCompare() {
  const navigate = useNavigate();
  const [completedSessions, setCompletedSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  /* compare slot selections */
  const [slot1, setSlot1] = useState("");
  const [slot2, setSlot2] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getCompanySessions();
        if (data.success) {
          /* filter only candidates who finished interviews */
          const finished = data.sessions.filter(s => s.status === "completed" && s.report);
          setCompletedSessions(finished);
        }
      } catch (e) {
        console.error("failed loading sessions:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* find sessions selected in slots */
  const candidate1 = completedSessions.find(s => s._id === slot1);
  const candidate2 = completedSessions.find(s => s._id === slot2);

  return (
    <div className="ip-app-wrapper" style={{ display:"flex", minHeight:"100vh", background: "var(--bg)", fontFamily: "var(--sans)", fontSize: 14 }}>
      <Sidebar role="company" />

      {/* main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* top bar */}
        <header style={{ padding: "0 var(--space-6)", height: 56, background: "var(--color-bg-panel)", borderBottom: "1px solid var(--color-border-subtle)", position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, fontFamily: "var(--sans)" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.04em", textTransform: "uppercase" }}>Recruiter workspace</span>
            <span style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>Compare Candidates</span>
          </div>
        </header>

        {/* page body */}
        <main style={{ flex: 1, overflowY: "auto" }}>
          <PageHeader 
            title="Side-by-Side Comparison" 
            subtitle="Select two completed evaluations to compare their scores, feedback, and key credentials side-by-side" 
          />

          <div style={{ maxWidth: 1180, margin: "-24px auto 0", padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

            {/* loading state */}
            {loading ? (
              <div style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <Skeleton height={200} />
              </div>
            ) : completedSessions.length < 2 ? (
              <Card style={{ padding: "var(--space-8)" }}>
                <EmptyState
                  icon="⚖️"
                  title="Insufficient data"
                  subtext="You need at least 2 completed candidate interviews with reports to use comparison tools."
                />
              </Card>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
                
                {/* slot selectors panel */}
                <Card style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: "var(--space-6)", padding: "var(--space-4)" }}>
                  
                  {/* slot 1 selector */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                      Candidate A
                    </label>
                    <select
                      value={slot1}
                      onChange={e => setSlot1(e.target.value)}
                      style={{ padding: "10px 12px", borderRadius: "var(--radius-md)", fontSize: 14, width: "100%", outline: "none", cursor: "pointer", background: "var(--color-bg-panel-sunken)", border: "1px solid var(--color-border-subtle)", color: "var(--text-primary)" }}
                    >
                      <option value="">choose candidate...</option>
                      {completedSessions.map(s => (
                        <option key={s._id} value={s._id} disabled={s._id === slot2}>
                          {s.studentEmail} ({s.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* slot 2 selector */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                      Candidate B
                    </label>
                    <select
                      value={slot2}
                      onChange={e => setSlot2(e.target.value)}
                      style={{ padding: "10px 12px", borderRadius: "var(--radius-md)", fontSize: 14, width: "100%", outline: "none", cursor: "pointer", background: "var(--color-bg-panel-sunken)", border: "1px solid var(--color-border-subtle)", color: "var(--text-primary)" }}
                    >
                      <option value="">choose candidate...</option>
                      {completedSessions.map(s => (
                        <option key={s._id} value={s._id} disabled={s._id === slot1}>
                          {s.studentEmail} ({s.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </Card>

                {/* comparison metrics table card */}
                {candidate1 || candidate2 ? (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: "var(--space-6)" }}>
                    
                    {/* candidate a specs */}
                    <Card style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                      {candidate1 ? (
                        <>
                          <div>
                            <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em", color: "var(--accent)" }}>
                              Candidate A
                            </div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "4px 0" }}>
                              {candidate1.studentEmail}
                            </h2>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                              {candidate1.role} · <span style={{ textTransform: "capitalize" }}>{candidate1.difficulty}</span>
                            </div>
                          </div>

                          {/* overall score card badge */}
                          <div style={{ padding: "var(--space-4)", borderRadius: "var(--radius-md)", background: "var(--success-bg)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>Overall Assessment Grade</span>
                            <span style={{ fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, lineHeight: 1, color: "var(--accent)" }}>
                              <IconStar /> {candidate1.report.overallScore}/100
                            </span>
                          </div>

                          {/* report summaries */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                              Performance Summary
                            </span>
                            <p style={{ fontSize: 12, lineHeight: 1.5, color: "var(--text-secondary)", margin: 0 }}>
                              {candidate1.report.summary}
                            </p>
                          </div>

                          {/* key strengths */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                              Identified Strengths
                            </span>
                            <ul style={{ paddingLeft: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-1)", fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                              {candidate1.report.strengths?.slice(0, 3).map((st, i) => (
                                <li key={i}>{st}</li>
                              ))}
                            </ul>
                          </div>

                          {/* weaknesses */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                              Areas for Improvement
                            </span>
                            <ul style={{ paddingLeft: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-1)", fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                              {candidate1.report.weaknesses?.slice(0, 3).map((wk, i) => (
                                <li key={i}>{wk}</li>
                              ))}
                            </ul>
                          </div>

                          <Button 
                            variant="primary" 
                            style={{ width: "100%", marginTop: "var(--space-4)" }}
                            onClick={() => navigate(`/interview/${candidate1._id}/report`)}
                          >
                            View Full Report <IconArrowRight />
                          </Button>
                        </>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", fontSize: 12, color: "var(--text-disabled)" }}>
                          please choose candidate a above to compare
                        </div>
                      )}
                    </Card>

                    {/* candidate b specs */}
                    <Card style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                      {candidate2 ? (
                        <>
                          <div>
                            <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em", color: "var(--accent)" }}>
                              Candidate B
                            </div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "4px 0" }}>
                              {candidate2.studentEmail}
                            </h2>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                              {candidate2.role} · <span style={{ textTransform: "capitalize" }}>{candidate2.difficulty}</span>
                            </div>
                          </div>

                          {/* overall score card badge */}
                          <div style={{ padding: "var(--space-4)", borderRadius: "var(--radius-md)", background: "var(--success-bg)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>Overall Assessment Grade</span>
                            <span style={{ fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, lineHeight: 1, color: "var(--accent)" }}>
                              <IconStar /> {candidate2.report.overallScore}/100
                            </span>
                          </div>

                          {/* report summaries */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                              Performance Summary
                            </span>
                            <p style={{ fontSize: 12, lineHeight: 1.5, color: "var(--text-secondary)", margin: 0 }}>
                              {candidate2.report.summary}
                            </p>
                          </div>

                          {/* key strengths */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                              Identified Strengths
                            </span>
                            <ul style={{ paddingLeft: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-1)", fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                              {candidate2.report.strengths?.slice(0, 3).map((st, i) => (
                                <li key={i}>{st}</li>
                              ))}
                            </ul>
                          </div>

                          {/* weaknesses */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                              Areas for Improvement
                            </span>
                            <ul style={{ paddingLeft: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-1)", fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                              {candidate2.report.weaknesses?.slice(0, 3).map((wk, i) => (
                                <li key={i}>{wk}</li>
                              ))}
                            </ul>
                          </div>

                          <Button 
                            variant="primary" 
                            style={{ width: "100%", marginTop: "var(--space-4)" }}
                            onClick={() => navigate(`/interview/${candidate2._id}/report`)}
                          >
                            View Full Report <IconArrowRight />
                          </Button>
                        </>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", fontSize: 12, color: "var(--text-disabled)" }}>
                          please choose candidate b above to compare
                        </div>
                      )}
                    </Card>

                  </div>
                ) : (
                  <Card style={{ padding: "var(--space-10)", textAlign: "center", fontSize: 12, color: "var(--text-secondary)" }}>
                    Select at least one candidate from the selector boxes to display candidate cards
                  </Card>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
