import { describe, expect, it } from "vitest";
import { detectBrands, normalizeText } from "./brand-detection";

const brands = [
  { id: "foodbox", name: "FoodBox", aliases: ["Food Box"] },
  { id: "competitor", name: "BurgerMax", aliases: [] },
];

describe("normalizeText", () => {
  it("normaliza mayusculas y diacriticos", () => {
    expect(normalizeText("COMIDA RÁPIDA")).toBe("comida rapida");
  });
});

describe("detectBrands", () => {
  it("detecta marcas exactas y ordena por aparicion", () => {
    const detections = detectBrands("BurgerMax aparece antes que FoodBox.", brands);

    expect(detections).toMatchObject([
      { brandId: "competitor", position: 1, detectedVia: "exact" },
      { brandId: "foodbox", position: 2, detectedVia: "exact" },
    ]);
  });

  it("detecta alias exactos", () => {
    const detections = detectBrands("Food Box es una franquicia conocida.", brands);

    expect(detections[0]).toMatchObject({ brandId: "foodbox", detectedVia: "exact" });
  });

  it("detecta typos por fuzzy matching", () => {
    const detections = detectBrands("FodBox aparece con un typo pequeno.", brands);

    expect(detections[0]).toMatchObject({ brandId: "foodbox", detectedVia: "fuzzy" });
  });
});
