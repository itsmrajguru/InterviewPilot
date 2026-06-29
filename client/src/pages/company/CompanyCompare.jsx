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
        <main className="flex-1 p-4 md:p-6 lg:p-8">

          {/* welcome banner */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: "var(--text)" }}>
              Side-by-Side Comparison
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              select two completed evaluations to compare their scores, feedback, and key credentials side-by-side
            </p>
          </div>

          {/* loading state */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="ip-spinner ip-spinner-dark" />
            </div>
          ) : completedSessions.length < 2 ? (
            <div className="ip-card">
              <div className="ip-card-body">
                <EmptyState
                  icon="⚖️"
                  title="insufficient data"
                  sub="you need at least 2 completed candidate interviews with reports to use comparison tools."
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              
              {/* slot selectors panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                
                {/* slot 1 selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Candidate A
                  </label>
                  <select
                    value={slot1}
                    onChange={e => setSlot1(e.target.value)}
                    className="px-3 py-2.5 rounded-lg text-sm outline-none cursor-pointer w-full"
                    style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text)" }}
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Candidate B
                  </label>
                  <select
                    value={slot2}
                    onChange={e => setSlot2(e.target.value)}
                    className="px-3 py-2.5 rounded-lg text-sm outline-none cursor-pointer w-full"
                    style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text)" }}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* candidate a specs */}
                  <div className="ip-card p-6 flex flex-col gap-4">
                    {candidate1 ? (
                      <>
                        <div>
                          <div className="text-xs uppercase font-bold tracking-wider" style={{ color: "var(--accent)" }}>
                            Candidate A
                          </div>
                          <h2 className="text-lg font-bold mt-1" style={{ color: "var(--text)" }}>
                            {candidate1.studentEmail}
                          </h2>
                          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {candidate1.role} · <span className="capitalize">{candidate1.difficulty}</span>
                          </div>
                        </div>

                        {/* overall score card badge */}
                        <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: "var(--accent-light)" }}>
                          <span className="text-xs font-semibold" style={{ color: "var(--accent)" }}>Overall Assessment Grade</span>
                          <span className="text-xl font-bold flex items-center gap-1 leading-none" style={{ color: "var(--accent)" }}>
                            <IconStar /> {candidate1.report.overallScore}/100
                          </span>
                        </div>

                        {/* report summaries */}
                        <div className="flex flex-col gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                            Performance Summary
                          </span>
                          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            {candidate1.report.summary}
                          </p>
                        </div>

                        {/* key strengths */}
                        <div className="flex flex-col gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                            Identified Strengths
                          </span>
                          <ul className="list-disc pl-4 flex flex-col gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                            {candidate1.report.strengths?.slice(0, 3).map((st, i) => (
                              <li key={i}>{st}</li>
                            ))}
                          </ul>
                        </div>

                        {/* weaknesses */}
                        <div className="flex flex-col gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                            Areas for Improvement
                          </span>
                          <ul className="list-disc pl-4 flex flex-col gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                            {candidate1.report.weaknesses?.slice(0, 3).map((wk, i) => (
                              <li key={i}>{wk}</li>
                            ))}
                          </ul>
                        </div>

                        <button
                          onClick={() => navigate(`/interview/${candidate1._id}/report`)}
                          className="btn-primary w-full py-2.5 text-xs mt-3 flex items-center justify-center gap-1.5"
                        >
                          View Full Report <IconArrow />
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center justify-center py-20 text-xs" style={{ color: "var(--text-muted)" }}>
                        please choose candidate a above to compare
                      </div>
                    )}
                  </div>

                  {/* candidate b specs */}
                  <div className="ip-card p-6 flex flex-col gap-4">
                    {candidate2 ? (
                      <>
                        <div>
                          <div className="text-xs uppercase font-bold tracking-wider" style={{ color: "var(--accent)" }}>
                            Candidate B
                          </div>
                          <h2 className="text-lg font-bold mt-1" style={{ color: "var(--text)" }}>
                            {candidate2.studentEmail}
                          </h2>
                          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {candidate2.role} · <span className="capitalize">{candidate2.difficulty}</span>
                          </div>
                        </div>

                        {/* overall score card badge */}
                        <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: "var(--accent-light)" }}>
                          <span className="text-xs font-semibold" style={{ color: "var(--accent)" }}>Overall Assessment Grade</span>
                          <span className="text-xl font-bold flex items-center gap-1 leading-none" style={{ color: "var(--accent)" }}>
                            <IconStar /> {candidate2.report.overallScore}/100
                          </span>
                        </div>

                        {/* report summaries */}
                        <div className="flex flex-col gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                            Performance Summary
                          </span>
                          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            {candidate2.report.summary}
                          </p>
                        </div>

                        {/* key strengths */}
                        <div className="flex flex-col gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                            Identified Strengths
                          </span>
                          <ul className="list-disc pl-4 flex flex-col gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                            {candidate2.report.strengths?.slice(0, 3).map((st, i) => (
                              <li key={i}>{st}</li>
                            ))}
                          </ul>
                        </div>

                        {/* weaknesses */}
                        <div className="flex flex-col gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                            Areas for Improvement
                          </span>
                          <ul className="list-disc pl-4 flex flex-col gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                            {candidate2.report.weaknesses?.slice(0, 3).map((wk, i) => (
                              <li key={i}>{wk}</li>
                            ))}
                          </ul>
                        </div>

                        <button
                          onClick={() => navigate(`/interview/${candidate2._id}/report`)}
                          className="btn-primary w-full py-2.5 text-xs mt-3 flex items-center justify-center gap-1.5"
                        >
                          View Full Report <IconArrow />
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center justify-center py-20 text-xs" style={{ color: "var(--text-muted)" }}>
                        please choose candidate b above to compare
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="ip-card p-12 text-center text-xs" style={{ color: "var(--text-muted)" }}>
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
