//creating JoinInterviewPage

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { joinSession, startSession } from "../../services/interviewService";

export default function JoinInterviewPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [resumeText, setResumeText] = useState("");

  /* step 1: on mount, validate the token and fetch session data */
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await joinSession(token);
        if (data.success) {
          setSession(data.session);
        } else {
          setError(data.message || "Invalid interview link.");
        }
      } catch (e) {
        /* inform to the developer */
        console.error("joinSession error:", e);
        /* inform to the user */
        setError(
          e.response?.data?.message ||
          "This link may be expired or invalid. Please contact your recruiter."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [token]);

  /* step 2: when student clicks Start Interview, mark session active
  and navigate to the interview room */
  const handleStart = async () => {
    if (!resumeText.trim()) {
      setError("Please provide your resume summary to personalize your interview.");
      return;
    }
    setStarting(true);
    try {
      const data = await startSession(session._id, resumeText);
      if (data.success) {
        /* navigate to the interview room, passing session data via state
        so the room page does not need to re-fetch */
        const activeSession = data.session;
        sessionStorage.setItem(`interview_session_${session._id}`, JSON.stringify(activeSession));
        navigate(`/interview/${session._id}`, { state: { session: activeSession } });
      } else {
        setError(data.message || "Could not start the interview.");
        setStarting(false);
      }
    } catch (e) {
      /* inform to the developer */
      console.error("startSession error:", e);
      /* inform to the user */
      setError(e.response?.data?.message || "Could not start the interview. Please try again.");
      setStarting(false);
    }
  };

  /* loading state */
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#e4e8ee", fontFamily: "var(--font-sans)", fontSize: 14 }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="ip-text-secondary text-[14px]">Validating your interview link...</p>
        </div>
      </div>
    );
  }

  /* error state — expired / invalid link */
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
          <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>
            Link Unavailable
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>{error}</p>
        </div>
      </div>
    );
  }

  /* already completed */
  if (session?.status === "completed") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "1rem", background: "#e4e8ee", fontFamily: "var(--font-sans)", fontSize: 14 }}>
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
          <div style={{ fontSize: 40 }}>✅</div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>
            Interview Completed
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, marginBottom: 8 }}>
            You have already completed this interview.
          </p>
          <button
            onClick={() => navigate(`/interview/${session._id}/report`)}
            style={{ fontSize: 14, color: "#ffffff", background: "#1d9e75", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontWeight: 500, width: "100%" }}
          >
            View My Report
          </button>
        </div>
      </div>
    );
  }

  /* ready state — show session info and start button */
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "1rem", background: "#e4e8ee", fontFamily: "var(--font-sans)", fontSize: 14 }}>

      <div style={{ width: "100%", maxWidth: 500, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* header with logo */}
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #0f6e56 0%, #1d9e75 100%)", boxShadow: "0 4px 12px rgba(29, 158, 117, 0.3)", marginBottom: 12 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>
            Personalize Your Interview
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, marginTop: 4 }}>
            Provide your resume to generate 10 questions tailored exactly to your background.
          </p>
        </div>

        {/* session info card — shows what the student is about to walk into */}
        <div style={{
          background: "#ffffff",
          border: "0.5px solid #dde1e8",
          borderRadius: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          padding: 32,
          display: "flex",
          flexDirection: "column",
          gap: 20
        }}>


          {/* resume input */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", margin: 0, marginBottom: 8 }}>
              Your Resume Summary
            </p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, marginBottom: 12 }}>
              Paste your resume or a summary of your experience below. We will use this to generate personalized interview questions just for you.
            </p>
            <textarea
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                setError("");
              }}
              placeholder="e.g. I have 3 years of experience in React and Node.js..."
              style={{
                width: "100%",
                minHeight: 120,
                padding: "12px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                fontSize: 13,
                fontFamily: "var(--font-sans)",
                resize: "vertical",
                background: "#f8fafc",
                outline: "none"
              }}
            />
          </div>

          {/* divider */}
          <div style={{ borderTop: "0.5px solid var(--border)" }} />

          {/* submit button */}
          <button
            onClick={handleStart}
            disabled={starting}
            style={{ fontSize: 14, color: "#ffffff", background: "#1d9e75", border: "none", borderRadius: 8, padding: "12px 16px", cursor: starting ? "not-allowed" : "pointer", fontWeight: 500, width: "100%", marginTop: 4, opacity: starting ? 0.7 : 1 }}
          >
            {starting ? "Generating your personalized interview..." : "Start Interview →"}
          </button>
        </div>

        {/* footer info */}
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)" }}>
          © 2026 InterviewPilot · Powered by Gemini AI
        </p>
      </div>
    </div>
  );
}
