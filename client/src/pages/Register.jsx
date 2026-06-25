import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

const securityQuestions = [
  "What is your pet's name?",
  "What city were you born in?",
  "What is your favorite movie?",
  "What was your first school's name?",
  "What is your mother's maiden name?",
];

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    securityQuestion: securityQuestions[0],
    securityAnswer: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.securityAnswer.trim()) {
      setError("Security answer is required");
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        securityQuestion: formData.securityQuestion,
        securityAnswer: formData.securityAnswer,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Start creating"
      title="Make space for your next big idea."
      subtitle="One account, every project, and a workspace built to stay out of your way."
      compact
      footer={
        <p>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      }
    >
      {error && (
        <div className="form-message form-message-error">
          <span aria-hidden="true">!</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="register-username">
              Username
            </label>
            <input
              id="register-username"
              type="text"
              name="username"
              className="input-field"
              placeholder="yourname"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="field-label" htmlFor="register-email">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              name="email"
              className="input-field"
              placeholder="you@email.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="register-password">
              Password
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                name="password"
                className="input-field pr-16"
                placeholder="6+ characters"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
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
          <div>
            <label className="field-label" htmlFor="register-confirm-password">
              Confirm
            </label>
            <input
              id="register-confirm-password"
              type="password"
              name="confirmPassword"
              className="input-field"
              placeholder="Repeat password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="security-question">
            Recovery question
          </label>
          <select
            id="security-question"
            name="securityQuestion"
            className="input-field"
            value={formData.securityQuestion}
            onChange={handleChange}
          >
            {securityQuestions.map((question) => (
              <option key={question} value={question} style={{ background: "#11130f" }}>
                {question}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="security-answer">
            Recovery answer
          </label>
          <input
            id="security-answer"
            type="text"
            name="securityAnswer"
            className="input-field"
            placeholder="Keep this memorable"
            value={formData.securityAnswer}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary btn-lg w-full mt-1">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner" style={{ borderTopColor: "#16160d" }} />
              Creating workspace
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Create my workspace
              <span aria-hidden="true">→</span>
            </span>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Register;
