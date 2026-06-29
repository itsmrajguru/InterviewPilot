//creating InterviewReportPage

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { getReport } from "../../services/interviewService";

export default function InterviewReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const savedSession = useMemo(() => {
    return location.state?.session || JSON.parse(sessionStorage.getItem(`interview_session_${id}`) || "null");
  }, [id, location.state]);
  const savedReport = location.state?.report || savedSession?.report || null;

  const [report, setReport] = useState(savedReport);
  const [session, setSession] = useState(savedSession);
  const [loading, setLoading] = useState(!savedReport);
  const [error, setError] = useState("");

  /* step 1 :fetch the full report from the backend on mount */
  useEffect(() => {
    if (savedReport) {
      return;
    }

    const fetchReport = async () => {
      try {
        const data = await getReport(id);
        if (data.success) {
          setReport(data.session.report);
          setSession(data.session);
        } else {
          setError(data.message || "Could not load the report.");
        }
      } catch (e) {
        /* inform to the developer */
        console.error("getReport error:", e);
        /* inform to the user */
        setError(e.response?.data?.message || "Failed to load report. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id, savedReport]);

  /* score color helper */
  const scoreColor = (score) => {
    if (score >= 75) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  /* individual answer score color */
  const answerScoreStyle = (score) => {
    if (score >= 8) return { background: "#f0fdf4", color: "#15803d", border: "0.5px solid #bbf7d0" };
    if (score >= 5) return { background: "#fefce8", color: "#a16207", border: "0.5px solid #fef08a" };
    return { background: "#fef2f2", color: "#b91c1c", border: "0.5px solid #fecaca" };
  };

  /* loading state */
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#e4e8ee", fontFamily: "var(--font-sans)", fontSize: 14 }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 40, height: 40, border: "2px solid #1d9e75", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>Loading your report...</p>
        </div>
      </div>
    );
  }

  /* error state */
  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "1.5rem", background: "#e4e8ee", fontFamily: "var(--font-sans)", fontSize: 14 }}>
        <div style={{
          background: "#ffffff",
          border: "0.5px solid #dde1e8",
          borderRadius: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          padding: 40,
          width: "100%",
          maxWidth: 440,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignItems: "center"
        }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>{error}</p>
          <button onClick={() => navigate(-1)} style={{ fontSize: 14, color: "#ffffff", background: "#1d9e75", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontWeight: 500, width: "100%" }}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#e4e8ee", fontFamily: "var(--font-sans)", fontSize: 14 }}>

      {/* top navigation bar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", background: "#ffffff", borderBottom: "0.5px solid #dde1e8", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logo.svg" alt="InterviewPilot" style={{ width: 28, height: 28, borderRadius: 8 }} />
          <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>Interview Report</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* back to dashboard */}
          <Link to="/student/dashboard" style={{ fontSize: 12, color: "var(--text-secondary)", background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: 8, padding: "8px 16px", textDecoration: "none", fontWeight: 500 }}>
            ← Dashboard
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* hero: overall score */}
        <div style={{
          background: "#ffffff",
          border: "0.5px solid #dde1e8",
          borderRadius: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          padding: 40,
          textAlign: "center"
        }}>
          <div>
            {/* role and date */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, fontWeight: 500, background: "#e6f4ea", color: "#1d9e75", border: "0.5px solid #a7dfc9", textTransform: "capitalize" }}>{session?.role}</span>
              <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, fontWeight: 500, background: "var(--surface-1)", color: "var(--text-secondary)", border: "0.5px solid var(--border)", textTransform: "capitalize" }}>{session?.difficulty}</span>
            </div>

            {/* overall score — the big number */}
            <div className={scoreColor(report?.overallScore)} style={{ fontSize: 72, fontWeight: 900, lineHeight: 1, marginBottom: 8, color: report?.overallScore >= 75 ? "#15803d" : (report?.overallScore >= 50 ? "#a16207" : "#b91c1c") }}>
              {report?.overallScore}
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", margin: 0, marginBottom: 16 }}>
              Overall Score / 100
            </p>

            {/* summary paragraph */}
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 600, margin: "0 auto" }}>
              {report?.summary}
            </p>
          </div>
        </div>

        {/* communication assessment section */}
        {report?.communicationScore > 0 && (
          <div style={{
            background: "#ffffff",
            border: "0.5px solid #dde1e8",
            borderRadius: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            padding: 24
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Communication Assessment</span>
              <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, fontWeight: 500, background: "#e6f4ea", color: "#1d9e75", border: "0.5px solid #a7dfc9" }}>
                {report.videoAnswersCount} video answer{report.videoAnswersCount !== 1 ? "s" : ""}
              </span>
            </div>
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                {/* overall communication grade */}
                <div style={{ background: "var(--surface-1)", padding: 16, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 4 }}>Overall Communication</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#1d9e75" }}>
                    {report.communicationScore}/10
                  </div>
                </div>

                {/* per-answer communication breakdown */}
                {session.answers
                  .filter(a => a.communicationScore > 0)
                  .slice(0, 3)
                  .map((a, i) => (
                    <div key={i} style={{ background: "var(--surface-1)", padding: 16, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Q{a.questionIndex + 1} — {a.type}</div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>
                        {a.communicationScore}/10
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* two column: strengths + weaknesses */}

        <div className="ip-grid-2">

          {/* strengths */}
          <div style={{ background: "#ffffff", border: "0.5px solid #dde1e8", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ padding: "16px 20px 14px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>💪 Strengths</span>
            </div>
            <div style={{ padding: "16px 20px" }}>
              {report?.strengths?.length > 0 ? (
                <ul style={{ display: "flex", flexDirection: "column", gap: 8, margin: 0, padding: 0, listStyle: "none" }}>
                  {report.strengths.map((s, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ fontSize: 13, color: "#10b981", marginTop: 2 }}>✓</span>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>No specific strengths identified.</p>
              )}
            </div>
          </div>

          {/* weaknesses */}
          <div style={{ background: "#ffffff", border: "0.5px solid #dde1e8", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ padding: "16px 20px 14px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>🎯 Areas to Improve</span>
            </div>
            <div style={{ padding: "16px 20px" }}>
              {report?.weaknesses?.length > 0 ? (
                <ul style={{ display: "flex", flexDirection: "column", gap: 8, margin: 0, padding: 0, listStyle: "none" }}>
                  {report.weaknesses.map((w, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ fontSize: 13, color: "#f43f5e", marginTop: 2 }}>⨯</span>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{w}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>No specific weaknesses identified.</p>
              )}
            </div>
          </div>
        </div>

        {/* improvement roadmap */}
        <div style={{ background: "#ffffff", border: "0.5px solid #dde1e8", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ padding: "16px 20px 14px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>🗺️ Improvement Roadmap</span>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              {report?.improvementRoadmap}
            </p>
          </div>
        </div>

        {/* per-question answer breakdown */}
        <div style={{ background: "#ffffff", border: "0.5px solid #dde1e8", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ padding: "16px 20px 14px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>📋 Answer Breakdown</span>
            <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 500, background: "var(--surface-1)", color: "var(--text-secondary)", border: "0.5px solid var(--border)" }}>{session?.answers?.length} answers</span>
          </div>
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            {session?.answers?.map((a, i) => (
              <div key={i} style={{ paddingBottom: 16, borderBottom: i < session.answers.length - 1 ? "0.5px solid var(--border)" : "none" }}>
                {/* question header row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700, textTransform: "capitalize", background: "var(--surface-1)", color: "var(--text-secondary)", border: "0.5px solid var(--border)", display: "inline-block", marginBottom: 6 }}>{a.type}</span>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>{a.question}</p>
                  </div>
                  <div style={{ ...answerScoreStyle(a.score), fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 10 }}>Score:</span> {a.score}/10
                  </div>
                </div>

                {/* detailed feedback content */}
                {a.feedback ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, background: "var(--surface-1)", borderRadius: 8, padding: 12, margin: 0 }}>
                      <strong style={{ display: "block", marginBottom: 4, color: "var(--text-primary)" }}>Your Answer:</strong>
                      {a.answer}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>
                      <strong style={{ color: "var(--text-secondary)", fontStyle: "normal" }}>AI Feedback: </strong>
                      {a.feedback}
                    </p>
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>No answer details available.</p>
                )}
              </div>
            ))}

            {/* fallback if no answers saved */}
            {(!session?.answers || session.answers.length === 0) && (
              <p className="ip-text-muted text-[13px]">No answer details available.</p>
            )}
          </div>
        </div>

        {/* footer cta */}
        <div className="flex items-center justify-center gap-4 pb-8">
          <Link to="/student/dashboard" className="btn-secondary">
            ← Back to Dashboard
          </Link>
          <Link to="/practice" className="btn-primary">
            Practice Again →
          </Link>
        </div>
      </div>
    </div>
  );
}
