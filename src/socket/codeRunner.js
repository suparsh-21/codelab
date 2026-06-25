const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

// ========== LANGUAGE CONFIG ==========
// each language has: extension, how to build the command, and any cleanup logic
// this is where you add new languages - just add an entry here

const LANGUAGES = {
  javascript: {
    ext: ".js",
    run: (file) => `node "${file}"`,
  },
  typescript: {
    ext: ".ts",
    run: (file) => `npx ts-node "${file}"`,
    // fallback if ts-node not installed
    fallback: (file) => {
      const jsFile = file.replace(".ts", ".js");
      return `npx tsc "${file}" --outFile "${jsFile}" && node "${jsFile}"`;
    },
  },
  python: {
    ext: ".py",
    run: (file) => `python "${file}"`,
  },
  java: {
    ext: ".java",
    // java needs special handling because of class name
    getFilename: (code, socketId, tempDir) => {
      const match = code.match(/public\s+class\s+(\w+)/);
      const name = match ? match[1] : "Main";
      return path.join(tempDir, `${name}.java`);
    },
    run: (file) => {
      const dir = path.dirname(file);
      const name = path.basename(file, ".java");
      return `cd "${dir}" && javac "${name}.java" && java "${name}"`;
    },
  },
  cpp: {
    ext: ".cpp",
    run: (file) => {
      const out = file.replace(".cpp", "_out");
      return `g++ "${file}" -o "${out}" && "${out}"`;
    },
  },
  c: {
    ext: ".c",
    run: (file) => {
      const out = file.replace(".c", "_cout");
      return `gcc "${file}" -o "${out}" && "${out}"`;
    },
  },
  csharp: {
    ext: ".cs",
    run: (file) => `dotnet-script "${file}"`,
    fallback: (file) => `csc "${file}" && "${file.replace(".cs", ".exe")}"`,
  },
  go: {
    ext: ".go",
    run: (file) => `go run "${file}"`,
  },
  rust: {
    ext: ".rs",
    run: (file) => {
      const out = file.replace(".rs", "_out");
      return `rustc "${file}" -o "${out}" && "${out}"`;
    },
  },
  ruby: {
    ext: ".rb",
    run: (file) => `ruby "${file}"`,
  },
  php: {
    ext: ".php",
    run: (file) => `php "${file}"`,
  },
  swift: {
    ext: ".swift",
    run: (file) => `swift "${file}"`,
  },
  kotlin: {
    ext: ".kt",
    run: (file) => {
      const jar = file.replace(".kt", ".jar");
      return `kotlinc "${file}" -include-runtime -d "${jar}" && java -jar "${jar}"`;
    },
  },
  scala: {
    ext: ".scala",
    run: (file) => `scala "${file}"`,
  },
  dart: {
    ext: ".dart",
    run: (file) => `dart run "${file}"`,
  },
  r: {
    ext: ".r",
    run: (file) => `Rscript "${file}"`,
  },
  perl: {
    ext: ".pl",
    run: (file) => `perl "${file}"`,
  },
  lua: {
    ext: ".lua",
    run: (file) => `lua "${file}"`,
  },
  bash: {
    ext: ".sh",
    run: (file) => `bash "${file}"`,
  },
  powershell: {
    ext: ".ps1",
    run: (file) => `powershell -File "${file}"`,
  },
  haskell: {
    ext: ".hs",
    run: (file) => `runhaskell "${file}"`,
  },
  elixir: {
    ext: ".exs",
    run: (file) => `elixir "${file}"`,
  },
  clojure: {
    ext: ".clj",
    run: (file) => `clojure "${file}"`,
  },
  fsharp: {
    ext: ".fsx",
    run: (file) => `dotnet fsi "${file}"`,
  },
  objectivec: {
    ext: ".m",
    run: (file) => {
      const out = file.replace(".m", "_out");
      return `gcc -framework Foundation "${file}" -o "${out}" && "${out}"`;
    },
  },
  pascal: {
    ext: ".pas",
    run: (file) => {
      const out = file.replace(".pas", "_out");
      return `fpc "${file}" -o"${out}" && "${out}"`;
    },
  },
  groovy: {
    ext: ".groovy",
    run: (file) => `groovy "${file}"`,
  },
  julia: {
    ext: ".jl",
    run: (file) => `julia "${file}"`,
  },
  ocaml: {
    ext: ".ml",
    run: (file) => `ocaml "${file}"`,
  },
  fortran: {
    ext: ".f90",
    run: (file) => {
      const out = file.replace(".f90", "_out");
      return `gfortran "${file}" -o "${out}" && "${out}"`;
    },
  },
  cobol: {
    ext: ".cob",
    run: (file) => {
      const out = file.replace(".cob", "_out");
      return `cobc -x "${file}" -o "${out}" && "${out}"`;
    },
  },
  erlang: {
    ext: ".erl",
    run: (file) => `escript "${file}"`,
  },
  nim: {
    ext: ".nim",
    run: (file) => `nim r "${file}"`,
  },
  zig: {
    ext: ".zig",
    run: (file) => `zig run "${file}"`,
  },
  vlang: {
    ext: ".v",
    run: (file) => `v run "${file}"`,
  },
  // markup / web languages - these get preview on frontend, not execution
  html: { ext: ".html", preview: true },
  css: { ext: ".css", preview: true },
  markdown: { ext: ".md", preview: true },
  xml: { ext: ".xml", preview: true },
  json: { ext: ".json", preview: true },
  yaml: { ext: ".yaml", preview: true },
  sql: { ext: ".sql", preview: true },
  graphql: { ext: ".graphql", preview: true },
};


const activeProcesses = new Map();

function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("run-code", ({ code, language, stdin, files, activeFilePath }) => {
      // Kill existing process for this socket if any
      if (activeProcesses.has(socket.id)) {
        const existingChild = activeProcesses.get(socket.id);
        try {
          existingChild.kill();
        } catch (e) {}
        activeProcesses.delete(socket.id);
      }

      const langConfig = LANGUAGES[language];

      // check if language is supported
      if (!langConfig) {
        socket.emit("output", {
          type: "error",
          data: `Language "${language}" is not supported for execution yet.`,
        });
        socket.emit("run-completed", { code: 1 });
        return;
      }

      // preview-only languages dont run on server
      if (langConfig.preview) {
        socket.emit("output", {
          type: "info",
          data: `${language} is a markup/data language. Use the preview panel to see output.`,
        });
        socket.emit("run-completed", { code: 0 });
        return;
      }

      // Create a unique temporary project directory for this execution
      const runDir = path.join(os.tmpdir(), `codelab_project_${socket.id}`);

      try {
        if (fs.existsSync(runDir)) {
          fs.rmSync(runDir, { recursive: true, force: true });
        }
        fs.mkdirSync(runDir, { recursive: true });
      } catch (err) {
        socket.emit("output", {
          type: "error",
          data: "Failed to initialize execution directory: " + err.message,
        });
        socket.emit("run-completed", { code: 1 });
        return;
      }

      // Deduce the relative execution path
      let execPath;
      if (activeFilePath) {
        execPath = activeFilePath;
      } else if (langConfig.getFilename) {
        const rawName = langConfig.getFilename(code || "", socket.id, "");
        execPath = path.basename(rawName);
      } else {
        execPath = `codelab_${socket.id}${langConfig.ext}`;
      }

      // Write files inside the project run directory
      try {
        if (Array.isArray(files) && files.length > 0) {
          for (const file of files) {
            const fullPath = path.join(runDir, file.path);
            if (file.type === "folder") {
              fs.mkdirSync(fullPath, { recursive: true });
            } else if (file.type === "file") {
              fs.mkdirSync(path.dirname(fullPath), { recursive: true });
              fs.writeFileSync(fullPath, file.content || "");
            }
          }
        } else {
          // Fallback if single file run payload (old format)
          const fullPath = path.join(runDir, execPath);
          fs.mkdirSync(path.dirname(fullPath), { recursive: true });
          fs.writeFileSync(fullPath, code || "");
        }
      } catch (err) {
        socket.emit("output", {
          type: "error",
          data: "Failed to write workspace files: " + err.message,
        });
        socket.emit("run-completed", { code: 1 });
        try { fs.rmSync(runDir, { recursive: true, force: true }); } catch (e) {}
        return;
      }

      // Parse .env environment variables if present
      const envFile = Array.isArray(files) && files.find(f => f.path === ".env" && f.type === "file");
      const customEnv = {};
      if (envFile && envFile.content) {
        const lines = envFile.content.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
            const parts = trimmed.split("=");
            const key = parts[0].trim();
            const val = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, '');
            if (key) {
              customEnv[key] = val;
            }
          }
        }
      }

      socket.emit("output", {
        type: "info",
        data: `$ running ${language}...`,
      });

      const execute = (commandToRun, isFallbackRun = false) => {
        let hasErrors = false;
        // spawn command inside the temp project directory (cwd: runDir) with custom env vars
        const child = spawn(commandToRun, { 
          shell: true, 
          timeout: 15000, 
          cwd: runDir, 
          env: { ...process.env, ...customEnv } 
        });
        activeProcesses.set(socket.id, child);

        if (child.stdin) {
          child.stdin.on("error", (err) => {
            console.error("Stdin write error:", err.message);
          });
          if (stdin) {
            child.stdin.write(stdin);
          }
        }

        child.stdout.on("data", (data) => {
          socket.emit("output", {
            type: "stdout",
            data: data.toString(),
          });
        });

        child.stderr.on("data", (data) => {
          hasErrors = true;
          socket.emit("output", {
            type: "stderr",
            data: data.toString(),
          });
        });

        child.on("error", (err) => {
          socket.emit("output", {
            type: "error",
            data: err.message,
          });
        });

        child.on("close", (codeVal, signal) => {
          activeProcesses.delete(socket.id);

          if (signal === "SIGTERM") {
            socket.emit("output", {
              type: "error",
              data: "\nExecution timed out (15s limit). Check for infinite loops!",
            });
            try { fs.rmSync(runDir, { recursive: true, force: true }); } catch (e) {}
            socket.emit("run-completed", { code: 1, signal });
            return;
          }

          // if primary command failed, try fallback if available
          if ((codeVal !== 0 || hasErrors) && !isFallbackRun && langConfig.fallback) {
            const fallbackCmd = langConfig.fallback(execPath);
            execute(fallbackCmd, true);
            return;
          }

          // clean up temp project directory recursively
          try {
            fs.rmSync(runDir, { recursive: true, force: true });
          } catch (e) {
            console.error("Cleanup error:", e.message);
          }

          // output exit code status
          if (codeVal === 0) {
            socket.emit("output", {
              type: "info",
              data: "\n[Process completed successfully]",
            });
          } else {
            socket.emit("output", {
              type: "error",
              data: `\n[Process exited with code ${codeVal}]`,
            });
          }

          socket.emit("run-completed", { code: codeVal, signal });
        });
      };

      const command = langConfig.run(execPath);
      execute(command, false);
    });

    socket.on("stdin", (data) => {
      const child = activeProcesses.get(socket.id);
      if (child && child.stdin && child.stdin.writable) {
        child.stdin.write(data);
      }
    });

    socket.on("disconnect", () => {
      const child = activeProcesses.get(socket.id);
      if (child) {
        try {
          child.kill();
        } catch (e) {}
        activeProcesses.delete(socket.id);
      }
      console.log("User disconnected:", socket.id);
    });
  });
}

module.exports = { setupSocket };
