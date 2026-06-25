import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import API from "../utils/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Recovery States
  const [mode, setMode] = useState("login"); // "login", "forgot-email", "forgot-reset"
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGetQuestion = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/security-question", { email: recoveryEmail });
      setSecurityQuestion(res.data.securityQuestion);
      setMode("forgot-reset");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await API.post("/auth/reset-password", {
        email: recoveryEmail,
        securityAnswer,
        newPassword,
      });
      setSuccess("Your password has been reset successfully. You can now sign in.");
      setMode("login");
      setEmail(recoveryEmail);
      setPassword("");
      setRecoveryEmail("");
      setSecurityAnswer("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getEyebrow = () => {
    if (mode === "login") return "Welcome back";
    if (mode === "forgot-email") return "Recovery · step 1 of 2";
    return "Recovery · step 2 of 2";
  };

  const getTitle = () => {
    if (mode === "login") return "Step into your workspace.";
    return "Reset your password.";
  };

  const getSubtitle = () => {
    if (mode === "login") return "Sign in and pick up exactly where your last idea left off.";
    if (mode === "forgot-email") return "Tell us where to find your account.";
    return "One quick check, then you are back in.";
  };

  return (
    <AuthLayout
      eyebrow={getEyebrow()}
      title={getTitle()}
      subtitle={getSubtitle()}
      footer={
        mode === "login" ? (
          <p>
            New to CodeLab? <Link to="/register">Create an account</Link>
          </p>
        ) : (
          <p>
            Remembered it?{" "}
            <button
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
              className="form-link"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "inherit" }}
            >
              Back to sign in
            </button>
          </p>
        )
      }
    >
      {error && (
        <div className="form-message form-message-error">
          <span aria-hidden="true">!</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="form-message form-message-success">
          <span aria-hidden="true">✓</span>
          <span>{success}</span>
        </div>
      )}

      {mode === "login" && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="field-label" htmlFor="login-email">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="field-label" htmlFor="login-password" style={{ margin: 0 }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setMode("forgot-email");
                  setError("");
                  setSuccess("");
                  setRecoveryEmail(email);
                }}
                className="form-link"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="input-field pr-16"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "hide" : "show"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner" style={{ borderTopColor: "#16160d" }} />
                Signing in
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Enter workspace
                <span aria-hidden="true">→</span>
              </span>
            )}
          </button>
        </form>
      )}

      {mode === "forgot-email" && (
        <form onSubmit={handleGetQuestion} className="space-y-5 animate-fade-in">
          <div>
            <label className="field-label" htmlFor="recovery-email">
              Email address
            </label>
            <input
              id="recovery-email"
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
            {loading ? "Finding account..." : "Continue →"}
          </button>
        </form>
      )}

      {mode === "forgot-reset" && (
        <form onSubmit={handleResetPassword} className="space-y-5 animate-fade-in">
          <div className="rounded-xl border border-[#e9c44a]/15 bg-[#e9c44a]/[0.055] p-4">
            <span className="eyebrow text-[#91865a] mb-2 block" style={{ fontSize: "0.55rem" }}>Security question</span>
            <p className="text-sm text-[#e4dfc9] font-medium">{securityQuestion}</p>
          </div>

          <div>
            <label className="field-label" htmlFor="security-response">
              Your answer
            </label>
            <input
              id="security-response"
              type="text"
              className="input-field"
              placeholder="Type your answer"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="new-password">
              New password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                className="input-field pr-16"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
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
            <label className="field-label" htmlFor="confirm-password">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                className="input-field pr-16"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
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

          <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
            {loading ? "Resetting password..." : "Reset password →"}
          </button>
        </form>
      )}

      <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-[#555b51] mono">
        <span className="status-dot" />
        Secure session · autosave enabled
      </div>
    </AuthLayout>
  );
}

export default Login;
