import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

// all supported languages with labels and colors
const ALL_LANGUAGES = [
  // popular ones first
  { value: "javascript", label: "JavaScript", color: "#F7DF1E", icon: "JS" },
  { value: "typescript", label: "TypeScript", color: "#3178C6", icon: "TS" },
  { value: "python", label: "Python", color: "#3572A5", icon: "PY" },
  { value: "java", label: "Java", color: "#B07219", icon: "JV" },
  { value: "cpp", label: "C++", color: "#F34B7D", icon: "C++" },
  { value: "c", label: "C", color: "#555555", icon: "C" },
  { value: "csharp", label: "C#", color: "#178600", icon: "C#" },
  { value: "go", label: "Go", color: "#00ADD8", icon: "GO" },
  { value: "rust", label: "Rust", color: "#DEA584", icon: "RS" },
  { value: "ruby", label: "Ruby", color: "#CC342D", icon: "RB" },
  { value: "php", label: "PHP", color: "#4F5D95", icon: "PHP" },
  { value: "swift", label: "Swift", color: "#F05138", icon: "SW" },
  { value: "kotlin", label: "Kotlin", color: "#A97BFF", icon: "KT" },
  { value: "dart", label: "Dart", color: "#00B4AB", icon: "DT" },
  { value: "scala", label: "Scala", color: "#DC322F", icon: "SC" },
  { value: "r", label: "R", color: "#198CE7", icon: "R" },
  { value: "perl", label: "Perl", color: "#0298C3", icon: "PL" },
  { value: "lua", label: "Lua", color: "#000080", icon: "LU" },
  { value: "bash", label: "Bash", color: "#4EAA25", icon: "SH" },
  { value: "powershell", label: "PowerShell", color: "#012456", icon: "PS" },
  { value: "haskell", label: "Haskell", color: "#5D4F85", icon: "HS" },
  { value: "elixir", label: "Elixir", color: "#6E4A7E", icon: "EX" },
  { value: "clojure", label: "Clojure", color: "#5881D8", icon: "CJ" },
  { value: "fsharp", label: "F#", color: "#B845FC", icon: "F#" },
  { value: "objectivec", label: "Objective-C", color: "#438EFF", icon: "OC" },
  { value: "pascal", label: "Pascal", color: "#E3F171", icon: "PA" },
  { value: "groovy", label: "Groovy", color: "#4298B8", icon: "GR" },
  { value: "julia", label: "Julia", color: "#9558B2", icon: "JL" },
  { value: "ocaml", label: "OCaml", color: "#3BE133", icon: "ML" },
  { value: "fortran", label: "Fortran", color: "#4D41B1", icon: "FT" },
  { value: "cobol", label: "COBOL", color: "#555555", icon: "CB" },
  { value: "erlang", label: "Erlang", color: "#B83998", icon: "ER" },
  { value: "nim", label: "Nim", color: "#FFE953", icon: "NM" },
  { value: "zig", label: "Zig", color: "#EC915C", icon: "ZG" },
  { value: "vlang", label: "V", color: "#5D87BF", icon: "V" },
  // web / markup / data
  { value: "html", label: "HTML", color: "#E34C26", icon: "HT" },
  { value: "css", label: "CSS", color: "#1572B6", icon: "CS" },
  { value: "markdown", label: "Markdown", color: "#083FA1", icon: "MD" },
  { value: "json", label: "JSON", color: "#292929", icon: "{}" },
  { value: "xml", label: "XML", color: "#0060AC", icon: "XM" },
  { value: "yaml", label: "YAML", color: "#CB171E", icon: "YM" },
  { value: "sql", label: "SQL", color: "#E38C00", icon: "SQ" },
  { value: "graphql", label: "GraphQL", color: "#E10098", icon: "GQ" },
];

// quick lookup map
const langMap = {};
ALL_LANGUAGES.forEach((l) => {
  langMap[l.value] = l;
});

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", language: "javascript" });
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [langSearch, setLangSearch] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data.projects);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    setCreating(true);
    try {
      const res = await API.post("/projects", newProject);
      navigate(`/editor/${res.data.project._id}`);
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await API.delete(`/projects/${id}`);
      setProjects(projects.filter((p) => p._id !== id));
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  // filtered language list for modal search
  const filteredLanguages = useMemo(() => {
    if (!langSearch.trim()) return ALL_LANGUAGES;
    const q = langSearch.toLowerCase();
    return ALL_LANGUAGES.filter(
      (l) => l.label.toLowerCase().includes(q) || l.value.includes(q)
    );
  }, [langSearch]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="dash-page dot-bg">
      <div className="dash-container">
        {/* header */}
        <div className="dashboard-hero animate-fade-in">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Personal workspace
          </span>
          <h1>
            Good to see you, <span className="hero-highlight">{user?.username || "builder"}.</span>
          </h1>
          <p style={{ display: "none" }}>
            your workspace · {projects.length} {projects.length === 1 ? "project" : "projects"} total
          </p>
          <p>
            Everything you are building, learning, and experimenting with—ready
            for the next line of code.
          </p>
          <div className="hero-code-decoration" aria-hidden="true">&lt;/&gt;</div>
        </div>

        {/* stats */}
        <div className="dash-stats-grid animate-fade-in" style={{ animationDelay: "0.08s" }}>
          <div className="glass-card stat-card dash-stat-item">
            <div className="dash-stat-icon dash-stat-icon-gold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 7.5h6l2 2h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-11Z" />
                <path d="M3 7.5v-2a2 2 0 0 1 2-2h4l2 2h4" />
              </svg>
            </div>
            <div>
              <p className="dash-stat-number">{projects.length}</p>
              <p className="dash-stat-label mono">Active projects</p>
            </div>
          </div>
          <div className="glass-card stat-card dash-stat-item">
            <div className="dash-stat-icon dash-stat-icon-violet">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" />
              </svg>
            </div>
            <div>
              <p className="dash-stat-number">
                {new Set(projects.map((p) => p.language)).size}
              </p>
              <p className="dash-stat-label mono">Languages used</p>
            </div>
          </div>
          <div className="glass-card stat-card dash-stat-item">
            <div className="dash-stat-icon dash-stat-icon-cyan">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <div>
              <p className="dash-stat-number">{ALL_LANGUAGES.length}</p>
              <p className="dash-stat-label mono">Supported runtimes</p>
            </div>
          </div>
        </div>

        {/* section header */}
        <div className="dash-section-header animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <div>
            <span className="dash-section-count mono">
              {projects.length} {projects.length === 1 ? "project" : "projects"} total
            </span>
            <h2 className="dash-section-title">Recent work</h2>
          </div>
          <button 
            onClick={() => { setShowModal(true); setLangSearch(""); }} 
            className="btn-primary btn-sm dash-new-project-btn"
          >
            <svg style={{ width: "0.875rem", height: "0.875rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New project
          </button>
        </div>

        {/* project grid */}
        {loading ? (
          <div className="dash-loading">
            <div className="spinner" style={{ width: 28, height: 28 }}></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="dash-empty animate-fade-in glass-card">
            <div className="dash-empty-inner">
              <div className="dash-empty-icon editor-empty-symbol">
                <span className="mono">&lt;/&gt;</span>
              </div>
              <h3 className="dash-empty-title">A clean slate. Nice.</h3>
              <p className="dash-empty-desc">Create your first project and turn that blinking cursor into something real.</p>
              <button onClick={() => { setShowModal(true); setLangSearch(""); }} className="btn-primary btn-md">
                Create first project
              </button>
            </div>
          </div>
        ) : (
          <div className="dash-projects-grid">
            {projects.map((project, i) => {
              const lang = langMap[project.language] || { label: project.language, color: "#888", icon: "?" };
              const codeLines = project.code?.split("\n").length || 0;
              const charCount = project.code?.length || 0;
              
              return (
                <div
                  key={project._id}
                  className="project-card glass-card glass-card-hover dash-project-card"
                  style={{ animationDelay: `${0.05 * i}s`, cursor: "pointer" }}
                  onClick={() => navigate(`/editor/${project._id}`)}
                >
                  <div>
                    <div className="dash-project-header">
                      <div className="dash-project-info">
                        <div
                          className="dash-project-lang-icon mono"
                          style={{
                            background: `${lang.color}08`,
                            color: lang.color,
                            border: `1px solid ${lang.color}15`,
                          }}
                        >
                          {lang.icon}
                        </div>
                        <div>
                          <h3 className="dash-project-name">
                            {project.name}
                          </h3>
                          <p className="dash-project-lang mono">{lang.label}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(project._id);
                        }}
                        className="btn-delete dash-project-delete mono"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="dash-project-meta">
                      <span className="mono">
                        {codeLines} {codeLines === 1 ? "line" : "lines"} · {charCount} chars
                      </span>
                    </div>
                  </div>

                  <div className="dash-project-footer">
                    <div className="dash-progress-bar">
                      <div
                        className="project-progress dash-progress-fill"
                        style={{
                          width: `${Math.min(100, Math.max(8, charCount / 10))}%`,
                          background: lang.color,
                        }}
                      />
                    </div>
                    <div className="dash-project-date">
                      <span className="mono">last edit</span>
                      <span className="mono">{formatDate(project.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="modal-backdrop" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "0 1rem" }}>
          <div className="glass-card animate-modal-zoom" style={{ padding: "1.75rem 2rem", width: "100%", maxWidth: "32rem", background: "rgba(9, 11, 8, 0.96)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="dash-modal-header">
              <div>
                <span className="eyebrow" style={{ color: "#e9c44a", marginBottom: "0.25rem", display: "block" }}>Start fresh</span>
                <h2 className="dash-modal-title">Create a project</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="dash-modal-close"
                aria-label="Close dialog"
              >
                <svg style={{ width: "0.75rem", height: "0.875rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="dash-modal-form">
              <div>
                <label className="field-label">Project Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="my-awesome-project"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="field-label">Select Environment / Language</label>
                {/* search bar for languages */}
                <div style={{ position: "relative", marginBottom: "0.75rem" }}>
                  <input
                    type="text"
                    className="input-field"
                    style={{ paddingRight: "2.5rem" }}
                    placeholder="Search compiler environments..."
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                  />
                  <div className="dash-search-hint mono">/</div>
                </div>
                {/* language grid */}
                <div className="dash-lang-grid">
                  {filteredLanguages.map((lang) => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => setNewProject({ ...newProject, language: lang.value })}
                      className={`language-option dash-lang-option ${
                        newProject.language === lang.value
                          ? "dash-lang-option-selected"
                          : ""
                      }`}
                    >
                      <div
                        className="mono"
                        style={{
                          fontSize: "0.69rem",
                          fontWeight: 700,
                          marginBottom: "0.25rem",
                          color: newProject.language === lang.value ? lang.color : "#444",
                        }}
                      >
                        {lang.icon}
                      </div>
                      <div className={`mono dash-lang-label ${
                        newProject.language === lang.value ? "dash-lang-label-active" : ""
                      }`}>
                        {lang.label}
                      </div>
                    </button>
                  ))}
                  {filteredLanguages.length === 0 && (
                    <div className="dash-lang-empty mono">
                      No env match "{langSearch}"
                    </div>
                  )}
                </div>
              </div>

              <div className="dash-modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary btn-sm mono" style={{ flex: 1, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-primary btn-sm mono" style={{ flex: 1, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {creating ? "Creating..." : "Create workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="modal-backdrop" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "0 1rem" }}>
          <div className="glass-card animate-modal-zoom" style={{ padding: "1.5rem", width: "100%", maxWidth: "24rem", background: "rgba(9, 11, 8, 0.98)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "white", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>Delete Project?</h3>
            <p className="mono" style={{ color: "#555", fontSize: "0.75rem", marginBottom: "1.5rem" }}>This action is permanent and cannot be undone.</p>
            <div className="dash-modal-actions">
              <button onClick={() => setDeleteId(null)} className="btn-secondary btn-sm mono" style={{ flex: 1, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Cancel
              </button>
              <button onClick={() => handleDeleteProject(deleteId)} className="btn-danger btn-sm mono" style={{ flex: 1, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
