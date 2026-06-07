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
    <div className="min-h-screen w-full flex flex-col lg:flex-row ip-bg-page">

      {/*added new 40-60 view
      and this is the left side 60 panel*/}
      <div className="hidden lg:flex lg:flex-[0.6] ip-auth-left shadow-[inset_-20px_0_40px_rgba(0,0,0,0.1)]">

        {/* this diaplays the content on the left panel with 
        carrersync logo and the text below it
        we have also added the return to home page here*/}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px]" />
        <div className="relative z-10 w-full max-w-[440px] text-center">
          {/* careersync logo */}
          <img
            src="/logo.svg"
            alt="InterviewPilot Logo"
            className="w-32 h-32 mx-auto mb-6 shadow-2xl rounded-[32px] border border-white/10 p-2"
            style={{ filter: "drop-shadow(0 0 50px rgba(0, 199, 183, 0.3))" }}
          />
          <h2 className="text-[52px] font-display font-black text-white leading-[0.9] tracking-[-3px] mb-3">
            One source of <span className="text-primary-400">truth.</span>
          </h2>
          <p className="text-[17px] text-white/60 font-medium leading-relaxed mb-4 mx-auto max-w-[380px]">
            The modern talent infrastructure for the world's most ambitious companies. Sign in to access your verified professional ecosystem.
          </p>
        </div>
      </div>

      {/* added new 40-60 view
      and this is the right side 40 panel*/}
      <div className="flex-1 lg:flex-[0.4] ip-auth-right relative z-10 px-4 md:px-6 lg:px-8">
        <div className="w-full max-w-[320px] flex flex-col gap-6">

          {/* mobile logo - only visible on small screens */}
          <div className="lg:hidden flex justify-center mb-2" onClick={() => navigate("/")}>
            <img src="/logo.svg" alt="Logo" className="w-14 h-14 rounded-2xl shadow-lg ip-border" />
          </div>

          {/* Hero section */}
          <div className="text-left">
            <h1 className="text-[28px] font-display font-black ip-text-primary tracking-[-1.5px] leading-tight mb-1">
              Welcome back.
            </h1>
            <p className="ip-text-secondary text-[12px] font-medium">
              Continue your professional growth journey.
            </p>
          </div>

          {/* Displaying state messages 
          i.e. those error message , which shoudl be shown on incorrect email,
          incorrect password, email not verified... etc*/}
          {error && (
            <div className="ip-alert ip-alert-danger animate-fade-up">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
              <span>{error}</span>
            </div>
          )}

          {/*through this form, we will take the email and password
          from the user and log them in directly  */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="ip-form-group">
              <label className="ip-label">Email address</label>
              <input
                type="email"
                name="email"
                className="ip-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
              />
            </div>

            <div className="ip-form-group">
              {/* forgot password section... 
              Option for the user to change the password*/}
              <div className="flex items-center justify-between px-0.5">
                <label className="ip-label mb-0">Password</label>
                <Link to="/forgot-password" className="text-[9px] font-black ip-text-accent hover:underline uppercase tracking-widest">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  className="ip-input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
                {/* the eye button that display , and undisplay the password 
                to show and hide it for the user */}
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 ip-text-muted hover:text-black transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* submit button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-1"
            >
              {loading ? "Signing in..." : "Sign in to InterviewPilot"}
            </button>
          </form>

          {/* links to go to the signup and company login pages */}
          <div className="text-center text-[12px] ip-text-secondary font-medium border-t ip-border-top pt-6">
            New here?{" "}
            <Link to="/signup" className="ip-text-primary hover:text-primary-500 font-black transition-colors underline decoration-primary-500/20 hover:decoration-primary-500">
              Start your profile
            </Link>
            <span className="block mt-2 text-[11px] ip-text-secondary">
              A recruiter?{" "}
              <Link to="/company-login" className="ip-text-accent font-black hover:underline">
                Recruiter Portal →
              </Link>
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-10 flex items-center justify-center gap-6 text-[9px] ip-text-muted font-bold uppercase tracking-widest opacity-60">
          <span>&copy; 2026 InterviewPilot</span>
          <Link to="/privacy" className="hover:text-black">Privacy</Link>
          <Link to="/legal" className="hover:text-black">Legal</Link>
        </div>
      </div>
    </div>
  );
}
