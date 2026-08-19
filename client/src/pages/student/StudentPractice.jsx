import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import StudentTopbar from "../../components/StudentTopbar";
import { createInterviewSession } from "../../services/interviewService";

import { IconArrowRight, IconBriefcase, IconCheck, IconFile } from "../../components/ui/icons";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";

const IconGauge = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 10 10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconSparkle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2z"/>
  </svg>
);

const DIFF_META = {
  easy:   { label: "Easy",   desc: "Foundational concepts, guided pace",     color: "var(--success-text)", bg: "var(--success-bg)", border: "var(--success-border)" },
  medium: { label: "Medium", desc: "Balanced mix, real interview pace",      color: "var(--warning-text)", bg: "var(--warning-bg)", border: "var(--warning-border)" },
  hard:   { label: "Hard",   desc: "Deep dives, tight time pressure",        color: "var(--danger-text)", bg: "var(--danger-bg)", border: "var(--danger-border)" },
};

const PERKS = [
  "Tailored HR, technical & coding questions",
  "Instant AI evaluation after every answer",
  "Practice rounds don't affect your reports",
];

export default function StudentPractice() {
  const navigate = useNavigate();
  const [jobRole, setJobRole]       = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();

  const handleStartPractice = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await createInterviewSession({
        studentEmail: user.email,
        role: jobRole,
        difficulty,
        resumeText
      });
      if (res.success && res.session) {
        navigate(`/interview/join/${res.session.inviteToken}`);
      } else {
        setError(res.message || "Failed to prepare your practice session.");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dm = DIFF_META[difficulty];

  return (
    <>
      <style>{`
        @keyframes sp-spin { to { transform: rotate(360deg); } }
        @keyframes sp-fade-up { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes sp-pulse { 0%,100% { opacity:1; } 50% { opacity:0.55; } }
        .sp-fade { animation: sp-fade-up 0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .sp-input:focus { border-color:var(--accent) !important; background:var(--color-bg-panel) !important; box-shadow:0 0 0 3px rgba(17,24,39,0.1) !important; }
        .sp-diff-btn:hover:not(.active) { background:var(--color-bg-panel-hover) !important; }
      `}</style>

      <div className="ip-app-wrapper" style={{ display:"flex", minHeight:"100vh", background:"var(--bg)", fontFamily:"var(--sans)", fontSize:14 }}>
        <Sidebar role="student" />

        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
          <StudentTopbar title="AI Practice Room" sub="Create a custom mock interview before the real round" />

          <main style={{ flex: 1, overflowY: "auto" }}>
            <PageHeader 
              title="Custom AI Practice" 
              subtitle="Practice answering custom questions and coding tasks configured by you." 
            />

            <div style={{ maxWidth: 1180, margin: "-24px auto 0", padding: "0 24px 24px" }}>

              <div style={{ width: "100%", maxWidth: 920, display: "grid", gridTemplateColumns: "1fr 320px", gap: "var(--space-6)", alignItems: "start" }}>

                {/* ══ LEFT: FORM ══ */}
                <Card className="sp-fade">
                  <div style={{ padding: "var(--space-6)" }}>
                    {/* error */}
                    {error && (
                      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 16px", borderRadius:"var(--radius-sm)", marginBottom:20, background:"var(--danger-bg)", color:"var(--danger-text)", border:"1px solid var(--danger-border)", fontSize:13 }}>
                        <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--danger-text)", flexShrink:0 }}/>
                        {error}
                      </div>
                    )}

                    {loading ? (
                      /* ── LOADING STATE ── */
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"56px 0", textAlign:"center", gap:18 }}>
                        <div style={{ position:"relative", width:56, height:56 }}>
                          <div style={{ width:56, height:56, border:"3px solid var(--bg-subtle)", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"sp-spin 0.8s linear infinite" }}/>
                          <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🤖</span>
                        </div>
                        <div>
                          <p style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)", margin:"0 0 5px 0" }}>Preparing your practice room…</p>
                          <p style={{ fontSize:13, color:"var(--text-secondary)", maxWidth:300, margin:0, lineHeight:1.6, animation:"sp-pulse 1.6s ease-in-out infinite" }}>
                            Our AI interviewer is generating questions and coding challenges based on your settings.
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* ── FORM ── */
                      <form onSubmit={handleStartPractice} style={{ display:"flex", flexDirection:"column", gap:22 }}>

                        {/* job role */}
                        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                          <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"var(--text-secondary)" }}>
                            <IconBriefcase /> Target Job Role
                          </label>
                          <input
                            type="text"
                            className="sp-input"
                            style={{ padding:"11px 14px", borderRadius:"var(--radius-md)", fontSize:14, width:"100%", outline:"none", background:"var(--color-bg-panel-sunken)", border:"1.5px solid var(--color-border-subtle)", color:"var(--text-primary)", transition:"all 0.15s", boxSizing:"border-box" }}
                            placeholder="e.g. Frontend React Developer, Python Backend Developer"
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                            required
                          />
                        </div>

                        {/* difficulty */}
                        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                          <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"var(--text-secondary)" }}>
                            <IconGauge /> Difficulty Level
                          </label>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                            {Object.entries(DIFF_META).map(([key, meta]) => {
                              const active = difficulty === key;
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  className={`sp-diff-btn${active ? " active" : ""}`}
                                  onClick={() => setDifficulty(key)}
                                  style={{ padding:"12px 10px", borderRadius:"var(--radius-md)", cursor:"pointer", textAlign:"left", transition:"all 0.18s", background: active ? meta.bg : "var(--color-bg-panel-sunken)", border: active ? `1.5px solid ${meta.border}` : "1.5px solid var(--color-border-subtle)", display:"flex", flexDirection:"column", gap:3 }}
                                >
                                  <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:13, fontWeight:600, color: active ? meta.color : "var(--text-primary)" }}>
                                    {active && <IconCheck />} {meta.label}
                                  </span>
                                  <span style={{ fontSize:11, color: active ? meta.color : "var(--text-secondary)", lineHeight:1.4, opacity: active ? 0.85 : 1 }}>
                                    {meta.desc}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* resume */}
                        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                          <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"var(--text-secondary)" }}>
                            <IconFile /> Resume Summary
                            <span style={{ fontSize:10, fontWeight:600, color:"var(--color-border-shadow)", textTransform:"none", letterSpacing:0 }}>(optional)</span>
                          </label>
                          <textarea
                            className="sp-input"
                            style={{ padding:"11px 14px", borderRadius:"var(--radius-md)", fontSize:14, width:"100%", outline:"none", background:"var(--color-bg-panel-sunken)", border:"1.5px solid var(--color-border-subtle)", color:"var(--text-primary)", height:100, resize:"none", lineHeight:1.6, transition:"all 0.15s", boxSizing:"border-box", fontFamily:"inherit" }}
                            placeholder="Paste your resume text to receive personalized question prompts…"
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                          />
                        </div>

                        {/* submit */}
                        <Button type="submit" variant="primary" style={{ width: "100%", marginTop: 4, padding: "14px 18px", fontSize: 14.5 }}>
                          <IconSparkle /> Start Free Practice Round <IconArrowRight />
                        </Button>
                      </form>
                    )}
                  </div>
                </Card>

                {/* ══ RIGHT: INFO PANEL ══ */}
                {!loading && (
                  <div className="sp-fade" style={{ animationDelay:"0.06s", display:"flex", flexDirection:"column", gap:"var(--space-4)" }}>

                    {/* selected difficulty preview */}
                    <Card style={{ padding: "var(--space-5)" }}>
                      <p style={{ margin:"0 0 10px 0", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"var(--text-secondary)" }}>
                        Session Preview
                      </p>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                        <span style={{ fontSize:10, fontWeight:700, textTransform: "uppercase", letterSpacing: "0.06em", padding:"2px 8px", borderRadius:20, background: dm.bg, color: dm.color, border:`1px solid ${dm.border}` }}>
                          {dm.label}
                        </span>
                        <span style={{ fontSize:13, color:"var(--text-primary)", fontWeight:600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {jobRole || "Select a role"}
                        </span>
                      </div>
                      <p style={{ margin:0, fontSize:13, color:"var(--text-secondary)", lineHeight:1.6 }}>
                        {dm.desc}
                      </p>
                    </Card>

                    {/* perks card */}
                    <Card style={{ padding: "var(--space-5)" }}>
                      <p style={{ margin:"0 0 12px 0", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"var(--text-secondary)" }}>
                        What you get
                      </p>
                      <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:11 }}>
                        {PERKS.map((perk, i) => (
                          <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:9 }}>
                            <span style={{ width:18, height:18, borderRadius:"50%", flexShrink:0, marginTop:1, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--color-bg-panel-sunken)", color:"var(--text-primary)" }}>
                              <IconCheck />
                            </span>
                            <span style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.55 }}>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    {/* tip card */}
                    <div style={{ borderRadius:"var(--radius-lg)", padding:"var(--space-4)", background:"var(--color-bg-panel-hover)", border:"1px solid var(--color-border-subtle)" }}>
                      <p style={{ margin:"0 0 4px 0", fontSize:12, fontWeight:700, color:"var(--text-primary)" }}>💡 Pro tip</p>
                      <p style={{ margin:0, fontSize:12, color:"var(--text-secondary)", lineHeight:1.6 }}>
                        Pasting your resume helps the AI ask questions tailored to your real experience.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}