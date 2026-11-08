const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "src");

const ignoredFolders = new Set([
  "node_modules",
  ".git",
  ".vscode",
  "uploads",
]);

const ignoredFiles = new Set([
  "project-structure.js",
]);

function getFunctions(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  const functions = new Set();

  // exports.functionName = ...
  const exportedFunctions = content.matchAll(
    /exports\.([a-zA-Z_$][\w$]*)\s*=/g
  );

  for (const match of exportedFunctions) {
    functions.add(match[1] + "()");
  }

  // function functionName(...)
  const normalFunctions = content.matchAll(
    /(?:async\s+)?function\s+([a-zA-Z_$][\w$]*)\s*\(/g
  );

  for (const match of normalFunctions) {
    functions.add(match[1] + "()");
  }

  // const functionName = (...) =>
  // const functionName = async (...) =>
  const arrowFunctions = content.matchAll(
    /(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z_$][\w$]*)\s*=>/g
  );

  for (const match of arrowFunctions) {
    functions.add(match[1] + "()");
  }

  // class ClassName { ... }
  const classMatches = content.matchAll(
    /class\s+([a-zA-Z_$][\w$]*)\s*(?:extends\s+[^{]+)?\s*\{/g
  );

  for (const classMatch of classMatches) {
    const className = classMatch[1];

    // Find methods inside the class
    const classStart = classMatch.index + classMatch[0].length;
    const classContent = content.slice(classStart);

    const methods = classContent.matchAll(
      /^\s*(?:static\s+)?(?:async\s+)?([a-zA-Z_$][\w$]*)\s*\([^)]*\)\s*\{/gm
    );

    for (const method of methods) {
      const methodName = method[1];

      if (
        methodName !== "if" &&
        methodName !== "for" &&
        methodName !== "while" &&
        methodName !== "switch" &&
        methodName !== "catch"
      ) {
        functions.add(`${className}.${methodName}()`);
      }
    }
  }

  return [...functions];
}

function printTree(currentPath, prefix = "") {
  const entries = fs
    .readdirSync(currentPath, { withFileTypes: true })
    .filter((entry) => {
      if (entry.isDirectory()) {
        return !ignoredFolders.has(entry.name);
      }

      return !ignoredFiles.has(entry.name);
    })
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;

      return a.name.localeCompare(b.name);
    });

  entries.forEach((entry, index) => {
    const isLast = index === entries.length - 1;
    const branch = isLast ? "└── " : "├── ";
    const nextPrefix = prefix + (isLast ? "    " : "│   ");

    const fullPath = path.join(currentPath, entry.name);

    if (entry.isDirectory()) {
      console.log(`${prefix}${branch}${entry.name}/`);

      printTree(fullPath, nextPrefix);
      return;
    }

    console.log(`${prefix}${branch}${entry.name}`);

    // Only analyze JavaScript files
    if (entry.name.endsWith(".js")) {
      const functions = getFunctions(fullPath);

      functions.forEach((fn, fnIndex) => {
        const fnBranch =
          fnIndex === functions.length - 1 ? "└── " : "├── ";

        console.log(`${nextPrefix}${fnBranch}${fn}`);
      });
    }
  });
}

console.log("src/");
printTree(ROOT);