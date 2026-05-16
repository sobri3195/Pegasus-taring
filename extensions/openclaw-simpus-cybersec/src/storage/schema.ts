import type { SimpusStoreData } from "../types.js";

export const emptyStoreData = (): SimpusStoreData => ({
  assets: [],
  scanRuns: [],
  comparisons: [],
  reports: [],
  auditLogs: [],
});
