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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--sans)", fontSize: 14 }}>
            <div style={{ width: "100%", maxWidth: 440, padding: 24 }}>
                
                {/* logo and header */}
                <div style={{ textAlign: "center", marginBottom: 32, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Link to="/" style={{ cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img src="/logo-light.png" alt="InterviewPilot" style={{ height: 48, objectFit: "contain" }} />
                    </Link>
                    <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-primary)", margin: 0, marginBottom: 4 }}>
                        Account Recovery
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
                        Enter your email below to receive a secure recovery link
                    </p>
                </div>

                {/* auth card */}
                <div className="ip-auth-box" style={{ background: "var(--color-bg-panel)",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "var(--shadow-md)",
                    padding: 32,
                    width: "100%"
                }}>
                    {error && (
                        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "12px 16px", borderRadius: "var(--radius-md)", background: "var(--danger-bg)", color: "var(--danger-text)", border: "1px solid var(--danger-border)" }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--danger-text)", flexShrink: 0 }} />
                            <span>{error}</span>
                        </div>
                    )}

                    {message ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "12px 16px", borderRadius: "var(--radius-md)", background: "var(--success-bg)", color: "var(--success-text)", border: "1px solid var(--success-border)" }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success-text)", flexShrink: 0 }} />
                                <span>{message}</span>
                            </div>
                            <Link
                                to="/login"
                                style={{ fontSize: 14, color: "var(--color-bg-panel)", background: "var(--accent)", border: "none", borderRadius: "var(--radius-md)", padding: "10px 16px", cursor: "pointer", fontWeight: 500, width: "100%", textAlign: "center", textDecoration: "none", display: "inline-block" }}
                            >
                                Return to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="name@example.com"
                                    style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: 14, width: "100%", outline: "none", background: "var(--color-bg-panel-sunken)", border: "1px solid var(--color-border-subtle)", color: "var(--text-primary)" }}
                                    onFocus={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--color-bg-panel)"; }}
                                    onBlur={e => { e.currentTarget.style.borderColor = "var(--color-border-subtle)"; e.currentTarget.style.background = "var(--color-bg-panel-sunken)"; }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{ fontSize: 14, color: "var(--color-bg-panel)", background: "var(--accent)", border: "none", borderRadius: "var(--radius-md)", padding: "10px 16px", cursor: "pointer", fontWeight: 500, width: "100%", marginTop: 8 }}
                            >
                                {loading ? "Sending link..." : "Send Reset Link"}
                            </button>
                        </form>
                    )}

                    {!message && (
                        <div style={{ marginTop: 24, paddingTop: 20, display: "flex", flexDirection: "column", gap: 8, textAlign: "center", fontSize: 12, borderTop: "1px solid var(--color-border-subtle)", color: "var(--text-secondary)" }}>
                            <div>
                                Remember your password? <Link to="/login" style={{ fontWeight: 500, color: "var(--text-primary)", textDecoration: "none" }}>Back to Login</Link>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* footer */}
                <div style={{ marginTop: 32, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                    <span>&copy; 2026 CareerSync</span>
                    <Link to="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Privacy</Link>
                    <Link to="/legal" style={{ color: "inherit", textDecoration: "none" }}>Legal</Link>
                </div>
            </div>
        </div>
    );
}
