// InterviewRoomPage.jsx — dark-theme interview room
// Layout: sticky dark navbar → two video panels → transcription block
// Coding: Monaco editor in a slide-up drawer when type === 'coding'

import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import { submitCode, completeSession } from "../../services/interviewService";
import { getVideoUploadParams, submitVideoAnswer } from "../../services/interviewService";
import "../../interview-dark.css";

// max recording duration is 120s
const MAX_DURATION = 120;

const LANG_MONACO_MAP = {
  javascript: "javascript",
  python: "python",
  cpp: "cpp",
  java: "java",
};

function Spinner({ size = 20, color = "#1e88e5" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `2px solid #2e2e2e`, borderTopColor: color,
      animation: "idk-spin 0.7s linear infinite", flexShrink: 0
    }} />
  );
}

// exit confirm modal
function ExitModal({ onCancel, onExit }) {
  return (
    <div className="idk-overlay ip-dark">
      <motion.div
        className="idk-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.18 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: "50%", background: "#ef4444",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            <span style={{ fontSize: 20 }}>!</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#ffffff", margin: 0 }}>Confirm exit?</h2>
        </div>
        <p style={{ fontSize: 14, color: "#b0b0b0", marginBottom: 24, lineHeight: 1.6 }}>
          Exiting now will erase progress and affect your application.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="idk-btn-outline-dark" onClick={onCancel}>Continue interview</button>
          <button className="idk-btn-red" onClick={onExit}>Exit now</button>
        </div>
      </motion.div>
    </div>
  );
}

// ended early screen
function EndedEarlyScreen({ sessionId, navigate }) {
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(t);
          navigate("/student/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [navigate]);

  return (
    <div className="ip-dark" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px", gap: 24 }}>
      {/* Close icon */}
      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#1c1c1c", border: "1px solid #2e2e2e", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        onClick={() => navigate("/student/dashboard")}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 2l12 12M14 2L2 14" stroke="#b0b0b0" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>

      <div className="idk-card" style={{ padding: "36px 32px", maxWidth: 520, width: "100%", textAlign: "center" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#ffffff", marginBottom: 16 }}>
          Interview ended early
        </h2>
        <p style={{ fontSize: 14, color: "#b0b0b0", lineHeight: 1.7 }}>
          You've exited before completing your interview. You have one final opportunity to reattempt it.
          If you experienced technical issues, please contact{" "}
          <a href="mailto:support@interviewpilot.ai" style={{ color: "#1e88e5", textDecoration: "none" }}>
            support@interviewpilot.ai
          </a>{" "}
          for assistance.
        </p>
      </div>

      <p style={{ fontSize: 13, color: "#8a8a8a" }}>
        Redirecting to dashboard in <strong style={{ color: "#ffffff" }}>{countdown}s</strong>
      </p>
    </div>
  );
}

/* video recorder stream management — inline equivalent of VideoRecorder.jsx's
   getUserMedia logic. UI is handled by the interview room panels directly */
function useCameraStream() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const start = async () => {
    if (streamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) {
      console.error("Camera error:", e);
    }
  };

  const stop = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  return { videoRef, streamRef, start, stop };
}

export default function InterviewRoomPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const sessionData = location.state?.session;
  const savedSession = sessionData || JSON.parse(sessionStorage.getItem(`interview_session_${id}`) || "null");
  const [session] = useState(savedSession);

  const [currentIndex, setCurrentIndex] = useState(session?.currentQuestionIndex || 0);
  const [answered, setAnswered] = useState(
    JSON.parse(sessionStorage.getItem(`interview_answered_${id}`) || "{}")
  );
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [showExit, setShowExit] = useState(false);
  const [exitedEarly, setExitedEarly] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");

  /* Coding state */
  const [showCodeDrawer, setShowCodeDrawer] = useState(false);
  const [code, setCode] = useState("// Write your solution here\n\n");
  const [language, setLanguage] = useState("javascript");
  const [submitting, setSubmitting] = useState(false);
  const [codeResults, setCodeResults] = useState(null);

  /* Recording state */
  const [recPhase, setRecPhase] = useState("idle"); // idle|ready|recording|uploading|evaluating
  const [elapsed, setElapsed] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { videoRef, streamRef, start: startCamera, stop: stopCamera } = useCameraStream();
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => { if (!session) navigate("/login"); }, [session, navigate]);
  useEffect(() => { if (session) sessionStorage.setItem(`interview_session_${id}`, JSON.stringify(session)); }, [id, session]);
  useEffect(() => { sessionStorage.setItem(`interview_answered_${id}`, JSON.stringify(answered)); }, [id, answered]);

  // start camera on mount and clean up on unmount
  useEffect(() => {
    startCamera();
    return () => { stopCamera(); clearInterval(timerRef.current); };
  }, []);

  // sync stream to video element
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [recPhase]);

  // clean up camera stream when question changes
  useEffect(() => {
    setFeedback(null); setCodeResults(null); setError("");
    setTranscript("");
    setCode("// Write your solution here\n\n");
    setShowCodeDrawer(false);
    setRecPhase("idle"); setElapsed(0); setUploadProgress(0);
  }, [currentIndex]);

  if (!session) return null;

  const questions = session.questions || [];
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isCoding = currentQuestion?.type === "coding";
  const allAnswered = questions.length > 0 && Object.keys(answered).length >= questions.length;
  const fullName = session.candidateName || "Candidate";
  const firstName = fullName.split(" ")[0];

  // start recording
  const startRecording = async () => {
    if (!streamRef.current) await startCamera();
    if (!streamRef.current) return;
    chunksRef.current = [];
    setElapsed(0);
    const options = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
      ? { mimeType: "video/webm;codecs=vp8,opus" }
      : undefined;
    const recorder = new MediaRecorder(streamRef.current, options);
    recorderRef.current = recorder;
    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      await uploadAndSubmit(blob);
    };
    recorder.start(250);
    setRecPhase("recording");
    timerRef.current = setInterval(() => {
      setElapsed(prev => {
        if (prev + 1 >= MAX_DURATION) { stopRecording(); return MAX_DURATION; }
        return prev + 1;
      });
    }, 1000);
  };

  // stop recording
  const stopRecording = () => {
    clearInterval(timerRef.current);
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setRecPhase("uploading");
  };

  // upload video to cloudinary
  const uploadAndSubmit = async (blob) => {
    setError("");
    try {
      // get upload params from backend
      const paramsRes = await getVideoUploadParams(id, currentIndex);
      const { uploadParams } = paramsRes;
      // build form data
      const form = new FormData();
      form.append("file", blob);
      form.append("public_id", uploadParams.publicId);
      form.append("timestamp", uploadParams.timestamp);
      form.append("signature", uploadParams.signature);
      form.append("api_key", uploadParams.apiKey);

      // upload to cloudinary
      const cloudUrl = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadParams.uploadUrl);
        xhr.upload.onprogress = e => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          try { resolve(JSON.parse(xhr.responseText).secure_url); }
          catch { reject(new Error("cloudinary response parse error")); }
        };
        xhr.onerror = () => reject(new Error("upload network error"));
        xhr.send(form);
      });

      // submit video url to backend
      setRecPhase("evaluating");
      const result = await submitVideoAnswer({ sessionId: id, questionIndex: currentIndex, videoUrl: cloudUrl });
      // save feedback and show evaluation panel
      setFeedback(result.evaluation);
      if (result.transcript) setTranscript(result.transcript);
      setAnswered(prev => ({ ...prev, [currentIndex]: true }));
      setRecPhase("done");
    } catch (e) {
      // log error for developer
      console.error("VideoRecorder upload error :", e);
      setError(`Upload failed: ${e.message}`);
      setRecPhase("ready");
    }
  };

  // handle coding submission
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

  // navigation handlers
  const handleNext = () => {
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

  const handleExitConfirm = () => {
    stopCamera();
    clearInterval(timerRef.current);
    setExitedEarly(true);
    setShowExit(false);
  };

  // format time to mm:ss
  const formatTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // check if exited early
  if (exitedEarly) {
    return <EndedEarlyScreen sessionId={id} navigate={navigate} />;
  }

  const isRecording = recPhase === "recording";
  const candidateActive = recPhase === "recording" || recPhase === "ready";

  return (
    <>
      <div className="ip-dark" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* navbar */}
        <nav
          className="idk-navbar"
          style={{ justifyContent: "space-between" }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src="/logo-dark-final.png" alt="InterviewPilot" style={{ height: 48, objectFit: "contain" }} />
          </div>
          <button
            className="idk-btn-outline-white"
            onClick={() => setShowExit(true)}
            style={{ padding: "8px 18px", fontSize: 14 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Exit
          </button>
        </nav>

        {/* video panels */}
        <div
          className="idk-video-panels"
          style={{ display: "flex", gap: 16, padding: "16px 16px 0", flex: "0 0 auto" }}
        >
          {/* Left: Interviewer panel */}
          <div
            style={{
              flex: 1, position: "relative",
              background: "#1a1a1a", border: "1px solid #2e2e2e",
              borderRadius: 14, overflow: "hidden",
              aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center",
              outline: !candidateActive ? "2.5px solid #1e88e5" : "none"
            }}
          >
            {/* Interviewer avatar circle */}
            <div style={{
              width: 120, height: 120, borderRadius: "50%",
              overflow: "hidden", border: "3px solid #2e2e2e",
              background: "#111"
            }}>
              <img
                src="/ira-avatar.png"
                alt="IRA"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { e.target.style.display = "none"; }}
              />
            </div>
            {/* Name pill */}
            <div className="idk-name-pill">Interviewer (IRA)</div>
          </div>

          {/* Right: Candidate panel */}
          <div
            style={{
              flex: 1, position: "relative",
              background: "#1a1a1a",
              borderRadius: 14, overflow: "hidden",
              aspectRatio: "4/3",
              border: candidateActive ? "2.5px solid #1e88e5" : "1px solid #2e2e2e",
              transition: "border 0.2s"
            }}
          >
            <video
              ref={videoRef}
              autoPlay muted playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            {/* Rec badge */}
            {(recPhase === "recording" || recPhase === "uploading" || recPhase === "evaluating") && (
              <div className="idk-rec-badge">
                <div className="idk-rec-dot" />
                Rec
              </div>
            )}
            {/* Name pill */}
            <div className="idk-name-pill">{fullName}</div>
          </div>
        </div>

        {/* transcription block */}
        <div style={{ padding: "16px" }}>
          <div className="idk-transcription">
            <span className="idk-transcription-label">Transcription</span>
            <p style={{
              fontSize: 18, fontWeight: 700, color: "#ffffff",
              lineHeight: 1.55, marginBottom: transcript ? 12 : 0
            }}>
              {currentQuestion?.question || "Loading question…"}
            </p>
            {transcript && (
              <p style={{ fontSize: 14, color: "#b0b0b0", lineHeight: 1.65, fontStyle: "italic" }}>
                "{transcript}"
              </p>
            )}
            {!transcript && (
              <p style={{ fontSize: 13, color: "#8a8a8a", marginTop: 6 }}>
                {recPhase === "recording" ? "Listening to your answer…" :
                  recPhase === "uploading" ? `Uploading… ${uploadProgress}%` :
                    recPhase === "evaluating" ? "Evaluating your answer…" :
                      recPhase === "done" ? "Answer submitted." :
                        isCoding ? "Open the code editor below to write your solution." :
                          "Click 'Start Recording' to answer."}
              </p>
            )}
          </div>
        </div>

        {/* recording controls (non-coding questions) */}
        {!isCoding && !feedback && recPhase !== "done" && (
          <div style={{ padding: "0 16px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            {recPhase === "idle" && (
              <button className="idk-btn-blue" onClick={startRecording} style={{ minWidth: 180 }}>
                ● Start Recording
              </button>
            )}
            {recPhase === "ready" && (
              <button className="idk-btn-blue" onClick={startRecording} style={{ minWidth: 180 }}>
                ● Start Recording
              </button>
            )}
            {recPhase === "recording" && (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 13, color: "#ef4444", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  <div className="idk-rec-dot" style={{ position: "static" }} />
                  {formatTime(elapsed)} / {formatTime(MAX_DURATION)}
                </span>
                <button
                  onClick={stopRecording}
                  style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 999, padding: "10px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >
                  ⏹ Stop & Submit
                </button>
              </div>
            )}
            {(recPhase === "uploading" || recPhase === "evaluating") && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Spinner />
                <span style={{ fontSize: 13, color: "#b0b0b0" }}>
                  {recPhase === "uploading" ? `Uploading… ${uploadProgress}%` : "Evaluating your answer…"}
                </span>
              </div>
            )}
          </div>
        )}

        {/* coding toggle button */}
        {isCoding && !feedback && (
          <div style={{ padding: "0 16px 16px", display: "flex", justifyContent: "center" }}>
            <button
              className="idk-btn-blue"
              onClick={() => setShowCodeDrawer(!showCodeDrawer)}
              style={{ minWidth: 200 }}
            >
              {showCodeDrawer ? "▼ Hide Code Editor" : "💻 Open Code Editor"}
            </button>
          </div>
        )}

        {/* error */}
        {error && (
          <div style={{ margin: "0 16px 16px", background: "#1a0808", border: "1px solid #ef4444", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#ef4444" }}>
            {error}
          </div>
        )}

        {/* ai feedback panel */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ margin: "0 16px 16px", background: "#1c1c1c", border: "1px solid #2e2e2e", borderRadius: 14, overflow: "hidden" }}
            >
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #2e2e2e", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1e88e5" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>AI Evaluation</span>
                <span style={{ fontSize: 12, color: "#8a8a8a", marginLeft: "auto" }}>Powered by Gemini</span>
              </div>
              <div style={{ padding: 20 }}>
                {/* Scores */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                  {[
                    feedback.contentScore !== undefined && { label: "Content", score: feedback.contentScore },
                    feedback.communicationScore !== undefined && { label: "Communication", score: feedback.communicationScore },
                    feedback.clarityScore !== undefined && { label: "Clarity", score: feedback.clarityScore },
                    feedback.vocabularyScore !== undefined && { label: "Vocabulary", score: feedback.vocabularyScore },
                    feedback.structureScore !== undefined && { label: "Structure", score: feedback.structureScore },
                    feedback.score !== undefined && feedback.contentScore === undefined && { label: "Score", score: feedback.score },
                  ].filter(Boolean).map((m, i) => (
                    <div key={i} style={{ background: "#232323", border: "1px solid #2e2e2e", borderRadius: 10, padding: "10px 14px", textAlign: "center", minWidth: 80 }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#1e88e5", marginBottom: 4 }}>{m.score}<span style={{ fontSize: 11, color: "#8a8a8a" }}>/10</span></div>
                      <div style={{ fontSize: 11, color: "#b0b0b0", fontWeight: 600 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
                {feedback.feedback && (
                  <div style={{ background: "#232323", border: "1px solid #2e2e2e", borderRadius: 10, padding: "14px 18px" }}>
                    <p style={{ margin: 0, fontSize: 14, color: "#b0b0b0", lineHeight: 1.7 }}>{feedback.feedback}</p>
                  </div>
                )}
                {codeResults && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8a8a8a", marginBottom: 10 }}>
                      Test Results — {codeResults.filter(r => r.passed).length}/{codeResults.length} passed
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {codeResults.map((r, i) => (
                        <div key={i} className="ip-flex-wrap" style={{
                          display: "flex", gap: 10, alignItems: "center",
                          padding: "10px 14px", borderRadius: 8, fontFamily: "var(--mono)", fontSize: 12,
                          background: r.passed ? "#0d1f12" : "#1f0d0d",
                          border: `1px solid ${r.passed ? "#22c55e" : "#ef4444"}`
                        }}>
                          <span style={{ color: r.passed ? "#22c55e" : "#ef4444", fontWeight: 700, fontSize: 16, width: 24, flexShrink: 0 }}>{r.passed ? "✓" : "✗"}</span>
                          <div style={{ flex: 1, minWidth: 100 }}><div style={{ fontSize: 9, color: "#8a8a8a", textTransform: "uppercase", marginBottom: 2 }}>Input</div>{r.input || "—"}</div>
                          <div style={{ flex: 1, minWidth: 100 }}><div style={{ fontSize: 9, color: "#8a8a8a", textTransform: "uppercase", marginBottom: 2 }}>Expected</div>{r.expectedOutput}</div>
                          <div style={{ flex: 1, minWidth: 100 }}><div style={{ fontSize: 9, color: "#8a8a8a", textTransform: "uppercase", marginBottom: 2 }}>Got</div><span style={{ color: r.passed ? "#22c55e" : "#ef4444" }}>{r.actualOutput || r.error || "—"}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Next / Finish buttons */}
              <div style={{ padding: "14px 20px", borderTop: "1px solid #2e2e2e", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                {!isLastQuestion ? (
                  <button
                    className="idk-btn-blue"
                    onClick={handleNext}
                  >
                    Next Question →
                  </button>
                ) : (
                  allAnswered ? (
                    <button
                      className="idk-btn-blue"
                      disabled={completing}
                      onClick={handleComplete}
                    >
                      {completing ? <><Spinner size={16} color="#fff" /> Generating Report…</> : "Finish Interview & Get Report →"}
                    </button>
                  ) : (
                    <span style={{ fontSize: 13, color: "#8a8a8a" }}>Answer all questions to finish.</span>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* skip button */}
        {!feedback && !isLastQuestion && (
          <div style={{ padding: "0 16px 24px", display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleNext}
              style={{
                background: "transparent", color: "#8a8a8a",
                border: "1px solid #2e2e2e", borderRadius: 8,
                padding: "8px 16px", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s"
              }}
            >
              Skip this question
            </button>
          </div>
        )}

        {/* finish when all answered (no feedback yet) */}
        {!feedback && isLastQuestion && allAnswered && (
          <div style={{ padding: "0 16px 24px", display: "flex", justifyContent: "center" }}>
            <button
              className="idk-btn-blue"
              disabled={completing}
              onClick={handleComplete}
              style={{ minWidth: 200 }}
            >
              {completing ? "Generating Report…" : "Finish Interview →"}
            </button>
          </div>
        )}


        {/* code drawer (slide up) */}
        <AnimatePresence>
          {showCodeDrawer && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0,
                height: "55vh", zIndex: 150,
                background: "#111", border: "1px solid #2e2e2e",
                borderRadius: "16px 16px 0 0",
                display: "flex", flexDirection: "column",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.6)"
              }}
            >
              {/* Drawer header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #2e2e2e" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>💻 Code Editor</span>
                  <span style={{ fontSize: 11, color: "#8a8a8a" }}>Monaco · Judge0 execution</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* Language selector */}
                  <div style={{ display: "flex", gap: 2, background: "#1c1c1c", borderRadius: 8, padding: 3 }}>
                    {["javascript", "python", "cpp", "java"].map(lang => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        disabled={submitting}
                        style={{
                          padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                          border: "none", cursor: submitting ? "not-allowed" : "pointer", transition: "all 0.15s",
                          background: language === lang ? "#1e88e5" : "transparent",
                          color: language === lang ? "#fff" : "#8a8a8a",
                          fontFamily: "inherit"
                        }}
                      >{lang}</button>
                    ))}
                  </div>
                  {/* Run button */}
                  <button
                    className="idk-btn-blue"
                    onClick={handleSubmitCode}
                    disabled={submitting || !code.trim()}
                    style={{ padding: "7px 18px", fontSize: 13 }}
                  >
                    {submitting ? <><Spinner size={14} color="#fff" /> Running…</> : "Run & Submit →"}
                  </button>
                  {/* Close */}
                  <button onClick={() => setShowCodeDrawer(false)} style={{ background: "transparent", border: "none", color: "#8a8a8a", cursor: "pointer", padding: 4 }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                  </button>
                </div>
              </div>
              {/* Monaco editor */}
              <div style={{ flex: 1, overflow: "hidden" }}>
                <Editor
                  height="100%"
                  language={LANG_MONACO_MAP[language]}
                  value={code}
                  onChange={val => setCode(val || "")}
                  theme="vs-dark"
                  options={{
                    fontSize: 13, lineHeight: 22, minimap: { enabled: false },
                    scrollBeyondLastLine: false, wordWrap: "on", automaticLayout: true,
                    readOnly: submitting, fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    padding: { top: 14, bottom: 14 }, renderLineHighlight: "all",
                    smoothScrolling: true, cursorBlinking: "smooth",
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* exit modal */}
        <AnimatePresence>
          {showExit && (
            <ExitModal
              onCancel={() => setShowExit(false)}
              onExit={handleExitConfirm}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}