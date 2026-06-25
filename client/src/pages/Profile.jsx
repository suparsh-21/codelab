import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

function Profile() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mode, setMode] = useState("change"); // 'change' or 'reset'
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setError("New password cannot be the same as current password.");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setSuccess(res.data.message || "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!securityAnswer.trim()) {
      setError("Security answer is required.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/reset-password", {
        email: user?.email,
        securityAnswer,
        newPassword,
      });
      setSuccess("Password reset successfully using security question.");
      setSecurityAnswer("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="dash-page dot-bg">
      <div className="dash-container">
        {/* header */}
        <div className="dashboard-hero animate-fade-in">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Account details
          </span>
          <h1>
            Your <span className="hero-highlight">Profile.</span>
          </h1>
          <p>
            Manage your account information and personal details all in one
            place.
          </p>
        </div>

        <div className="profile-grid">
          {/* profile card */}
          <div
            className="glass-card profile-card animate-fade-in"
            style={{ animationDelay: "0.08s" }}
          >
            {/* top accent line */}
            <div className="profile-card-accent" aria-hidden="true" />

            <div className="profile-header">
              <div className="profile-avatar">
                <span className="profile-avatar-text">
                  {getInitials(user?.username)}
                </span>
                <span className="profile-avatar-ring" aria-hidden="true" />
                <span className="profile-avatar-glow" aria-hidden="true" />
              </div>
              <div className="profile-identity">
                <h2 className="profile-name">{user?.username || "User"}</h2>
                <span className="profile-role-badge">
                  <span className="profile-role-dot" />
                  Developer
                </span>
              </div>
            </div>

            <div className="profile-divider" />

            {/* info rows */}
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <div className="profile-info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.5-1.632Z" />
                  </svg>
                </div>
                <div className="profile-info-content">
                  <span className="profile-info-label">Username</span>
                  <span className="profile-info-value">{user?.username || "—"}</span>
                </div>
              </div>

              <div className="profile-info-item">
                <div className="profile-info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0-8.953 5.468a1.5 1.5 0 0 1-1.594 0L2.25 6.75" />
                  </svg>
                </div>
                <div className="profile-info-content">
                  <span className="profile-info-label">Email Address</span>
                  <span className="profile-info-value">{user?.email || "—"}</span>
                </div>
              </div>

              <div className="profile-info-item">
                <div className="profile-info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                </div>
                <div className="profile-info-content">
                  <span className="profile-info-label">Member Since</span>
                  <span className="profile-info-value">{formatDate(user?.createdAt)}</span>
                </div>
              </div>

              <div className="profile-info-item">
                <div className="profile-info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                </div>
                <div className="profile-info-content">
                  <span className="profile-info-label">Security Question</span>
                  <span className="profile-info-value">{user?.securityQuestion || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div
            className="glass-card change-password-card animate-fade-in"
            style={{ animationDelay: "0.14s" }}
          >
            {/* top accent line with custom gradient */}
            <div
              className="profile-card-accent"
              aria-hidden="true"
              style={{ background: "linear-gradient(90deg, #9c7bff, var(--gold))" }}
            />

            <div style={{ padding: "2rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "white", marginBottom: "0.5rem" }}>
                Security Options
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#777d70", marginBottom: "1.5rem" }}>
                Update your password to keep your workspace secure.
              </p>

              {error && (
                <div className="form-message form-message-error mb-4">
                  <span aria-hidden="true">!</span>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="form-message form-message-success mb-4">
                  <span aria-hidden="true">✓</span>
                  <span>{success}</span>
                </div>
              )}

              {mode === "change" ? (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="field-label" htmlFor="current-password" style={{ margin: 0 }}>
                        Current Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("reset");
                          setError("");
                          setSuccess("");
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmNewPassword("");
                          setSecurityAnswer("");
                        }}
                        className="form-link"
                        style={{ fontSize: "0.62rem", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        className="input-field pr-16"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="password-toggle"
                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                      >
                        {showCurrentPassword ? "hide" : "show"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="field-label" htmlFor="new-password">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        className="input-field pr-16"
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="password-toggle"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? "hide" : "show"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="field-label" htmlFor="confirm-new-password">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-new-password"
                        type={showConfirmPassword ? "text" : "password"}
                        className="input-field pr-16"
                        placeholder="Repeat new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="password-toggle"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? "hide" : "show"}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary btn-lg w-full mt-2">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="spinner" style={{ borderTopColor: "#16160d" }} />
                        Updating password
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Update password
                        <span aria-hidden="true">→</span>
                      </span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="rounded-xl border border-[#e9c44a]/15 bg-[#e9c44a]/[0.055] p-4 mb-2">
                    <span className="eyebrow text-[#91865a] mb-2 block" style={{ fontSize: "0.55rem" }}>Security question</span>
                    <p className="text-sm text-[#e4dfc9] font-medium">{user?.securityQuestion || "Loading security question..."}</p>
                  </div>

                  <div>
                    <label className="field-label" htmlFor="security-answer-profile">
                      Your Answer
                    </label>
                    <div className="relative">
                      <input
                        id="security-answer-profile"
                        type={showAnswer ? "text" : "password"}
                        className="input-field pr-16"
                        placeholder="Type your security answer"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowAnswer(!showAnswer)}
                        className="password-toggle"
                        aria-label={showAnswer ? "Hide answer" : "Show answer"}
                      >
                        {showAnswer ? "hide" : "show"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="field-label" htmlFor="new-password-reset">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="new-password-reset"
                        type={showNewPassword ? "text" : "password"}
                        className="input-field pr-16"
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="password-toggle"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? "hide" : "show"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="field-label" htmlFor="confirm-new-password-reset">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-new-password-reset"
                        type={showConfirmPassword ? "text" : "password"}
                        className="input-field pr-16"
                        placeholder="Repeat new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="password-toggle"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? "hide" : "show"}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="spinner" style={{ borderTopColor: "#16160d" }} />
                          Resetting password
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Reset password
                          <span aria-hidden="true">→</span>
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("change");
                        setError("");
                        setSuccess("");
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmNewPassword("");
                        setSecurityAnswer("");
                      }}
                      className="logout-button w-full mt-1"
                      style={{ fontSize: "0.62rem" }}
                    >
                      Back to change password
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
