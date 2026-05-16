import { Type } from "@sinclair/typebox";
import { definePluginEntry, type AnyAgentTool } from "openclaw/plugin-sdk/core";
import { resolveSimpusConfig } from "./config.js";
import { registerSimpusCli } from "./cli.js";
import { osintTarget } from "./osint/osint-service.js";
import { generateMarkdownReport } from "./reports/markdown-report.js";
import { JsonSimpusStore } from "./storage/store.js";

function createSimpusTool(): AnyAgentTool {
  return {
    name: "openclaw_simpus_assess",
    label: "OpenClaw SIMPUS Assessment",
    description:
      "Run defensive SIMPUS OSINT for authorized targets or summarize local stored findings. Never uses exploit, brute force, or credential guessing.",
    parameters: Type.Object({
      action: Type.Optional(Type.String({ description: "osint or report" })),
      target: Type.Optional(
        Type.String({ description: "Authorized target URL/domain for passive OSINT" }),
      ),
      authorized: Type.Optional(
        Type.Boolean({ description: "Set true only when written authorization exists" }),
      ),
      asset: Type.Optional(Type.String({ description: "Asset name/id for report" })),
    }),
    async execute(_id: string, params: Record<string, unknown>) {
      const config = resolveSimpusConfig();
      const store = new JsonSimpusStore(config.dataDir);
      const action = typeof params.action === "string" ? params.action : "report";
      if (action === "osint") {
        const target = typeof params.target === "string" ? params.target : "";
        const run = await osintTarget({
          store,
          target,
          allowPublicScan: config.allowPublicScan,
          authorized: params.authorized === true,
        });
        return { content: [{ type: "text", text: JSON.stringify(run, null, 2) }], details: run };
      }
      const data = await store.read();
      const assetName = typeof params.asset === "string" ? params.asset : undefined;
      const assets = assetName
        ? data.assets.filter((item) => item.id === assetName || item.name === assetName)
        : data.assets;
      const assetIds = new Set(assets.map((item) => item.id));
      const report = generateMarkdownReport({
        assets,
        runs: data.scanRuns.filter((run) => assetIds.has(run.assetId)),
      });
      return { content: [{ type: "text", text: report }], details: { assets: assets.length } };
    },
  } as unknown as AnyAgentTool;
}

export default definePluginEntry({
  id: "openclaw-simpus-cybersec",
  name: "OpenClaw SIMPUS Scanner & OSINT Assistant",
  description:
    "Defensive light scanning, passive OSINT, risk scoring, comparison, and local reporting for SIMPUS/SIMRS assets.",
  register(api) {
    api.registerCli(({ program }) => registerSimpusCli(program), { commands: ["openclaw-simpus"] });
    api.registerTool(() => createSimpusTool(), {
      names: ["openclaw_simpus_assess"],
      optional: true,
    });
  },
});

export * from "./types.js";
export { compareScanRuns } from "./comparison/diff-engine.js";
export { parseNmapXml } from "./scanner/nmap-parser.js";
export { validateTargetSafety } from "./safety/target-validator.js";
