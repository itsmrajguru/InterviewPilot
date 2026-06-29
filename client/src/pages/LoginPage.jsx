import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  /* validates credentials — if valid, backend issues JWT tokens directly */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      if (data.success) {
        //change 1: check user role to redirect to correct dashboard
        if (data.user?.role === "company") {
          navigate("/company/dashboard");
        } else {
          navigate("/student/dashboard");
        }
      } else {
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || err.message || "Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#e4e8ee", fontFamily: "var(--font-sans)", fontSize: 14 }}>
      <div className="w-full max-w-md p-6 md:p-8">
        
        {/* logo and header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div onClick={() => navigate("/")} className="cursor-pointer mb-4 flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: "linear-gradient(135deg, #0f6e56 0%, #1d9e75 100%)", boxShadow: "0 4px 12px rgba(29, 158, 117, 0.3)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: "var(--text)" }}>
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Sign in to your InterviewPilot account
          </p>
        </div>

        {/* auth card */}
        <div className="ip-card p-6 md:p-8">
          {error && (
            <div className="mb-6 flex items-center gap-2 text-sm px-4 py-3 rounded" style={{ background: "var(--color-danger-bg)", color: "var(--color-danger-text)", border: "1px solid var(--color-danger-border)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Email address</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="px-3 py-2 rounded-lg text-sm w-full outline-none transition-all"
                style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Password</label>
                <Link to="/forgot-password" className="text-[11px] font-bold" style={{ color: "var(--accent)" }}>
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="px-3 py-2 pr-10 rounded-lg text-sm w-full outline-none transition-all"
                  style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 pt-5 flex flex-col gap-2 text-center text-xs" style={{ borderTop: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            <div>
              New here? <Link to="/signup" className="font-bold" style={{ color: "var(--text)" }}>Create an account</Link>
            </div>
            <div>
              Are you a recruiter? <Link to="/company-login" className="font-bold" style={{ color: "var(--accent)" }}>Company Portal →</Link>
            </div>
          </div>
        </div>
        
        {/* footer */}
        <div className="mt-8 text-center flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          <span>&copy; 2026 InterviewPilot</span>
          <Link to="/privacy">Privacy</Link>
          <Link to="/legal">Legal</Link>
        </div>
      </div>
    </div>
  );
}
