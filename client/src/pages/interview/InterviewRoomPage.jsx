import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import { submitCode, completeSession } from "../../services/interviewService";
import VideoRecorder from "../../components/VideoRecorder";

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const CodeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M9.5 3.5l3 4-3 4M5.5 3.5l-3 4 3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const SpinnerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: "ip-spin 0.7s linear infinite" }}>
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2"/>
    <path d="M8 2a6 6 0 016 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const LANG_MONACO_MAP = {
  javascript: "javascript",
  python: "python",
  cpp: "cpp",
  java: "java",
};

const TYPE_STYLES = {
  hr:        { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", label: "HR" },
  technical: { bg: "#fdf4ff", color: "#7c3aed", border: "#e9d5ff", label: "Technical" },
  coding:    { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", label: "Coding" },
};

const scoreColor = (score, max = 10) => {
  const pct = score / max;
  if (pct >= 0.8) return "var(--accent)";
  if (pct >= 0.5) return "#d97706";
  return "#dc2626";
};

const ScoreRing = ({ score, max = 10, size = 56 }) => {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const fill = (score / max) * circ;
  const color = scoreColor(score, max);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={r} fill="none" stroke="var(--border)" strokeWidth="4"/>
      <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${fill} ${circ}`} strokeDashoffset={circ / 4}
        strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease" }}/>
      <text x="24" y="28" textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>{score}</text>
    </svg>
  );
};

const MetricTile = ({ label, score }) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    padding: "14px 10px", borderRadius: 10,
    background: "var(--bg-hover)", border: "1px solid var(--border)",
    minWidth: 80
  }}>
    <ScoreRing score={score} size={48} />
    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
  </div>
);

export default function InterviewRoomPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const sessionData = location.state?.session;
  const savedSession = sessionData || JSON.parse(sessionStorage.getItem(`interview_session_${id}`) || "null");
  const [session] = useState(savedSession);

  const [currentIndex, setCurrentIndex] = useState(session?.currentQuestionIndex || 0);
  const [code, setCode]         = useState("// Write your solution here\n\n");
  const [language, setLanguage] = useState("javascript");
  const [submitting, setSubmitting]   = useState(false);
  const [feedback, setFeedback]       = useState(null);
  const [codeResults, setCodeResults] = useState(null);
  const [error, setError]             = useState("");
  const [answered, setAnswered]       = useState(
    JSON.parse(sessionStorage.getItem(`interview_answered_${id}`) || "{}")
  );
  const [completing, setCompleting] = useState(false);

  useEffect(() => { if (!session) navigate("/login"); }, [session, navigate]);
  useEffect(() => { if (session) sessionStorage.setItem(`interview_session_${id}`, JSON.stringify(session)); }, [id, session]);
  useEffect(() => { sessionStorage.setItem(`interview_answered_${id}`, JSON.stringify(answered)); }, [id, answered]);

  if (!session) return null;

  const questions       = session.questions || [];
  const currentQuestion = questions[currentIndex];
  const isLastQuestion  = currentIndex === questions.length - 1;
  const isCoding        = currentQuestion?.type === "coding";
  const allAnswered     = questions.length > 0 && Object.keys(answered).length >= questions.length;
  const progressPct     = Math.round(((currentIndex + (feedback ? 1 : 0)) / questions.length) * 100);
  const typeStyle       = TYPE_STYLES[currentQuestion?.type] || TYPE_STYLES.hr;

  const handleSubmitCode = async () => {
    if (!code.trim()) return;
    setSubmitting(true); setCodeResults(null); setFeedback(null); setError("");
    try {
      const data = await submitCode({ sessionId: id, code, language, questionIndex: currentIndex });
      if (data.success) {
        setCodeResults(data.testResults);
        setFeedback(data.evaluation);
        setAnswered(prev => ({ ...prev, [currentIndex]: true }));
      } else setError(data.message || "Code execution failed.");
    } catch (e) {
      setError(e.response?.data?.message || "Connection error. Please try again.");
    } finally { setSubmitting(false); }
  };

  const handleNext = () => {
    setCode("// Write your solution here\n\n");
    setFeedback(null); setCodeResults(null); setError("");
    setCurrentIndex(prev => prev + 1);
  };

  const handleComplete = async () => {
    setCompleting(true); setError("");
    try {
      const data = await completeSession(id);
      if (data.success) {
        const completedSession = { ...session, status: "completed", report: data.report };
        sessionStorage.setItem(`interview_session_${id}`, JSON.stringify(completedSession));
        navigate(`/interview/${id}/report`, { state: { session: completedSession, report: data.report } });
      } else { setError(data.message || "Could not complete interview."); setCompleting(false); }
    } catch (e) {
      setError(e.response?.data?.message || "Connection error. Please try again.");
      setCompleting(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes ip-spin { to { transform: rotate(360deg); } }
        .ip-q-btn:hover:not(:disabled) { background: var(--bg-subtle) !important; }
        .ip-lang-btn:hover:not(:disabled) { background: var(--border) !important; }
        .ip-action-btn:hover:not(:disabled) { filter: brightness(0.93); transform: translateY(-1px); }
        .ip-action-btn { transition: all 0.15s ease !important; }
        .ip-skip-btn:hover { background: var(--bg-subtle) !important; }
      `}</style>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{ display:"flex", flexDirection:"column", minHeight:"100vh", background:"var(--bg-subtle)", fontFamily:"var(--sans)" }}
      >
        <nav style={{
          position:"sticky", top:0, zIndex:50,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 24px", height:56,
          background:"var(--bg-card)",
          borderBottom:"1px solid var(--border)",
          boxShadow:"0 1px 0 0 rgba(0,0,0,0.04)"
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <img src="/logo.svg" alt="InterviewPilot" style={{ height: 28 }} />
            <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
              <span style={{ fontWeight:700, fontSize:13, color:"var(--text-primary)", lineHeight:1 }}>
                {session.role}
              </span>
              <span style={{ fontSize:11, color:"var(--text-placeholder)", lineHeight:1, textTransform:"capitalize" }}>
                {session.difficulty} difficulty
              </span>
            </div>
          </div>

          <div style={{ flex:1, margin:"0 32px", maxWidth:480 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
              <span style={{ fontSize:11, fontWeight:600, color:"var(--text-muted)" }}>Progress</span>
              <span style={{ fontSize:11, fontWeight:700, color:"var(--accent)" }}>{progressPct}%</span>
            </div>
            <div style={{ width:"100%", height:5, background:"var(--border)", borderRadius:99, overflow:"hidden" }}>
              <motion.div
                style={{ height:"100%", background:"var(--accent)", borderRadius:99 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
              />
            </div>
          </div>

          <div style={{
            display:"flex", alignItems:"center", gap:6,
            padding:"5px 12px", borderRadius:8,
            background:"var(--bg-hover)", border:"1px solid var(--border)"
          }}>
            <span style={{ fontSize:12, fontWeight:700, color:"var(--text-primary)" }}>Q{currentIndex + 1}</span>
            <span style={{ fontSize:12, color:"var(--border-input)" }}>/</span>
            <span style={{ fontSize:12, color:"var(--text-placeholder)", fontWeight:600 }}>{questions.length}</span>
          </div>
        </nav>

        <div style={{
          display:"flex", flex:1, gap:0,
          maxWidth:1200, margin:"0 auto", width:"100%",
          padding:"24px 20px"
        }}>
          <aside style={{
            width:220, flexShrink:0, marginRight:20,
            display:"flex", flexDirection:"column", gap:2
          }}>
            <div style={{
              background:"var(--bg-card)", borderRadius:12, border:"1px solid var(--border)",
              padding:"12px 8px", boxShadow:"0 1px 3px rgba(0,0,0,0.05)"
            }}>
              <p style={{
                fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
                color:"var(--text-placeholder)", margin:"0 0 10px 8px"
              }}>Questions</p>

              {questions.map((q, i) => {
                const isActive   = i === currentIndex;
                const isDone     = !!answered[i];
                const isLocked   = !isDone && !isActive && i > currentIndex;
                const ts         = TYPE_STYLES[q.type] || TYPE_STYLES.hr;
                return (
                  <button
                    key={i}
                    className="ip-q-btn"
                    onClick={() => {
                      if (!isLocked) {
                        setCurrentIndex(i);
                        setCode("// Write your solution here\n\n");
                        setFeedback(null); setCodeResults(null); setError("");
                      }
                    }}
                    disabled={isLocked}
                    style={{
                      width:"100%", textAlign:"left",
                      padding:"9px 10px", borderRadius:8,
                      fontSize:12, fontWeight:500,
                      cursor: isLocked ? "not-allowed" : "pointer",
                      border:"none",
                      background: isActive ? "var(--accent-light)" : "transparent",
                      opacity: isLocked ? 0.4 : 1,
                      transition:"background 0.15s",
                      display:"flex", alignItems:"flex-start", gap:8
                    }}
                  >
                    <div style={{
                      width:20, height:20, borderRadius:"50%", flexShrink:0, marginTop:1,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:10, fontWeight:700,
                      background: isDone ? "var(--accent)" : (isActive ? "var(--accent-light)" : "var(--bg-subtle)"),
                      color: isDone ? "#fff" : (isActive ? "var(--accent)" : "var(--text-placeholder)"),
                      border: isActive && !isDone ? "1.5px solid var(--accent)" : "none"
                    }}>
                      {isDone ? <CheckIcon /> : i + 1}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <span style={{
                        display:"inline-block", fontSize:9, fontWeight:700, letterSpacing:"0.06em",
                        textTransform:"uppercase", padding:"1px 6px", borderRadius:4,
                        background: ts.bg, color: ts.color,
                        marginBottom:3
                      }}>{ts.label}</span>
                      <p style={{
                        margin:0, fontSize:11, lineHeight:1.4, fontWeight:500,
                        color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                        overflow:"hidden", textOverflow:"ellipsis",
                        display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical"
                      }}>
                        {q.question.slice(0, 55)}{q.question.length > 55 ? "…" : ""}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <main style={{ flex:1, display:"flex", flexDirection:"column", gap:16, minWidth:0 }}>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity:0, y:10 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-10 }}
                transition={{ duration:0.2 }}
                style={{
                  background:"var(--bg-card)", borderRadius:14, border:"1px solid var(--border)",
                  boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
                  padding:28
                }}
              >
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                  <span style={{
                    fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:20,
                    background: typeStyle.bg, color: typeStyle.color, border:`1px solid ${typeStyle.border}`
                  }}>{typeStyle.label}</span>
                  {currentQuestion?.topic && (
                    <span style={{
                      fontSize:12, fontWeight:500, padding:"4px 12px", borderRadius:20,
                      background:"var(--bg-hover)", color:"var(--text-muted)", border:"1px solid var(--border)"
                    }}>{currentQuestion.topic}</span>
                  )}
                </div>

                <p style={{
                  fontSize:17, fontWeight:600, color:"var(--text-primary)",
                  lineHeight:1.65, margin:0
                }}>
                  {currentQuestion?.question}
                </p>

                {isCoding && currentQuestion?.testCases?.length > 0 && (
                  <div style={{ marginTop:20 }}>
                    <p style={{
                      fontSize:11, fontWeight:700, textTransform:"uppercase",
                      letterSpacing:"0.08em", color:"var(--text-placeholder)", margin:"0 0 10px 0"
                    }}>Sample Test Cases</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {currentQuestion.testCases.map((tc, i) => (
                        <div key={i} style={{
                          background:"var(--bg-hover)", borderRadius:8,
                          border:"1px solid var(--border)",
                          padding:"10px 14px",
                          fontFamily:"var(--mono)", fontSize:12,
                          display:"grid", gridTemplateColumns:"1fr 1fr", gap:8
                        }}>
                          <div>
                            <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", color:"var(--text-placeholder)", display:"block", marginBottom:3 }}>Input</span>
                            <span style={{ color:"#374151" }}>{tc.input || "(none)"}</span>
                          </div>
                          <div>
                            <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", color:"var(--accent)", display:"block", marginBottom:3 }}>Expected Output</span>
                            <span style={{ color:"var(--text-primary)", fontWeight:600 }}>{tc.expectedOutput}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {!feedback && (
              <motion.div
                initial={{ opacity:0, y:10 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay:0.05, duration:0.2 }}
              >
                {!isCoding ? (
                  <VideoRecorder
                    sessionId={id}
                    questionIndex={currentIndex}
                    onSubmitted={(evaluation) => {
                      setFeedback(evaluation);
                      setAnswered(prev => ({ ...prev, [currentIndex]: true }));
                    }}
                  />
                ) : (
                  <div style={{
                    background:"var(--bg-card)", borderRadius:14, border:"1px solid var(--border)",
                    boxShadow:"0 1px 3px rgba(0,0,0,0.05)", overflow:"hidden"
                  }}>
                    <div style={{
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"12px 16px",
                      background:"var(--bg-hover)",
                      borderBottom:"1px solid var(--border)"
                    }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <CodeIcon />
                        <span style={{ fontSize:13, fontWeight:700, color:"#374151" }}>Code Editor</span>
                        <span style={{ fontSize:11, color:"var(--text-placeholder)" }}>— Monaco · Judge0 execution</span>
                      </div>
                      <div style={{
                        display:"flex", gap:2, padding:3,
                        background:"var(--border)", borderRadius:8
                      }}>
                        {["javascript","python","cpp","java"].map(lang => (
                          <button
                            key={lang}
                            className="ip-lang-btn"
                            onClick={() => setLanguage(lang)}
                            disabled={!!feedback || submitting}
                            style={{
                              padding:"4px 10px", borderRadius:6, fontSize:11,
                              fontWeight:700, letterSpacing:"0.04em",
                              border:"none", cursor: (!!feedback || submitting) ? "not-allowed" : "pointer",
                              transition:"all 0.15s",
                              background: language === lang ? "var(--bg-card)" : "transparent",
                              color: language === lang ? "var(--accent)" : "var(--text-muted)",
                              boxShadow: language === lang ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                            }}
                          >{lang}</button>
                        ))}
                      </div>
                    </div>

                    <Editor
                      height="360px"
                      language={LANG_MONACO_MAP[language]}
                      value={code}
                      onChange={(val) => setCode(val || "")}
                      theme="vs-dark"
                      options={{
                        fontSize: 13,
                        lineHeight: 22,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        automaticLayout: true,
                        readOnly: !!feedback || submitting,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        padding: { top: 16, bottom: 16 },
                        renderLineHighlight: "all",
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                      }}
                    />

                    <div style={{
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"10px 16px",
                      background:"var(--bg-hover)", borderTop:"1px solid var(--border)"
                    }}>
                      <span style={{ fontSize:11, color:"var(--text-placeholder)" }}>
                        {language === "javascript" ? "JS" : language === "cpp" ? "C++" : language.charAt(0).toUpperCase() + language.slice(1)} · Executed via Judge0
                      </span>
                      <button
                        className="ip-action-btn"
                        onClick={handleSubmitCode}
                        disabled={submitting || !code.trim()}
                        style={{
                          display:"flex", alignItems:"center", gap:8,
                          padding:"8px 18px", borderRadius:8, fontSize:13,
                          fontWeight:700, border:"none", cursor: (submitting || !code.trim()) ? "not-allowed" : "pointer",
                          background: (submitting || !code.trim()) ? "var(--border)" : "var(--accent)",
                          color: (submitting || !code.trim()) ? "var(--text-placeholder)" : "var(--bg-card)",
                          opacity: (submitting || !code.trim()) ? 0.7 : 1
                        }}
                      >
                        {submitting ? <><SpinnerIcon /> Running…</> : <>Run &amp; Submit <ChevronRight /></>}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {error && (
              <div style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"12px 16px", borderRadius:10,
                background:"#fef2f2", border:"1px solid #fecaca",
                fontSize:13, color:"#b91c1c"
              }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:"#ef4444", flexShrink:0 }}/>
                {error}
              </div>
            )}

            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity:0, y:12 }}
                  animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0 }}
                  transition={{ duration:0.25 }}
                  style={{
                    background:"var(--bg-card)", borderRadius:14, border:"1px solid var(--border)",
                    boxShadow:"0 1px 3px rgba(0,0,0,0.05)", overflow:"hidden"
                  }}
                >
                  <div style={{
                    padding:"16px 24px",
                    borderBottom:"1px solid var(--bg-subtle)",
                    background:"#fafafa",
                    display:"flex", alignItems:"center", gap:8
                  }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--accent)" }}/>
                    <span style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>AI Evaluation</span>
                    <span style={{ fontSize:12, color:"var(--text-placeholder)", marginLeft:"auto" }}>Powered by Gemini</span>
                  </div>

                  <div style={{ padding:24 }}>
                    <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20 }}>
                      {feedback.contentScore !== undefined && (
                        <MetricTile label="Content" score={feedback.contentScore ?? feedback.score} />
                      )}
                      {feedback.score !== undefined && feedback.contentScore === undefined && (
                        <MetricTile label="Score" score={feedback.score} />
                      )}
                      {feedback.communicationScore !== undefined && (
                        <MetricTile label="Communication" score={feedback.communicationScore} />
                      )}
                      {feedback.clarityScore !== undefined && (
                        <MetricTile label="Clarity" score={feedback.clarityScore} />
                      )}
                      {feedback.vocabularyScore !== undefined && (
                        <MetricTile label="Vocabulary" score={feedback.vocabularyScore} />
                      )}
                      {feedback.structureScore !== undefined && (
                        <MetricTile label="Structure" score={feedback.structureScore} />
                      )}
                    </div>

                    {feedback.feedback && (
                      <div style={{
                        padding:"14px 18px", borderRadius:10,
                        background:"var(--bg-hover)", border:"1px solid var(--border)",
                        marginBottom: codeResults ? 16 : 0
                      }}>
                        <p style={{ margin:0, fontSize:14, color:"#374151", lineHeight:1.65 }}>
                          {feedback.feedback}
                        </p>
                      </div>
                    )}

                    {codeResults && (
                      <div style={{ marginTop:16 }}>
                        <div style={{
                          display:"flex", alignItems:"center", justifyContent:"space-between",
                          marginBottom:10
                        }}>
                          <p style={{
                            margin:0, fontSize:11, fontWeight:700, textTransform:"uppercase",
                            letterSpacing:"0.08em", color:"var(--text-placeholder)"
                          }}>Test Results</p>
                          <span style={{
                            fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:20,
                            background: codeResults.filter(r=>r.passed).length === codeResults.length ? "var(--accent-light)" : "#fef2f2",
                            color: codeResults.filter(r=>r.passed).length === codeResults.length ? "var(--accent)" : "#dc2626"
                          }}>
                            {codeResults.filter(r=>r.passed).length}/{codeResults.length} passed
                          </span>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                          {codeResults.map((r, i) => (
                            <div key={i} style={{
                              display:"grid", gridTemplateColumns:"24px 1fr 1fr 1fr", gap:10,
                              padding:"10px 14px", borderRadius:8,
                              fontFamily:"var(--mono)", fontSize:12,
                              background: r.passed ? "#f0fdf4" : "#fef2f2",
                              border: `1px solid ${r.passed ? "#a7f3d0" : "#fecaca"}`
                            }}>
                              <span style={{ color: r.passed ? "var(--accent)" : "#dc2626", fontWeight:700, fontSize:15 }}>
                                {r.passed ? "✓" : "✗"}
                              </span>
                              <div>
                                <span style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", color:"var(--text-placeholder)", display:"block" }}>Input</span>
                                <span style={{ color:"#374151" }}>{r.input || "—"}</span>
                              </div>
                              <div>
                                <span style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", color:"var(--text-placeholder)", display:"block" }}>Expected</span>
                                <span style={{ color:"#374151" }}>{r.expectedOutput}</span>
                              </div>
                              <div>
                                <span style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", color:"var(--text-placeholder)", display:"block" }}>Got</span>
                                <span style={{ color: r.passed ? "var(--accent)" : "#dc2626", fontWeight:600 }}>
                                  {r.actualOutput || r.error || "—"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"14px 20px", borderRadius:12,
              background:"var(--bg-card)", border:"1px solid var(--border)",
              boxShadow:"0 1px 3px rgba(0,0,0,0.05)"
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {feedback && (
                  isLastQuestion ? (
                    allAnswered ? (
                      <button
                        className="ip-action-btn"
                        onClick={handleComplete}
                        disabled={completing}
                        style={{
                          display:"flex", alignItems:"center", gap:8,
                          padding:"10px 22px", borderRadius:8, fontSize:14,
                          fontWeight:700, border:"none",
                          cursor: completing ? "not-allowed" : "pointer",
                          background: completing ? "var(--border)" : "var(--accent)",
                          color: completing ? "var(--text-placeholder)" : "var(--bg-card)"
                        }}
                      >
                        {completing ? <><SpinnerIcon /> Generating Report…</> : <>Finish Interview &amp; Get Report <ChevronRight /></>}
                      </button>
                    ) : (
                      <span style={{ fontSize:13, color:"var(--text-placeholder)", fontWeight:500 }}>
                        Answer all questions to finish.
                      </span>
                    )
                  ) : (
                    <button
                      className="ip-action-btn"
                      onClick={handleNext}
                      style={{
                        display:"flex", alignItems:"center", gap:8,
                        padding:"10px 22px", borderRadius:8, fontSize:14,
                        fontWeight:700, border:"none", cursor:"pointer",
                        background:"var(--accent)", color:"var(--bg-card)"
                      }}
                    >
                      Next Question <ChevronRight />
                    </button>
                  )
                )}

                {!feedback && isCoding && (
                  <span style={{ fontSize:12, color:"var(--text-placeholder)" }}>
                    Write your solution above and click Run &amp; Submit
                  </span>
                )}
              </div>

              {!feedback && !isLastQuestion && (
                <button
                  className="ip-skip-btn"
                  onClick={handleNext}
                  style={{
                    display:"flex", alignItems:"center", gap:6,
                    padding:"8px 16px", borderRadius:8, fontSize:13,
                    fontWeight:600, cursor:"pointer",
                    background:"transparent", color:"var(--text-placeholder)",
                    border:"1px solid var(--border)",
                    transition:"background 0.15s"
                  }}
                >
                  Skip this question
                </button>
              )}

              {!feedback && isLastQuestion && allAnswered && (
                <button
                  className="ip-action-btn"
                  onClick={handleComplete}
                  disabled={completing}
                  style={{
                    display:"flex", alignItems:"center", gap:8,
                    padding:"10px 22px", borderRadius:8, fontSize:14,
                    fontWeight:700, border:"none",
                    cursor: completing ? "not-allowed" : "pointer",
                    background: completing ? "var(--border)" : "var(--accent)",
                    color: completing ? "var(--text-placeholder)" : "var(--bg-card)"
                  }}
                >
                  {completing ? <><SpinnerIcon /> Generating Report…</> : <>Finish Interview <ChevronRight /></>}
                </button>
              )}
            </div>

          </main>
        </div>
      </motion.div>
    </>
  );
}