// InterviewGuidelinesPage.jsx — Guidelines screen before the interview starts

import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { startSession } from "../../services/interviewService";
import "../../interview-dark.css";

function Logo() {
  return (
    <div className="idk-logo" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
      <img src="/logo-dark-final.png" alt="InterviewPilot" style={{ height: 48, objectFit: "contain" }} />
    </div>
  );
}

export default function InterviewGuidelinesPage() {
  const { id }   = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const session   = location.state?.session || JSON.parse(sessionStorage.getItem(`interview_session_${id}`) || "null");
  const firstName = session?.candidateName?.split(" ")[0] || "there";

  const [agreed,    setAgreed]    = useState(false);
  const [starting,  setStarting]  = useState(false);
  const [error,     setError]     = useState("");

  const handleStart = async () => {
    if (!agreed) return;
    setStarting(true);
    setError("");
    try {
      const resumeText = sessionStorage.getItem(`interview_resume_${id}`) || "";
      const data = await startSession(session._id, resumeText);
      if (data.success) {
        const activeSession = data.session;
        sessionStorage.setItem(`interview_session_${id}`, JSON.stringify(activeSession));
        navigate(`/interview/${id}`, { state: { session: activeSession } });
      } else {
        setError(data.message || "Could not start the interview.");
        setStarting(false);
      }
    } catch (e) {
      setError(e.response?.data?.message || "Could not start the interview. Please try again.");
      setStarting(false);
    }
  };

  if (!session) {
    navigate("/");
    return null;
  }

  return (
    <div className="ip-dark" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav className="idk-navbar">
        <Logo />
      </nav>

      {/* Header */}
      <div style={{ padding: "32px 32px 0", maxWidth: 720, margin: "0 auto", width: "100%" }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#ffffff", marginBottom: 4 }}>
          Hi {firstName}!
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em", marginBottom: 8 }}>
          Welcome to your AI Mock Interview
        </h1>
        <p style={{ fontSize: 14, color: "#b0b0b0", lineHeight: 1.65 }}>
          This is just like a standard interview where the interviewer will ask a few simple questions.
        </p>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ padding: "24px 32px 40px", maxWidth: 720, margin: "0 auto", width: "100%" }}
      >
        <div className="idk-card" style={{ padding: "24px 28px", marginBottom: 20 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 16 }}>
            Duration: <span style={{ fontWeight: 600, color: "#b0b0b0" }}>15–20 minutes</span>
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", marginBottom: 12 }}>Guidelines:</p>
          <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Find a quiet, well-lit space with stable internet",
              "Use earphones for better audio quality",
              "Ensure you dress neatly. Sit upright with your face clearly visible",
              "Give detailed responses for a better score",
            ].map((g, i) => (
              <li key={i} style={{ fontSize: 14, color: "#b0b0b0", lineHeight: 1.6 }}>{g}</li>
            ))}
          </ul>
        </div>

        {/* Consent checkbox */}
        <label
          style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", marginBottom: 24 }}
        >
          <div
            onClick={() => setAgreed(!agreed)}
            style={{
              width: 20, height: 20, borderRadius: 4, flexShrink: 0, marginTop: 2,
              border: `2px solid ${agreed ? "#1e88e5" : "#555"}`,
              background: agreed ? "#1e88e5" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s", cursor: "pointer"
            }}
          >
            {agreed && (
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M1.5 5.5L4 8L9.5 2.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span style={{ fontSize: 13, color: "#b0b0b0", lineHeight: 1.65 }}>
            I understand that cheating (reading answers, using phone, getting help from others, switching tabs, etc.) will result in disqualification.
          </span>
        </label>

        {/* Error */}
        {error && (
          <div style={{ background: "#2a1515", border: "1px solid #ef4444", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ef4444", marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* CTA button */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <button
            className="idk-btn-blue"
            disabled={!agreed || starting}
            onClick={handleStart}
            style={{ width: "100%", maxWidth: 380, padding: "14px 40px", fontSize: 15 }}
          >
            {starting ? "Starting your interview…" : "I'm ready to continue"}
          </button>
          <p style={{ fontSize: 12, color: "#8a8a8a", textAlign: "center", maxWidth: 400, lineHeight: 1.6 }}>
            By clicking 'I'm ready to continue', you agree for this session to be recorded and shared with recruiters.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
