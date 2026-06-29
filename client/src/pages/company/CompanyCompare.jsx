import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { getCompanySessions } from "../../services/interviewService";

/* icons */
const IconStar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

/* empty state component */
function EmptyState({ icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-1"
        style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
      >
        {icon}
      </div>
      <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>{title}</div>
      <div className="text-xs max-w-xs" style={{ color: "var(--text-muted)" }}>{sub}</div>
    </div>
  );
}

/* main recruiter compare candidates page */
export default function CompanyCompare() {
  const navigate = useNavigate();
  const [completedSessions, setCompletedSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  /* compare slot selections */
  const [slot1, setSlot1] = useState("");
  const [slot2, setSlot2] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getCompanySessions();
        if (data.success) {
          /* filter only candidates who finished interviews */
          const finished = data.sessions.filter(s => s.status === "completed" && s.report);
          setCompletedSessions(finished);
        }
      } catch (e) {
        console.error("failed loading sessions:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* find sessions selected in slots */
  const candidate1 = completedSessions.find(s => s._id === slot1);
  const candidate2 = completedSessions.find(s => s._id === slot2);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#e4e8ee", fontFamily: "var(--font-sans)", fontSize: 14 }}>
      <Sidebar role="company" />

      {/* main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* top bar */}
        <header
          style={{
            padding: "0 28px",
            height: 56,
            background: "#ffffff",
            borderBottom: "0.5px solid #dde1e8",
            position: "sticky",
            top: 0,
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            fontFamily: "var(--font-sans)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 11, color: "#7a8a99", letterSpacing: "0.04em", textTransform: "uppercase" }}>Recruiter workspace</span>
            <span style={{ fontSize: 15, fontWeight: 500, color: "#111827" }}>Compare Candidates</span>
          </div>
        </header>

        {/* page body */}
        <main style={{ flex: 1, padding: "24px 32px" }}>

          {/* welcome banner */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, marginBottom: 4 }}>
              Side-by-Side Comparison
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
              select two completed evaluations to compare their scores, feedback, and key credentials side-by-side
            </p>
          </div>

          {/* loading state */}
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
              <div style={{ width: 24, height: 24, border: "2px solid #1d9e75", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            </div>
          ) : completedSessions.length < 2 ? (
            <div style={{ background: "#ffffff", border: "0.5px solid #dde1e8", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              <div style={{ padding: 24 }}>
                <EmptyState
                  icon="⚖️"
                  title="insufficient data"
                  sub="you need at least 2 completed candidate interviews with reports to use comparison tools."
                />
              </div>
            </div>
          )             <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* slot selectors panel */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, padding: 16, borderRadius: 12, background: "#ffffff", border: "0.5px solid #dde1e8", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                
                {/* slot 1 selector */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                    Candidate A
                  </label>
                  <select
                    value={slot1}
                    onChange={e => setSlot1(e.target.value)}
                    style={{ padding: "10px 12px", borderRadius: 8, fontSize: 14, width: "100%", outline: "none", cursor: "pointer", background: "var(--surface-1)", border: "0.5px solid var(--border)", color: "var(--text-primary)" }}
                  >
                    <option value="">choose candidate...</option>
                    {completedSessions.map(s => (
                      <option key={s._id} value={s._id} disabled={s._id === slot2}>
                        {s.studentEmail} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* slot 2 selector */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                    Candidate B
                  </label>
                  <select
                    value={slot2}
                    onChange={e => setSlot2(e.target.value)}
                    style={{ padding: "10px 12px", borderRadius: 8, fontSize: 14, width: "100%", outline: "none", cursor: "pointer", background: "var(--surface-1)", border: "0.5px solid var(--border)", color: "var(--text-primary)" }}
                  >
                    <option value="">choose candidate...</option>
                    {completedSessions.map(s => (
                      <option key={s._id} value={s._id} disabled={s._id === slot1}>
                        {s.studentEmail} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* comparison metrics table card */}
              {candidate1 || candidate2 ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  
                  {/* candidate a specs */}
                  <div style={{ background: "#ffffff", border: "0.5px solid #dde1e8", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                    {candidate1 ? (
                      <>
                        <div>
                          <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em", color: "#1d9e75" }}>
                            Candidate A
                          </div>
                          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "4px 0" }}>
                            {candidate1.studentEmail}
                          </h2>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            {candidate1.role} · <span style={{ textTransform: "capitalize" }}>{candidate1.difficulty}</span>
                          </div>
                        </div>

                        {/* overall score card badge */}
                        <div style={{ padding: 16, borderRadius: 12, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#1d9e75" }}>Overall Assessment Grade</span>
                          <span style={{ fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, lineHeight: 1, color: "#1d9e75" }}>
                            <IconStar /> {candidate1.report.overallScore}/100
                          </span>
                        </div>

                        {/* report summaries */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                            Performance Summary
                          </span>
                          <p style={{ fontSize: 12, lineHeight: 1.5, color: "var(--text-secondary)", margin: 0 }}>
                            {candidate1.report.summary}
                          </p>
                        </div>

                        {/* key strengths */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                            Identified Strengths
                          </span>
                          <ul style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                            {candidate1.report.strengths?.slice(0, 3).map((st, i) => (
                              <li key={i}>{st}</li>
                            ))}
                          </ul>
                        </div>

                        {/* weaknesses */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                            Areas for Improvement
                          </span>
                          <ul style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                            {candidate1.report.weaknesses?.slice(0, 3).map((wk, i) => (
                              <li key={i}>{wk}</li>
                            ))}
                          </ul>
                        </div>

                        <button
                          onClick={() => navigate(`/interview/${candidate1._id}/report`)}
                          style={{ fontSize: 12, color: "#ffffff", background: "#1d9e75", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", marginTop: 12 }}
                        >
                          View Full Report <IconArrow />
                        </button>
                      </>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", fontSize: 12, color: "var(--text-muted)" }}>
                        please choose candidate a above to compare
                      </div>
                    )}
                  </div>

                  {/* candidate b specs */}
                  <div style={{ background: "#ffffff", border: "0.5px solid #dde1e8", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                    {candidate2 ? (
                      <>
                        <div>
                          <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em", color: "#1d9e75" }}>
                            Candidate B
                          </div>
                          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "4px 0" }}>
                            {candidate2.studentEmail}
                          </h2>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            {candidate2.role} · <span style={{ textTransform: "capitalize" }}>{candidate2.difficulty}</span>
                          </div>
                        </div>

                        {/* overall score card badge */}
                        <div style={{ padding: 16, borderRadius: 12, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#1d9e75" }}>Overall Assessment Grade</span>
                          <span style={{ fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, lineHeight: 1, color: "#1d9e75" }}>
                            <IconStar /> {candidate2.report.overallScore}/100
                          </span>
                        </div>

                        {/* report summaries */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                            Performance Summary
                          </span>
                          <p style={{ fontSize: 12, lineHeight: 1.5, color: "var(--text-secondary)", margin: 0 }}>
                            {candidate2.report.summary}
                          </p>
                        </div>

                        {/* key strengths */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                            Identified Strengths
                          </span>
                          <ul style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                            {candidate2.report.strengths?.slice(0, 3).map((st, i) => (
                              <li key={i}>{st}</li>
                            ))}
                          </ul>
                        </div>

                        {/* weaknesses */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                            Areas for Improvement
                          </span>
                          <ul style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                            {candidate2.report.weaknesses?.slice(0, 3).map((wk, i) => (
                              <li key={i}>{wk}</li>
                            ))}
                          </ul>
                        </div>

                        <button
                          onClick={() => navigate(`/interview/${candidate2._id}/report`)}
                          style={{ fontSize: 12, color: "#ffffff", background: "#1d9e75", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", marginTop: 12 }}
                        >
                          View Full Report <IconArrow />
                        </button>
                      </>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", fontSize: 12, color: "var(--text-muted)" }}>
                        please choose candidate b above to compare
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div style={{ background: "#ffffff", border: "0.5px solid #dde1e8", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 48, textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>
                  select at least one candidate from the selector boxes to display candidate cards
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
