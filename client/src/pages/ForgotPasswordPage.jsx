import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";


export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    /* This function call the forgotPassword axios,and just returns
    the response coming from the server,whether it may be error or success */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await forgotPassword(email);
            setMessage(res.message || "Password reset link sent to your email.");
            setEmail("");
        } catch (err) {
            setError(err.message || "Failed to send reset email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-sans)", fontSize: 14 }}>
            <div style={{ width: "100%", maxWidth: 440, padding: 24 }}>
                
                {/* logo and header */}
                <div style={{ textAlign: "center", marginBottom: 32, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Link to="/" style={{ cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, var(--accent-hover) 0%, var(--accent) 100%)", boxShadow: "0 4px 12px rgba(29, 158, 117, 0.3)" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--bg-card)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </Link>
                    <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-primary)", margin: 0, marginBottom: 4 }}>
                        Account Recovery
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
                        Enter your email below to receive a secure recovery link
                    </p>
                </div>

                {/* auth card */}
                <div className="ip-auth-box" style={{ background: "var(--bg-card)",
                    border: "0.5px solid var(--border)",
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
                                style={{ fontSize: 14, color: "#ffffff", background: "var(--accent)", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontWeight: 500, width: "100%", textAlign: "center", textDecoration: "none", display: "inline-block" }}
                            >
                                Return to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="name@example.com"
                                    style={{ padding: "10px 14px", borderRadius: 8, fontSize: 14, width: "100%", outline: "none", background: "var(--surface-1)", border: "0.5px solid var(--border)", color: "var(--text-primary)" }}
                                    onFocus={e => { e.currentTarget.style.borderColor = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-card)"; }}
                                    onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface-1)"; }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{ fontSize: 14, color: "#ffffff", background: "var(--accent)", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontWeight: 500, width: "100%", marginTop: 8 }}
                            >
                                {loading ? "Sending link..." : "Send Reset Link"}
                            </button>
                        </form>
                    )}

                    {!message && (
                        <div style={{ marginTop: 24, paddingTop: 20, display: "flex", flexDirection: "column", gap: 8, textAlign: "center", fontSize: 12, borderTop: "0.5px solid var(--border)", color: "var(--text-secondary)" }}>
                            <div>
                                Remember your password? <Link to="/login" style={{ fontWeight: 500, color: "var(--text-primary)", textDecoration: "none" }}>Back to Login</Link>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* footer */}
                <div style={{ marginTop: 32, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                    <span>&copy; 2026 CareerSync</span>
                    <Link to="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Privacy</Link>
                    <Link to="/legal" style={{ color: "inherit", textDecoration: "none" }}>Legal</Link>
                </div>
            </div>
        </div>
    );
}
