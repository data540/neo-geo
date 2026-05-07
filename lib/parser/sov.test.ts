import { describe, expect, it } from "vitest";
import { calculateShareOfVoice, calculateWeightedShareOfVoice } from "./sov";

describe("calculateShareOfVoice", () => {
  it("calcula SOV simple", () => {
    expect(
      calculateShareOfVoice(
        [
          { brandId: "a", position: 1 },
          { brandId: "b", position: 2 },
          { brandId: "a", position: 3 },
        ],
        "a",
      ),
    ).toBeCloseTo(66.66, 1);
  });

  it("devuelve 0 sin menciones", () => {
    expect(calculateShareOfVoice([], "a")).toBe(0);
  });
});

describe("calculateWeightedShareOfVoice", () => {
  it("pondera por posicion", () => {
    expect(
      calculateWeightedShareOfVoice(
        [
          { brandId: "a", position: 1 },
          { brandId: "b", position: 2 },
        ],
        "a",
      ),
    ).toBeCloseTo(66.66, 1);
  });
});
