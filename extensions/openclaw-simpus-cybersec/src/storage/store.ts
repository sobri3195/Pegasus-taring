import fs from "node:fs/promises";
import path from "node:path";
import { emptyStoreData } from "./schema.js";
import type { Asset, AuditLogEntry, ComparisonResult, ScanRun, SimpusStoreData } from "../types.js";

export class JsonSimpusStore {
  readonly filePath: string;

  constructor(dataDir: string) {
    this.filePath = path.join(dataDir, "store.json");
  }

  async init(): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true, mode: 0o700 });
    try {
      await fs.access(this.filePath);
    } catch {
      await this.write(emptyStoreData());
    }
  }

  async read(): Promise<SimpusStoreData> {
    await this.init();
    const raw = await fs.readFile(this.filePath, "utf8");
    return { ...emptyStoreData(), ...(JSON.parse(raw) as Partial<SimpusStoreData>) };
  }

  async write(data: SimpusStoreData): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true, mode: 0o700 });
    await fs.writeFile(this.filePath, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
  }

  async upsertAsset(asset: Asset): Promise<Asset> {
    const data = await this.read();
    const index = data.assets.findIndex((item) => item.id === asset.id || item.name === asset.name);
    if (index >= 0) {
      data.assets[index] = { ...data.assets[index], ...asset, updatedAt: new Date().toISOString() };
    } else {
      data.assets.push(asset);
    }
    await this.write(data);
    return index >= 0 ? data.assets[index] : asset;
  }

  async findAsset(nameOrId: string): Promise<Asset | undefined> {
    const data = await this.read();
    return data.assets.find((asset) => asset.id === nameOrId || asset.name === nameOrId);
  }

  async addScanRun(run: ScanRun): Promise<void> {
    const data = await this.read();
    data.scanRuns.push(run);
    await this.write(data);
  }

  async latestRuns(assetId: string, count = 2): Promise<ScanRun[]> {
    const data = await this.read();
    return data.scanRuns
      .filter((run) => run.assetId === assetId && run.status === "success")
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
      .slice(0, count);
  }

  async addComparison(assetId: string, comparison: ComparisonResult): Promise<void> {
    const data = await this.read();
    data.comparisons.push({
      ...comparison,
      id: crypto.randomUUID(),
      assetId,
      createdAt: new Date().toISOString(),
    });
    await this.write(data);
  }

  async addReport(report: { assetId?: string; format: string; content: string }): Promise<void> {
    const data = await this.read();
    data.reports.push({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...report });
    await this.write(data);
  }

  async addAudit(entry: AuditLogEntry): Promise<void> {
    const data = await this.read();
    data.auditLogs.push(entry);
    await this.write(data);
  }
}
