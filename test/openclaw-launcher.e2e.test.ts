import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

async function makeLauncherFixture(fixtureRoots: string[]): Promise<string> {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-launcher-"));
  fixtureRoots.push(fixtureRoot);
  await fs.copyFile(
    path.resolve(process.cwd(), "openclaw.mjs"),
    path.join(fixtureRoot, "openclaw.mjs"),
  );
  await fs.copyFile(
    path.resolve(process.cwd(), "pegasus-taring.mjs"),
    path.join(fixtureRoot, "pegasus-taring.mjs"),
  );
  await fs.mkdir(path.join(fixtureRoot, "dist"), { recursive: true });
  return fixtureRoot;
}

describe("openclaw launcher", () => {
  const fixtureRoots: string[] = [];

  afterEach(async () => {
    await Promise.all(
      fixtureRoots.splice(0).map(async (fixtureRoot) => {
        await fs.rm(fixtureRoot, { recursive: true, force: true });
      }),
    );
  });

  it("surfaces transitive entry import failures instead of masking them as missing dist", async () => {
    const fixtureRoot = await makeLauncherFixture(fixtureRoots);
    await fs.writeFile(
      path.join(fixtureRoot, "dist", "entry.js"),
      'import "missing-openclaw-launcher-dep";\nexport {};\n',
      "utf8",
    );

    const result = spawnSync(process.execPath, [path.join(fixtureRoot, "openclaw.mjs"), "--help"], {
      cwd: fixtureRoot,
      encoding: "utf8",
    });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("missing-openclaw-launcher-dep");
    expect(result.stderr).not.toContain(
      "missing dist/entry.js | ./dist/entry.mjs | ./dist/entry.cjs",
    );
  });

  it("keeps the friendly launcher error for a truly missing entry build output", async () => {
    const fixtureRoot = await makeLauncherFixture(fixtureRoots);

    const result = spawnSync(process.execPath, [path.join(fixtureRoot, "openclaw.mjs"), "--help"], {
      cwd: fixtureRoot,
      encoding: "utf8",
    });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      "missing ./dist/entry.js | ./dist/entry.mjs | ./dist/entry.cjs",
    );
  });

  it("supports a custom entry module via OPENCLAW_ENTRY_MODULE", async () => {
    const fixtureRoot = await makeLauncherFixture(fixtureRoots);
    await fs.writeFile(
      path.join(fixtureRoot, "dist", "custom-entry.mjs"),
      "process.exit(0);\n",
      "utf8",
    );

    const result = spawnSync(process.execPath, [path.join(fixtureRoot, "openclaw.mjs")], {
      cwd: fixtureRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        OPENCLAW_ENTRY_MODULE: "./dist/custom-entry.mjs",
      },
    });

    expect(result.status).toBe(0);
  });

  it("loads CommonJS dist/entry.cjs when ESM entry files are missing", async () => {
    const fixtureRoot = await makeLauncherFixture(fixtureRoots);
    await fs.writeFile(
      path.join(fixtureRoot, "dist", "entry.cjs"),
      "process.exitCode = 0;\n",
      "utf8",
    );

    const result = spawnSync(process.execPath, [path.join(fixtureRoot, "openclaw.mjs")], {
      cwd: fixtureRoot,
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
  });

  it("can emit debug logs for entry probing", async () => {
    const fixtureRoot = await makeLauncherFixture(fixtureRoots);
    await fs.writeFile(path.join(fixtureRoot, "dist", "entry.mjs"), "export {};\n", "utf8");

    const result = spawnSync(process.execPath, [path.join(fixtureRoot, "openclaw.mjs")], {
      cwd: fixtureRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        OPENCLAW_WRAPPER_DEBUG: "1",
      },
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toContain("missing ./dist/entry.js");
    expect(result.stderr).toContain("loaded ./dist/entry.mjs");
  });
});
