import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import StudentTopbar from "../../components/StudentTopbar";
import CompanyTopbar from "../../components/CompanyTopbar";
import { getCompanySessions } from "../../services/interviewService";

import { IconClock, IconCheck, IconArrowRight, IconStar, IconSearch, IconDownload, IconUsers, IconCircleCheck, IconTrendUp } from "../../components/ui/icons";
import StatCard from "../../components/ui/StatCard";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";

export default function CompanyInterviews() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter]       = useState("all");
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
      (s.role || "").toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesDiff   = difficultyFilter === "all" || s.difficulty === difficultyFilter;

    return matchesSearch && matchesStatus && matchesDiff;
  });

  const pendingCount   = sessions.filter(s => s.status === "pending").length;
  const completedCount = sessions.filter(s => s.status === "completed").length;
  const completedWithScore = sessions.filter(s => s.status === "completed" && s.report?.overallScore !== undefined);
  const avgScore = completedWithScore.length > 0
    ? Math.round(completedWithScore.reduce((acc, curr) => acc + (curr.report?.overallScore || 0), 0) / completedWithScore.length)
    : null;

  return (
    <div className="ip-app-wrapper" style={{ display:"flex", minHeight:"100vh", background: "#F8FAFC", overflow: "hidden", fontFamily: "var(--sans)", fontSize: 13 }}>
      <Sidebar role="company" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        <CompanyTopbar 
          title="Candidate Pipeline"
          action={
            <button
              onClick={handleExportCSV}
              disabled={filteredSessions.length === 0}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8,
                background: "#FFFFFF", color: "#0F172A", border: "1px solid #E2E8F0",
                fontWeight: 600, fontSize: 12.5, cursor: filteredSessions.length > 0 ? "pointer" : "not-allowed",
                opacity: filteredSessions.length > 0 ? 1 : 0.6
              }}
            >
              <IconDownload style={{ width: 14, height: 14 }} /> Export CSV
            </button>
          }
        />

        <main style={{ flex: 1, overflowY: "auto", padding: "20px 24px 40px" }}>
          <div style={{ maxWidth: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Banner Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
                  Candidate Registry 🎯
                </h1>
                <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
                  Search, filter, and review evaluations for all candidate invites sent by your team.
                </p>
              </div>

              <button
                onClick={() => navigate("/company/dashboard")}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 10,
                  background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", color: "#FFFFFF",
                  border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)", transition: "all 0.15s"
                }}
              >
                <span>✨</span> Create Invite
              </button>
            </div>

            {/* 4 Top Stat Cards Grid */}
            <div className="ip-stat-cards-grid">
              <StatCard label="Total Invites" value={loading ? <Skeleton width={30} height={22} /> : sessions.length} sub="All time total" icon={IconUsers} hue="blue" />
              <StatCard label="Pending" value={loading ? <Skeleton width={30} height={22} /> : pendingCount} sub={pendingCount > 0 ? "Action needed" : "All clear"} icon={IconClock} hue="amber" />
              <StatCard label="Completed" value={loading ? <Skeleton width={30} height={22} /> : completedCount} sub="Rounds finished" icon={IconCircleCheck} hue="emerald" />
              <StatCard label="Average Score" value={loading ? <Skeleton width={30} height={22} /> : (avgScore !== null ? avgScore : "—")} sub={avgScore !== null ? "out of 100" : "Keep going!"} icon={IconTrendUp} hue="purple" />
            </div>

            {/* Search and Filters Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex" }}>
                  <IconSearch style={{ width: 15, height: 15 }} />
                </span>
                <input
                  type="text"
                  placeholder="Search candidate email or role..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    padding: "9px 12px 9px 36px", borderRadius: 10, fontSize: 13, width: "100%", outline: "none",
                    background: "#FFFFFF", border: "1px solid #E2E8F0", color: "#0F172A", transition: "all 0.15s"
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = "#2563EB"}
                  onBlur={e => e.currentTarget.style.borderColor = "#E2E8F0"}
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ padding: "9px 14px", borderRadius: 10, fontSize: 13, outline: "none", cursor: "pointer", background: "#FFFFFF", border: "1px solid #E2E8F0", color: "#0F172A" }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={difficultyFilter}
                onChange={e => setDifficultyFilter(e.target.value)}
                style={{ padding: "9px 14px", borderRadius: 10, fontSize: 13, outline: "none", cursor: "pointer", background: "#FFFFFF", border: "1px solid #E2E8F0", color: "#0F172A" }}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Candidates Pipeline Table Card */}
            <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.03)", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
                  <IconUsers style={{ color: "#2563EB", width: 18, height: 18 }} /> All Candidates
                </span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#2563EB", background: "#EEF2FF", padding: "2px 10px", borderRadius: 10 }}>
                  {filteredSessions.length} total
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {loading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 10 }}>
                    {[1,2,3].map(i => <Skeleton key={i} height={52} />)}
                  </div>
                ) : filteredSessions.length === 0 ? (
                  <EmptyState
                    title="No matching candidates"
                    subtext="We couldn't find any candidate invites matching your search or filters."
                  />
                ) : (
                  filteredSessions.map(session => {
                    const isCompleted = session.status === "completed";
                    const isPending   = session.status === "pending";
                    const initial     = (session.studentEmail || "C").charAt(0).toUpperCase();

                    return (
                      <div key={session._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 12, background: "#F8FAFC", border: "1px solid #F1F5F9" }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          background: isCompleted ? "#ECFDF5" : isPending ? "#FEF3C7" : "#EFF6FF",
                          color: isCompleted ? "#059669" : isPending ? "#D97706" : "#2563EB", fontWeight: 700, fontSize: 14
                        }}>
                          {initial}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {session.studentEmail}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                            {session.role || "Software Engineer"} · <span style={{ textTransform: "capitalize" }}>{session.difficulty}</span> ·{" "}
                            {session.createdAt ? new Date(session.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                          {isCompleted && session.report?.overallScore !== undefined && (
                            <span style={{ fontSize: 12, fontWeight: 700, color: session.report.overallScore >= 75 ? "#059669" : "#2563EB", background: session.report.overallScore >= 75 ? "#ECFDF5" : "#EFF6FF", padding: "4px 8px", borderRadius: 8 }}>
                              {session.report.overallScore}/100
                            </span>
                          )}

                          {isCompleted ? (
                            <button
                              onClick={() => navigate(`/interview/${session._id}/report`)}
                              style={{ padding: "6px 16px", borderRadius: 8, background: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}
                            >
                              Report →
                            </button>
                          ) : isPending ? (
                            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#D97706", background: "#FEF3C7", padding: "3px 10px", borderRadius: 10 }}>
                              Pending
                            </span>
                          ) : (
                            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#2563EB", background: "#EEF2FF", padding: "3px 10px", borderRadius: 10 }}>
                              {session.status}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
