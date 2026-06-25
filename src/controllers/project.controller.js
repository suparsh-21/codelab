const projectmodel = require("../models/project.model");

// default starter code for each language
const starterCode = {
  javascript: '// Welcome to CodeLab!\nconsole.log("Hello, World!");',
  typescript: '// Welcome to CodeLab!\nconst greeting: string = "Hello, World!";\nconsole.log(greeting);',
  python: '# Welcome to CodeLab!\nprint("Hello, World!")',
  java: '// Welcome to CodeLab!\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  cpp: '// Welcome to CodeLab!\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
  c: '// Welcome to CodeLab!\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
  csharp: '// Welcome to CodeLab!\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',
  go: '// Welcome to CodeLab!\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
  rust: '// Welcome to CodeLab!\nfn main() {\n    println!("Hello, World!");\n}',
  ruby: '# Welcome to CodeLab!\nputs "Hello, World!"',
  php: '<?php\n// Welcome to CodeLab!\necho "Hello, World!\\n";\n?>',
  swift: '// Welcome to CodeLab!\nprint("Hello, World!")',
  kotlin: '// Welcome to CodeLab!\nfun main() {\n    println("Hello, World!")\n}',
  scala: '// Welcome to CodeLab!\nobject Main extends App {\n    println("Hello, World!")\n}',
  dart: '// Welcome to CodeLab!\nvoid main() {\n  print("Hello, World!");\n}',
  r: '# Welcome to CodeLab!\ncat("Hello, World!\\n")',
  perl: '# Welcome to CodeLab!\nprint "Hello, World!\\n";',
  lua: '-- Welcome to CodeLab!\nprint("Hello, World!")',
  bash: '#!/bin/bash\n# Welcome to CodeLab!\necho "Hello, World!"',
  powershell: '# Welcome to CodeLab!\nWrite-Host "Hello, World!"',
  haskell: '-- Welcome to CodeLab!\nmain :: IO ()\nmain = putStrLn "Hello, World!"',
  elixir: '# Welcome to CodeLab!\nIO.puts("Hello, World!")',
  clojure: ';; Welcome to CodeLab!\n(println "Hello, World!")',
  fsharp: '// Welcome to CodeLab!\nprintfn "Hello, World!"',
  objectivec: '// Welcome to CodeLab!\n#import <Foundation/Foundation.h>\n\nint main() {\n    @autoreleasepool {\n        NSLog(@"Hello, World!");\n    }\n    return 0;\n}',
  pascal: '// Welcome to CodeLab!\nprogram HelloWorld;\nbegin\n    writeln(\'Hello, World!\');\nend.',
  groovy: '// Welcome to CodeLab!\nprintln "Hello, World!"',
  julia: '# Welcome to CodeLab!\nprintln("Hello, World!")',
  ocaml: '(* Welcome to CodeLab! *)\nprint_endline "Hello, World!"',
  fortran: '! Welcome to CodeLab!\nprogram hello\n    print *, "Hello, World!"\nend program hello',
  cobol: '       IDENTIFICATION DIVISION.\n       PROGRAM-ID. HELLO.\n       PROCEDURE DIVISION.\n           DISPLAY "Hello, World!".\n           STOP RUN.',
  erlang: '% Welcome to CodeLab!\nmain(_) ->\n    io:format("Hello, World!~n").',
  nim: '# Welcome to CodeLab!\necho "Hello, World!"',
  zig: '// Welcome to CodeLab!\nconst std = @import("std");\n\npub fn main() void {\n    std.debug.print("Hello, World!\\n", .{});\n}',
  vlang: '// Welcome to CodeLab!\nfn main() {\n    println("Hello, World!")\n}',
  html: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n  <style>\n    body {\n      font-family: system-ui, sans-serif;\n      text-align: center;\n      padding: 60px 20px;\n      background: #0a0a0a;\n      color: #fff;\n    }\n    h1 { color: #E2B808; font-size: 2.5rem; }\n    p { color: #888; margin-top: 10px; }\n  </style>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n  <p>Start editing to see live preview</p>\n</body>\n</html>',
  css: '/* Welcome to CodeLab! */\nbody {\n  font-family: system-ui, sans-serif;\n  background: #0a0a0a;\n  color: #ffffff;\n  margin: 0;\n  padding: 40px;\n}\n\nh1 {\n  color: #E2B808;\n}',
  markdown: '# Welcome to CodeLab!\n\nThis is a **markdown** file.\n\n## Features\n- Write markdown\n- Preview output\n- Export anywhere',
  xml: '<?xml version="1.0" encoding="UTF-8"?>\n<!-- Welcome to CodeLab! -->\n<greeting>\n  <message>Hello, World!</message>\n</greeting>',
  json: '{\n  "message": "Welcome to CodeLab!",\n  "greeting": "Hello, World!"\n}',
  yaml: '# Welcome to CodeLab!\nmessage: Hello, World!\napp:\n  name: CodeLab\n  version: 1.0.0',
  sql: '-- Welcome to CodeLab!\nSELECT \'Hello, World!\' AS greeting;',
  graphql: '# Welcome to CodeLab!\ntype Query {\n  hello: String\n}\n\n# Example query:\n# query {\n#   hello\n# }',
};


function getFileExtension(lang) {
  switch (lang) {
    case "javascript": return "js";
    case "typescript": return "ts";
    case "python": return "py";
    case "java": return "java";
    case "cpp": return "cpp";
    case "c": return "c";
    case "csharp": return "cs";
    case "go": return "go";
    case "rust": return "rs";
    case "ruby": return "rb";
    case "php": return "php";
    case "swift": return "swift";
    case "kotlin": return "kt";
    case "dart": return "dart";
    case "html": return "html";
    case "css": return "css";
    case "markdown": return "md";
    case "json": return "json";
    case "sql": return "sql";
    default: return "txt";
  }
}

async function createProjectController(req, res) {
  try {
    const { name, language } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const lang = language || "javascript";
    const defaultCode = starterCode[lang] || `// Start coding in ${lang}...`;
    const defaultFileName = `main.${getFileExtension(lang)}`;

    const project = await projectmodel.create({
      name,
      language: lang,
      code: defaultCode,
      files: [
        {
          name: defaultFileName,
          path: defaultFileName,
          type: "file",
          content: defaultCode,
        }
      ],
      userId: req.userId,
    });

    return res.status(201).json({ message: "Project created", project });
  } catch (error) {
    console.error("Project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


async function getProjectsController(req, res) {
  try {
    const projects = await projectmodel
      .find({ userId: req.userId })
      .sort({ updatedAt: -1 });

    return res.status(200).json({ projects });
  } catch (error) {
    console.error("Project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


async function getProjectByIdController(req, res) {
  try {
    const project = await projectmodel.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Auto-migrate older projects without 'files'
    if (!project.files || project.files.length === 0) {
      const ext = getFileExtension(project.language);
      const defaultFileName = `main.${ext}`;
      project.files = [
        {
          name: defaultFileName,
          path: defaultFileName,
          type: "file",
          content: project.code || "",
        }
      ];
      await project.save();
    }

    return res.status(200).json({ project });
  } catch (error) {
    console.error("Project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


async function updateProjectController(req, res) {
  try {
    const { code, name, language, files } = req.body;

    const project = await projectmodel.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (code !== undefined) project.code = code;
    if (name) project.name = name;
    if (language) project.language = language;
    if (files !== undefined) project.files = files;

    await project.save();

    return res.status(200).json({ message: "Project updated", project });
  } catch (error) {
    console.error("Project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


async function deleteProjectController(req, res) {
  try {
    const project = await projectmodel.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    console.error("Project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
};
