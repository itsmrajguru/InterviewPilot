import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import CompanyTopbar from "../../components/CompanyTopbar";
import { changePassword, deleteAccount } from "../../services/authService";

const IconLock    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconTrash   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IconEye     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEyeOff  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IconLogout  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconCheck   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

function SectionCard({ children, style }) {
  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 16,
      border: "1px solid #E2E8F0",
      boxShadow: "0 1px 3px rgba(15,23,42,0.03)",
      padding: 24,
      display: "flex",
      flexDirection: "column",
      gap: 20,
      ...style
    }}>
      {children}
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: "#EFF6FF", color: "#2563EB",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>{title}</div>
        <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{subtitle}</div>
      </div>
    </div>
  );
}

function Alert({ type, message }) {
  const styles = {
    success: { bg: "#F0FDF4", border: "#BBF7D0", color: "#15803D" },
    error:   { bg: "#FEF2F2", border: "#FCA5A5", color: "#DC2626" },
  };
  const s = styles[type];
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 500,
      display: "flex", alignItems: "center", gap: 8
    }}>
      {type === "success" ? <IconCheck /> : "⚠"}
      {message}
    </div>
  );
}

function PasswordInput({ id, label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder || "••••••••"}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "10px 40px 10px 14px",
            borderRadius: 10, border: "1.5px solid #E2E8F0",
            fontSize: 14, color: "#0F172A", background: "#F8FAFC", outline: "none",
            transition: "border-color 0.15s"
          }}
          onFocus={e => e.target.style.borderColor = "#2563EB"}
          onBlur={e => e.target.style.borderColor = "#E2E8F0"}
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: 0
          }}
        >
          {show ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>
    </div>
  );
}

function PasswordStrength({ password }) {
  const getStrength = (p) => {
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };
  const strength = getStrength(password);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["#E2E8F0", "#EF4444", "#F59E0B", "#10B981", "#2563EB"];

  if (!password) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{
          flex: 1, height: 4, borderRadius: 2,
          background: i <= strength ? colors[strength] : "#E2E8F0",
          transition: "background 0.3s"
        }} />
      ))}
      <span style={{ fontSize: 12, fontWeight: 600, color: colors[strength], minWidth: 40 }}>
        {labels[strength]}
      </span>
    </div>
  );
}

export default function CompanySettings() {
  const navigate = useNavigate();
  const userRaw = localStorage.getItem("user");
  const user    = userRaw ? JSON.parse(userRaw) : {};

  const [cpForm, setCpForm]       = useState({ current: "", newPwd: "", confirm: "" });
  const [cpLoading, setCpLoading] = useState(false);
  const [cpMsg, setCpMsg]         = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePwd, setDeletePwd]             = useState("");
  const [deleteLoading, setDeleteLoading]     = useState(false);
  const [deleteMsg, setDeleteMsg]             = useState(null);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setCpMsg(null);

    if (cpForm.newPwd !== cpForm.confirm) {
      return setCpMsg({ type: "error", text: "New passwords do not match." });
    }
    if (cpForm.newPwd.length < 6) {
      return setCpMsg({ type: "error", text: "New password must be at least 6 characters." });
    }

    setCpLoading(true);
    try {
      await changePassword(cpForm.current, cpForm.newPwd);
      setCpMsg({ type: "success", text: "Password changed successfully! Please log in again for security." });
      setCpForm({ current: "", newPwd: "", confirm: "" });
      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }, 2500);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Something went wrong.";
      setCpMsg({ type: "error", text: msg });
    } finally {
      setCpLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteMsg(null);
    if (!deletePwd) return setDeleteMsg({ type: "error", text: "Please enter your password." });
    setDeleteLoading(true);
    try {
      await deleteAccount(deletePwd);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Something went wrong.";
      setDeleteMsg({ type: "error", text: msg });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC", fontFamily: "var(--sans)", fontSize: 14 }}>
      <Sidebar role="company" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <CompanyTopbar title="Settings" sub="Manage your account" />

        <main className="ip-main-pad" style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Page heading */}
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
                Account Settings ⚙️
              </h1>
              <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
                Manage your security and account preferences.
              </p>
            </div>

            <div className="ip-grid-2col-responsive" style={{ alignItems: "start" }}>

              {/* LEFT column: Change Password */}
              <SectionCard>
                <SectionHeader
                  icon={<IconLock />}
                  title="Change Password"
                  subtitle="Update your login password"
                />

                <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <PasswordInput
                    id="cp-current-password"
                    label="Current Password"
                    value={cpForm.current}
                    onChange={e => setCpForm(f => ({ ...f, current: e.target.value }))}
                    placeholder="Enter current password"
                  />
                  <PasswordInput
                    id="cp-new-password"
                    label="New Password"
                    value={cpForm.newPwd}
                    onChange={e => setCpForm(f => ({ ...f, newPwd: e.target.value }))}
                    placeholder="At least 6 characters"
                  />
                  <PasswordStrength password={cpForm.newPwd} />
                  <PasswordInput
                    id="cp-confirm-password"
                    label="Confirm New Password"
                    value={cpForm.confirm}
                    onChange={e => setCpForm(f => ({ ...f, confirm: e.target.value }))}
                    placeholder="Repeat new password"
                  />

                  {cpMsg && <Alert type={cpMsg.type} message={cpMsg.text} />}

                  <button
                    type="submit"
                    disabled={cpLoading}
                    style={{
                      padding: "10px 20px", borderRadius: 10, alignSelf: "flex-start",
                      background: cpLoading ? "#93C5FD" : "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                      color: "#FFFFFF", border: "none", fontWeight: 600, fontSize: 13.5,
                      cursor: cpLoading ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 12px rgba(37,99,235,0.25)", transition: "all 0.15s",
                      display: "flex", alignItems: "center", gap: 8
                    }}
                  >
                    {cpLoading ? (
                      <><span className="ip-spinner" /> Changing...</>
                    ) : (
                      <><IconLock /> Update Password</>
                    )}
                  </button>
                </form>
              </SectionCard>

              {/* RIGHT column: Session + Danger Zone */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <SectionCard>
                  <SectionHeader
                    icon={<IconLogout />}
                    title="Session"
                    subtitle="Manage your active login session"
                  />
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 16px", borderRadius: 10, background: "#F8FAFC", border: "1px solid #F1F5F9",
                    flexWrap: "wrap", gap: 12
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Logged in as</div>
                      <div style={{ fontSize: 13, color: "#64748B" }}>{user?.email || "Unknown"}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 16px", borderRadius: 10,
                        background: "#FEF2F2", color: "#DC2626",
                        border: "1px solid #FECACA", fontWeight: 600, fontSize: 13,
                        cursor: "pointer", transition: "all 0.15s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#DC2626"; e.currentTarget.style.color = "#FFF"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = "#DC2626"; }}
                    >
                      <IconLogout /> Log Out
                    </button>
                  </div>
                </SectionCard>

                {/* Danger Zone */}
                <SectionCard style={{ border: "1px solid #FCA5A5" }}>
                  <SectionHeader
                    icon={<span style={{ color: "#DC2626" }}><IconTrash /></span>}
                    title="Danger Zone"
                    subtitle="Permanently delete your account and all data"
                  />
                  <div style={{
                    padding: "14px 16px", borderRadius: 10, background: "#FFF5F5", border: "1px solid #FED7D7"
                  }}>
                    <p style={{ margin: "0 0 12px 0", fontSize: 13, color: "#7F1D1D", lineHeight: 1.5 }}>
                      Once you delete your account, <strong>all your company sessions, reports, and data will be permanently removed</strong>. This action cannot be undone.
                    </p>
                    <button
                      onClick={() => { setShowDeleteModal(true); setDeleteMsg(null); setDeletePwd(""); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "9px 18px", borderRadius: 10,
                        background: "#DC2626", color: "#FFFFFF",
                        border: "none", fontWeight: 600, fontSize: 13,
                        cursor: "pointer", transition: "all 0.15s",
                        boxShadow: "0 4px 12px rgba(220,38,38,0.25)"
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#B91C1C"}
                      onMouseLeave={e => e.currentTarget.style.background = "#DC2626"}
                    >
                      <IconTrash /> Delete My Account
                    </button>
                  </div>
                </SectionCard>
              </div>{/* end right column */}
            </div>{/* end 2-col grid */}

            <div style={{ height: 20 }} />
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16
        }}>
          <div style={{
            background: "#FFFFFF", borderRadius: 20,
            border: "1px solid #FCA5A5",
            boxShadow: "0 20px 60px rgba(15,23,42,0.15)",
            padding: 32, maxWidth: 420, width: "100%",
            display: "flex", flexDirection: "column", gap: 20
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: "#FEF2F2", color: "#DC2626",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <IconTrash />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", margin: "0 0 8px" }}>
                Delete Account?
              </h2>
              <p style={{ fontSize: 13.5, color: "#64748B", margin: 0, lineHeight: 1.6 }}>
                This will permanently delete <strong>{user?.email}</strong> and all associated data. Enter your password to confirm.
              </p>
            </div>

            <PasswordInput
              id="cp-delete-password"
              label="Your Password"
              value={deletePwd}
              onChange={e => setDeletePwd(e.target.value)}
              placeholder="Enter your password"
            />

            {deleteMsg && <Alert type={deleteMsg.type} message={deleteMsg.text} />}

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  flex: 1, padding: "10px", borderRadius: 10,
                  background: "#F8FAFC", color: "#64748B",
                  border: "1px solid #E2E8F0", fontWeight: 600, fontSize: 13.5, cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                style={{
                  flex: 1, padding: "10px", borderRadius: 10,
                  background: deleteLoading ? "#FCA5A5" : "#DC2626", color: "#FFFFFF",
                  border: "none", fontWeight: 700, fontSize: 13.5,
                  cursor: deleteLoading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                }}
              >
                {deleteLoading ? <><span className="ip-spinner" /> Deleting...</> : <><IconTrash /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
