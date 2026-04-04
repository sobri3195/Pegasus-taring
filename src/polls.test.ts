import { describe, expect, it } from "vitest";
import { normalizePollDurationHours, normalizePollInput } from "./polls.js";

describe("polls", () => {
  it("normalizes question/options and validates maxSelections", () => {
    expect(
      normalizePollInput({
        question: "  Lunch? ",
        options: [" Pizza ", " ", "Sushi"],
        maxSelections: 2,
      }),
    ).toEqual({
      question: "Lunch?",
      options: ["Pizza", "Sushi"],
      maxSelections: 2,
      durationSeconds: undefined,
      durationHours: undefined,
    });
  });

  it("enforces max option count when configured", () => {
    expect(() =>
      normalizePollInput({ question: "Q", options: ["A", "B", "C"] }, { maxOptions: 2 }),
    ).toThrow(/at most 2/);
  });

  it("automatically removes duplicate options and keeps first variant", () => {
    expect(
      normalizePollInput({
        question: "Best editor?",
        options: ["Vim", "vim", "Neovim", "VIM"],
      }),
    ).toEqual({
      question: "Best editor?",
      options: ["Vim", "Neovim"],
      maxSelections: 1,
      durationSeconds: undefined,
      durationHours: undefined,
    });
  });

  it("automatically clamps maxSelections to valid bounds", () => {
    expect(
      normalizePollInput({
        question: "Pick one",
        options: ["A", "B", "C"],
        maxSelections: 99,
      }).maxSelections,
    ).toBe(3);

    expect(
      normalizePollInput({
        question: "Pick one",
        options: ["A", "B", "C"],
        maxSelections: 0,
      }).maxSelections,
    ).toBe(1);
  });

  it("automatically clamps duration minimums", () => {
    expect(
      normalizePollInput({
        question: "Q",
        options: ["A", "B"],
        durationSeconds: 0,
      }).durationSeconds,
    ).toBe(1);

    expect(
      normalizePollInput({
        question: "Q",
        options: ["A", "B"],
        durationHours: -2,
      }).durationHours,
    ).toBe(1);
  });

  it.each([
    { durationHours: undefined, expected: 24 },
    { durationHours: 999, expected: 48 },
    { durationHours: 1, expected: 1 },
  ])("clamps poll duration for $durationHours hours", ({ durationHours, expected }) => {
    expect(normalizePollDurationHours(durationHours, { defaultHours: 24, maxHours: 48 })).toBe(
      expected,
    );
  });

  it("rejects both durationSeconds and durationHours", () => {
    expect(() =>
      normalizePollInput({
        question: "Q",
        options: ["A", "B"],
        durationSeconds: 60,
        durationHours: 1,
      }),
    ).toThrow(/mutually exclusive/);
  });
});
