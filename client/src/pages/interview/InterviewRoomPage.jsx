// InterviewRoomPage.jsx — dark-theme interview room
// Layout: sticky dark navbar → two video panels → transcription block
// Coding: Monaco editor in a slide-up drawer when type === 'coding'

import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { submitVideoAnswer, getVideoUploadParams, completeSession } from "../../services/interviewService";
import "../../interview-dark.css";

// max recording duration is 120s
const MAX_DURATION = 120;

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



  /* Recording state */
  const [recPhase, setRecPhase] = useState("idle"); // idle|prep|recording|uploading|evaluating
  const [prepCountdown, setPrepCountdown] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [activeUploads, setActiveUploads] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const { videoRef, streamRef, start: startCamera, stop: stopCamera } = useCameraStream();
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // Watch for completion of all uploads when finishing
  useEffect(() => {
    if (isFinishing && activeUploads === 0 && !completing) {
      setCompleting(true);
      setError("");
      (async () => {
        try {
          const data = await completeSession(id);
          if (data.success) {
            const completedSession = { ...session, status: "completed", report: data.report };
            sessionStorage.setItem(`interview_session_${id}`, JSON.stringify(completedSession));
            navigate(`/interview/${id}/report`, { state: { session: completedSession, report: data.report } });
          } else {
            setError(data.message || "Could not complete interview.");
            setCompleting(false);
          }
        } catch (e) {
          setError(e.response?.data?.message || "Connection error. Please try again.");
          setCompleting(false);
        }
      })();
    }
  }, [isFinishing, activeUploads, completing, id, session, navigate]);

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
    setFeedback(null); setError("");
    setTranscript("");

    // Calculate dynamic prep time
    const qText = session?.questions?.[currentIndex]?.text || "";
    const words = qText.split(" ").length;
    const calculatedPrepTime = Math.min(Math.max(Math.ceil(words / 3), 5), 30);
    setPrepCountdown(calculatedPrepTime);

    setRecPhase("prep"); setElapsed(0); setUploadProgress(0);
  }, [currentIndex, session]);

  // auto-prep countdown
  useEffect(() => {
    if (recPhase === "prep") {
      if (prepCountdown <= 0) {
        startRecording();
        return;
      }
      const t = setInterval(() => {
        setPrepCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(t);
    }
  }, [recPhase, prepCountdown]);

  if (!session) return null;

  const questions = session.questions || [];
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
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

    // Capture the current index for this specific recording closure
    const captureIndex = currentIndex;

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      startBackgroundUpload(blob, captureIndex);
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

  // stop recording and INSTANTLY transition UI
  const stopRecording = () => {
    clearInterval(timerRef.current);
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop(); // This triggers recorder.onstop asynchronously
    }

    if (currentIndex === session.questions.length - 1) {
      setRecPhase("done");
      setIsFinishing(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // background upload process (detached from UI blocking)
  const startBackgroundUpload = async (blob, qIndex) => {
    setActiveUploads(prev => prev + 1);
    try {
      const paramsRes = await getVideoUploadParams(id, qIndex);
      const { uploadParams } = paramsRes;

      const form = new FormData();
      form.append("file", blob);
      form.append("public_id", uploadParams.publicId);
      form.append("timestamp", uploadParams.timestamp);
      form.append("signature", uploadParams.signature);
      form.append("api_key", uploadParams.apiKey);

      const cloudUrl = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadParams.uploadUrl);
        xhr.onload = () => {
          try { resolve(JSON.parse(xhr.responseText).secure_url); }
          catch { reject(new Error("cloudinary response parse error")); }
        };
        xhr.onerror = () => reject(new Error("upload network error"));
        xhr.send(form);
      });

      await submitVideoAnswer({ sessionId: id, questionIndex: qIndex, videoUrl: cloudUrl });
      setAnswered(prev => ({ ...prev, [qIndex]: true }));

    } catch (e) {
      console.error(`Background upload error for Q${qIndex}:`, e);
      // Optionally could show a non-blocking toast notification here
    } finally {
      setActiveUploads(prev => prev - 1);
    }
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

  if (isFinishing) {
    return (
      <div className="ip-dark" style={{ display: "flex", flexDirection: "column", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <Spinner size={40} color="#1e88e5" />
          <h2 style={{ color: "#ffffff", margin: 0, fontSize: 24, fontWeight: 700 }}>Completing Interview...</h2>
          <p style={{ color: "#b0b0b0", margin: 0, fontSize: 15 }}>Please wait while we finalize your responses and generate your report.</p>
          <div style={{ color: "#1e88e5", fontWeight: 700, marginTop: 10, fontSize: 14 }}>
            {activeUploads > 0 ? `${activeUploads} background task(s) remaining...` : "Finishing up..."}
          </div>
        </div>
      </div>
    );
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
                {recPhase === "prep" ? `Get ready... recording starts in ${prepCountdown}s` :
                  recPhase === "recording" ? "Listening to your answer…" :
                    recPhase === "uploading" ? `Uploading… ${uploadProgress}%` :
                      recPhase === "evaluating" ? "Saving your answer…" :
                        recPhase === "done" ? "Answer submitted." : ""}
              </p>
            )}
          </div>
        </div>

        {/* recording controls */}
        {!feedback && recPhase !== "done" && (
          <div style={{ padding: "0 16px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            {(recPhase === "prep" || recPhase === "recording") && (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 13, color: recPhase === "recording" ? "#ef4444" : "#8a8a8a", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  {recPhase === "recording" && <div className="idk-rec-dot" style={{ position: "static" }} />}
                  {recPhase === "prep" ? `Starting in ${prepCountdown}s` : `${formatTime(elapsed)} / ${formatTime(MAX_DURATION)}`}
                </span>
                {recPhase === "recording" && (
                  <button
                    onClick={stopRecording}
                    style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 999, padding: "10px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    ⏹ Finish Answer
                  </button>
                )}
              </div>
            )}
            {(recPhase === "uploading" || recPhase === "evaluating") && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Spinner />
                <span style={{ fontSize: 13, color: "#b0b0b0" }}>
                  {recPhase === "uploading" ? `Uploading… ${uploadProgress}%` : "Saving your answer…"}
                </span>
              </div>
            )}
          </div>
        )}

        {/* error */}
        {error && (
          <div style={{ margin: "0 16px 16px", background: "#1a0808", border: "1px solid #ef4444", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#ef4444" }}>
            {error}
          </div>
        )}

        {/* skip button */}
        {recPhase === "idle" && !isLastQuestion && (
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

        {/* finish when all answered */}
        {isLastQuestion && allAnswered && (
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