import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";
import AuthLayout from "../components/AuthLayout";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGetQuestion = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/security-question", { email });
      setSecurityQuestion(res.data.securityQuestion);
      setStep(2);
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

    setLoading(true);

    try {
      await API.post("/auth/reset-password", {
        email,
        securityAnswer,
        newPassword,
      });
      setSuccess("Your password has been reset successfully.");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const subtitle =
    step === 1
      ? "Tell us where to find your account."
      : step === 2
        ? "One quick check, then you are back in."
        : "Everything is ready for your return.";

  return (
    <AuthLayout
      eyebrow={`Recovery · step ${step} of 3`}
      title={step === 3 ? "You’re back in business." : "Reset your password."}
      subtitle={subtitle}
      footer={
        <p>
          Remembered it? <Link to="/login">Back to sign in</Link>
        </p>
      }
    >
      <div className="progress-steps" aria-label={`Step ${step} of 3`}>
        {[1, 2, 3].map((item) => (
          <span key={item} className={`progress-step ${item <= step ? "is-active" : ""}`} />
        ))}
      </div>

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

      {step === 1 && (
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
            {loading ? "Finding account..." : "Continue →"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetPassword} className="space-y-5 animate-fade-in">
          <div className="rounded-xl border border-[#e9c44a]/15 bg-[#e9c44a]/[0.055] p-4">
            <span className="eyebrow text-[#91865a] mb-2">Security question</span>
            <p className="text-sm text-[#e4dfc9]">{securityQuestion}</p>
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
            <input
              id="new-password"
              type="password"
              className="input-field"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
            {loading ? "Resetting password..." : "Reset password →"}
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="py-3 text-center animate-fade-in">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-[#69d49a]/20 bg-[#69d49a]/10 text-2xl text-[#8be0ad]">
            ✓
          </div>
          <p className="mb-2 text-lg font-semibold text-white">Password updated</p>
          <p className="mb-6 text-sm leading-6 text-[#777d70]">
            Your new password is active. Let’s get you back to building.
          </p>
          <Link to="/login" className="btn-primary btn-lg w-full">
            Return to sign in →
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}

export default ForgotPassword;
