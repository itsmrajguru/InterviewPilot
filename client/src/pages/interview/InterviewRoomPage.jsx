//creating InterviewRoomPage

import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { submitCode, completeSession } from "../../services/interviewService";
import VideoRecorder from "../../components/VideoRecorder";


export default function InterviewRoomPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  /* step 1 :extract session data passed via navigation state from JoinInterviewPage */
  const sessionData = location.state?.session;
  const savedSession = sessionData || JSON.parse(sessionStorage.getItem(`interview_session_${id}`) || "null");
  const [session] = useState(savedSession);

  /* step 2 :extract which question the student is currently looking at */
  const [currentIndex, setCurrentIndex] = useState(session?.currentQuestionIndex || 0);

  /* step 3 :extract code editor state for the coding question */
  const [code, setCode] = useState("// Write your solution here\n\n");
  const [language, setLanguage] = useState("javascript");

  /* loading and feedback states */
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [codeResults, setCodeResults] = useState(null);
  const [error, setError] = useState("");

  /* step 4 :track which questions have been answered */

  const [answered, setAnswered] = useState(JSON.parse(sessionStorage.getItem(`interview_answered_${id}`) || "{}"));

  /* completing state */
  const [completing, setCompleting] = useState(false);

  /* condition :if no session data was found,
  redirect back to login for now */
  useEffect(() => {
    if (!session) {
      navigate("/login");
    }
  }, [session, navigate]);

  /* condition :save the interview data, so refresh does not remove it */
  useEffect(() => {
    if (session) {
      sessionStorage.setItem(`interview_session_${id}`, JSON.stringify(session));
    }
  }, [id, session]);

  /* condition :save answered questions also, so refresh does not reset them */
  useEffect(() => {
    sessionStorage.setItem(`interview_answered_${id}`, JSON.stringify(answered));
  }, [id, answered]);

  if (!session) return null;

  const questions = session.questions || [];
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isCoding = currentQuestion?.type === "coding";
  const allAnswered = questions.length > 0 && Object.keys(answered).length >= questions.length;

  /* submit code to judge0 and gemini */
  const handleSubmitCode = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    setCodeResults(null);
    setFeedback(null);
    setError("");

    try {
      const data = await submitCode({
        sessionId: id,
        code,
        language,
        questionIndex: currentIndex
      });

      if (data.success) {
        setCodeResults(data.testResults);
        setFeedback(data.evaluation);
        setAnswered(prev => ({ ...prev, [currentIndex]: true }));
      } else {
        setError(data.message || "Code execution failed.");
      }
    } catch (e) {
      /* inform to the developer */
      console.error("submitCode error:", e);
      /* inform to the user */
      setError(e.response?.data?.message || "Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* move to the next question */
  const handleNext = () => {
    setCode("// Write your solution here\n\n");
    setFeedback(null);
    setCodeResults(null);
    setError("");
    setCurrentIndex(prev => prev + 1);
  };

  /* complete the interview — gemini generates the final report */
  const handleComplete = async () => {
    setCompleting(true);
    setError("");
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
      /* inform to the developer */
      console.error("completeSession error:", e);
      /* inform to the user */
      setError(e.response?.data?.message || "Connection error. Please try again.");
      setCompleting(false);
    }
  };


  const scoreColor = (score) => {
    if (score >= 8) return "text-green-400";
    if (score >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#e4e8ee", fontFamily: "var(--font-sans)", fontSize: 14 }}>

      {/* top bar: progress and question counter */}
      <nav style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", background: "#ffffff", borderBottom: "0.5px solid #dde1e8", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logo.svg" alt="InterviewPilot" style={{ width: 28, height: 28, borderRadius: 8 }} />
          <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>
            {session.role} Interview
          </span>
          <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, fontWeight: 500, background: "var(--surface-1)", color: "var(--text-secondary)", border: "0.5px solid var(--border)", textTransform: "capitalize" }}>
            {session.difficulty}
          </span>
        </div>

        <div style={{ flex: 1, margin: "0 24px", maxWidth: 600 }}>
          {/* progress bar across all questions */}
          <div style={{ width: "100%", height: 6, background: "var(--surface-1)", borderRadius: 10, overflow: "hidden" }}>
            <div
              style={{ height: "100%", background: "#1d9e75", borderRadius: 10, transition: "all 0.5s", width: `${((currentIndex) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>
          Q{currentIndex + 1} / {questions.length}
        </span>
      </nav>

      {/* main interview layout */}
      <div style={{ display: "flex", flex: 1, gap: 24, maxWidth: 1152, margin: "0 auto", width: "100%", padding: "24px 16px" }}>

        {/* left: question sidebar */}
        <div style={{ width: 192, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 8 }}>Questions</p>
          {questions.map((q, i) => {
            const isActive = i === currentIndex;
            const isAnswered = answered[i];
            const isDisabled = !isAnswered && !isActive;
            return (
              <button
                key={i}
                onClick={() => {
                  if (!isDisabled) {
                    setCurrentIndex(i);
                    setCode("// Write your solution here\n\n");
                    setFeedback(null);
                    setCodeResults(null);
                    setError("");
                  }
                }}
                disabled={isDisabled}
                style={{
                  textAlign: "left", padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 500, transition: "all 0.2s", cursor: isDisabled ? "not-allowed" : "pointer",
                  background: isActive ? "#e6f4ea" : "transparent",
                  color: isActive ? "#1d9e75" : (isAnswered ? "#0f6e56" : "var(--text-muted)"),
                  border: isActive ? "0.5px solid #a7dfc9" : "0.5px solid transparent",
                  opacity: isDisabled ? 0.5 : (isAnswered && !isActive ? 0.8 : 1)
                }}
              >
                {/* question type label */}
                <span style={{ display: "block", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.6, marginBottom: 2 }}>
                  {q.type}
                </span>
                {/* truncated question text */}
                {q.question.slice(0, 40)}…
              </button>
            );
          })}
        </div>

        {/* right: question + answer area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* question card */}
          <div style={{
            background: "#ffffff",
            border: "0.5px solid #dde1e8",
            borderRadius: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            padding: 24,
          }}>
            <div>
              {/* question type badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, fontWeight: 500, background: "#e6f4ea", color: "#1d9e75", border: "0.5px solid #a7dfc9", textTransform: "capitalize" }}>{currentQuestion?.type}</span>
                {currentQuestion?.topic && (
                  <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, fontWeight: 500, background: "var(--surface-1)", color: "var(--text-secondary)", border: "0.5px solid var(--border)" }}>{currentQuestion.topic}</span>
                )}
              </div>

              {/* the question text */}
              <p style={{ fontSize: 15, color: "var(--text-primary)", lineHeight: 1.6, fontWeight: 500, margin: 0 }}>
                {currentQuestion?.question}
              </p>

              {/* test cases for coding questions */}
              {isCoding && currentQuestion?.testCases?.length > 0 && (
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", margin: 0 }}>
                    Sample Test Cases
                  </p>
                  {currentQuestion.testCases.map((tc, i) => (
                    <div key={i} style={{ background: "var(--surface-1)", borderRadius: 8, padding: 12, fontFamily: "monospace", fontSize: 12 }}>
                      <span style={{ color: "var(--text-muted)" }}>Input: </span>
                      <span style={{ color: "var(--text-primary)" }}>{tc.input || "(none)"}</span>
                      <br />
                      <span style={{ color: "var(--text-muted)" }}>Expected: </span>
                      <span style={{ color: "#1d9e75" }}>{tc.expectedOutput}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>          {/* answer area */}
          {!isCoding ? (
            /* hr / technical — video recorder only, no text mode */
            <div>
              {!feedback && (
                <VideoRecorder
                  sessionId={id}
                  questionIndex={currentIndex}
                  onSubmitted={(evaluation) => {
                    setFeedback(evaluation);
                    setAnswered(prev => ({ ...prev, [currentIndex]: true }));
                  }}
                />
              )}
            </div>
          ) : (
            /* coding problem — language selector + code textarea */
            <div style={{
              background: "#ffffff",
              border: "0.5px solid #dde1e8",
              borderRadius: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
              overflow: "hidden"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "0.5px solid var(--border)" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Code Editor</span>

                {/* language selector */}
                <div style={{ display: "flex", gap: 4 }}>
                  {["javascript", "python", "cpp", "java"].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      disabled={!!feedback || submitting}
                      style={{
                        padding: "4px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", transition: "all 0.15s", border: "none", cursor: (!!feedback || submitting) ? "not-allowed" : "pointer",
                        background: language === lang ? "#1d9e75" : "var(--surface-1)",
                        color: language === lang ? "#ffffff" : "var(--text-muted)"
                      }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ padding: 0 }}>
                <textarea
                  style={{ width: "100%", fontFamily: "monospace", fontSize: 13, background: "#1e1e1e", color: "#d4d4d4", padding: 16, resize: "none", outline: "none", minHeight: 300, border: "none" }}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={!!feedback || submitting}
                  spellCheck={false}
                />
              </div>
            </div>
          )}

          {/* error message */}
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "12px 16px", borderRadius: 8, background: "#fef2f2", color: "#b91c1c", border: "0.5px solid #fecaca" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}              {/* gemini feedback card */}
          {feedback && (
            <div style={{
              background: "#ffffff",
              border: "0.5px solid #dde1e8",
              borderRadius: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
              padding: 24,
              marginTop: 16
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div style={{ background: "var(--surface-1)", padding: 16, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 4 }}>Content Score</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>{feedback.contentScore ?? feedback.score}/10</div>
                </div>
                <div style={{ background: "var(--surface-1)", padding: 16, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 4 }}>Communication</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#1d9e75" }}>
                    {feedback.communicationScore}/10
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                <div style={{ background: "var(--surface-1)", padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 4 }}>Clarity</div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>{feedback.clarityScore}/10</div>
                </div>
                <div style={{ background: "var(--surface-1)", padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 4 }}>Vocabulary</div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>{feedback.vocabularyScore}/10</div>
                </div>
                <div style={{ background: "var(--surface-1)", padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 4 }}>Structure</div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>{feedback.structureScore}/10</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                {feedback.feedback}
              </p>

              {/* coding question test case results */}
              {codeResults && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", margin: 0 }}>
                    Test Results — {codeResults.filter(r => r.passed).length}/{codeResults.length} passed
                  </p>
                  {codeResults.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px", borderRadius: 8, fontSize: 12, fontFamily: "monospace",
                        background: r.passed ? "#f0fdf4" : "#fef2f2",
                        color: r.passed ? "#15803d" : "#b91c1c",
                        border: r.passed ? "0.5px solid #bbf7d0" : "0.5px solid #fecaca"
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{r.passed ? "✓" : "✗"}</span>
                      <div>
                        <span style={{ opacity: 0.6 }}>Input: </span>{r.input || "(none)"}<br />
                        <span style={{ opacity: 0.6 }}>Expected: </span>{r.expectedOutput}<br />
                        <span style={{ opacity: 0.6 }}>Got: </span>{r.actualOutput || r.error || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* action buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>

            {/* submit button — coding only, video answers self-submit */}
            {!feedback && isCoding ? (
              <button
                onClick={handleSubmitCode}
                disabled={submitting || !code.trim()}
                style={{ fontSize: 14, color: "#ffffff", background: "#1d9e75", border: "none", borderRadius: 8, padding: "10px 16px", cursor: (submitting || !code.trim()) ? "not-allowed" : "pointer", fontWeight: 500 }}
              >
                {submitting ? "Running code..." : "Submit Code →"}
              </button>
            ) : (
              /* after feedback: next question or complete */
              feedback ? (
                isLastQuestion ? (
                  allAnswered ? (
                    <button
                      onClick={handleComplete}
                      disabled={completing}
                      style={{ fontSize: 14, color: "#ffffff", background: "#1d9e75", border: "none", borderRadius: 8, padding: "10px 16px", cursor: completing ? "not-allowed" : "pointer", fontWeight: 500 }}
                    >
                      {completing ? "Generating Report..." : "Finish Interview & Get Report →"}
                    </button>
                  ) : (
                    <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Answer all questions to finish.</span>
                  )
                ) : (
                  <button onClick={handleNext} style={{ fontSize: 14, color: "#ffffff", background: "#1d9e75", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontWeight: 500 }}>
                    Next Question →
                  </button>
                )
              ) : <div />
            )}

            {/* skip button */}
            {!feedback && !isLastQuestion && (
              <button
                onClick={handleNext}
                style={{ fontSize: 12, color: "var(--text-secondary)", background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 500 }}
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
