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
      <div style={{ width: "100%", maxWidth: 440, padding: 24 }}>
        
        {/* logo and header */}
        <div style={{ textAlign: "center", marginBottom: 32, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div onClick={() => navigate("/")} style={{ cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #0f6e56 0%, #1d9e75 100%)", boxShadow: "0 4px 12px rgba(29, 158, 117, 0.3)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-primary)", margin: 0, marginBottom: 4 }}>
            Verify Email
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
            A 6-digit code has been sent to <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{email}</span>
          </p>
        </div>

        {/* auth card */}
        <div style={{
          background: "#ffffff",
          border: "0.5px solid #dde1e8",
          borderRadius: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          padding: 32,
          width: "100%"
        }}>
          {error && (
            <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "12px 16px", borderRadius: 8, background: "#fef2f2", color: "#b91c1c", border: "0.5px solid #fecaca" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleOtpSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", textAlign: "center" }}>Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
                placeholder="000000"
                autoFocus
                style={{ padding: "16px 14px", borderRadius: 8, fontSize: 32, fontWeight: 700, textAlign: "center", letterSpacing: "0.4em", width: "100%", outline: "none", background: "var(--surface-1)", border: "0.5px solid var(--border)", color: "var(--text-primary)" }}
                onFocus={e => { e.currentTarget.style.borderColor = "var(--text-primary)"; e.currentTarget.style.background = "#ffffff"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface-1)"; }}
              />
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", textAlign: "center", marginTop: 4 }}>
                Expires in 10 minutes
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                style={{ fontSize: 14, color: "#ffffff", background: "#1d9e75", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontWeight: 500, width: "100%" }}
              >
                {loading ? "Verifying..." : "Confirm Verification"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/signup")}
                style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", padding: "8px 0" }}
                onMouseOver={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
              >
                ← Use different email
              </button>
            </div>
          </form>
        </div>
        
        {/* footer */}
        <div style={{ marginTop: 32, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
          <span>&copy; 2026 InterviewPilot</span>
          <Link to="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Privacy</Link>
          <Link to="/legal" style={{ color: "inherit", textDecoration: "none" }}>Legal</Link>
        </div>
      </div>
    </div>
  );
}
