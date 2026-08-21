// SystemCheckPage.jsx — 5-step sequential system check before the interview
// Steps: Internet speed → Camera & Mic → Microphone → Speakers → Screen sharing

import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../../interview-dark.css";

function Logo() {
  return (
    <div className="idk-logo" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
      <img src="/logo-dark-final.png" alt="InterviewPilot" style={{ height: 48, objectFit: "contain" }} />
    </div>
  );
}

const CheckSvg = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M2.5 6.5L5 9L10.5 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const MicSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6"/>
  </svg>
);
const SpeakerSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>
  </svg>
);
const ScreenSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    <path d="M9 11l3-3 3 3M12 8v5"/>
  </svg>
);
const WifiSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/>
  </svg>
);
const CamSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>
  </svg>
);

/* step states */
// 'pending' | 'running' | 'pass' | 'fail'

const STEPS = [
  { id: "internet",  label: "Internet speed",           Icon: WifiSvg  },
  { id: "camera",    label: "Camera and microphone access", Icon: CamSvg   },
  { id: "mic",       label: "Microphone",                Icon: MicSvg   },
  { id: "speaker",   label: "Speakers",                  Icon: SpeakerSvg },
];

/* status icon */
function StatusIcon({ status }) {
  if (status === "pass") {
    return (
      <div className="idk-check-icon">
        <CheckSvg />
      </div>
    );
  }
  if (status === "running") {
    return <div className="idk-check-icon-spinner" />;
  }
  if (status === "fail") {
    return (
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
    );
  }
  // pending
  return (
    <div className="idk-check-icon-active" style={{ color: "#8a8a8a" }} />
  );
}

/* checklist row */
function CheckRow({ step, status, isActive, onAction, children }) {
  const isVisible = status !== "pending" || isActive;
  return (
    <div className="idk-check-row" style={{ opacity: !isVisible ? 0.45 : 1, transition: "opacity 0.2s" }}>
      <StatusIcon status={status} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          fontSize: 14, fontWeight: 600,
          color: status === "pass" ? "#ffffff" : status === "fail" ? "#ef4444" : "#ffffff"
        }}>
          {step.label}
        </span>
        {isActive && status !== "pass" && children}
      </div>
    </div>
  );
}

export default function SystemCheckPage() {
  const { id }     = useParams();
  const location   = useLocation();
  const navigate   = useNavigate();

  const session    = location.state?.session || JSON.parse(sessionStorage.getItem(`interview_session_${id}`) || "null");
  const firstName  = session?.candidateName?.split(" ")[0] || "there";
  const fullName   = session?.candidateName || "Candidate";

  /* current step status */
  const [statuses, setStatuses] = useState({
    internet: "running",
    camera:   "pending",
    mic:      "pending",
    speaker:  "pending",
  });
  const [activeStep, setActiveStep]   = useState("internet");
  const [speedInfo,  setSpeedInfo]    = useState(null);  // { down, up }
  const [allPassed,  setAllPassed]    = useState(false);

  /* camera preview */
  const videoRef   = useRef(null);
  const streamRef  = useRef(null);

  /* step runners */

  /* test internet speed */
  const runInternetTest = async () => {
    setStatus("internet", "running");
    try {
      const start = Date.now();
      const res   = await fetch("https://www.cloudflare.com/cdn-cgi/trace", { cache: "no-store" });
      await res.text();
      const rtt = Date.now() - start;
      // Estimate: good if RTT < 1500ms
      const estDown = (1024 * 8) / (rtt / 1000) / 1000; // rough estimate kb
      const passed  = rtt < 2000;
      setSpeedInfo({ rtt, passed });
      setStatus("internet", passed ? "pass" : "fail");
      if (passed) advance("internet", "camera");
    } catch {
      setStatus("internet", "fail");
      setSpeedInfo({ rtt: 9999, passed: false });
    }
  };

  /* test camera and mic */
  const runCameraTest = async () => {
    setStatus("camera", "running");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStatus("camera", "pass");
      advance("camera", "mic");
    } catch {
      setStatus("camera", "fail");
    }
  };

  /* test microphone audio tracks */
  const runMicTest = async () => {
    setStatus("mic", "running");
    try {
      // Ensure we have a stream
      if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      }
      const audioTracks = streamRef.current.getAudioTracks();
      if (audioTracks.length > 0 && audioTracks[0].readyState === "live") {
        setStatus("mic", "pass");
        advance("mic", "speaker");
      } else {
        setStatus("mic", "fail");
      }
    } catch {
      setStatus("mic", "fail");
    }
  };

  /* test speaker with short beep */
  const runSpeakerTest = async () => {
    setStatus("speaker", "running");
    setActiveStep("speaker");
  };

  const handlePlayAudio = async () => {
    try {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
      osc.start(); osc.stop(ctx.currentTime + 0.8);
      osc.onended = () => {
        setStatus("speaker", "pass");
        setAllPassed(true);
      };
    } catch {
      setStatus("speaker", "fail");
    }
  };



  /* set status */
  const setStatus = (id, val) => {
    setStatuses(prev => ({ ...prev, [id]: val }));
  };

  /* go to next step */
  const advance = (current, next) => {
    setActiveStep(next);
    setStatuses(prev => ({ ...prev, [current]: "pass" }));
  };

  /* auto-run steps in sequence */
  useEffect(() => { runInternetTest(); }, []);

  useEffect(() => {
    if (activeStep === "camera")  runCameraTest();
    if (activeStep === "mic")     runMicTest();
    if (activeStep === "speaker") runSpeakerTest();
  }, [activeStep]);

  /* cleanup camera stream */
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  /* sync stream to video */
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [statuses.camera]);

  const handleJoinInterview = () => {
    navigate(`/interview/${id}/guidelines`, { state: { session } });
  };

  return (
    <div className="ip-dark" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav className="idk-navbar">
        <Logo />
      </nav>

      {/* Header */}
      <div style={{ padding: "32px 32px 0", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#ffffff", marginBottom: 4 }}>
          Hi {firstName}!
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em", marginBottom: 8 }}>
          Welcome to your AI Mock Interview
        </h1>
        <p style={{ fontSize: 14, color: "#b0b0b0", lineHeight: 1.65 }}>
          Before starting, we'll be running a short system check to make sure everything works seamlessly.
        </p>
      </div>

      {/* Two-column body */}
      <div
        className="idk-two-col ip-flex-wrap"
        style={{ display: "flex", gap: 24, padding: "24px 32px 100px", maxWidth: 1100, margin: "0 auto", width: "100%", flex: 1 }}
      >
        {/* Left — checklist */}
        <div className="idk-card" style={{ flex: "1 1 400px", minWidth: 0, padding: "8px 24px" }}>
          {STEPS.map(step => {
            const status   = statuses[step.id];
            const isActive = activeStep === step.id;
            return (
              <CheckRow key={step.id} step={step} status={status} isActive={isActive}>
                {/* active content for step */}
                {step.id === "mic" && status !== "pass" && (
                  <div style={{ marginTop: 8 }}>
                    <p style={{ fontSize: 13, color: "#b0b0b0", marginBottom: 10 }}>
                      Please say —{" "}
                      <strong style={{ color: "#facc15" }}>"I am ready to start the interview."</strong>
                    </p>
                    <button className="idk-btn-white" style={{ fontSize: 13, padding: "8px 20px" }}>
                      Speak now
                    </button>
                  </div>
                )}
                {step.id === "speaker" && status === "running" && (
                  <div style={{ marginTop: 8 }}>
                    <p style={{ fontSize: 13, color: "#b0b0b0", marginBottom: 10 }}>
                      Click to play audio.
                    </p>
                    <button className="idk-btn-white" onClick={handlePlayAudio} style={{ fontSize: 13, padding: "8px 20px" }}>
                      Play
                    </button>
                  </div>
                )}
                {step.id === "internet" && status === "fail" && speedInfo && (
                  <div style={{ marginTop: 8 }}>
                    <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 4 }}>
                      Your internet connection does not meet the requirements.
                    </p>
                    <p style={{ fontSize: 12, color: "#8a8a8a", marginBottom: 10 }}>
                      RTT: {speedInfo.rtt}ms · Recommended: &lt; 2000ms
                    </p>
                    <button className="idk-btn-white" onClick={runInternetTest} style={{ fontSize: 13, padding: "8px 20px" }}>
                      Try again
                    </button>
                  </div>
                )}
                {step.id === "camera" && status === "fail" && (
                  <div style={{ marginTop: 8 }}>
                    <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 10 }}>
                      Camera or microphone access was denied. Please allow access and try again.
                    </p>
                    <button className="idk-btn-white" onClick={runCameraTest} style={{ fontSize: 13, padding: "8px 20px" }}>
                      Try again
                    </button>
                  </div>
                )}
              </CheckRow>
            );
          })}
        </div>

        {/* Right — live camera preview */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              position: "relative", borderRadius: 16, overflow: "hidden",
              background: "#1a1a1a", border: "1px solid #2e2e2e",
              aspectRatio: "4/3", width: "100%"
            }}
          >
            <video
              ref={videoRef}
              autoPlay muted playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            {/* Name pill */}
            <div className="idk-name-pill">{fullName}</div>
          </div>
        </div>
      </div>

      {/* join button when all passed */}
      <AnimatePresence>
        {allPassed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0,
              background: "#0d0d0d", borderTop: "1px solid #2e2e2e",
              padding: "16px 32px", display: "flex", justifyContent: "center",
              zIndex: 50
            }}
          >
            <button
              className="idk-btn-blue"
              onClick={handleJoinInterview}
              style={{ width: "100%", maxWidth: 560, padding: "15px 40px", fontSize: 16 }}
            >
              Join Interview
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
