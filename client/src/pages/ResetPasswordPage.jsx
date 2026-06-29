import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../services/authService";


export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        //step 1: Fetching the token from the params
        if (!token) {
            setError("Invalid or missing reset token.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            //Returning the response given by the backend
            const res = await resetPassword(token, password);
            setMessage(res.message || "Password reset successfully. You can now log in.");
            setPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.error("Reset Password Error:", err.response?.data || err);
            const serverMessage = err.response?.data?.message;
            setError(serverMessage || err.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#e4e8ee", fontFamily: "var(--font-sans)", fontSize: 14 }}>
            <div style={{ width: "100%", maxWidth: 440, padding: 24 }}>
                
                {/* logo and header */}
                <div style={{ textAlign: "center", marginBottom: 32, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Link to="/" style={{ cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #0f6e56 0%, #1d9e75 100%)", boxShadow: "0 4px 12px rgba(29, 158, 117, 0.3)" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </Link>
                    <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-primary)", margin: 0, marginBottom: 4 }}>
                        Reset Password
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
                        Generate a new secure password for your account
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

                    {message ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "12px 16px", borderRadius: 8, background: "#f0fdf4", color: "#15803d", border: "0.5px solid #bbf7d0" }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                                <span>{message}</span>
                            </div>
                            <Link
                                to="/login"
                                style={{ fontSize: 14, color: "#ffffff", background: "#1d9e75", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontWeight: 500, width: "100%", textAlign: "center", textDecoration: "none", display: "inline-block" }}
                            >
                                Return to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>New Password</label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        minLength={6}
                                        autoComplete="new-password"
                                        style={{ padding: "10px 38px 10px 14px", borderRadius: 8, fontSize: 14, width: "100%", outline: "none", background: "var(--surface-1)", border: "0.5px solid var(--border)", color: "var(--text-primary)" }}
                                        onFocus={e => { e.currentTarget.style.borderColor = "var(--text-primary)"; e.currentTarget.style.background = "#ffffff"; }}
                                        onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface-1)"; }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
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

                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Confirm New Password</label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        minLength={6}
                                        autoComplete="new-password"
                                        style={{ padding: "10px 38px 10px 14px", borderRadius: 8, fontSize: 14, width: "100%", outline: "none", background: "var(--surface-1)", border: "0.5px solid var(--border)", color: "var(--text-primary)" }}
                                        onFocus={e => { e.currentTarget.style.borderColor = "var(--text-primary)"; e.currentTarget.style.background = "#ffffff"; }}
                                        onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface-1)"; }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(v => !v)}
                                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? (
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
                                style={{ fontSize: 14, color: "#ffffff", background: "#1d9e75", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontWeight: 500, width: "100%", marginTop: 8 }}
                            >
                                {loading ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    )}
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
