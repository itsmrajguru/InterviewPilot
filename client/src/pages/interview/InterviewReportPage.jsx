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
      <div className="min-h-screen ip-bg-page flex items-center justify-center">
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
      <div className="min-h-screen ip-bg-page flex items-center justify-center p-6">
        <div className="ip-card max-w-md w-full text-center">
          <div className="ip-card-body py-10 flex flex-col gap-4">
            <div className="text-5xl">⚠️</div>
            <p className="ip-text-secondary">{error}</p>
            <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ip-bg-page">

      {/* top navigation bar */}
      <nav className="ip-navbar sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="InterviewPilot" className="w-7 h-7 rounded-lg" />
          <span className="ip-text-primary font-bold text-[13px]">Interview Report</span>
        </div>

        <div className="flex items-center gap-3">
          {/* back to dashboard */}
          <Link to="/student/dashboard" className="btn-secondary text-[12px]">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">

        {/* hero: overall score */}
        <div className="ip-card border border-primary-500/20">
          <div className="ip-card-body text-center py-8">
            {/* role and date */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="ip-badge ip-badge-primary">{session?.role}</span>
              <span className="ip-badge ip-badge-neutral capitalize">{session?.difficulty}</span>
            </div>

            {/* overall score — the big number */}
            <div className={`text-[72px] font-black font-display leading-none mb-2 ${scoreColor(report?.overallScore)}`}>
              {report?.overallScore}
            </div>
            <p className="ip-text-muted text-[12px] uppercase tracking-widest font-bold mb-4">
              Overall Score / 100
            </p>

            {/* summary paragraph */}
            <p className="ip-text-secondary text-[14px] leading-relaxed max-w-xl mx-auto">
              {report?.summary}
            </p>
          </div>
        </div>

        {/* communication assessment section */}
        {report?.communicationScore > 0 && (
          <div className="ip-card">
            <div className="ip-card-header" style={{ marginBottom: 16 }}>
              <span className="ip-card-title">Communication Assessment</span>
              <span className="ip-badge ip-badge-primary">
                {report.videoAnswersCount} video answer{report.videoAnswersCount !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="ip-card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* overall communication grade */}
                <div className="ip-stat-card">
                  <div className="ip-stat-label">Overall Communication</div>
                  <div className="ip-stat-value" style={{ color: "var(--accent)" }}>
                    {report.communicationScore}/10
                  </div>
                </div>

                {/* per-answer communication breakdown */}
                {session.answers
                  .filter(a => a.communicationScore > 0)
                  .slice(0, 3)
                  .map((a, i) => (
                    <div key={i} className="ip-stat-card">
                      <div className="ip-stat-label">Q{a.questionIndex + 1} — {a.type}</div>
                      <div style={{ fontWeight: 700, fontSize: 18 }}>
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
