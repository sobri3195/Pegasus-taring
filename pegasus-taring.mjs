#!/usr/bin/env node

import module from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MIN_NODE_MAJOR = 22;
const MIN_NODE_MINOR = 12;
const MIN_NODE_VERSION = `${MIN_NODE_MAJOR}.${MIN_NODE_MINOR}`;
const WRAPPER_DEBUG_ENABLED =
  process.env.OPENCLAW_WRAPPER_DEBUG === "1" || process.argv.includes("--wrapper-debug");

const parseNodeVersion = (rawVersion) => {
  const [majorRaw = "0", minorRaw = "0"] = rawVersion.split(".");
  return {
    major: Number(majorRaw),
    minor: Number(minorRaw),
  };
};

const isSupportedNodeVersion = (version) =>
  version.major > MIN_NODE_MAJOR ||
  (version.major === MIN_NODE_MAJOR && version.minor >= MIN_NODE_MINOR);

const resolveCliDisplayName = () => {
  const invokedPath = process.argv[1];
  if (typeof invokedPath !== "string" || invokedPath.length === 0) {
    return "pegasus-taring";
  }

  const rawName = path.basename(invokedPath).replace(/\.[cm]?js$/u, "");
  return rawName || "pegasus-taring";
};

const CLI_DISPLAY_NAME = resolveCliDisplayName();

const ensureSupportedNodeVersion = () => {
  if (process.env.OPENCLAW_SKIP_NODE_VERSION_CHECK === "1") {
    return;
  }

  if (isSupportedNodeVersion(parseNodeVersion(process.versions.node))) {
    return;
  }

  process.stderr.write(
    `${CLI_DISPLAY_NAME}: Node.js v${MIN_NODE_VERSION}+ is required (current: v${process.versions.node}).\n` +
      "If you use nvm, run:\n" +
      `  nvm install ${MIN_NODE_MAJOR}\n` +
      `  nvm use ${MIN_NODE_MAJOR}\n` +
      `  nvm alias default ${MIN_NODE_MAJOR}\n`,
  );
  process.exit(1);
};

const debugLog = (message) => {
  if (!WRAPPER_DEBUG_ENABLED) {
    return;
  }

  process.stderr.write(`${CLI_DISPLAY_NAME}: ${message}\n`);
};

const resolveEntryCandidates = () => {
  const envEntry = process.env.OPENCLAW_ENTRY_MODULE;
  if (typeof envEntry === "string" && envEntry.trim().length > 0) {
    return [envEntry.trim()];
  }

  return ["./dist/entry.js", "./dist/entry.mjs", "./dist/entry.cjs"];
};

ensureSupportedNodeVersion();

// https://nodejs.org/api/module.html#module-compile-cache
if (module.enableCompileCache && !process.env.NODE_DISABLE_COMPILE_CACHE) {
  try {
    module.enableCompileCache();
  } catch {
    // Ignore errors
  }
}

const isModuleNotFoundError = (err) =>
  err && typeof err === "object" && "code" in err && err.code === "ERR_MODULE_NOT_FOUND";

const isDirectModuleNotFoundError = (err, specifier) => {
  if (!isModuleNotFoundError(err)) {
    return false;
  }

  const expectedUrl = new URL(specifier, import.meta.url);
  if ("url" in err && err.url === expectedUrl.href) {
    return true;
  }

  const message = "message" in err && typeof err.message === "string" ? err.message : "";
  const expectedPath = fileURLToPath(expectedUrl);

  // Keep transitive missing dependencies visible (e.g., missing package imported by entry.js).
  return (
    message.includes(`Cannot find module '${expectedPath}'`) ||
    message.includes(`Cannot find module "${expectedPath}"`)
  );
};

const installProcessWarningFilter = async () => {
  // Keep bootstrap warnings consistent with the TypeScript runtime.
  for (const specifier of ["./dist/warning-filter.js", "./dist/warning-filter.mjs"]) {
    try {
      const mod = await import(specifier);
      if (typeof mod.installProcessWarningFilter === "function") {
        mod.installProcessWarningFilter();
        return;
      }
    } catch (err) {
      if (isDirectModuleNotFoundError(err, specifier)) {
        continue;
      }
      throw err;
    }
  }
};

await installProcessWarningFilter();

const tryImport = async (specifier) => {
  try {
    await import(specifier);
    debugLog(`loaded ${specifier}`);
    return true;
  } catch (err) {
    // Only swallow direct entry misses; rethrow transitive resolution failures.
    if (isDirectModuleNotFoundError(err, specifier)) {
      debugLog(`missing ${specifier}`);
      return false;
    }
    throw err;
  }
};

const entryCandidates = resolveEntryCandidates();
let loadedEntry = false;
for (const entrySpecifier of entryCandidates) {
  if (await tryImport(entrySpecifier)) {
    loadedEntry = true;
    break;
  }
}

if (loadedEntry) {
  // Entrypoint imported successfully.
} else {
  const entrySummary =
    entryCandidates.length === 1
      ? entryCandidates[0]
      : `${entryCandidates[0]} | ${entryCandidates[1]} | ${entryCandidates[2]}`;
  throw new Error(`${CLI_DISPLAY_NAME}: missing ${entrySummary} (build output).`);
}
