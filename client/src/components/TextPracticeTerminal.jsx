import { useState, useRef, useEffect } from "react";

/* TextPracticeTerminal component
   self-contained chat widget that lives inside StudentDashboard.
   no camera, no db, no session — pure text chat with gemini via backend */
export default function TextPracticeTerminal() {

  /* phase state machine */
  const [phase, setPhase]           = useState("setup");
  const [role, setRole]             = useState("");
  const [currentQuestion, setCQ]    = useState("");
  const [userInput, setUserInput]   = useState("");
  const [messages, setMessages]     = useState([]);
  const [questionNumber, setQN]     = useState(1);
  const [loading, setLoading]       = useState(false);
  const [summary, setSummary]       = useState(null);
  const [previousQA, setPreviousQA] = useState([]);

  const chatEndRef  = useRef(null);
  const inputRef    = useRef(null);

  /* scroll to bottom whenever messages change */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* step 1 :start a new text practice session */
  const handleStart = async () => {
    if (!role.trim() || loading) return;
    setLoading(true);
    try {
      const res  = await fetch("/api/interviews/text-practice/start", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ role: role.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setCQ(data.firstQuestion);
        setMessages([{ role: "ai", content: data.firstQuestion }]);
        setPhase("chatting");
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } catch (e) {
      console.log("handleStart Error :", e);
    } finally {
      setLoading(false);
    }
  };

  /* step 2 :send an answer to the backend and receive score + next question */
  const sendAnswer = async () => {
    if (!userInput.trim() || loading) return;
    const answer = userInput.trim();
    setUserInput("");
    setLoading(true);

    /* add user message to chat */
    setMessages(prev => [...prev, { role: "user", content: answer }]);

    try {
      const res  = await fetch("/api/interviews/text-practice/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          role,
          question: currentQuestion,
          answer,
          questionNumber,
          previousQA,
        }),
      });
      const data = await res.json();

      /* add feedback message */
      setMessages(prev => [...prev, {
        role:     "feedback",
        content:  data.feedback,
        score:    data.score,
      }]);

      /* update previous qa history */
      setPreviousQA(prev => [...prev, {
        question: currentQuestion,
        answer,
        score:    data.score,
        feedback: data.feedback,
      }]);

      if (data.isComplete) {
        setSummary(data.summary);
        setPhase("complete");
      } else {
        /* show next question */
        setCQ(data.nextQuestion);
        setQN(prev => prev + 1);
        setMessages(prev => [...prev, { role: "ai", content: data.nextQuestion }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: "feedback", content: "Error — please try again.", score: 0 }]);
    } finally {
      setLoading(false);
    }
  };

  /* helper :reset back to setup screen */
  const handleReset = () => {
    setPhase("setup");
    setRole("");
    setCQ("");
    setUserInput("");
    setMessages([]);
    setQN(1);
    setSummary(null);
    setPreviousQA([]);
  };

  /* helper :send on enter key */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendAnswer();
    }
  };

  return (
    <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>

      {/* setup phase */}
      {phase === "setup" && (
        <>
          <div style={{ padding: "16px 20px 14px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>💬 Text Practice Terminal</span>
          </div>
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              quick ai interview — no camera needed · 5 questions · instant feedback
            </p>
            <div>
              <label className="ip-label">role</label>
              <input
                className="ip-input"
                type="text"
                placeholder="e.g. React Developer, Data Analyst..."
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                disabled={loading}
              />
            </div>
            <button
              onClick={handleStart}
              disabled={!role.trim() || loading}
              className="btn-primary w-full py-2.5 text-sm"
            >
              {loading ? "Generating first question..." : "▶ Start Text Practice"}
            </button>
          </div>
        </>
      )}

      {/* chatting phase */}
      {phase === "chatting" && (
        <>
          <div style={{ padding: "16px 20px 14px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>💬 Text Practice</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {role} · Question {questionNumber} of 5
              </span>
            </div>
            <button
              onClick={handleReset}
              className="btn-secondary text-xs py-1 px-3"
            >
              Reset
            </button>
          </div>

          {/* chat message area */}
          <div
            style={{
              height: 320,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {messages.map((msg, i) => {

              /* ai question bubble */
              if (msg.role === "ai") {
                return (
                  <div key={i} className="ip-bubble-ai">
                    <span style={{ fontSize: 11, opacity: 0.5, display: "block", marginBottom: 3 }}>🤖 ai</span>
                    {msg.content}
                  </div>
                );
              }

              /* user answer bubble */
              if (msg.role === "user") {
                return (
                  <div key={i} className="ip-bubble-user">
                    <span style={{ fontSize: 11, opacity: 0.5, display: "block", marginBottom: 3 }}>👤 you</span>
                    {msg.content}
                  </div>
                );
              }

              /* feedback row */
              if (msg.role === "feedback") {
                return (
                  <div
                    key={i}
                    style={{
                      background:   "var(--color-success-bg)",
                      border:       "1px solid var(--color-success-border)",
                      padding:      "10px 14px",
                      borderRadius: "var(--radius-sm)",
                      fontSize:     13,
                      color:        "var(--text-secondary)",
                      lineHeight:   1.5,
                    }}
                  >
                    <span style={{ fontWeight: 700, color: "var(--color-success-text)", display: "block", marginBottom: 3 }}>
                      ✅ Score: {msg.score}/10
                    </span>
                    {msg.content}
                  </div>
                );
              }

              return null;
            })}

            {/* loading dots while waiting */}
            {loading && (
              <div className="ip-bubble-ai" style={{ opacity: 0.5 }}>
                <span style={{ fontSize: 11, marginBottom: 3, display: "block" }}>🤖 ai</span>
                thinking...
              </div>
            )}

            {/* scroll anchor */}
            <div ref={chatEndRef} />
          </div>

          {/* input row */}
          <div
            style={{
              borderTop: "1px solid var(--border)",
              padding:   "12px 16px",
              display:   "flex",
              gap:       8,
            }}
          >
            <input
              ref={inputRef}
              className="ip-input"
              style={{ flex: 1 }}
              type="text"
              placeholder="Type your answer..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={sendAnswer}
              disabled={!userInput.trim() || loading}
              className="btn-primary py-2 px-4 text-sm"
            >
              Send →
            </button>
          </div>
        </>
      )}

      {/* complete phase */}
      {phase === "complete" && summary && (
        <>
          <div style={{ padding: "16px 20px 14px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>💬 Text Practice Terminal</span>
          </div>
          <div style={{ padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
            <div className="text-4xl">✅</div>
            <div>
              <div className="text-lg font-bold mb-1" style={{ color: "var(--text)" }}>
                Practice Complete!
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                {summary.totalQuestions} questions answered
              </div>
            </div>

            {/* average score */}
            <div className="ip-stat-card w-full text-center">
              <div className="ip-stat-label">Average Score</div>
              <div className="ip-stat-value" style={{ color: "var(--accent)" }}>
                {summary.avgScore}/10
              </div>
            </div>

            <p className="text-xs max-w-xs" style={{ color: "var(--text-secondary)" }}>
              {summary.message}
            </p>

            <button
              onClick={handleReset}
              className="btn-primary py-2 px-5 text-sm"
            >
              🔄 Practice Again
            </button>
          </div>
        </>
      )}
    </div>
  );
}
