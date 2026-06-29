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
        <main style={{ flex: 1, padding: "24px 32px" }}>

          {/* welcome banner */}
          <div style={{ marginBottom: 32, display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, marginBottom: 4 }}>
                Pipeline Registry
              </h1>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
                search, filter and inspect all candidate invites sent by your organization
              </p>
            </div>
          </div>          {/* search and filter tools bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
            
            {/* search input box */}
            <div style={{ position: "relative", gridColumn: "span 2" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
                <IconSearch />
              </span>
              <input
                type="text"
                placeholder="search by email or role..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: "10px 12px 10px 36px", borderRadius: 8, fontSize: 14, width: "100%", outline: "none", background: "#ffffff", border: "0.5px solid var(--border)", color: "var(--text-primary)", transition: "all 0.2s" }}
                onFocus={e => { e.currentTarget.style.borderColor = "var(--text-primary)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
            </div>

            {/* status selector */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: "10px 12px", borderRadius: 8, fontSize: 14, width: "100%", outline: "none", cursor: "pointer", background: "#ffffff", border: "0.5px solid var(--border)", color: "var(--text-primary)" }}
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
              style={{ padding: "10px 12px", borderRadius: 8, fontSize: 14, width: "100%", outline: "none", cursor: "pointer", background: "#ffffff", border: "0.5px solid var(--border)", color: "var(--text-primary)" }}
            >
              <option value="all">all difficulties</option>
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </div>

          {/* list card representation */}
          <div style={{ background: "#ffffff", border: "0.5px solid #dde1e8", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "0.5px solid var(--border)" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Talent Pipeline Registry</span>
              <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, fontWeight: 500, background: "var(--surface-1)", color: "var(--text-secondary)", border: "0.5px solid var(--border)" }}>{filteredSessions.length} listed</span>
            </div>
            <div style={{ padding: 0 }}>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
                  <div style={{ width: 24, height: 24, border: "2px solid #1d9e75", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                </div>
              ) : filteredSessions.length === 0 ? (
                <EmptyState
                  icon="🔍"
                  title="no matching candidates"
                  sub="we couldn't find any candidate invites matching your search or filters"
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {filteredSessions.map((session, index) => {
                    return (
                      <div key={session._id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: index < filteredSessions.length - 1 ? "0.5px solid var(--border)" : "none" }}>
                        <div
                          style={{
                            width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            background: session.status === "completed" ? "#f0fdf4"
                              : session.status === "pending" ? "#fefce8"
                              : "var(--surface-1)",
                            color: session.status === "completed" ? "#15803d"
                              : session.status === "pending" ? "#a16207"
                              : "var(--text-muted)",
                          }}
                        >
                          {session.status === "completed" ? <IconCheck /> : <IconClock />}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {session.studentEmail}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                            {session.role} · <span style={{ textTransform: "capitalize" }}>{session.difficulty}</span> ·{" "}
                            {session.createdAt
                              ? new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                              : "—"}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                          {session.status === "completed" && session.report?.overallScore !== undefined && (
                            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#a16207" }}>
                              <IconStar />
                              {session.report.overallScore}/100
                            </div>
                          )}
                          <span style={{
                            fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700, textTransform: "uppercase",
                            background: session.status === "completed" ? "#f0fdf4" : (session.status === "pending" ? "#fefce8" : "var(--surface-1)"),
                            color: session.status === "completed" ? "#15803d" : (session.status === "pending" ? "#a16207" : "var(--text-secondary)"),
                            border: session.status === "completed" ? "0.5px solid #bbf7d0" : (session.status === "pending" ? "0.5px solid #fef08a" : "0.5px solid var(--border)")
                          }}>
                            {session.status}
                          </span>
                          {session.status === "completed" && (
                            <button
                              onClick={() => navigate(`/interview/${session._id}/report`)}
                              style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-primary)", background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 500 }}
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
