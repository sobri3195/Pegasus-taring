import type { Command } from "commander";
import { resolveSimpusConfig } from "./config.js";
import { compareScanRuns } from "./comparison/diff-engine.js";
import { osintTarget } from "./osint/osint-service.js";
import { generateCsvReport } from "./reports/csv-report.js";
import { generateJsonReport } from "./reports/json-report.js";
import { generateMarkdownReport } from "./reports/markdown-report.js";
import { scanAsset } from "./scanner/scan-service.js";
import { validateTargetSafety } from "./safety/target-validator.js";
import { JsonSimpusStore } from "./storage/store.js";
import {
  assetTypes,
  environments,
  type Asset,
  type AssetEnvironment,
  type AssetType,
} from "./types.js";

export function registerSimpusCli(program: Command) {
  const root = program
    .command("openclaw-simpus")
    .description("Defensive SIMPUS scanner and OSINT assistant");

  root
    .command("init")
    .description("Initialize local SIMPUS assessment storage")
    .action(async () => {
      const store = new JsonSimpusStore(resolveSimpusConfig().dataDir);
      await store.init();
      console.log(`Initialized ${store.filePath}`);
    });

  const asset = root.command("asset").description("Manage SIMPUS assets");
  asset
    .command("add")
    .requiredOption("--name <name>", "Asset name")
    .requiredOption("--target <target>", "IP, domain, or URL")
    .option("--type <type>", "Asset type", "simpus")
    .option("--environment <environment>", "dummy, staging, production", "dummy")
    .option("--authorized <value>", "true when written authorization exists", "false")
    .option("--owner <owner>", "Owner")
    .option("--location <location>", "Location")
    .option("--notes <notes>", "Notes")
    .action(async (opts) => {
      const config = resolveSimpusConfig();
      const store = new JsonSimpusStore(config.dataDir);
      const authorizationStatus = opts.authorized === "true" ? "authorized" : "pending";
      const now = new Date().toISOString();
      const candidate = makeAsset({ ...opts, authorizationStatus, now });
      const validation = validateTargetSafety(candidate.target, {
        allowPublicScan: config.allowPublicScan,
        asset: candidate,
        authorized: authorizationStatus === "authorized",
      });
      if (!validation.ok) throw new Error(validation.reason);
      const saved = await store.upsertAsset(candidate);
      console.log(JSON.stringify(saved, null, 2));
    });

  root
    .command("scan")
    .requiredOption("--asset <nameOrId>", "Asset name or id")
    .option("--deep-check", "Require explicit deep check acknowledgement", false)
    .action(async (opts) => {
      const { store, config } = makeStore();
      const found = await store.findAsset(opts.asset);
      if (!found) throw new Error(`Asset not found: ${opts.asset}`);
      const run = await scanAsset({
        store,
        asset: found,
        allowPublicScan: config.allowPublicScan,
        deepCheck: opts.deepCheck,
        explicitDeepCheck: opts.deepCheck,
      });
      console.log(JSON.stringify(run, null, 2));
    });

  root
    .command("osint")
    .requiredOption("--target <target>", "Domain or URL")
    .option("--authorized <value>", "true when written authorization exists", "false")
    .action(async (opts) => {
      const { store, config } = makeStore();
      const run = await osintTarget({
        store,
        target: opts.target,
        allowPublicScan: config.allowPublicScan,
        authorized: opts.authorized === "true",
      });
      console.log(JSON.stringify(run, null, 2));
    });

  root
    .command("compare")
    .requiredOption("--asset <nameOrId>", "Asset name or id")
    .action(async (opts) => {
      const { store } = makeStore();
      const found = await store.findAsset(opts.asset);
      if (!found) throw new Error(`Asset not found: ${opts.asset}`);
      const [current, previous] = await store.latestRuns(found.id, 2);
      if (!current) throw new Error("No successful scans available for asset.");
      const comparison = compareScanRuns(previous, current);
      await store.addComparison(found.id, comparison);
      console.log(JSON.stringify(comparison, null, 2));
    });

  root
    .command("report")
    .requiredOption("--asset <nameOrId>", "Asset name or id")
    .option("--format <format>", "markdown, json, csv", "markdown")
    .action(async (opts) => {
      const { store } = makeStore();
      const data = await store.read();
      const found = data.assets.find((item) => item.id === opts.asset || item.name === opts.asset);
      if (!found) throw new Error(`Asset not found: ${opts.asset}`);
      const runs = data.scanRuns.filter(
        (run) => run.assetId === found.id || run.target === found.target,
      );
      const content =
        opts.format === "json"
          ? generateJsonReport({ assets: [found], runs })
          : opts.format === "csv"
            ? generateCsvReport(runs)
            : generateMarkdownReport({ assets: [found], runs });
      await store.addReport({ assetId: found.id, format: opts.format, content });
      console.log(content);
    });
}

function makeStore() {
  const config = resolveSimpusConfig();
  return { config, store: new JsonSimpusStore(config.dataDir) };
}

function makeAsset(opts: Record<string, string>): Asset {
  const type = assetTypes.includes(opts.type as AssetType) ? (opts.type as AssetType) : "other";
  const environment = environments.includes(opts.environment as AssetEnvironment)
    ? (opts.environment as AssetEnvironment)
    : "dummy";
  return {
    id: crypto.randomUUID(),
    name: opts.name,
    target: opts.target,
    type,
    environment,
    owner: opts.owner,
    location: opts.location,
    notes: opts.notes,
    authorizationStatus: opts.authorizationStatus === "authorized" ? "authorized" : "pending",
    createdAt: opts.now,
    updatedAt: opts.now,
  };
}
