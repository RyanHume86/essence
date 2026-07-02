import { describe, it, expect } from "vitest";
import {
  normalizePriority,
  byPriorityDesc,
  isElevatedPriority,
  PRIORITY_DEFAULT,
} from "./priority";

describe("normalizePriority", () => {
  it("passes valid 1–5 integers through unchanged", () => {
    expect(normalizePriority(1)).toBe(1);
    expect(normalizePriority(3)).toBe(3);
    expect(normalizePriority(5)).toBe(5);
  });

  it("defaults nullish / garbage to the mid default", () => {
    expect(normalizePriority(undefined)).toBe(PRIORITY_DEFAULT);
    expect(normalizePriority(null)).toBe(PRIORITY_DEFAULT);
    expect(normalizePriority(NaN)).toBe(PRIORITY_DEFAULT);
    expect(normalizePriority("banana")).toBe(PRIORITY_DEFAULT);
    expect(normalizePriority({})).toBe(PRIORITY_DEFAULT);
  });

  it("treats empty / whitespace-only strings as the default (not 0→1)", () => {
    expect(normalizePriority("")).toBe(PRIORITY_DEFAULT);
    expect(normalizePriority("   ")).toBe(PRIORITY_DEFAULT);
    expect(normalizePriority("\t")).toBe(PRIORITY_DEFAULT);
  });

  it("maps shipped legacy string priorities (pre-2.5 rows)", () => {
    expect(normalizePriority("normal")).toBe(3);
    expect(normalizePriority("high")).toBe(4);
    expect(normalizePriority("HIGH")).toBe(4);
    expect(normalizePriority(" high ")).toBe(4);
  });

  it("coerces numeric strings", () => {
    expect(normalizePriority("4")).toBe(4);
    expect(normalizePriority("2")).toBe(2);
  });

  it("clamps out-of-range and rounds fractional values", () => {
    expect(normalizePriority(0)).toBe(1);
    expect(normalizePriority(9)).toBe(5);
    expect(normalizePriority(-3)).toBe(1);
    expect(normalizePriority(4.4)).toBe(4);
    expect(normalizePriority(4.6)).toBe(5);
  });
});

describe("byPriorityDesc", () => {
  it("sorts higher priority first", () => {
    const tasks = [{ priority: 2 }, { priority: 5 }, { priority: 3 }];
    expect(tasks.sort(byPriorityDesc).map((t) => t.priority)).toEqual([5, 3, 2]);
  });

  it("is legacy-safe: string rows sort against integers without NaN", () => {
    const tasks = [{ priority: "normal" }, { priority: 5 }, { priority: "high" }];
    // normal→3, high→4, so order is 5, high(4), normal(3)
    expect(tasks.sort(byPriorityDesc).map((t) => t.priority)).toEqual([5, "high", "normal"]);
  });

  it("treats a missing priority as the mid default", () => {
    const tasks = [{ priority: 5 }, {}, { priority: 1 }];
    expect(tasks.sort(byPriorityDesc).map((t) => t.priority ?? "none")).toEqual([5, "none", 1]);
  });
});

describe("isElevatedPriority", () => {
  it("is true only for the 4–5 band", () => {
    expect(isElevatedPriority(5)).toBe(true);
    expect(isElevatedPriority(4)).toBe(true);
    expect(isElevatedPriority(3)).toBe(false);
    expect(isElevatedPriority(1)).toBe(false);
  });

  it("recognises the legacy 'high' string as elevated", () => {
    expect(isElevatedPriority("high")).toBe(true);
    expect(isElevatedPriority("normal")).toBe(false);
  });
});
