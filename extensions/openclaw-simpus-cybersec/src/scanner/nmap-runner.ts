import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export type NmapRunOptions = { target: string; deepCheck?: boolean; timeoutMs?: number };

export async function runNmapSafe(options: NmapRunOptions): Promise<string> {
  if (options.deepCheck) {
    throw new Error(
      "deepCheck is intentionally not implemented with intrusive NSE scripts by default.",
    );
  }
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-simpus-nmap-"));
  const output = path.join(dir, "output.xml");
  const args = ["-sV", "-Pn", "-T2", "--open", "-oX", output, options.target];
  await runProcess("nmap", args, options.timeoutMs ?? 120_000);
  return fs.readFile(output, "utf8");
}

function runProcess(command: string, args: string[], timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`nmap timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`nmap exited ${code}: ${stderr.trim()}`));
    });
  });
}
