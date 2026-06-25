import BrandMark from "./BrandMark";

const codeLines = [
  ["keyword", "const "],
  ["plain", "ideas "],
  ["operator", "= "],
  ["plain", "await "],
  ["function", "build"],
  ["plain", "({"],
  ["property", " curiosity"],
  ["plain", ": "],
  ["string", '"infinite"'],
  ["plain", " });"],
];

function AuthLayout({ eyebrow, title, subtitle, children, footer, compact = false }) {
  return (
    <main className="auth-shell">
      <div className="ambient-orb ambient-orb-one" />
      <div className="ambient-orb ambient-orb-two" />
      <div className="ambient-orb ambient-orb-three" />

      <section className="auth-showcase" aria-label="CodeLab product preview">
        <div className="auth-showcase-inner">
          <BrandMark to="/" />

          <div className="showcase-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              Your ideas, in motion
            </span>
            <h2>
              From Classrooms to
              <br />
              <span className="gradient-text">Creation...</span>
            </h2>
            <p>
              A focused workspace for writing, running, and shaping code without
              losing your flow.
            </p>
          </div>

          <div className="code-window">
            <div className="code-window-bar">
              <div className="window-dots">
                <span />
                <span />
                <span />
              </div>
              <span className="code-window-title">hello-world.js</span>
              <span className="live-pill">
                <i />
                live
              </span>
            </div>
            <div className="code-window-body">
              <div className="code-line-number">01</div>
              <div className="code-line">
                {codeLines.map(([type, text], index) => (
                  <span key={`${type}-${index}`} className={`syntax-${type}`}>
                    {text}
                  </span>
                ))}
                <span className="typing-cursor" />
              </div>
              <div className="code-line-number">02</div>
              <div className="code-line">
                <span className="syntax-keyword">export default </span>
                <span className="syntax-plain">ideas;</span>
              </div>
            </div>
            <div className="code-window-footer">
              <span>JavaScript</span>
              <span>UTF-8</span>
              <span className="ml-auto">Ln 2, Col 22</span>
            </div>
          </div>

          <div className="floating-chip chip-command">
            <span>⌘</span>
            command ready
          </div>
          <div className="floating-chip chip-status">
            <span className="status-dot" />
            autosaved
          </div>

          <p className="showcase-footnote">
            <span>40+ languages</span>
            <span>•</span>
            <span>live preview</span>
            <span>•</span>
            <span>instant run</span>
          </p>
        </div>
      </section>

      <section className="auth-form-side">
        <div className={`auth-form-wrap ${compact ? "is-compact" : ""}`}>
          <div className="auth-mobile-brand">
            <BrandMark to="/" />
          </div>

          <div className="auth-heading">
            <span className="eyebrow auth-eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          <div className="auth-card">{children}</div>
          {footer && <div className="auth-footer">{footer}</div>}
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
