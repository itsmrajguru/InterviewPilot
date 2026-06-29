import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import StudentTopbar from "../../components/StudentTopbar";
import { createInterviewSession } from "../../services/interviewService";

/* icons */
const IconCode = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);
const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

/* main page component */
export default function StudentPractice() {
  const navigate = useNavigate();
  const [jobRole, setJobRole] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //get user from localstorage
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();

  const handleStartPractice = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      /* trigger interview session creation on backend */
      const res = await createInterviewSession({
        studentEmail: user.email,
        role: jobRole,
        difficulty,
        resumeText
      });

      if (res.success && res.session) {
        /* immediately navigate candidate to the join token route */
        navigate(`/interview/join/${res.session.inviteToken}`);
      } else {
        setError(res.message || "failed to prepare your practice interview session");
      }
    } catch (err) {
      setError("connection error. please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#e4e8ee", fontFamily: "var(--font-sans)", fontSize: 14 }}>
      <Sidebar role="student" />

      {/* main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* top bar */}
        <StudentTopbar
          title="AI Practice Room"
          sub="Create a custom mock interview before the real round"
        />

        {/* page body */}
        <main style={{ flex: 1, padding: "24px 32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", maxWidth: 672, margin: "0 auto", width: "100%" }}>

          {/* welcome banner */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{ width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, margin: "0 auto 12px auto", background: "#f5f3ff", color: "#6d28d9", border: "0.5px solid #ede9fe" }}
            >
              🤖
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, marginBottom: 8 }}>
              Custom AI Practice
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
              practice answering custom questions and coding tasks configured by you
            </p>
          </div>

          {/* error banner */}
          {error && (
            <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "12px 16px", borderRadius: 8, background: "#fef2f2", color: "#b91c1c", border: "0.5px solid #fecaca", marginBottom: 24 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* config form card */}
          <div style={{ width: "100%", background: "#ffffff", border: "0.5px solid #dde1e8", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 24 }}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", textAlign: "center", gap: 16 }}>
                <div style={{ width: 24, height: 24, border: "2px solid #1d9e75", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Preparing Practice Room...</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 300 }}>
                  our ai interviewer is generating questions and coding challenges based on your settings
                </div>
              </div>
            ) : (
              <form onSubmit={handleStartPractice} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                    Target Job Role
                  </label>
                  <input
                    type="text"
                    style={{ padding: "10px 14px", borderRadius: 8, fontSize: 14, width: "100%", outline: "none", background: "var(--surface-1)", border: "0.5px solid var(--border)", color: "var(--text-primary)" }}
                    onFocus={e => { e.currentTarget.style.borderColor = "var(--text-primary)"; e.currentTarget.style.background = "#ffffff"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface-1)"; }}
                    placeholder="e.g. Frontend React Developer, Python Backend Developer"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                    Difficulty Level
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, padding: 4, borderRadius: 10, background: "var(--surface-1)", border: "0.5px solid var(--border)" }}>
                    {["easy", "medium", "hard"].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        style={{
                          padding: "8px 0", borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: "capitalize", cursor: "pointer", transition: "all 0.2s", border: "none",
                          background: difficulty === d ? "#ffffff" : "transparent",
                          color: difficulty === d ? "var(--text-primary)" : "var(--text-secondary)",
                          boxShadow: difficulty === d ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                    Resume Summary (Optional)
                  </label>
                  <textarea
                    style={{ padding: "10px 14px", borderRadius: 8, fontSize: 14, width: "100%", outline: "none", background: "var(--surface-1)", border: "0.5px solid var(--border)", color: "var(--text-primary)", height: 96, resize: "none" }}
                    onFocus={e => { e.currentTarget.style.borderColor = "var(--text-primary)"; e.currentTarget.style.background = "#ffffff"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface-1)"; }}
                    placeholder="paste your resume text to receive personalized question prompts..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  style={{ fontSize: 14, color: "#ffffff", background: "#1d9e75", border: "none", borderRadius: 8, padding: "12px 16px", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", marginTop: 8 }}
                >
                  <IconCode /> Start Free Practice Round
                </button>
              </form>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}
