import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { getCompanySessions } from "../../services/interviewService";

import { IconClock, IconCheck, IconArrowRight, IconStar, IconSearch, IconDownload } from "../../components/ui/icons";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";

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

  return (
    <div className="ip-app-wrapper" style={{ display:"flex", minHeight:"100vh", background: "var(--bg)", fontFamily: "var(--sans)", fontSize: 14 }}>
      <Sidebar role="company" />

      {/* main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* top bar */}
        <header style={{ padding: "0 var(--space-6)", height: 56, background: "var(--color-bg-panel)", borderBottom: "1px solid var(--color-border-subtle)", position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, fontFamily: "var(--sans)" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.04em", textTransform: "uppercase" }}>Recruiter workspace</span>
            <span style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>All Candidates</span>
          </div>
          <Button variant="secondary" onClick={handleExportCSV} disabled={filteredSessions.length === 0} size="sm">
            <IconDownload /> Export CSV
          </Button>
        </header>

        {/* page body */}
        <main style={{ flex: 1, overflowY: "auto" }}>
          <PageHeader 
            title="Pipeline Registry" 
            subtitle="Search, filter and inspect all candidate invites sent by your organization" 
          />

          <div style={{ maxWidth: 1180, margin: "-24px auto 0", padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

            {/* search and filter tools bar */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
              
              {/* search input box */}
              <div style={{ position: "relative", gridColumn: "span 2" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", display: "flex" }}>
                  <IconSearch />
                </span>
                <input
                  type="text"
                  placeholder="Search by email or role..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ padding: "10px 12px 10px 36px", borderRadius: "var(--radius-md)", fontSize: 14, width: "100%", outline: "none", background: "var(--color-bg-panel)", border: "1px solid var(--color-border-subtle)", color: "var(--text-primary)", transition: "all 0.2s" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "var(--color-border-subtle)"; }}
                />
              </div>

              {/* status selector */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ padding: "10px 12px", borderRadius: "var(--radius-md)", fontSize: 14, width: "100%", outline: "none", cursor: "pointer", background: "var(--color-bg-panel)", border: "1px solid var(--color-border-subtle)", color: "var(--text-primary)" }}
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>

              {/* difficulty selector */}
              <select
                value={difficultyFilter}
                onChange={e => setDifficultyFilter(e.target.value)}
                style={{ padding: "10px 12px", borderRadius: "var(--radius-md)", fontSize: 14, width: "100%", outline: "none", cursor: "pointer", background: "var(--color-bg-panel)", border: "1px solid var(--color-border-subtle)", color: "var(--text-primary)" }}
              >
                <option value="all">All difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* list card representation */}
            <Card>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--color-border-subtle)" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Talent Pipeline Registry</span>
                <Badge variant="neutral">{filteredSessions.length} listed</Badge>
              </div>
              <div style={{ padding: 0 }}>
                {loading ? (
                  <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                  </div>
                ) : filteredSessions.length === 0 ? (
                  <EmptyState
                    title="No matching candidates"
                    subtext="We couldn't find any candidate invites matching your search or filters"
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {filteredSessions.map((session, index) => {
                      return (
                        <div key={session._id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: index < filteredSessions.length - 1 ? "1px solid var(--color-border-subtle)" : "none" }}>
                          <div
                            style={{
                              width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                              background: session.status === "completed" ? "var(--success-bg)"
                                : session.status === "pending" ? "var(--warning-bg)"
                                : "var(--color-bg-panel-sunken)",
                              color: session.status === "completed" ? "var(--success-text)"
                                : session.status === "pending" ? "var(--warning-text)"
                                : "var(--text-disabled)",
                            }}
                          >
                            {session.status === "completed" ? <IconCheck /> : <IconClock />}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {session.studentEmail}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                              {session.role} · <span style={{ textTransform: "capitalize" }}>{session.difficulty}</span> ·{" "}
                              {session.createdAt
                                ? new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                                : "—"}
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                            {session.status === "completed" && session.report?.overallScore !== undefined && (
                              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "var(--warning-text)" }}>
                                <IconStar />
                                {session.report.overallScore}/100
                              </div>
                            )}
                            
                            <Badge variant={session.status === "completed" ? "success" : session.status === "pending" ? "warning" : "neutral"} style={{ textTransform: "uppercase" }}>
                              {session.status}
                            </Badge>

                            {session.status === "completed" && (
                              <Button size="sm" variant="secondary" onClick={() => navigate(`/interview/${session._id}/report`)}>
                                Report <IconArrowRight />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
