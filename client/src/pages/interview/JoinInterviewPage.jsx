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
    setStarting(true);
    try {
      await startSession(session._id);
      /* navigate to the interview room, passing session data via state
      so the room page does not need to re-fetch */
      const activeSession = { ...session, status: "active" };
      sessionStorage.setItem(`interview_session_${session._id}`, JSON.stringify(activeSession));
      navigate(`/interview/${session._id}`, { state: { session: activeSession } });
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
      <div className="min-h-screen ip-bg-page flex items-center justify-center">
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
      <div className="min-h-screen ip-bg-page flex items-center justify-center p-6">
        <div className="ip-card max-w-md w-full text-center">
          <div className="ip-card-body py-10 flex flex-col gap-4">
            <div className="text-5xl">⚠️</div>
            <h1 className="text-[22px] font-display font-black ip-text-primary tracking-tight">
              Link Unavailable
            </h1>
            <p className="ip-text-secondary text-[13px] leading-relaxed">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  /* already completed */
  if (session?.status === "completed") {
    return (
      <div className="min-h-screen ip-bg-page flex items-center justify-center p-4 md:p-6">
        <div className="ip-card max-w-md w-full text-center">
          <div className="ip-card-body py-10 flex flex-col gap-4">
            <div className="text-5xl">✅</div>
            <h1 className="text-[22px] font-display font-black ip-text-primary tracking-tight">
              Interview Completed
            </h1>
            <p className="ip-text-secondary text-[13px]">
              You have already completed this interview.
            </p>
            <button
              onClick={() => navigate(`/interview/${session._id}/report`)}
              className="btn-primary"
            >
              View My Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ready state — show session info and start button */
  return (
    <div className="min-h-screen ip-bg-page flex items-center justify-center p-4 md:p-6">

      <div className="w-full max-w-lg flex flex-col gap-6">

        {/* header with logo */}
        <div className="text-center">
          <img src="/logo.svg" alt="InterviewPilot" className="w-14 h-14 rounded-2xl mx-auto mb-3 shadow-lg" />
          <h1 className="text-[26px] font-display font-black ip-text-primary tracking-[-1px]">
            You&apos;re Invited!
          </h1>
          <p className="ip-text-secondary text-[13px] mt-1">
            A recruiter has invited you to complete an AI-powered interview.
          </p>
        </div>

        {/* session info card — shows what the student is about to walk into */}
        <div className="ip-card">
          <div className="ip-card-body flex flex-col gap-5">

            {/* role + difficulty */}
            <div className="flex items-start justify-between">
              <div>
                <p className="ip-text-muted text-[11px] uppercase tracking-widest font-bold mb-1">Role</p>
                <p className="ip-text-primary font-black text-[20px] font-display tracking-tight">
                  {session?.role}
                </p>
              </div>
              <span className="ip-badge ip-badge-primary capitalize">{session?.difficulty}</span>
            </div>

            {/* divider */}
            <div className="border-t ip-border-top" />

            {/* what to expect section */}
            <div>
              <p className="ip-text-muted text-[11px] uppercase tracking-widest font-bold mb-3">
                What to Expect
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { icon: "🧠", text: "2 behavioural / HR questions" },
                  { icon: "⚡", text: "4 technical concept questions" },
                  { icon: "💻", text: "1-2 live coding problems" },
                  { icon: "📊", text: "AI-graded report at the end" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[18px]">{item.icon}</span>
                    <span className="ip-text-secondary text-[13px]">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* divider */}
            <div className="border-t ip-border-top" />

            {/* tips */}
            <div className="ip-alert ip-alert-info">
              <span className="text-[18px]">💡</span>
              <span className="ip-text-secondary text-[12px]">
                Find a quiet place, answer in full sentences, and take your time.
                Once you start you cannot pause the interview.
              </span>
            </div>

            {/* submit button */}
            <button
              onClick={handleStart}
              disabled={starting}
              className="btn-primary w-full py-3 text-[14px]"
            >
              {starting ? "Starting..." : "Start Interview →"}
            </button>
          </div>
        </div>

        {/* footer info */}
        <p className="text-center text-[11px] ip-text-muted">
          © 2026 InterviewPilot · Powered by Gemini AI
        </p>
      </div>
    </div>
  );
}
