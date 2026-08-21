//creating JoinInterviewPage
// Rebuilt dark-theme start screen — Start Card + Past Interviews list + Resume modal

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { joinSession } from "../../services/interviewService";
import "../../interview-dark.css";

function Logo() {
  return (
    <div className="idk-logo" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
      <img src="/logo-dark-final.png" alt="InterviewPilot" style={{ height: 48, objectFit: "contain" }} />
    </div>
  );
}

// get relative time
function relativeTime(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)  return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff/60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)} hours ago`;
  return `${Math.floor(diff/86400)} days ago`;
}

// resume modal
function ResumeModal({ onContinue, onClose }) {
  const [resumeText, setResumeText] = useState("");
  return (
    <div className="idk-overlay ip-dark" onClick={onClose}>
      <motion.div
        className="idk-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#ffffff", marginBottom: 8 }}>
          Personalize your interview
        </h2>
        <p style={{ fontSize: 14, color: "#b0b0b0", marginBottom: 20, lineHeight: 1.6 }}>
          Paste your resume or a brief summary of your experience. We'll use this to generate questions tailored to your background.
        </p>
        <textarea
          value={resumeText}
          onChange={e => setResumeText(e.target.value)}
          placeholder="e.g. I have 2 years of experience in React and Node.js, built 3 full-stack projects..."
          rows={6}
          style={{
            width: "100%", background: "#1c1c1c", border: "1px solid #2e2e2e",
            borderRadius: 10, padding: "12px 14px", color: "#ffffff",
            fontSize: 14, fontFamily: "inherit", resize: "vertical",
            outline: "none", marginBottom: 20, lineHeight: 1.6,
            boxSizing: "border-box"
          }}
        />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="idk-btn-outline-dark" onClick={onClose}>Cancel</button>
          <button
            className="idk-btn-blue"
            onClick={() => onContinue(resumeText)}
            disabled={!resumeText.trim()}
          >
            Continue →
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function JoinInterviewPage() {
  const { token } = useParams();
  const navigate  = useNavigate();

  const [session,  setSession]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [showResumeModal, setShowResumeModal] = useState(false);

  // check token and get session data on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await joinSession(token);
        if (data.success) {
          if (data.accessToken) {
              localStorage.setItem('token', data.accessToken);
              if (data.user) {
                  localStorage.setItem('user', JSON.stringify(data.user));
              }
          }
          setSession(data.session);
        } else {
          setError(data.message || "Invalid interview link.");
        }
      } catch (e) {
        // log error for developer
        console.error("joinSession error:", e);
        // show error to user
        setError(
          e.response?.data?.message ||
          "This link may be expired or invalid. Please contact your recruiter."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  /* step 2: when student confirms their resume, store it in sessionStorage
  and navigate to the system check — startSession is called later from the guidelines page */
  // note: guidelines page will read this resume text later
  const handleResumeConfirm = (resumeText) => {
    sessionStorage.setItem(`interview_resume_${session._id}`, resumeText);
    setShowResumeModal(false);
    navigate(`/interview/${session._id}/check`, { state: { session } });
  };

  // check if loading
  if (loading) {
    return (
      <div className="ip-dark" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div className="idk-spinner" />
          <p style={{ color: "#b0b0b0", fontSize: 14 }}>Validating your interview link...</p>
        </div>
      </div>
    );
  }

  // check if link is invalid or expired
  if (error) {
    return (
      <div className="ip-dark" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "1.5rem" }}>
        <div className="idk-card" style={{ padding: 40, maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#ffffff", marginBottom: 12 }}>Link Unavailable</h1>
          <p style={{ fontSize: 13, color: "#b0b0b0", lineHeight: 1.6 }}>{error}</p>
        </div>
      </div>
    );
  }

  // check if already completed
  if (session?.status === "completed") {
    return (
      <div className="ip-dark" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "1rem" }}>
        <div className="idk-card" style={{ padding: 40, maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#ffffff", marginBottom: 12 }}>Interview Completed</h1>
          <p style={{ fontSize: 13, color: "#b0b0b0", marginBottom: 20 }}>You have already completed this interview.</p>
          <button
            className="idk-btn-blue"
            style={{ width: "100%" }}
            onClick={() => navigate(`/interview/${session._id}/report`)}
          >
            View My Report
          </button>
        </div>
      </div>
    );
  }

  /* ready state — show the start card and past interviews list
  note: pastSessions is only available if the backend populates it on the join response */
  /* past sessions list (from session.pastsessions if provided) */
  const pastSessions = session?.pastSessions || [];
  const firstName = session?.candidateName?.split(" ")[0] || "there";

  return (
    <div className="ip-dark" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* header with logo */}
      <nav className="idk-navbar">
        <Logo />
      </nav>

      {/* main content area */}
      <div style={{ flex: 1, padding: "28px 24px", maxWidth: 800, margin: "0 auto", width: "100%" }}>
        {/* Go back */}
        <button className="idk-back" onClick={() => window.history.back()}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Go back
        </button>

        {/* start card — shows what the student is about to walk into */}
        <motion.div
          className="idk-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ padding: "40px 32px", textAlign: "center", marginBottom: 24 }}
        >
          <p style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", marginBottom: 6 }}>
            Hi {firstName}!
          </p>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em", marginBottom: 12 }}>
            Ready to ace your next Interview?
          </h1>
          <p style={{ fontSize: 14, color: "#b0b0b0", lineHeight: 1.65, marginBottom: 28, maxWidth: 540, margin: "0 auto 28px" }}>
            Practice with our advanced AI Interviewer and{" "}
            <span style={{ color: "#1e88e5" }}>get instant feedback</span>{" "}
            and improve your confidence.
          </p>
          <button
            className="idk-btn-blue"
            style={{ minWidth: 220, fontSize: 16, padding: "14px 40px" }}
            onClick={() => setShowResumeModal(true)}
          >
            Start new interview
          </button>
        </motion.div>

        {/* Past interviews */}
        {pastSessions.length > 0 && (
          <motion.div
            className="idk-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{ padding: "20px 24px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="#b0b0b0" strokeWidth="1.4"/>
                <path d="M8 4.5V8L10.5 10" stroke="#b0b0b0" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#ffffff" }}>Your past Interviews</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pastSessions.map((ps, i) => (
                <div
                  key={i}
                  className="ip-flex-wrap"
                  style={{
                    background: "#232323", border: "1px solid #2e2e2e", borderRadius: 10,
                    padding: "14px 18px",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#ffffff" }}>{ps.role}</span>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#8a8a8a", display: "inline-block" }} />
                      <span style={{ fontSize: 14, color: "#b0b0b0", textTransform: "capitalize" }}>{ps.difficulty || "Fresher"}</span>
                    </div>
                    <span style={{ fontSize: 12, color: "#8a8a8a" }}>{relativeTime(ps.createdAt)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <span style={{ fontSize: 13, color: "#8a8a8a", textAlign: "right", maxWidth: 200 }}>
                      {ps.status === "completed"
                        ? "Interview completed."
                        : ps.status === "active"
                          ? "You've exited before completing your interview."
                          : "Interview not completed."}
                    </span>
                    {ps.status !== "completed" && (
                      <button
                        className="idk-btn-outline-white"
                        onClick={() => navigate(`/interview/join/${ps.inviteToken || token}`)}
                        style={{ fontSize: 13, padding: "8px 16px", whiteSpace: "nowrap" }}
                      >
                        Retake Interview
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* resume modal — shown when student clicks Start new interview */}
      <AnimatePresence>
        {showResumeModal && (
          <ResumeModal
            onContinue={handleResumeConfirm}
            onClose={() => setShowResumeModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
