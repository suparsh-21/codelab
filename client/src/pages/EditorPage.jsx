import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import API from "../utils/api";
import socket from "../utils/socket";
import JSZip from "jszip";

// monaco editor language IDs mapping based on file extension
const getMonacoLanguageFromExtension = (filename) => {
  if (!filename) return "plaintext";
  const ext = filename.split(".").pop().toLowerCase();
  switch (ext) {
    case "js": return "javascript";
    case "ts": return "typescript";
    case "py": return "python";
    case "java": return "java";
    case "cpp": case "h": return "cpp";
    case "c": return "c";
    case "cs": return "csharp";
    case "go": return "go";
    case "rs": return "rust";
    case "rb": return "ruby";
    case "php": return "php";
    case "swift": return "swift";
    case "kt": return "kotlin";
    case "dart": return "dart";
    case "html": return "html";
    case "css": return "css";
    case "md": return "markdown";
    case "json": return "json";
    case "xml": return "xml";
    case "yaml": return "yaml";
    case "sql": return "sql";
    case "sh": return "shell";
    default: return "plaintext";
  }
};

// human readable labels
const languageLabels = {
  javascript: "JavaScript", typescript: "TypeScript", python: "Python",
  java: "Java", cpp: "C++", c: "C", csharp: "C#", go: "Go",
  rust: "Rust", ruby: "Ruby", php: "PHP", swift: "Swift",
  kotlin: "Kotlin", scala: "Scala", dart: "Dart", r: "R",
  perl: "Perl", lua: "Lua", bash: "Bash", powershell: "PowerShell",
  haskell: "Haskell", elixir: "Elixir", clojure: "Clojure",
  fsharp: "F#", objectivec: "Objective-C", pascal: "Pascal",
  groovy: "Groovy", julia: "Julia", ocaml: "OCaml", fortran: "Fortran",
  cobol: "COBOL", erlang: "Erlang", nim: "Nim", zig: "Zig", vlang: "V",
  html: "HTML", css: "CSS", markdown: "Markdown", json: "JSON",
  xml: "XML", yaml: "YAML", sql: "SQL", graphql: "GraphQL",
};

// Track global registration of the HTML snippet provider to avoid duplicates
let htmlSnippetProviderRegistered = false;

function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFilePath, setActiveFilePath] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [showStdin, setShowStdin] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [terminalInputValue, setTerminalInputValue] = useState("");
  const terminalInputRef = useRef(null);

  // Lab report states
  const [showReportModal, setShowReportModal] = useState(false);

  // Theme state
  const [editorTheme, setEditorTheme] = useState(() => {
    return localStorage.getItem("codelab-editor-theme") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("codelab-editor-theme", editorTheme);
  }, [editorTheme]);

  const toggleTheme = () => {
    setEditorTheme((prev) => {
      if (prev === "dark") return "semidark";
      if (prev === "semidark") return "light";
      return "dark";
    });
  };

  const getMonacoTheme = () => {
    switch (editorTheme) {
      case "light": return "clean-light";
      case "semidark": return "semi-dark";
      case "dark":
      default: return "pitch-black";
    }
  };

  const handleEditorBeforeMount = (monaco) => {
    monaco.editor.defineTheme("pitch-black", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#050505",
        "editor.foreground": "#f6f7f2",
        "editorLineNumber.foreground": "#444c38",
        "editorLineNumber.activeForeground": "#e9c44a",
        "editor.lineHighlightBackground": "#131611",
      }
    });

    monaco.editor.defineTheme("semi-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#131611",
        "editor.foreground": "#e2e3dd",
        "editorLineNumber.foreground": "#5c6057",
        "editorLineNumber.activeForeground": "#e9c44a",
        "editor.lineHighlightBackground": "#1e221b",
      }
    });

    monaco.editor.defineTheme("clean-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#ffffff",
        "editor.foreground": "#171813",
        "editorLineNumber.foreground": "#a4a89d",
        "editorLineNumber.activeForeground": "#e9c44a",
        "editor.lineHighlightBackground": "#f4f5f0",
      }
    });

    // Register HTML boilerplate completion provider
    if (!htmlSnippetProviderRegistered) {
      htmlSnippetProviderRegistered = true;
      monaco.languages.registerCompletionItemProvider("html", {
        triggerCharacters: ["!"],
        provideCompletionItems: (model, position) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });

          // Match if the line contains only optional whitespace and '!'
          const match = textUntilPosition.match(/^\s*(!)$/);
          if (match) {
            const startColumn = textUntilPosition.indexOf("!") + 1;
            return {
              suggestions: [
                {
                  label: "!",
                  kind: monaco.languages.CompletionItemKind.Snippet,
                  documentation: "HTML5 Boilerplate",
                  detail: "HTML5 Boilerplate",
                  insertText: [
                    "<!DOCTYPE html>",
                    "<html lang=\"en\">",
                    "<head>",
                    "    <meta charset=\"UTF-8\">",
                    "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",
                    "    <title>${1:Document}</title>",
                    "</head>",
                    "<body>",
                    "    $0",
                    "</body>",
                    "</html>"
                  ].join("\n"),
                  insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  range: {
                    startLineNumber: position.lineNumber,
                    startColumn: startColumn,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                  },
                },
              ],
            };
          }
          return { suggestions: [] };
        },
      });
    }
  };

  // File explorer states
  const [collapsedFolders, setCollapsedFolders] = useState({});
  const [creatingNode, setCreatingNode] = useState(null); // { type: 'file' | 'folder', parentPath: string }
  const [newNodeName, setNewNodeName] = useState("");

  const iframeRef = useRef(null);
  const outputEndRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  const isActiveHtml = activeFilePath.endsWith(".html");
  const isActiveMarkdown = activeFilePath.endsWith(".md");
  const canPreview = isActiveHtml || isActiveMarkdown;

  // fetch project
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await API.get(`/projects/${id}`);
        const proj = res.data.project;
        setProject(proj);
        setFiles(proj.files || []);

        if (proj.files && proj.files.length > 0) {
          // Select first file to start editing
          const firstFile = proj.files.find((f) => f.type === "file");
          if (firstFile) {
            setActiveFilePath(firstFile.path);
            setCode(firstFile.content || "");
            if (firstFile.path.endsWith(".html")) {
              setShowPreview(true);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load project:", err);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate]);

  // socket
  useEffect(() => {
    socket.connect();

    socket.on("output", ({ type, data }) => {
      setOutput((prev) => {
        const lines = data.split("\n");
        if (prev.length === 0) {
          return lines.map(line => ({ type, data: line }));
        }

        const newOutput = [...prev];
        const lastLine = newOutput[newOutput.length - 1];

        if (lastLine.type === "stdout" || lastLine.type === "stderr") {
          newOutput[newOutput.length - 1] = {
            ...lastLine,
            data: lastLine.data + lines[0]
          };
          for (let i = 1; i < lines.length; i++) {
            newOutput.push({ type, data: lines[i] });
          }
        } else {
          for (let i = 0; i < lines.length; i++) {
            newOutput.push({ type, data: lines[i] });
          }
        }

        return newOutput;
      });
    });

    socket.on("run-completed", () => {
      setIsRunning(false);
    });

    return () => {
      socket.off("output");
      socket.off("run-completed");
      socket.disconnect();
    };
  }, []);

  const handleTerminalInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = terminalInputValue;
      socket.emit("stdin", val + "\n");
      setOutput((prev) => [...prev, { type: "info", data: `> ${val}` }]);
      setTerminalInputValue("");
    }
  };

  // scroll terminal
  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [output, isRunning]);
  // Helper to compile HTML preview by recursively inlining styles and scripts from the file explorer
  const compileHtmlPreview = useCallback((htmlCode) => {
    if (!htmlCode) return "";

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlCode, "text/html");

      // Inline styles
      const linkTags = doc.querySelectorAll('link[rel="stylesheet"]');
      linkTags.forEach((link) => {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("http://") && !href.startsWith("https://")) {
          let targetPath = href;
          if (activeFilePath.includes("/")) {
            const parts = activeFilePath.split("/");
            parts.pop();
            targetPath = [...parts, href].join("/");
          }
          
          const cssFile = files.find(f => f.path === targetPath || f.name === href);
          if (cssFile && cssFile.type === "file") {
            const styleTag = doc.createElement("style");
            styleTag.textContent = cssFile.content || "";
            link.parentNode.replaceChild(styleTag, link);
          }
        }
      });

      // Inline scripts
      const scriptTags = doc.querySelectorAll("script[src]");
      scriptTags.forEach((script) => {
        const src = script.getAttribute("src");
        if (src && !src.startsWith("http://") && !src.startsWith("https://")) {
          let targetPath = src;
          if (activeFilePath.includes("/")) {
            const parts = activeFilePath.split("/");
            parts.pop();
            targetPath = [...parts, src].join("/");
          }
          
          const jsFile = files.find(f => f.path === targetPath || f.name === src);
          if (jsFile && jsFile.type === "file") {
            const newScript = doc.createElement("script");
            newScript.textContent = jsFile.content || "";
            script.parentNode.replaceChild(newScript, script);
          }
        }
      });

      return doc.documentElement.outerHTML;
    } catch (e) {
      console.error("Failed to compile HTML preview:", e);
      return htmlCode;
    }
  }, [files, activeFilePath]);

  // update html preview
  useEffect(() => {
    if (isActiveHtml && showPreview && iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(compileHtmlPreview(code));
      doc.close();
    }
  }, [code, showPreview, isActiveHtml, compileHtmlPreview]);

  // update markdown preview
  useEffect(() => {
    if (isActiveMarkdown && showPreview && iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: system-ui, sans-serif; padding: 30px; background: #0a0a0a; color: #ddd; line-height: 1.7; max-width: 700px; }
            h1,h2,h3,h4 { color: #fff; margin-top: 1.5em; }
            h1 { border-bottom: 1px solid #222; padding-bottom: 8px; }
            code { background: #1a1a2e; padding: 2px 6px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 13px; }
            pre { background: #111; padding: 16px; border-radius: 8px; overflow-x: auto; border: 1px solid #222; }
            pre code { background: none; padding: 0; }
            a { color: #E2B808; }
            ul, ol { padding-left: 24px; }
            li { margin: 4px 0; }
            blockquote { border-left: 3px solid #E2B808; padding-left: 16px; color: #999; margin: 16px 0; }
            strong { color: #fff; }
            hr { border: none; border-top: 1px solid #222; margin: 24px 0; }
          </style>
        </head>
        <body>${simpleMarkdownToHtml(code)}</body>
        </html>
      `;
      doc.open();
      doc.write(htmlContent);
      doc.close();
    }
  }, [code, showPreview, isActiveMarkdown]);

  // markdown parser
  function simpleMarkdownToHtml(md) {
    let html = md
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^---$/gm, '<hr>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
      .replace(/^(?!<[a-z])((?!^\s*$).+)$/gm, '<p>$1</p>');

    html = html.replace(/(<li>.*?<\/li>\n?)+/g, '<ul>$&</ul>');
    return html;
  }

  // select file
  const handleSelectFile = (path) => {
    const file = files.find((f) => f.path === path);
    if (file && file.type === "file") {
      setActiveFilePath(path);
      setCode(file.content || "");
    }
  };

  // code change with auto save
  const handleCodeChange = useCallback(
    (value) => {
      setCode(value);
      setSaved(false);

      setFiles((prev) => {
        const updated = prev.map((f) => {
          if (f.path === activeFilePath) {
            return { ...f, content: value };
          }
          return f;
        });

        // Trigger autosave
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(async () => {
          try {
            setSaving(true);
            await API.put(`/projects/${id}`, { files: updated, code: value });
            setSaved(true);
          } catch (err) {
            console.error("Auto-save failed:", err);
          } finally {
            setSaving(false);
          }
        }, 1500);

        return updated;
      });
    },
    [id, activeFilePath]
  );

  // ctrl+s
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code, files, activeFilePath, id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedFiles = files.map((f) => {
        if (f.path === activeFilePath) {
          return { ...f, content: code };
        }
        return f;
      });
      await API.put(`/projects/${id}`, { files: updatedFiles, code });
      setSaved(true);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRun = () => {
    const activeFile = files.find((f) => f.path === activeFilePath);
    if (!activeFile) return;

    const ext = activeFilePath.split(".").pop().toLowerCase();
    
    // map extension to language
    const extLangMap = {
      js: "javascript", ts: "typescript", py: "python", java: "java",
      cpp: "cpp", c: "c", cs: "csharp", go: "go", rs: "rust",
      rb: "ruby", php: "php", swift: "swift", kt: "kotlin",
      dart: "dart", html: "html", css: "css", md: "markdown",
      json: "json", sql: "sql", sh: "bash"
    };

    const runLang = extLangMap[ext] || project.language;
    const isRunPreview = ["html", "css", "markdown", "json", "yaml", "sql", "xml", "graphql"].includes(runLang);

    if (runLang === "html" || runLang === "markdown") {
      setShowPreview(true);
      setOutput((prev) => [...prev, { type: "info", data: "preview updated ✓" }]);
      return;
    }

    if (isRunPreview) {
      setOutput((prev) => [...prev, { type: "info", data: `${runLang} is a data/markup language — no execution needed.` }]);
      return;
    }

    setIsRunning(true);
    setOutput((prev) => [...prev, { type: "info", data: `$ run ${languageLabels[runLang] || runLang}` }]);
    socket.emit("run-code", { code: activeFile.content || "", language: runLang, stdin: customInput, files, activeFilePath });
  };

  const clearTerminal = () => {
    setOutput([]);
  };

  const handleDownloadZip = async () => {
    try {
      const zip = new JSZip();
      files.forEach((file) => {
        if (file.type === "file") {
          zip.file(file.path, file.content || "");
        }
      });
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project?.name || "project"}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ZIP download failed:", err);
      alert("Failed to download ZIP file: " + err.message);
    }
  };

  const getOutputColor = (type) => {
    switch (type) {
      case "success": return "#22c55e";
      case "error": return "#ef4444";
      case "warning": return "#eab308";
      case "info": return "#E2B808";
      case "stdout": return "#e2e8f0";
      case "stderr": return "#ef4444";
      default: return "#e2e8f0";
    }
  };

  // VIRTUAL FILE TREE HELPERS
  const isNodeVisible = (nodePath) => {
    const parts = nodePath.split("/");
    if (parts.length === 1) return true; // top level
    
    for (let i = 1; i < parts.length; i++) {
      const ancestorPath = parts.slice(0, i).join("/");
      if (collapsedFolders[ancestorPath]) {
        return false;
      }
    }
    return true;
  };

  const handleCreateNode = async (e) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;

    if (newNodeName.includes("/") || newNodeName.includes("\\")) {
      alert("Invalid folder/file name");
      return;
    }

    if (creatingNode.type === "file") {
      const parts = newNodeName.split(".");
      const ext = parts.length > 1 ? parts.pop().toLowerCase() : "";
      const allowedExts = [
        "js", "ts", "py", "java", "cpp", "h", "c", "cs", "go", "rs", "rb", 
        "php", "swift", "kt", "dart", "html", "css", "md", "json", "xml", 
        "yaml", "sql", "sh"
      ];

      // catch common typos and show specific error
      const typoMap = {
        // JavaScript typos
        "hs": "Did you mean .js (JavaScript)?",
        "ks": "Did you mean .js (JavaScript)?",
        "jd": "Did you mean .js (JavaScript)?",
        "jss": "Did you mean .js (JavaScript)?",
        "ls": "Did you mean .js (JavaScript)?",
        "jsx": "Did you mean .js (JavaScript)?",
        // TypeScript typos
        "tsx": "Did you mean .ts (TypeScript)?",
        "tsv": "Did you mean .ts (TypeScript)?",
        "td": "Did you mean .ts (TypeScript)?",
        // Python typos
        "pys": "Did you mean .py (Python)?",
        "ps": "Did you mean .py (Python)?",
        "pt": "Did you mean .py (Python)?",
        "pu": "Did you mean .py (Python)?",
        "pyt": "Did you mean .py (Python)?",
        "pi": "Did you mean .py (Python)?",
        // Java typos
        "javas": "Did you mean .java (Java)?",
        "jv": "Did you mean .java (Java)?",
        "jav": "Did you mean .java (Java)?",
        "javs": "Did you mean .java (Java)?",
        // C++ typos
        "ccp": "Did you mean .cpp (C++)?",
        "cp": "Did you mean .cpp (C++)?",
        "cppp": "Did you mean .cpp (C++)?",
        // C# typos
        "css2": "Did you mean .cs (C#)?",
        // Go typos
        "og": "Did you mean .go (Go)?",
        "goo": "Did you mean .go (Go)?",
        // Rust typos
        "rrs": "Did you mean .rs (Rust)?",
        "rst": "Did you mean .rs (Rust)?",
        // HTML typos
        "htmll": "Did you mean .html (HTML)?",
        "htm": "Did you mean .html (HTML)?",
        "htlm": "Did you mean .html (HTML)?",
        "hml": "Did you mean .html (HTML)?",
        // CSS typos
        "csss": "Did you mean .css (CSS)?",
        "ccs": "Did you mean .css (CSS)?",
        // Other
        "mk": "Did you mean .md (Markdown)?",
        "mdd": "Did you mean .md (Markdown)?",
        "jsn": "Did you mean .json (JSON)?",
        "jsonn": "Did you mean .json (JSON)?",
        "yml": "Did you mean .yaml (YAML)?",
        "sgl": "Did you mean .sql (SQL)?",
        "bas": "Did you mean .sh (Bash)?",
        "bash": "Did you mean .sh (Bash)?",
      };

      if (!ext) {
        alert("Invalid type: File must have an extension (e.g. .js, .py, .html)");
        return;
      }

      if (typoMap[ext]) {
        alert(`Invalid type: ".${ext}" is not a supported file extension. ${typoMap[ext]}`);
        return;
      }

      if (!allowedExts.includes(ext)) {
        alert(`Invalid type: ".${ext}" is not a supported file extension.\n\nSupported extensions: ${allowedExts.map(e => "." + e).join(", ")}`);
        return;
      }
    }

    const parentPath = creatingNode.parentPath;
    const newPath = parentPath ? `${parentPath}/${newNodeName}` : newNodeName;

    if (files.some((f) => f.path === newPath)) {
      alert("An item with this name already exists");
      return;
    }

    const newNode = {
      name: newNodeName,
      path: newPath,
      type: creatingNode.type,
      content: creatingNode.type === "file" ? "" : undefined,
    };

    const updatedFiles = [...files, newNode];
    setFiles(updatedFiles);
    setCreatingNode(null);
    setNewNodeName("");

    if (creatingNode.type === "file") {
      setActiveFilePath(newPath);
      setCode("");
    }

    try {
      await API.put(`/projects/${id}`, { files: updatedFiles });
    } catch (err) {
      console.error("Failed to save tree:", err);
    }
  };

  const handleDeleteNode = async (e, nodePath, type) => {
    e.stopPropagation();
    const label = type === "folder" ? "folder and all its contents" : "file";
    if (!window.confirm(`Are you sure you want to delete this ${label}?`)) return;

    const updatedFiles = files.filter((f) => {
      if (f.path === nodePath) return false;
      if (type === "folder" && f.path.startsWith(nodePath + "/")) return false;
      return true;
    });

    setFiles(updatedFiles);

    if (activeFilePath === nodePath || (type === "folder" && activeFilePath.startsWith(nodePath + "/"))) {
      const nextFile = updatedFiles.find((f) => f.type === "file");
      if (nextFile) {
        setActiveFilePath(nextFile.path);
        setCode(nextFile.content || "");
      } else {
        setActiveFilePath("");
        setCode("");
      }
    }

    try {
      await API.put(`/projects/${id}`, { files: updatedFiles });
    } catch (err) {
      console.error("Failed to save after deletion:", err);
    }
  };

  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      const aParts = a.path.split("/");
      const bParts = b.path.split("/");
      const minLength = Math.min(aParts.length, bParts.length);
      for (let i = 0; i < minLength; i++) {
        if (aParts[i] !== bParts[i]) {
          const aIsFolder = i < aParts.length - 1 || a.type === "folder";
          const bIsFolder = i < bParts.length - 1 || b.type === "folder";
          if (aIsFolder && !bIsFolder) return -1;
          if (!aIsFolder && bIsFolder) return 1;
          return aParts[i].localeCompare(bParts[i]);
        }
      }
      return aParts.length - bParts.length;
    });
  }, [files]);

  const renderInputRow = (depth) => {
    return (
      <div 
        key="creating-node-input"
        className="flex items-center gap-2 py-1 pr-3"
        style={{ paddingLeft: `${depth * 12 + 14}px` }}
      >
        <span className="text-[11px]">{creatingNode.type === "folder" ? "📁" : "📄"}</span>
        <form onSubmit={handleCreateNode} className="flex-1">
          <input
            type="text"
            className="w-full bg-[#151515] border border-[#E2B808] text-white font-mono text-[10px] py-0.5 px-1.5 rounded outline-none"
            placeholder={creatingNode.type === "folder" ? "folder..." : "file..."}
            value={newNodeName}
            onChange={(e) => setNewNodeName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setCreatingNode(null);
                setNewNodeName("");
              }
            }}
            autoFocus
            onBlur={() => {
              setTimeout(() => {
                setCreatingNode(null);
                setNewNodeName("");
              }, 200);
            }}
          />
        </form>
      </div>
    );
  };

  const renderExplorerNodes = () => {
    const nodes = [];

    const addNode = (node) => {
      if (!isNodeVisible(node.path)) return;
      
      const depth = node.path.split("/").length - 1;
      const isActive = node.path === activeFilePath;
      const isFolder = node.type === "folder";
      const isCollapsed = collapsedFolders[node.path];

      nodes.push(
        <div
          key={node.path}
          onClick={() => {
            if (isFolder) {
              setCollapsedFolders((prev) => ({ ...prev, [node.path]: !isCollapsed }));
            } else {
              handleSelectFile(node.path);
            }
          }}
          className={`editor-tree-node group flex items-center justify-between py-1.5 pr-3 cursor-pointer border-l-2 ${
            isActive 
              ? "bg-[#E2B808]/8 text-white border-[#E2B808]" 
              : "text-[#888] hover:text-white hover:bg-white/3 border-transparent"
          }`}
          style={{ paddingLeft: `${depth * 12 + 14}px` }}
        >
          <div className="flex items-center gap-2 truncate">
            <span className="text-[10px] text-[#444] font-bold">
              {isFolder ? (isCollapsed ? "▶" : "▼") : ""}
            </span>
            <span className="text-[11px]">
              {isFolder ? (isCollapsed ? "📁" : "📂") : "📄"}
            </span>
            <span className="truncate mono text-[11px] tracking-tight">{node.name}</span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isFolder && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreatingNode({ type: "file", parentPath: node.path });
                    setCollapsedFolders((prev) => ({ ...prev, [node.path]: false }));
                  }}
                  className="icon-btn hover:text-[#E2B808]"
                  title="New File"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreatingNode({ type: "folder", parentPath: node.path });
                    setCollapsedFolders((prev) => ({ ...prev, [node.path]: false }));
                  }}
                  className="icon-btn hover:text-[#E2B808]"
                  title="New Folder"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </button>
              </>
            )}
            <button
              onClick={(e) => handleDeleteNode(e, node.path, node.type)}
              className="icon-btn hover:text-red-400"
              title="Delete"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      );

      // Render nested input row immediately inside this folder
      if (isFolder && !isCollapsed && creatingNode && creatingNode.parentPath === node.path) {
        nodes.push(renderInputRow(depth + 1));
      }
    };

    // Render root input
    if (creatingNode && creatingNode.parentPath === "") {
      nodes.push(renderInputRow(0));
    }

    sortedFiles.forEach(addNode);
    return nodes;
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="spinner" style={{ width: 28, height: 28 }}></div>
      </div>
    );
  }

  const activeFile = files.find((f) => f.path === activeFilePath);

  return (
    <div className={`editor-shell h-screen flex flex-col theme-${editorTheme}`}>
      {/* toolbar */}
      <div className="editor-toolbar relative flex items-center justify-between gap-3 px-4 py-2.5 border-b border-white/[0.07] z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-secondary btn-compact flex items-center gap-1.5 text-[10px] mono uppercase tracking-wider font-semibold"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </button>

          <div className="w-px h-4 bg-white/8"></div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white truncate max-w-[200px] tracking-tight">
              {project?.name}
            </span>
            <span className="text-[10px] mono px-2 py-0.5 rounded bg-white/3 text-[#888] border border-white/5 uppercase tracking-wider">
              {languageLabels[project?.language] || project?.language}
            </span>
          </div>

          {/* save indicator */}
          <div className="save-indicator flex items-center gap-1.5 ml-2">
            {saving ? (
              <>
                <div className="spinner" style={{ width: 10, height: 10 }}></div>
                <span className="text-[10px] text-[#555] mono uppercase tracking-wider">saving</span>
              </>
            ) : saved ? (
              <>
                <div className="status-dot"></div>
                <span className="text-[10px] text-[#555] mono uppercase tracking-wider">saved</span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-[#E2B808]"></div>
                <span className="text-[10px] text-[#555] mono uppercase tracking-wider">unsaved</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canPreview && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`btn-compact flex items-center gap-1.5 text-[10px] mono uppercase tracking-wider border cursor-pointer ${
                showPreview
                  ? "border-[#E2B808]/30 bg-[#E2B808]/8 text-[#E2B808] hover:bg-[#E2B808]/12"
                  : "border-white/5 bg-transparent text-[#6e7469] hover:text-white hover:border-white/12"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full transition-all ${showPreview ? "bg-[#E2B808] shadow-[0_0_8px_#E2B808]" : "bg-[#444]"}`} />
              Preview
            </button>
          )}

          <button onClick={handleSave} className="btn-secondary btn-compact flex items-center gap-1.5 text-[10px] mono uppercase tracking-wider font-semibold">
            Save
          </button>

          <button onClick={handleDownloadZip} className="btn-secondary btn-compact flex items-center gap-1.5 text-[10px] mono uppercase tracking-wider font-semibold" title="Download workspace as ZIP">
            ZIP
          </button>

          <button onClick={() => setShowReportModal(true)} className="btn-secondary btn-compact flex items-center gap-1.5 text-[10px] mono uppercase tracking-wider font-semibold" title="Export Source Code & Logs">
            Report
          </button>

          <button onClick={toggleTheme} className="btn-secondary btn-compact flex items-center gap-1.5 text-[10px] mono uppercase tracking-wider font-semibold" title="Toggle Editor Theme">
            {editorTheme === "dark" && "🌙 Dark"}
            {editorTheme === "semidark" && "🌓 Semi-Dark"}
            {editorTheme === "light" && "☀️ Light"}
          </button>

          {activeFile && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="btn-primary btn-compact flex items-center gap-1.5 text-[10px] mono uppercase tracking-wider font-semibold"
            >
              {isRunning ? (
                <>
                  <span className="spinner" style={{ width: 9, height: 9, borderTopColor: "#17170e", borderWidth: "1.5px" }} />
                  running
                </>
              ) : (
                <>
                  <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  run
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* sidebar file explorer */}
        <div className="editor-sidebar w-60 border-r border-white/[0.07] flex flex-col select-none">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.01]">
            <span className="text-[10px] font-bold text-[#666] mono uppercase tracking-widest">Workspace</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCreatingNode({ type: "file", parentPath: "" })}
                className="icon-btn"
                title="New File"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <button
                onClick={() => setCreatingNode({ type: "folder", parentPath: "" })}
                className="icon-btn"
                title="New Folder"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {files.length === 0 && !creatingNode ? (
              <div className="px-4 py-8 text-center text-[#444] mono text-[10px]">
                Empty Workspace
              </div>
            ) : (
              renderExplorerNodes()
            )}
          </div>
        </div>

        {/* editor pane */}
        <div className={`flex-1 flex flex-col ${showPreview ? "w-1/2" : "w-full"}`}>
          {activeFilePath ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1">
                <Editor
                  height="100%"
                  language={getMonacoLanguageFromExtension(activeFilePath)}
                  theme={getMonacoTheme()}
                  beforeMount={handleEditorBeforeMount}
                  value={code}
                  onChange={handleCodeChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                    lineNumbers: "on",
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    theme: getMonacoTheme(),
                    scrollbar: {
                      vertical: "visible",
                      horizontal: "visible",
                      verticalScrollbarSize: 5,
                      horizontalScrollbarSize: 5,
                    },
                  }}
                />
              </div>

              {/* terminal output panel */}
              <div
                className="terminal-panel terminal-glow border-t border-white/[0.07]"
                style={{ height: terminalHeight, minHeight: 80 }}
              >
                <div className="flex items-center justify-between px-4 py-1.5 bg-black/50 border-b border-white/3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-[#888] mono uppercase tracking-wider">terminal</span>
                    <span className="text-[10px] text-[#444] mono bg-white/3 px-1.5 py-0.25 rounded">{output.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowStdin(!showStdin)}
                      className={`terminal-btn text-[10px] mono uppercase ${showStdin ? "text-[#E2B808] border-[#E2B808]/40 bg-[#E2B808]/5" : ""}`}
                    >
                      Stdin / Input
                    </button>
                    <button
                      onClick={() => setTerminalHeight(terminalHeight === 200 ? 350 : 200)}
                      className="terminal-btn text-[10px] mono uppercase"
                    >
                      {terminalHeight === 200 ? "expand" : "collapse"}
                    </button>
                    <button
                      onClick={clearTerminal}
                      className="terminal-btn text-[10px] mono uppercase"
                    >
                      clear
                    </button>
                  </div>
                </div>

                <div className="flex min-h-0" style={{ height: terminalHeight - 32 }}>
                  {showStdin && (
                    <div className="w-[30%] border-r border-white/[0.05] bg-[#020202] p-3 flex flex-col gap-2 min-w-[200px]">
                      <span className="text-[9px] text-[#666] mono uppercase tracking-wider font-semibold">custom stdin input</span>
                      <textarea
                        className="flex-1 w-full bg-black/40 border border-white/5 rounded-lg p-2 text-xs text-white font-mono placeholder-[#333] focus:outline-none focus:border-[#E2B808]/40 resize-none"
                        placeholder="Type inputs here... (e.g. 5\n10)"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                      />
                    </div>
                  )}
                  <div
                    className="flex-1 px-4 py-3 overflow-y-auto terminal-output cursor-text"
                    style={{ background: "var(--ink)" }}
                    onClick={() => {
                      if (terminalInputRef.current) {
                        terminalInputRef.current.focus();
                      }
                    }}
                  >
                    {output.length === 0 && (
                      <p className="text-[#333] text-xs mono">
                        {isActiveHtml || isActiveMarkdown
                          ? "markup/data environment — review output via live preview pane"
                          : "press ▶ run to compile and run your code"}
                      </p>
                    )}
                    {output.map((line, i) => (
                      <div key={i} className="mb-0.5" style={{ color: getOutputColor(line.type) }}>
                        <span className="text-[#333] mr-1.5">{String(i + 1).padStart(2, '0')}</span>
                        {line.data}
                      </div>
                    ))}
                    {isRunning && (
                      <div className="flex items-center mb-0.5 text-white">
                        <span className="text-[#333] mr-1.5">{String(output.length + 1).padStart(2, '0')}</span>
                        <span className="text-[#E2B808] mr-1">&gt;</span>
                        <input
                          type="text"
                          ref={terminalInputRef}
                          value={terminalInputValue}
                          onChange={(e) => setTerminalInputValue(e.target.value)}
                          onKeyDown={handleTerminalInputKeyDown}
                          className="flex-1 bg-transparent border-none outline-none text-white font-mono text-[11.5px] p-0"
                          placeholder="Type input and press Enter..."
                          autoFocus
                        />
                      </div>
                    )}
                    <div ref={outputEndRef} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#090b09] text-[#444] select-none">
              <div className="editor-empty-symbol w-16 h-16 rounded-2xl bg-[#e9c44a]/5 border border-[#e9c44a]/15 flex items-center justify-center mb-6 shadow-[0_20px_50px_rgba(233,196,74,0.07)]">
                <span className="mono text-[#E2B808] text-lg font-bold">&lt;/&gt;</span>
              </div>
              <p className="text-white text-sm font-bold tracking-tight mb-1">No file active in editor</p>
              <p className="text-xs mono mb-8 text-[#555]">Select or create a workspace file to write code.</p>
              <div className="flex flex-col gap-2 text-[10px] mono w-64 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                <div className="flex justify-between border-b border-white/5 pb-1.5 text-[#555]">
                  <span>New File</span>
                  <span className="text-[#E2B808] font-bold">Explorer Button</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5 text-[#555]">
                  <span>Save file</span>
                  <span className="text-[#E2B808] font-bold">⌘ S / Ctrl+S</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* preview panel */}
        {showPreview && canPreview && (
          <div className="preview-panel w-1/2 border-l border-white/[0.07] flex flex-col">
            <div className="px-4 py-2 bg-black/50 border-b border-white/3 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#888] mono uppercase tracking-widest">
                {isActiveMarkdown ? "Markdown View" : "HTML Live Preview"}
              </span>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/80"></div>
              </div>
            </div>
            <div className="flex-1 bg-white">
              <iframe
                ref={iframeRef}
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin"
                title="Preview"
              />
            </div>
          </div>
        )}
      </div>

      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4 overflow-y-auto">
          {/* Print specific style block */}
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              .printable-lab-report, .printable-lab-report * {
                visibility: visible !important;
              }
              html, body {
                height: auto !important;
                overflow: visible !important;
                background: white !important;
              }
              #root, 
              .editor-shell, 
              div[class*="fixed"], 
              div[class*="overflow-"], 
              div[class*="max-h-"] {
                position: static !important;
                overflow: visible !important;
                height: auto !important;
                max-height: none !important;
                min-height: 0 !important;
                border: none !important;
                box-shadow: none !important;
                background: transparent !important;
              }
              .printable-lab-report {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: auto !important;
                background: white !important;
                color: black !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          <div className="bg-[#0d0f0c] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#131611]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#E2B808] mono uppercase tracking-wider">Source Code Exporter</span>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="text-[#666] hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 flex overflow-hidden min-h-0">
              {/* Left Column: Export Controls */}
              <div className="w-[30%] border-r border-white/5 p-6 overflow-y-auto bg-black/30 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-white mono uppercase tracking-wider mb-2">Export Actions</h4>
                <p className="text-[11px] text-[#888] leading-relaxed">
                  Generate a clean, printable PDF document containing all of your workspace's source files and execution output.
                </p>
                <button 
                  onClick={() => window.print()}
                  className="btn-primary w-full mt-4 flex items-center justify-center gap-2 py-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Report / PDF
                </button>
              </div>

              {/* Right Column: Document Preview */}
              <div className="flex-1 p-6 bg-[#080907] overflow-y-auto">
                <h4 className="text-xs font-bold text-white mono uppercase tracking-wider mb-4">Document Preview</h4>
                
                {/* Printable Source Code Document */}
                <div className="bg-white text-black p-8 rounded-lg shadow-lg font-sans border border-gray-200 printable-lab-report" style={{ minHeight: "800px" }}>
                  {/* Document Title */}
                  <div className="text-center border-b-2 border-black pb-4 mb-6">
                    <h1 className="text-xl font-bold uppercase tracking-wide">{project?.name || "CodeLab Project"}</h1>
                    <h2 className="text-xs font-semibold tracking-wide uppercase mt-1">Source Code Files & Execution Log</h2>
                    <div className="text-[10px] text-gray-500 font-mono mt-1">
                      Generated on {new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>

                  {/* Files iteration */}
                  <div className="mb-6">
                    {files.filter(f => f.type === "file").map((file) => (
                      <div key={file.path} className="mb-4">
                        <div className="text-xs font-bold font-mono text-gray-700 bg-gray-100 p-1.5 border border-gray-300 rounded-t-md font-sans">
                          📄 {file.path}
                        </div>
                        <pre className="text-[10px] font-mono p-3 bg-gray-50 border-x border-b border-gray-300 overflow-x-auto whitespace-pre-wrap leading-relaxed rounded-b-md">
                          {file.content || "// Empty file"}
                        </pre>
                      </div>
                    ))}
                  </div>

                  {/* Output log */}
                  {output.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xs font-bold border-b border-black pb-1 mb-3 uppercase tracking-wider">Execution Console Log</h3>
                      <pre className="text-[10px] font-mono p-3 bg-gray-900 text-green-400 overflow-x-auto whitespace-pre-wrap leading-relaxed rounded-md">
                        {output.map(l => l.data).join("\n")}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default EditorPage;
