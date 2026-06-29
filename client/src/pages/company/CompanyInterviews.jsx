import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { getCompanySessions } from "../../services/interviewService";

/* icons */
const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconStar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
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

/* main recruiter candidates list page */
export default function CompanyInterviews() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const data = await getCompanySessions();
        if (data.success) setSessions(data.sessions);
      } catch (e) {
        console.error("failed loading sessions:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* csv export logic */
  const handleExportCSV = () => {
    const headers = ["Candidate Email", "Role", "Difficulty", "Status", "Score", "Invited Date"];
    const rows = filteredSessions.map(s => [
      s.studentEmail,
      s.role,
      s.difficulty,
      s.status,
      s.report?.overallScore !== undefined ? s.report.overallScore : "N/A",
      s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN") : "—"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `candidates_pipeline_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* filter matching logic */
  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.studentEmail.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesDiff = difficultyFilter === "all" || s.difficulty === difficultyFilter;

    return matchesSearch && matchesStatus && matchesDiff;
  });

  const statusMap = {
    pending:   { cls: "ip-badge ip-badge-warning", label: "Pending" },
    active:    { cls: "ip-badge ip-badge-info",    label: "Active" },
    completed: { cls: "ip-badge ip-badge-success", label: "Completed" },
    expired:   { cls: "ip-badge ip-badge-neutral", label: "Expired" },
  };

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
            <span style={{ fontSize: 15, fontWeight: 500, color: "#111827" }}>All Candidates</span>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={filteredSessions.length === 0}
            className="btn-secondary py-2 px-4 text-xs flex items-center gap-1.5"
          >
            <IconDownload /> Export CSV
          </button>
        </header>

        {/* page body */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">

          {/* welcome banner */}
          <div className="mb-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: "var(--text)" }}>
                Pipeline Registry
              </h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                search, filter and inspect all candidate invites sent by your organization
              </p>
            </div>
          </div>

          {/* search and filter tools bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            
            {/* search input box */}
            <div className="relative col-span-1 md:col-span-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                <IconSearch />
              </span>
              <input
                type="text"
                placeholder="search by email or role..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-lg text-sm w-full outline-none transition-all"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
            </div>

            {/* status selector */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}
            >
              <option value="all">all statuses</option>
              <option value="pending">pending</option>
              <option value="active">active</option>
              <option value="completed">completed</option>
              <option value="expired">expired</option>
            </select>

            {/* difficulty selector */}
            <select
              value={difficultyFilter}
              onChange={e => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}
            >
              <option value="all">all difficulties</option>
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </div>

          {/* list card representation */}
          <div className="ip-card">
            <div className="ip-card-header flex items-center justify-between">
              <span className="ip-card-title">Talent Pipeline Registry</span>
              <span className="ip-badge ip-badge-neutral">{filteredSessions.length} listed</span>
            </div>
            <div className="ip-card-body">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="ip-spinner ip-spinner-dark" />
                </div>
              ) : filteredSessions.length === 0 ? (
                <EmptyState
                  icon="🔍"
                  title="no matching candidates"
                  sub="we couldn't find any candidate invites matching your search or filters"
                />
              ) : (
                <div className="flex flex-col">
                  {filteredSessions.map((session) => {
                    const s = statusMap[session.status] || statusMap.pending;
                    return (
                      <div key={session._id} className="ip-activity-row">
                        <div
                          className="ip-activity-icon flex-shrink-0"
                          style={{
                            background: session.status === "completed" ? "var(--color-success-bg)"
                              : session.status === "pending" ? "var(--color-warning-bg)"
                              : "var(--bg-subtle)",
                            color: session.status === "completed" ? "var(--color-success-text)"
                              : session.status === "pending" ? "var(--color-warning-text)"
                              : "var(--text-muted)",
                          }}
                        >
                          {session.status === "completed" ? <IconCheck /> : <IconClock />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
                            {session.studentEmail}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                            {session.role} · <span className="capitalize">{session.difficulty}</span> ·{" "}
                            {session.createdAt
                              ? new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                              : "—"}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {session.status === "completed" && session.report?.overallScore !== undefined && (
                            <div className="flex items-center gap-1 text-xs font-bold" style={{ color: "var(--accent)" }}>
                              <IconStar />
                              {session.report.overallScore}/100
                            </div>
                          )}
                          <span className={s.cls}>{s.label}</span>
                          {session.status === "completed" && (
                            <button
                              onClick={() => navigate(`/interview/${session._id}/report`)}
                              className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
                            >
                              Report <IconArrow />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
