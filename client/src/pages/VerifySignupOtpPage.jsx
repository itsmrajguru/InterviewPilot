import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { verifySignupOtp } from "../services/authService";


export default function VerifySignupOtpPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* extract the email passed from SignupPage via navigation state */
  const location = useLocation();
  const email = location.state?.email;

  /* if user lands here without going through signup, send them back */
  if (!email) {
    navigate("/signup");
    return null;
  }

  /* This function verifies the OTP sent to the user's email during signup */
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      //step 1 : call the verifySignupOtp api with email and otp
      const data = await verifySignupOtp({ email, otp });

      if (data && data.success) {
        //step 2 : on success, redirect to login page
        navigate("/login");
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP Verify Error:", err);
      setError(err.response?.data?.message || err.message || "Verification failed. Please try again.");
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
            Verify Email
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            A 6-digit code has been sent to <span className="font-bold" style={{ color: "var(--text)" }}>{email}</span>
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

          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-center" style={{ color: "var(--text-muted)" }}>Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
                placeholder="000000"
                autoFocus
                className="px-3 py-4 rounded-lg text-3xl font-black text-center tracking-[0.5em] w-full outline-none transition-all"
                style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
              <p className="text-[9px] font-bold uppercase tracking-wider text-center mt-1" style={{ color: "var(--text-muted)" }}>
                Expires in 10 minutes
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn-primary w-full py-2.5"
              >
                {loading ? "Verifying..." : "Confirm Verification"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="py-2 text-[11px] font-bold uppercase tracking-widest transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseOver={(e) => e.currentTarget.style.color = "var(--text)"}
                onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
              >
                ← Use different email
              </button>
            </div>
          </form>
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
