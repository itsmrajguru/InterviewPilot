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
  const answerScoreColor = (score) => {
    if (score >= 8) return "ip-badge ip-badge-success";
    if (score >= 5) return "ip-badge ip-badge-warning";
    return "ip-badge ip-badge-danger";
  };

  /* loading state */
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#e4e8ee", fontFamily: "var(--font-sans)", fontSize: 14 }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="ip-text-secondary text-[14px]">Loading your report...</p>
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
          <div className="ip-card">
            <div className="ip-card-header">
              <span className="ip-card-title">💪 Strengths</span>
            </div>
            <div className="ip-card-body">
              {report?.strengths?.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-400 shrink-0 mt-0.5">✓</span>
                      <span className="ip-text-secondary text-[13px]">{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="ip-text-muted text-[13px]">No specific strengths identified.</p>
              )}
            </div>
          </div>

          {/* weaknesses */}
          <div className="ip-card">
            <div className="ip-card-header">
              <span className="ip-card-title">🎯 Areas to Improve</span>
            </div>
            <div className="ip-card-body">
              {report?.weaknesses?.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {report.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-yellow-400 shrink-0 mt-0.5">△</span>
                      <span className="ip-text-secondary text-[13px]">{w}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="ip-text-muted text-[13px]">No specific weaknesses identified.</p>
              )}
            </div>
          </div>
        </div>

        {/* improvement roadmap */}
        <div className="ip-card">
          <div className="ip-card-header">
            <span className="ip-card-title">🗺️ Improvement Roadmap</span>
          </div>
          <div className="ip-card-body">
            <p className="ip-text-secondary text-[13px] leading-relaxed">
              {report?.improvementRoadmap}
            </p>
          </div>
        </div>

        {/* per-question answer breakdown */}
        <div className="ip-card">
          <div className="ip-card-header">
            <span className="ip-card-title">📋 Answer Breakdown</span>
            <span className="ip-badge ip-badge-neutral">{session?.answers?.length} answers</span>
          </div>
          <div className="ip-card-body flex flex-col gap-4">
            {session?.answers?.map((a, i) => (
              <div key={i} className="border-b ip-border-top pb-4 last:border-none last:pb-0">
                {/* question header row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="ip-badge ip-badge-neutral capitalize text-[10px]">{a.type}</span>
                    <p className="ip-text-primary text-[13px] font-medium">{a.question}</p>
                  </div>
                  <span className={answerScoreColor(a.score)}>{a.score}/10</span>
                </div>

                {/* the student's answer */}
                <p className="ip-text-secondary text-[12px] mb-2 leading-relaxed bg-white/5 rounded-lg p-3">
                  {a.type === "coding"
                    ? <code className="font-mono text-[11px]">{a.answer?.slice(0, 200)}…</code>
                    : a.answer}
                </p>

                {/* gemini feedback for this question */}
                <p className="ip-text-muted text-[12px] italic">{a.feedback}</p>
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
