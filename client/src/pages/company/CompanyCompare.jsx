import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import StudentTopbar from "../../components/StudentTopbar";
import CompanyTopbar from "../../components/CompanyTopbar";
import { getCompanySessions } from "../../services/interviewService";

import { IconStar, IconArrowRight, IconUsers, IconCheck } from "../../components/ui/icons";
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
    <div className="ip-app-wrapper" style={{ display:"flex", minHeight:"100vh", background: "#F8FAFC", overflow: "hidden", fontFamily: "var(--sans)", fontSize: 13 }}>
      <Sidebar role="company" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        <CompanyTopbar title="Compare Candidates" />

        <main style={{ flex: 1, overflowY: "auto", padding: "20px 24px 40px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Banner Header */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: 0, letterSpacing: "-0.02em" }}>
                Compare Candidates ⚖️
              </h1>
              <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
                Select two completed evaluations to compare their scores, feedback, and key credentials side-by-side.
              </p>
            </div>

            {loading ? (
              <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", padding: 24 }}>
                <Skeleton height={180} />
              </div>
            ) : completedSessions.length < 2 ? (
              <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", padding: 40, textAlign: "center" }}>
                <EmptyState
                  icon={IconUsers}
                  title="Insufficient data"
                  subtext="You need at least 2 completed candidate interviews with evaluation reports to use side-by-side comparison."
                />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                
                {/* Slot Selectors Panel */}
                <div className="ip-grid-main" style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 20, gap: 16 }}>
                  
                  {/* Slot 1 Selector */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748B" }}>
                      Candidate A
                    </label>
                    <select
                      value={slot1}
                      onChange={e => setSlot1(e.target.value)}
                      style={{ padding: "10px 12px", borderRadius: 10, fontSize: 13, width: "100%", outline: "none", cursor: "pointer", background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#0F172A", fontWeight: 500 }}
                    >
                      <option value="">Select Candidate A...</option>
                      {completedSessions.map(s => (
                        <option key={s._id} value={s._id} disabled={s._id === slot2}>
                          {s.studentEmail} ({s.role || "Software Engineer"})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Slot 2 Selector */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748B" }}>
                      Candidate B
                    </label>
                    <select
                      value={slot2}
                      onChange={e => setSlot2(e.target.value)}
                      style={{ padding: "10px 12px", borderRadius: 10, fontSize: 13, width: "100%", outline: "none", cursor: "pointer", background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#0F172A", fontWeight: 500 }}
                    >
                      <option value="">Select Candidate B...</option>
                      {completedSessions.map(s => (
                        <option key={s._id} value={s._id} disabled={s._id === slot1}>
                          {s.studentEmail} ({s.role || "Software Engineer"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Comparison Metrics Grid */}
                {candidate1 || candidate2 ? (
                  <div className="ip-grid-main" style={{ gap: 16 }}>
                    
                    {/* Candidate A Card */}
                    <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                      {candidate1 ? (
                        <>
                          <div>
                            <span style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", color: "#2563EB", background: "#EEF2FF", padding: "3px 8px", borderRadius: 6 }}>
                              Candidate A
                            </span>
                            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", margin: "8px 0 2px 0" }}>
                              {candidate1.studentEmail}
                            </h2>
                            <div style={{ fontSize: 12, color: "#64748B" }}>
                              {candidate1.role || "Software Engineer"} · <span style={{ textTransform: "capitalize" }}>{candidate1.difficulty}</span>
                            </div>
                          </div>

                          <div style={{ padding: "12px 14px", borderRadius: 10, background: "#ECFDF5", border: "1px solid #A7F3D0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#059669" }}>Overall Grade</span>
                            <span style={{ fontSize: 18, fontWeight: 700, color: "#059669" }}>
                              {candidate1.report.overallScore}/100
                            </span>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94A3B8" }}>
                              Performance Summary
                            </span>
                            <p style={{ fontSize: 12.5, lineHeight: 1.5, color: "#475569", margin: 0 }}>
                              {candidate1.report.summary || "Evaluation completed cleanly."}
                            </p>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94A3B8" }}>
                              Identified Strengths
                            </span>
                            <ul style={{ paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#475569" }}>
                              {(candidate1.report.strengths || ["Strong technical knowledge", "Clear communication"]).slice(0, 3).map((st, i) => (
                                <li key={i}>{st}</li>
                              ))}
                            </ul>
                          </div>

                          <button 
                            onClick={() => navigate(`/interview/${candidate1._id}/report`)}
                            style={{ width: "100%", marginTop: 8, padding: "10px", borderRadius: 10, background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", color: "#FFFFFF", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                          >
                            View Full Report →
                          </button>
                        </>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", fontSize: 12.5, color: "#94A3B8" }}>
                          Select Candidate A above to display evaluation
                        </div>
                      )}
                    </div>

                    {/* Candidate B Card */}
                    <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                      {candidate2 ? (
                        <>
                          <div>
                            <span style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", color: "#2563EB", background: "#EEF2FF", padding: "3px 8px", borderRadius: 6 }}>
                              Candidate B
                            </span>
                            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", margin: "8px 0 2px 0" }}>
                              {candidate2.studentEmail}
                            </h2>
                            <div style={{ fontSize: 12, color: "#64748B" }}>
                              {candidate2.role || "Software Engineer"} · <span style={{ textTransform: "capitalize" }}>{candidate2.difficulty}</span>
                            </div>
                          </div>

                          <div style={{ padding: "12px 14px", borderRadius: 10, background: "#ECFDF5", border: "1px solid #A7F3D0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#059669" }}>Overall Grade</span>
                            <span style={{ fontSize: 18, fontWeight: 700, color: "#059669" }}>
                              {candidate2.report.overallScore}/100
                            </span>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94A3B8" }}>
                              Performance Summary
                            </span>
                            <p style={{ fontSize: 12.5, lineHeight: 1.5, color: "#475569", margin: 0 }}>
                              {candidate2.report.summary || "Evaluation completed cleanly."}
                            </p>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94A3B8" }}>
                              Identified Strengths
                            </span>
                            <ul style={{ paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#475569" }}>
                              {(candidate2.report.strengths || ["Strong problem solving", "Analytical thinking"]).slice(0, 3).map((st, i) => (
                                <li key={i}>{st}</li>
                              ))}
                            </ul>
                          </div>

                          <button 
                            onClick={() => navigate(`/interview/${candidate2._id}/report`)}
                            style={{ width: "100%", marginTop: 8, padding: "10px", borderRadius: 10, background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", color: "#FFFFFF", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                          >
                            View Full Report →
                          </button>
                        </>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", fontSize: 12.5, color: "#94A3B8" }}>
                          Select Candidate B above to display evaluation
                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", padding: 32, textAlign: "center", fontSize: 13, color: "#64748B" }}>
                    Select candidates from the dropdown boxes above to display side-by-side evaluations
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
