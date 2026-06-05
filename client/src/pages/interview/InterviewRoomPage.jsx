//creating InterviewRoomPage

import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { submitAnswer, submitCode, completeSession } from "../../services/interviewService";


export default function InterviewRoomPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  /* step 1 :extract session data passed via navigation state from JoinInterviewPage */
  const sessionData = location.state?.session;
  const [session, setSession] = useState(sessionData);

  /* step 2 :extract which question the student is currently looking at */
  const [currentIndex, setCurrentIndex] = useState(session?.currentQuestionIndex || 0);
  const [answer, setAnswer] = useState("");

  /* step 3 :extract code editor state for the coding question */
  const [code, setCode] = useState("// Write your solution here\n\n");
  const [language, setLanguage] = useState("javascript");

  /* loading and feedback states */
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); 
  const [codeResults, setCodeResults] = useState(null); 
  const [error, setError] = useState("");

  /* step 4 :track which questions have been answered */
  const [answered, setAnswered] = useState({});

  /* completing state */
  const [completing, setCompleting] = useState(false);

  const textareaRef = useRef(null);

  /* condition :if no session data was passed,
  redirect back to login for now */
  useEffect(() => {
    if (!session) {
      navigate("/login");
    }
  }, [session, navigate]);

  if (!session) return null;

  const questions = session.questions || [];
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isCoding = currentQuestion?.type === "coding";
  const allAnswered = questions.length > 0 && Object.keys(answered).length >= questions.length;

  /* submit an hr or technical answer */
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    setFeedback(null);
    setError("");

    try {
      const data = await submitAnswer({
        sessionId: id,
        questionIndex: currentIndex,
        answer
      });

      if (data.success) {
        /* show the Gemini score and feedback inline */
        setFeedback(data.evaluation);
        setAnswered(prev => ({ ...prev, [currentIndex]: true }));
      } else {
        setError(data.message || "Could not submit answer.");
      }
    } catch (e) {
      /* inform to the developer */
      console.error("submitAnswer error:", e);
      /* inform to the user */
      setError(e.response?.data?.message || "Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
    setAnswer("");
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
        navigate(`/interview/${id}/report`);
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
    <div className="min-h-screen ip-bg-page flex flex-col">

      {/* top bar: progress and question counter */}
      <nav className="ip-navbar sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="InterviewPilot" className="w-7 h-7 rounded-lg" />
          <span className="ip-text-primary font-bold text-[13px]">
            {session.role} Interview
          </span>
          <span className="ip-badge ip-badge-neutral capitalize">{session.difficulty}</span>
        </div>

        <div className="flex-1 mx-6">
          {/* progress bar across all questions */}
          <div className="w-full h-1.5 ip-bg-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <span className="ip-text-secondary text-[12px] font-medium">
          Q{currentIndex + 1} / {questions.length}
        </span>
      </nav>

      {/* main interview layout */}
      <div className="flex flex-1 gap-0 max-w-6xl mx-auto w-full px-6 py-6">

        {/* left: question sidebar */}
        <div className="w-48 shrink-0 hidden lg:flex flex-col gap-1 mr-6">
          <p className="ip-text-muted text-[10px] uppercase tracking-widest font-bold mb-2">Questions</p>
          {questions.map((q, i) => (
            <button
              key={i}
              onClick={() => {
                /* condition :only allow navigation to already-answered questions */
                if (answered[i] || i === currentIndex) {
                  setCurrentIndex(i);
                  setAnswer("");
                  setFeedback(null);
                  setCodeResults(null);
                  setError("");
                }
              }}
              className={`text-left px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${
                i === currentIndex
                  ? "bg-primary-500/20 ip-text-primary border border-primary-500/30"
                  : answered[i]
                  ? "ip-text-accent opacity-80"
                  : "ip-text-muted opacity-50 cursor-not-allowed"
              }`}
            >
              {/* question type label */}
              <span className="block text-[9px] uppercase tracking-wider opacity-60 mb-0.5">
                {q.type}
              </span>
              {/* truncated question text */}
              {q.question.slice(0, 40)}…
            </button>
          ))}
        </div>

        {/* right: question + answer area */}
        <div className="flex-1 flex flex-col gap-4">

          {/* question card */}
          <div className="ip-card">
            <div className="ip-card-body">
              {/* question type badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="ip-badge ip-badge-primary capitalize">{currentQuestion?.type}</span>
                {currentQuestion?.topic && (
                  <span className="ip-badge ip-badge-neutral">{currentQuestion.topic}</span>
                )}
              </div>

              {/* the question text */}
              <p className="ip-text-primary text-[15px] leading-relaxed font-medium">
                {currentQuestion?.question}
              </p>

              {/* test cases for coding questions */}
              {isCoding && currentQuestion?.testCases?.length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                  <p className="ip-text-muted text-[11px] uppercase tracking-widest font-bold">
                    Sample Test Cases
                  </p>
                  {currentQuestion.testCases.map((tc, i) => (
                    <div key={i} className="ip-bg-subtle rounded-lg p-3 font-mono text-[12px]">
                      <span className="ip-text-muted">Input: </span>
                      <span className="ip-text-primary">{tc.input || "(none)"}</span>
                      <br />
                      <span className="ip-text-muted">Expected: </span>
                      <span className="ip-text-accent">{tc.expectedOutput}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* answer area — textarea for hr/technical, code for coding */}
          {!isCoding ? (
            /* hr / technical answer textarea */
            <div className="ip-card">
              <div className="ip-card-body">
                <label className="ip-label">Your Answer</label>
                <textarea
                  ref={textareaRef}
                  className="ip-input resize-none"
                  rows={6}
                  placeholder="Type your answer here in as much detail as you can..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={!!feedback || submitting}
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] ip-text-muted">{answer.length} chars</span>
                </div>
              </div>
            </div>
          ) : (
            /* coding problem — language selector + code textarea */
            <div className="ip-card">
              <div className="ip-card-header">
                <span className="ip-card-title">Code Editor</span>
                {/* language selector */}
                <div className="flex gap-1">
                  {["javascript", "python", "cpp", "java"].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      disabled={!!feedback || submitting}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${
                        language === lang
                          ? "bg-primary-500 text-white"
                          : "ip-bg-subtle ip-text-muted"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
              <div className="ip-card-body p-0">
                <textarea
                  className="w-full font-mono text-[13px] ip-bg-subtle ip-text-primary p-4 resize-none outline-none rounded-b-xl"
                  rows={14}
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
            <div className="ip-alert ip-alert-danger">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1" />
              <span>{error}</span>
            </div>
          )}

          {/* gemini feedback card — shown after submission */}
          {feedback && (
            <div className="ip-card border border-primary-500/20 animate-fade-up">
              <div className="ip-card-body flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] ip-text-muted font-bold uppercase tracking-widest">
                    AI Evaluation
                  </span>
                  <span className={`text-[22px] font-black font-display ${scoreColor(feedback.score)}`}>
                    {feedback.score}/10
                  </span>
                </div>
                <p className="ip-text-secondary text-[13px] leading-relaxed">{feedback.feedback}</p>

                {/* test case results for coding question */}
                {codeResults && (
                  <div className="flex flex-col gap-2 mt-1">
                    <p className="ip-text-muted text-[11px] uppercase tracking-widest font-bold">
                      Test Results — {codeResults.filter(r => r.passed).length}/{codeResults.length} passed
                    </p>
                    {codeResults.map((r, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2 px-3 py-2 rounded-lg text-[12px] font-mono ${
                          r.passed ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        <span>{r.passed ? "✓" : "✗"}</span>
                        <div>
                          <span className="opacity-60">Input: </span>{r.input || "(none)"}<br />
                          <span className="opacity-60">Expected: </span>{r.expectedOutput}<br />
                          <span className="opacity-60">Got: </span>{r.actualOutput || r.error || "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* action buttons */}
          <div className="flex items-center justify-between">

            {/* submit button — only shown if not yet answered */}
            {!feedback ? (
              <button
                onClick={isCoding ? handleSubmitCode : handleSubmitAnswer}
                disabled={submitting || (isCoding ? !code.trim() : !answer.trim())}
                className="btn-primary"
              >
                {submitting
                  ? (isCoding ? "Running code..." : "Evaluating...")
                  : (isCoding ? "Submit Code →" : "Submit Answer →")}
              </button>
            ) : (
              /* after feedback: next question or complete */
              isLastQuestion ? (
                allAnswered ? (
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    className="btn-primary"
                  >
                    {completing ? "Generating Report..." : "Finish Interview & Get Report →"}
                  </button>
                ) : (
                  <span className="ip-text-muted text-[12px]">Answer all questions to finish.</span>
                )
              ) : (
                <button onClick={handleNext} className="btn-primary">
                  Next Question →
                </button>
              )
            )}

            {/* skip button — moves forward without submitting */}
            {!feedback && !isLastQuestion && (
              <button
                onClick={handleNext}
                className="btn-secondary text-[12px]"
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
