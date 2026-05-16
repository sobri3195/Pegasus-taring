import { describe, expect, it } from "vitest";
import { validateTargetSafety } from "../src/safety/target-validator.js";

const asset = {
  id: "a",
  name: "Dummy",
  target: "192.168.1.2",
  type: "simpus",
  environment: "dummy",
  authorizationStatus: "pending",
  createdAt: "now",
  updatedAt: "now",
} as const;

describe("target validator", () => {
  it("allows private dummy targets", () => {
    expect(validateTargetSafety("192.168.1.2", { allowPublicScan: false, asset }).ok).toBe(true);
  });

  it("blocks shell injection characters", () => {
    const result = validateTargetSafety("127.0.0.1; rm -rf /", { allowPublicScan: true });
    expect(result.ok).toBe(false);
  });

  it("blocks unauthorized production", () => {
    const result = validateTargetSafety("https://simpus.example.test", {
      allowPublicScan: true,
      asset: { ...asset, target: "https://simpus.example.test", environment: "production" },
    });
    expect(result.ok).toBe(false);
  });

  it("blocks public targets without override or authorization", () => {
    const result = validateTargetSafety("https://simpus.example.test", { allowPublicScan: false });
    expect(result.ok).toBe(false);
  });
});
