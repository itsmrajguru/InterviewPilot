import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { getReport } from "../../services/interviewService";

const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const IconMap = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
);
const IconList = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
);
const IconMic = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
);
const IconArrowLeft = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
);
const IconPlay = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);
const IconSpin = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ animation: "irp-spin 0.8s linear infinite" }}>
    <circle cx="16" cy="16" r="12" stroke="var(--border)" strokeWidth="3"/>
    <path d="M16 4a12 12 0 0 1 12 12" stroke="var(--text-primary)" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const scoreColor = (s, max = 100) => {
  const p = s / max;
  if (p >= 0.75) return { text: "var(--accent)", bg: "var(--accent-light)", border: "var(--accent-border)", track: "#dcfce7" };
  if (p >= 0.5)  return { text: "#d97706", bg: "#fffbeb", border: "#fde68a", track: "#fef3c7" };
  return              { text: "#dc2626", bg: "#fef2f2", border: "#fecaca", track: "#fee2e2" };
};

const BigScoreRing = ({ score }) => {
  const sc = scoreColor(score);
  const r = 54, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={sc.track} strokeWidth="8"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={sc.text} strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${fill} ${circ}`}
        strokeDashoffset={circ / 4}
        style={{ transition: "stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)" }}/>
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="28" fontWeight="900" fill={sc.text}>{score}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-placeholder)">/ 100</text>
    </svg>
  );
};

const SmallRing = ({ score, max = 10, size = 52 }) => {
  const sc = scoreColor(score, max);
  const r = 20, cx = 26, cy = 26;
  const circ = 2 * Math.PI * r;
  const fill = (score / max) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 52 52">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={sc.track} strokeWidth="4"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={sc.text} strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${fill} ${circ}`}
        strokeDashoffset={circ / 4}
        style={{ transition: "stroke-dasharray 0.8s ease" }}/>
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill={sc.text}>{score}</text>
    </svg>
  );
};

const TYPE_STYLE = {
  hr:        { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", label: "HR" },
  technical: { bg: "#fdf4ff", color: "#7c3aed", border: "#e9d5ff", label: "Technical" },
  coding:    { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", label: "Coding" },
};

const SectionHeader = ({ icon, title, right }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 22px", borderBottom: "1px solid var(--bg-subtle)",
    background: "#fafafa"
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <span style={{ color: "var(--text-muted)" }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{title}</span>
    </div>
    {right}
  </div>
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

  const [report, setReport]   = useState(savedReport);
  const [session, setSession] = useState(savedSession);
  const [loading, setLoading] = useState(!savedReport);
  const [error, setError]     = useState("");

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

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"var(--bg-subtle)", fontFamily:"var(--sans)" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
        <IconSpin />
        <p style={{ fontSize:14, color:"var(--text-muted)", margin:0 }}>Generating your report…</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"var(--bg-subtle)", padding:24, fontFamily:"var(--sans)" }}>
      <div style={{ background:"#fff", borderRadius:16, border:"1px solid var(--border)", padding:40, maxWidth:420, width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:36, marginBottom:12 }}>⚠️</div>
        <p style={{ fontSize:14, color:"var(--text-muted)", margin:"0 0 20px 0", lineHeight:1.6 }}>{error}</p>
        <button onClick={() => navigate(-1)} style={{ background: "var(--accent)", color: "#ffffff", border:"none", borderRadius:9, padding:"10px 22px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Go Back</button>
      </div>
    </div>
  );

  const sc         = scoreColor(report?.overallScore || 0);
  const answers    = session?.answers || [];
  const strengths  = report?.strengths  || [];
  const weaknesses = report?.weaknesses || [];
  const hasComm    = report?.communicationScore > 0;

  return (
    <>
      <style>{`
        @keyframes irp-spin { to { transform: rotate(360deg); } }
        @keyframes irp-fade-up { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .irp-fade { animation: irp-fade-up 0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .irp-answer-row { transition: background 0.15s; }
        .irp-answer-row:hover { background: #fafafa !important; }
        .irp-btn-dash:hover { background: var(--bg-subtle) !important; }
        .irp-btn-practice:hover { background: var(--accent-hover) !important; }
      `}</style>

      <div style={{ minHeight:"100vh", background:"var(--bg-subtle)", fontFamily:"var(--sans)", fontSize:14 }}>

        <nav style={{
          position:"sticky", top:0, zIndex:50,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 28px", height:56,
          background:"var(--bg-card)", borderBottom:"1px solid var(--border)",
          boxShadow:"0 1px 0 0 rgba(0,0,0,0.04)"
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <img src="/logo.svg" alt="CareerSync" style={{ height: 28 }} />
            <div>
              <span style={{ fontWeight:700, fontSize:13, color:"var(--text-primary)" }}>Interview Report</span>
              {session?.role && (
                <span style={{ fontSize:12, color:"var(--text-placeholder)", marginLeft:8 }}>— {session.role}</span>
              )}
            </div>
          </div>
          <Link to="/student/dashboard" style={{
            display:"flex", alignItems:"center", gap:7,
            fontSize:12, fontWeight:600, color:"#374151",
            background:"var(--bg-hover)", border:"1px solid var(--border)",
            borderRadius:8, padding:"7px 14px", textDecoration:"none",
            transition:"background 0.15s"
          }} className="irp-btn-dash">
            <IconArrowLeft /> Dashboard
          </Link>
        </nav>

        <div style={{ maxWidth:860, margin:"0 auto", padding:"32px 24px", display:"flex", flexDirection:"column", gap:20 }}>

          <div className="irp-fade" style={{
            background:"var(--bg-card)", borderRadius:16, border:"1px solid var(--border)",
            boxShadow:"0 1px 3px rgba(0,0,0,0.05)", overflow:"hidden"
          }}>
            
            <div style={{ height:4, background:`linear-gradient(90deg, ${sc.text}, ${sc.text}66)` }}/>
            <div style={{ padding:"36px 40px", display:"flex", alignItems:"center", gap:40, flexWrap:"wrap" }}>

              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, flexShrink:0 }}>
                <BigScoreRing score={report?.overallScore || 0} />
                <span style={{
                  fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em",
                  padding:"3px 10px", borderRadius:20,
                  background: sc.bg, color: sc.text, border:`1px solid ${sc.border}`
                }}>
                  {report?.overallScore >= 75 ? "Strong" : report?.overallScore >= 50 ? "Average" : "Needs Work"}
                </span>
              </div>

              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, flexWrap:"wrap" }}>
                  <span style={{
                    fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:20,
                    background:"var(--bg-subtle)", color:"#0f172a", border:"1px solid var(--border-input)",
                    textTransform:"capitalize"
                  }}>{session?.role}</span>
                  <span style={{
                    fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20,
                    background:"var(--bg-hover)", color:"var(--text-muted)", border:"1px solid var(--border)",
                    textTransform:"capitalize"
                  }}>{session?.difficulty}</span>
                  {session?.createdAt && (
                    <span style={{ fontSize:11, color:"var(--text-placeholder)" }}>
                      {new Date(session.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                    </span>
                  )}
                </div>
                <p style={{ margin:"0 0 16px 0", fontSize:15, fontWeight:700, color:"var(--text-primary)", letterSpacing:"-0.01em" }}>
                  Overall Score / 100
                </p>
                {report?.summary ? (
                  <p style={{ margin:0, fontSize:14, color:"var(--text-muted)", lineHeight:1.7 }}>
                    {report.summary}
                  </p>
                ) : (
                  <p style={{ margin:0, fontSize:13, color:"var(--border-input)", fontStyle:"italic" }}>
                    No summary generated for this session.
                  </p>
                )}
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:10, flexShrink:0, minWidth:130 }}>
                {[
                  { label:"Questions", value: answers.length || session?.questions?.length || 0 },
                  { label:"Answered",  value: answers.length },
                  { label:"Session",   value: session?.status === "completed" ? "Done" : "—" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", gap:16, alignItems:"center" }}>
                    <span style={{ fontSize:11, color:"var(--text-placeholder)", fontWeight:600 }}>{label}</span>
                    <span style={{ fontSize:13, fontWeight:800, color:"#374151" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {hasComm && (
            <div className="irp-fade" style={{
              animationDelay:"0.05s",
              background:"var(--bg-card)", borderRadius:16, border:"1px solid var(--border)",
              boxShadow:"0 1px 3px rgba(0,0,0,0.05)", overflow:"hidden"
            }}>
              <SectionHeader
                icon={<IconMic />}
                title="Communication Assessment"
                right={
                  <span style={{
                    fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20,
                    background:"var(--bg-subtle)", color:"#0f172a", border:"1px solid var(--border-input)"
                  }}>{report.videoAnswersCount} video answer{report.videoAnswersCount !== 1 ? "s" : ""}</span>
                }
              />
              <div style={{ padding:"20px 22px", display:"flex", flexWrap:"wrap", gap:16, alignItems:"center" }}>
                
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                  <SmallRing score={report.communicationScore} max={10} size={64} />
                  <span style={{ fontSize:10, fontWeight:700, color:"var(--text-placeholder)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Overall</span>
                </div>
                <div style={{ width:1, height:60, background:"var(--bg-subtle)", flexShrink:0 }}/>
                
                {answers.filter(a => a.communicationScore > 0).slice(0, 4).map((a, i) => (
                  <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                    <SmallRing score={a.communicationScore} max={10} size={52} />
                    <span style={{ fontSize:10, fontWeight:600, color:"var(--text-placeholder)", textAlign:"center" }}>
                      Q{a.questionIndex + 1} · {(TYPE_STYLE[a.type] || {}).label || a.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="irp-fade" style={{ animationDelay:"0.08s", display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

            <div style={{ background:"var(--bg-card)", borderRadius:16, border:"1px solid var(--border)", boxShadow:"0 1px 3px rgba(0,0,0,0.05)", overflow:"hidden" }}>
              <SectionHeader icon={<span style={{ fontSize:14 }}>💪</span>} title="Strengths" />
              <div style={{ padding:"18px 22px" }}>
                {strengths.length > 0 ? (
                  <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:10 }}>
                    {strengths.map((s, i) => (
                      <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                        <span style={{
                          width:20, height:20, borderRadius:"50%", flexShrink:0, marginTop:1,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          background:"#dcfce7", color:"#15803d"
                        }}><IconCheck /></span>
                        <span style={{ fontSize:13, color:"#374151", lineHeight:1.55 }}>{s}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"16px 0", textAlign:"center", gap:6 }}>
                    <span style={{ fontSize:20 }}>🔍</span>
                    <p style={{ margin:0, fontSize:12, color:"var(--text-placeholder)" }}>No specific strengths identified.</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ background:"var(--bg-card)", borderRadius:16, border:"1px solid var(--border)", boxShadow:"0 1px 3px rgba(0,0,0,0.05)", overflow:"hidden" }}>
              <SectionHeader icon={<span style={{ fontSize:14 }}>🎯</span>} title="Areas to Improve" />
              <div style={{ padding:"18px 22px" }}>
                {weaknesses.length > 0 ? (
                  <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:10 }}>
                    {weaknesses.map((w, i) => (
                      <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                        <span style={{
                          width:20, height:20, borderRadius:"50%", flexShrink:0, marginTop:1,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          background:"#fee2e2", color:"#dc2626"
                        }}><IconX /></span>
                        <span style={{ fontSize:13, color:"#374151", lineHeight:1.55 }}>{w}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"16px 0", textAlign:"center", gap:6 }}>
                    <span style={{ fontSize:20 }}>✨</span>
                    <p style={{ margin:0, fontSize:12, color:"var(--text-placeholder)" }}>No specific weaknesses identified.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {report?.improvementRoadmap && (
            <div className="irp-fade" style={{
              animationDelay:"0.11s",
              background:"var(--bg-card)", borderRadius:16, border:"1px solid var(--border)",
              boxShadow:"0 1px 3px rgba(0,0,0,0.05)", overflow:"hidden"
            }}>
              <SectionHeader icon={<IconMap />} title="Improvement Roadmap" />
              <div style={{ padding:"20px 22px" }}>
                
                {report.improvementRoadmap.split(/\.\s+/).filter(Boolean).length > 1 ? (
                  <ol style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:12 }}>
                    {report.improvementRoadmap.split(/\.\s+/).filter(Boolean).map((step, i) => (
                      <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                        <span style={{
                          width:22, height:22, borderRadius:"50%", flexShrink:0, marginTop:1,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          background:"#f0fdf4", color:"#15803d",
                          fontSize:11, fontWeight:800
                        }}>{i + 1}</span>
                        <p style={{ margin:0, fontSize:13, color:"#374151", lineHeight:1.65 }}>
                          {step}{!step.endsWith(".") ? "." : ""}
                        </p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p style={{ margin:0, fontSize:13, color:"#374151", lineHeight:1.7 }}>
                    {report.improvementRoadmap}
                  </p>
                )}
              </div>
            </div>
          )}

          {answers.length > 0 && (
            <div className="irp-fade" style={{
              animationDelay:"0.14s",
              background:"var(--bg-card)", borderRadius:16, border:"1px solid var(--border)",
              boxShadow:"0 1px 3px rgba(0,0,0,0.05)", overflow:"hidden"
            }}>
              <SectionHeader
                icon={<IconList />}
                title="Answer Breakdown"
                right={
                  <span style={{
                    fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20,
                    background:"var(--bg-subtle)", color:"var(--text-muted)", border:"1px solid var(--border)"
                  }}>{answers.length} answer{answers.length !== 1 ? "s" : ""}</span>
                }
              />

              <div style={{ display:"flex", flexDirection:"column" }}>
                {answers.map((a, i) => {
                  const ts    = TYPE_STYLE[a.type] || TYPE_STYLE.hr;
                  const asc   = scoreColor(a.score, 10);
                  const isLast = i === answers.length - 1;
                  return (
                    <div
                      key={i}
                      className="irp-answer-row"
                      style={{
                        padding:"20px 22px",
                        borderBottom: isLast ? "none" : "1px solid var(--bg-subtle)"
                      }}
                    >
                      
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, marginBottom:14 }}>
                        <div style={{ display:"flex", alignItems:"flex-start", gap:10, minWidth:0 }}>
                          
                          <span style={{
                            width:24, height:24, borderRadius:6, flexShrink:0, marginTop:1,
                            display:"flex", alignItems:"center", justifyContent:"center",
                            background:"var(--bg-subtle)", color:"var(--text-muted)",
                            fontSize:11, fontWeight:800
                          }}>Q{i + 1}</span>
                          <div style={{ minWidth:0 }}>
                            <span style={{
                              display:"inline-block", fontSize:10, fontWeight:700, textTransform:"uppercase",
                              letterSpacing:"0.06em", padding:"2px 8px", borderRadius:20, marginBottom:6,
                              background: ts.bg, color: ts.color, border:`1px solid ${ts.border}`
                            }}>{ts.label}</span>
                            <p style={{ margin:0, fontSize:14, fontWeight:600, color:"var(--text-primary)", lineHeight:1.55 }}>
                              {a.question}
                            </p>
                          </div>
                        </div>
                        
                        <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                          <SmallRing score={a.score} max={10} size={48} />
                          <span style={{ fontSize:9, fontWeight:700, color:"var(--text-placeholder)", textTransform:"uppercase" }}>Score</span>
                        </div>
                      </div>

                      <div style={{ display:"flex", flexDirection:"column", gap:10, marginLeft:34 }}>
                        
                        {(a.answer || a.transcript) && (
                          <div style={{
                            background:"var(--bg-hover)", borderRadius:10, border:"1px solid var(--border)",
                            padding:"12px 16px"
                          }}>
                            <p style={{ margin:"0 0 6px 0", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--text-placeholder)" }}>
                              {a.videoUrl ? "Transcript" : "Your Answer"}
                            </p>
                            <p style={{ margin:0, fontSize:13, color:"#374151", lineHeight:1.65 }}>
                              {a.answer || a.transcript || <span style={{ color:"var(--border-input)", fontStyle:"italic" }}>No answer recorded.</span>}
                            </p>
                          </div>
                        )}

                        {a.feedback && (
                          <div style={{
                            display:"flex", gap:10, padding:"12px 16px",
                            background:"#f0fdf4", borderRadius:10, border:"1px solid var(--accent-border)"
                          }}>
                            <span style={{ fontSize:14, flexShrink:0, marginTop:1 }}>🤖</span>
                            <div>
                              <p style={{ margin:"0 0 3px 0", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--accent-hover)" }}>AI Feedback</p>
                              <p style={{ margin:0, fontSize:13, color:"#374151", lineHeight:1.65 }}>{a.feedback}</p>
                            </div>
                          </div>
                        )}

                        {a.communicationScore > 0 && (
                          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                            {[
                              { label:"Clarity",    val: a.clarityScore },
                              { label:"Vocabulary", val: a.vocabularyScore },
                              { label:"Structure",  val: a.structureScore },
                            ].map(({ label, val }) => val !== undefined && (
                              <div key={label} style={{
                                display:"flex", alignItems:"center", gap:7,
                                padding:"6px 12px", borderRadius:8,
                                background:"var(--bg-hover)", border:"1px solid var(--border)"
                              }}>
                                <SmallRing score={val} max={10} size={32} />
                                <span style={{ fontSize:11, fontWeight:600, color:"var(--text-muted)" }}>{label}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {!a.answer && !a.transcript && !a.feedback && (
                          <p style={{ margin:0, fontSize:12, color:"var(--border-input)", fontStyle:"italic" }}>No details recorded for this question.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="irp-fade" style={{
            animationDelay:"0.17s",
            display:"flex", alignItems:"center", justifyContent:"center", gap:12,
            padding:"8px 0 32px"
          }}>
            <Link to="/student/dashboard" style={{
              display:"flex", alignItems:"center", gap:8,
              padding:"11px 22px", borderRadius:10, fontSize:13,
              fontWeight:700, border:"1px solid var(--border)",
              background:"var(--bg-card)", color:"#374151",
              textDecoration:"none", transition:"background 0.15s"
            }} className="irp-btn-dash">
              <IconArrowLeft /> Back to Dashboard
            </Link>
            <Link to="/student/practice" style={{
              display:"flex", alignItems:"center", gap:8,
              padding:"11px 22px", borderRadius:10, fontSize:13,
              fontWeight:700, border:"none",
              background: "var(--accent)", color:"var(--bg-card)",
              textDecoration:"none", transition:"background 0.15s"
            }} className="irp-btn-practice">
              <IconPlay /> Practice Again
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}