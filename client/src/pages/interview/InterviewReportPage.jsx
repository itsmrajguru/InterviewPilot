import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { getReport } from "../../services/interviewService";
import StudentTopbar from "../../components/StudentTopbar";
import api from "../../../api.js";

const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const IconRoute = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="3" /><circle cx="18" cy="5" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-8a3.5 3.5 0 0 1 0-7H15" /></svg>
);
const IconList = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
);
const IconMic = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
);
const IconRadarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
);
const IconArrowLeft = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
);
const IconPlay = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
);
const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);
const IconSparkle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 5.6L19 9l-5.2 1.9L12 16l-1.8-5.1L5 9l5.2-1.4z" /></svg>
);
const IconAlert = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);
const IconEmpty = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);

const scoreColor = (s, max = 100) => {
  const p = (s || 0) / max;
  if (p >= 0.75) return { tier: "success", text: "var(--color-success-text)" };
  if (p >= 0.5) return { tier: "warning", text: "var(--color-warning-text)" };
  return { tier: "danger", text: "var(--color-danger-text)" };
};

const TIER_LABEL = { success: "Strong", warning: "Average", danger: "Needs Work" };

const BigScoreRing = ({ score }) => {
  const sc = scoreColor(score);
  const r = 54, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const fill = (Math.min(Math.max(score, 0), 100) / 100) * circ;
  return (
    <svg width="128" height="128" viewBox="0 0 128 128" role="img" aria-label={`Overall score ${score} out of 100`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={sc.text} strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${fill} ${circ}`}
        strokeDashoffset={circ / 4}
        style={{ transition: "stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)" }} />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="28" fontWeight="800" fill={sc.text} fontFamily="var(--sans)">{score}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-placeholder)" fontFamily="var(--sans)">/ 100</text>
    </svg>
  );
};

const SmallRing = ({ score, max = 10, size = 52 }) => {
  const sc = scoreColor(score, max);
  const r = 20, cx = 26, cy = 26;
  const circ = 2 * Math.PI * r;
  const fill = (Math.min(Math.max(score, 0), max) / max) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" role="img" aria-label={`Score ${score} out of ${max}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={sc.text} strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${fill} ${circ}`}
        strokeDashoffset={circ / 4}
        style={{ transition: "stroke-dasharray 0.8s ease" }} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill={sc.text} fontFamily="var(--sans)">{score}</text>
    </svg>
  );
};

const TYPE_STYLE = {
  hr: { badge: "ip-badge-info", label: "HR" },
  technical: { badge: "ip-badge-primary", label: "Technical" },
  coding: { badge: "ip-badge-warning", label: "Coding" },
};

const CardHeader = ({ icon, title, right }) => (
  <div className="ip-card-header">
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <span style={{ color: "var(--accent)", display: "flex" }}>{icon}</span>
      <span className="ip-card-title">{title}</span>
    </div>
    {right}
  </div>
);

const EmptyMini = ({ icon, text }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", textAlign: "center", gap: 8, color: "var(--text-placeholder)" }}>
    {icon}
    <p style={{ margin: 0, fontSize: 12 }}>{text}</p>
  </div>
);

const GlobalStyle = () => (
  <style>{`
    .irp-page :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 4px; }
    .irp-answer-row { transition: background 0.15s; }
    .irp-answer-row:hover { background: var(--bg-hover); }
    @keyframes irpShimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
    .irp-skel {
      background: linear-gradient(90deg, var(--bg-subtle) 25%, var(--bg-hover) 37%, var(--bg-subtle) 63%);
      background-size: 800px 100%;
      animation: irpShimmer 1.4s ease-in-out infinite;
      border: 1px solid var(--border);
    }
    @media (max-width: 640px) {
      .irp-navbar-role { display: none; }
      .irp-stats-row { grid-template-columns: repeat(2, 1fr) !important; }
      .irp-stats-row > div:nth-child(3) { border-left: none !important; border-top: 1px solid var(--border); grid-column: 1 / -1; }
    }
    @media print {
      .irp-navbar, .irp-footer-actions { display: none !important; }
      .ip-card { box-shadow: none !important; border: 1px solid #ddd !important; break-inside: avoid; }
      body { background: #fff !important; }
    }
  `}</style>
);

export default function InterviewReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const savedSession = useMemo(() =>
    location.state?.session || JSON.parse(sessionStorage.getItem(`interview_session_${id}`) || "null"),
    [id, location.state]
  );
  const savedReport = location.state?.report || savedSession?.report || null;

  const [report, setReport] = useState(savedReport);
  const [session, setSession] = useState(savedSession);
  const [loading, setLoading] = useState(!savedReport);
  const [error, setError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (savedReport) return;
    (async () => {
      try {
        const data = await getReport(id);
        if (data.success) { setReport(data.session.report); setSession(data.session); }
        else setError(data.message || "Could not load the report.");
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load report.");
      } finally { setLoading(false); }
    })();
  }, [id, savedReport]);

  const answers = session?.answers || [];
  const strengths = report?.strengths || [];
  const weaknesses = report?.weaknesses || [];
  const hasComm = report?.communicationScore > 0;
  const sc = scoreColor(report?.overallScore || 0);

  const roadmapSteps = useMemo(() => (
    report?.improvementRoadmap ? report.improvementRoadmap.split(/\.\s+/).filter(Boolean) : []
  ), [report]);

  const radarData = useMemo(() => {
    if (!answers.length) return [];
    const hrAnswers = answers.filter(a => a.type === 'hr');
    const techAnswers = answers.filter(a => a.type === 'technical');
    const codeAnswers = answers.filter(a => a.type === 'coding');
    const avg = (arr, key) => arr.length ? Math.round(arr.reduce((s, a) => s + (a[key] || 0), 0) / arr.length * 10) : 0;
    const data = [
      { subject: 'HR', score: avg(hrAnswers, 'score') },
      { subject: 'Technical', score: avg(techAnswers, 'score') },
      { subject: 'Coding', score: avg(codeAnswers, 'score') },
    ];
    if (report?.communicationScore > 0) {
      data.push({ subject: 'Communication', score: Math.round(report.communicationScore * 10) });
    }
    return data;
  }, [answers, report]);

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const response = await api.get(`interviews/${id}/report/pdf`, { responseType: 'blob' });
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `InterviewPilot_Report_${session?.role?.replace(/\s+/g, '_') || 'Report'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PDF download failed:', e);
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) return (
    <div className="irp-page" style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--sans)" }}>
      <GlobalStyle />
      <StudentTopbar title="Interview Report" />
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="irp-skel" style={{ height: 190, borderRadius: 16 }} />
        <div className="irp-skel" style={{ height: 220, borderRadius: 16 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="irp-skel" style={{ height: 160, borderRadius: 16 }} />
          <div className="irp-skel" style={{ height: 160, borderRadius: 16 }} />
        </div>
        <div className="irp-skel" style={{ height: 280, borderRadius: 16 }} />
      </div>
    </div>
  );

  if (error) return (
    <div className="irp-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)", padding: 24, fontFamily: "var(--sans)" }}>
      <GlobalStyle />
      <div className="ip-card" style={{ padding: 40, maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%", margin: "0 auto 16px",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--color-danger-bg)", color: "var(--color-danger-text)"
        }}>
          <IconAlert />
        </div>
        <p style={{ margin: "0 0 20px 0", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{error}</p>
        <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
      </div>
    </div>
  );

  return (
    <motion.div
      className="irp-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--sans)", fontSize: 14 }}
    >
      <GlobalStyle />

      <StudentTopbar
        title="Interview Report"
        sub={session?.role}
        rightContent={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="btn-primary"
              style={{ padding: "8px 16px", fontSize: 12 }}
            >
              {pdfLoading ? <span className="ip-spinner" /> : <IconDownload />}
              Download PDF
            </button>
            <button
              onClick={() => navigate("/student/dashboard")}
              className="btn-outline"
              style={{ padding: "8px 16px", fontSize: 12, background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              <IconArrowLeft />
              Dashboard
            </button>
          </div>
        }
      />

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        <div className="ip-card fade-up" style={{ overflow: "hidden" }}>
          <div style={{ height: 4, background: `linear-gradient(90deg, ${sc.text}, transparent)` }} />
          <div className="ip-responsive-flex-col" style={{ display: "flex", alignItems: "center", gap: 36, flexWrap: "wrap", padding: "32px 36px" }}>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <BigScoreRing score={report?.overallScore || 0} />
              <span className={`ip-badge ip-badge-${sc.tier}`} style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {TIER_LABEL[sc.tier]}
              </span>
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                {session?.role && <span className="ip-badge ip-badge-neutral" style={{ textTransform: "capitalize" }}>{session.role}</span>}
                {session?.difficulty && <span className="ip-badge ip-badge-neutral" style={{ textTransform: "capitalize" }}>{session.difficulty}</span>}
                {session?.createdAt && (
                  <span style={{ fontSize: 11, color: "var(--text-placeholder)" }}>
                    {new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}
              </div>
              <p style={{ margin: "0 0 14px 0", fontSize: 15, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>
                Overall Score / 100
              </p>
              {report?.summary ? (
                <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {report.summary}
                </p>
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-placeholder)", fontStyle: "italic" }}>
                  No summary generated for this session.
                </p>
              )}
            </div>
          </div>

          <div className="irp-stats-row ip-border-top" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
            {[
              { label: "Questions", value: answers.length || session?.questions?.length || 0 },
              { label: "Answered", value: answers.length },
              { label: "Status", value: session?.status === "completed" ? "Completed" : "—" },
            ].map(({ label, value }, i) => (
              <div key={label} style={{ padding: "16px 20px", borderLeft: i > 0 ? "1px solid var(--border)" : "none" }}>
                <div className="ip-stat-label">{label}</div>
                <div className="ip-stat-value">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {radarData.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.3 }}
            className="ip-card"
          >
            <CardHeader icon={<IconRadarIcon />} title="Performance Radar" />
            <div className="ip-card-body" style={{ paddingTop: 8 }}>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "var(--text-secondary)", fontWeight: 600 }} />
                  <Tooltip
                    formatter={(v) => [`${v}/100`, 'Score']}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)' }}
                  />
                  <Radar name="Score" dataKey="score" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} strokeWidth={2} dot={{ r: 4, fill: "var(--accent)" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {hasComm && (
          <div className="ip-card fade-up" style={{ animationDelay: "0.05s" }}>
            <CardHeader
              icon={<IconMic />}
              title="Communication Assessment"
              right={
                <span className="ip-badge ip-badge-neutral">
                  {report.videoAnswersCount} video answer{report.videoAnswersCount !== 1 ? "s" : ""}
                </span>
              }
            />
            <div className="ip-card-body" style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <SmallRing score={report.communicationScore} max={10} size={64} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-placeholder)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Overall</span>
              </div>
              <div style={{ width: 1, alignSelf: "stretch", background: "var(--border)", flexShrink: 0 }} />

              <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                {answers.filter(a => a.communicationScore > 0).map((a, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <SmallRing score={a.communicationScore} max={10} size={52} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-placeholder)", textAlign: "center" }}>
                      Q{a.questionIndex + 1} · {(TYPE_STYLE[a.type] || {}).label || a.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="ip-grid-2-col fade-up" style={{ animationDelay: "0.08s", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          <div className="ip-card">
            <CardHeader icon={<IconCheck />} title="Strengths" />
            <div className="ip-card-body">
              {strengths.length > 0 ? (
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {strengths.map((s, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "var(--color-success-bg)", color: "var(--color-success-text)"
                      }}><IconCheck /></span>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyMini icon={<IconEmpty />} text="No specific strengths identified." />
              )}
            </div>
          </div>

          <div className="ip-card">
            <CardHeader icon={<IconX />} title="Areas to Improve" />
            <div className="ip-card-body">
              {weaknesses.length > 0 ? (
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {weaknesses.map((w, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "var(--color-danger-bg)", color: "var(--color-danger-text)"
                      }}><IconX /></span>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>{w}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyMini icon={<IconEmpty />} text="No specific weaknesses identified." />
              )}
            </div>
          </div>
        </div>

        {report?.improvementRoadmap && (
          <div className="ip-card fade-up" style={{ animationDelay: "0.11s" }}>
            <CardHeader icon={<IconRoute />} title="Improvement Roadmap" />
            <div className="ip-card-body">
              {roadmapSteps.length > 1 ? (
                <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
                  {roadmapSteps.map((step, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "var(--accent-light)", color: "var(--accent-hover)",
                        fontSize: 11, fontWeight: 800
                      }}>{i + 1}</span>
                      <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>
                        {step}{!step.endsWith(".") ? "." : ""}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {report.improvementRoadmap}
                </p>
              )}
            </div>
          </div>
        )}

        {answers.length > 0 && (
          <div className="ip-card fade-up" style={{ animationDelay: "0.14s" }}>
            <CardHeader
              icon={<IconList />}
              title="Answer Breakdown"
              right={
                <span className="ip-badge ip-badge-neutral">{answers.length} answer{answers.length !== 1 ? "s" : ""}</span>
              }
            />

            <div style={{ display: "flex", flexDirection: "column" }}>
              {answers.map((a, i) => {
                const ts = TYPE_STYLE[a.type] || TYPE_STYLE.hr;
                const isLast = i === answers.length - 1;
                return (
                  <div
                    key={i}
                    className="irp-answer-row"
                    style={{
                      padding: "20px 24px",
                      borderBottom: isLast ? "none" : "1px solid var(--border)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, minWidth: 0 }}>
                        <span style={{
                          width: 24, height: 24, borderRadius: 6, flexShrink: 0, marginTop: 1,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: "var(--bg-subtle)", color: "var(--text-secondary)",
                          fontSize: 11, fontWeight: 800
                        }}>Q{i + 1}</span>
                        <div style={{ minWidth: 0 }}>
                          <span className={`ip-badge ${ts.badge}`} style={{ fontSize: 10, padding: "2px 8px", marginBottom: 6 }}>{ts.label}</span>
                          <p style={{ margin: "6px 0 0", fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.55 }}>
                            {a.question}
                          </p>
                        </div>
                      </div>

                      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <SmallRing score={a.score} max={10} size={48} />
                        <span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-placeholder)", textTransform: "uppercase" }}>Score</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginLeft: 34 }}>

                      {(a.answer || a.transcript) && (
                        <div style={{
                          background: "var(--bg-subtle)", borderRadius: 10, border: "1px solid var(--border)",
                          padding: "12px 16px"
                        }}>
                          <p style={{ margin: "0 0 6px 0", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-placeholder)" }}>
                            {a.videoUrl ? "Transcript" : "Your Answer"}
                          </p>
                          <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>
                            {a.answer || a.transcript || <span style={{ color: "var(--text-placeholder)", fontStyle: "italic" }}>No answer recorded.</span>}
                          </p>
                        </div>
                      )}

                      {a.feedback && (
                        <div style={{
                          display: "flex", gap: 10, padding: "12px 16px",
                          background: "var(--accent-light)", borderRadius: 10, border: "1px solid var(--accent-border)"
                        }}>
                          <span style={{ color: "var(--accent-hover)", flexShrink: 0, marginTop: 2 }}><IconSparkle /></span>
                          <div>
                            <p style={{ margin: "0 0 3px 0", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent-hover)" }}>AI Feedback</p>
                            <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>{a.feedback}</p>
                          </div>
                        </div>
                      )}

                      {a.communicationScore > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {[
                            { label: "Clarity", val: a.clarityScore },
                            { label: "Vocabulary", val: a.vocabularyScore },
                            { label: "Structure", val: a.structureScore },
                          ].map(({ label, val }) => val !== undefined && (
                            <div key={label} style={{
                              display: "flex", alignItems: "center", gap: 7,
                              padding: "6px 12px", borderRadius: 8,
                              background: "var(--bg-subtle)", border: "1px solid var(--border)"
                            }}>
                              <SmallRing score={val} max={10} size={30} />
                              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>{label}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {!a.answer && !a.transcript && !a.feedback && (
                        <p style={{ margin: 0, fontSize: 12, color: "var(--text-placeholder)", fontStyle: "italic" }}>No details recorded for this question.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="fade-up irp-footer-actions ip-responsive-flex-col" style={{ animationDelay: "0.17s", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "8px 0 32px" }}>
          <Link to="/student/dashboard" className="btn-secondary">
            <IconArrowLeft /> Back to Dashboard
          </Link>
          <Link to="/student/practice" className="btn-primary">
            <IconPlay /> Practice Again
          </Link>
        </div>

      </div>
    </motion.div>
  );
}