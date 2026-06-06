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
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar role="student" />

      {/* main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* top bar */}
        <StudentTopbar
          title="AI Practice Room"
          sub="Create a custom mock interview before the real round"
        />

        {/* page body */}
        <main className="flex-1 p-8 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">

          {/* welcome banner */}
          <div className="text-center mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mx-auto mb-3"
              style={{ background: "var(--accent-light)", color: "var(--accent)", border: "1px solid rgba(91,72,232,0.15)" }}
            >
              🤖
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--text)" }}>
              Custom AI Practice
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              practice answering custom questions and coding tasks configured by you
            </p>
          </div>

          {/* error banner */}
          {error && (
            <div
              className="mb-6 w-full flex items-center gap-2 text-sm px-4 py-3 rounded"
              style={{ background: "var(--color-danger-bg)", color: "var(--color-danger-text)", border: "1px solid var(--color-danger-border)" }}
            >
              {error}
            </div>
          )}

          {/* config form card */}
          <div className="ip-card w-full p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                <div className="ip-spinner ip-spinner-dark mb-1" />
                <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>Preparing Practice Room...</div>
                <div className="text-xs max-w-xs" style={{ color: "var(--text-muted)" }}>
                  our ai interviewer is generating questions and coding challenges based on your settings
                </div>
              </div>
            ) : (
              <form onSubmit={handleStartPractice} className="flex flex-col gap-5">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Target Job Role
                  </label>
                  <input
                    type="text"
                    className="px-3 py-2.5 rounded-lg text-sm w-full outline-none transition-all"
                    style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text)" }}
                    placeholder="e.g. Frontend React Developer, Python Backend Developer"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-lg" style={{ background: "var(--bg-subtle)" }}>
                    {["easy", "medium", "hard"].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className="py-2 rounded-md text-[11px] font-bold transition-all capitalize"
                        style={{
                          background: difficulty === d ? "var(--bg-card)" : "transparent",
                          color: difficulty === d ? "var(--text)" : "var(--text-secondary)",
                          boxShadow: difficulty === d ? "0 1px 2px rgba(0,0,0,0.05)" : "none"
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Resume Summary (Optional)
                  </label>
                  <textarea
                    className="px-3 py-2.5 rounded-lg text-sm w-full outline-none transition-all h-24 resize-none"
                    style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text)" }}
                    placeholder="paste your resume text to receive personalized question prompts..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
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
