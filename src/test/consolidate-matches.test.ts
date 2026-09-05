import { describe, it, expect } from "vitest";
import {
  consolidateMatches,
  isSameEntity,
  nameSortKey,
  normaliseName,
  jaroWinkler,
  type ConsolidatableMatch,
} from "@/lib/screening/consolidateMatches";

const m = (over: Partial<ConsolidatableMatch> & { id: string }): ConsolidatableMatch => ({
  matched_name: "Elena Udrea",
  entity_type: "person",
  categories: ["pep"],
  category_labels: ["Politically Exposed Person"],
  name_similarity: 100,
  country: "Romania",
  year_of_birth: 1973,
  status: "pending",
  ...over,
});

describe("normalisation", () => {
  it("strips accents, punctuation and case", () => {
    expect(normaliseName("Éléna  Udrea-Popescu!")).toBe("elena udrea popescu");
  });
  it("sorts tokens so reordered names match", () => {
    expect(nameSortKey("Elena Udrea")).toBe(nameSortKey("Udrea, Elena"));
  });
  it("scores identical strings as 1", () => {
    expect(jaroWinkler("elena", "elena")).toBe(1);
    expect(jaroWinkler("elena", "")).toBe(0);
  });
});

describe("isSameEntity", () => {
  it("merges reordered names with the same DOB and country", () => {
    expect(isSameEntity(m({ id: "a" }), m({ id: "b", matched_name: "Udrea Elena" }))).toBe(true);
  });
  it("treats unknown attributes as compatible", () => {
    expect(isSameEntity(m({ id: "a" }), m({ id: "b", year_of_birth: null, country: null }))).toBe(true);
  });
  it("keeps different birth years apart", () => {
    expect(isSameEntity(m({ id: "a" }), m({ id: "b", year_of_birth: 1960 }))).toBe(false);
  });
  it("keeps different countries apart", () => {
    expect(isSameEntity(m({ id: "a" }), m({ id: "b", country: "Bulgaria" }))).toBe(false);
  });
  it("keeps different entity types apart", () => {
    expect(isSameEntity(m({ id: "a" }), m({ id: "b", entity_type: "company" }))).toBe(false);
  });
  it("keeps clearly different names apart", () => {
    expect(isSameEntity(m({ id: "a" }), m({ id: "b", matched_name: "Marian Vanghelie" }))).toBe(false);
  });
  it("merges names with an extra middle name (Elena Udrea / Udrea Elena Gabriela)", () => {
    expect(isSameEntity(m({ id: "a" }), m({ id: "b", matched_name: "Udrea Elena Gabriela" }))).toBe(true);
  });
  it("merges names with a near-identical extra token", () => {
    expect(isSameEntity(m({ id: "a" }), m({ id: "b", matched_name: "Elena Gabriela Udrea" }))).toBe(true);
  });
  it("does not merge when the longer name shares no full token set", () => {
    expect(isSameEntity(m({ id: "a" }), m({ id: "b", matched_name: "Elena Popescu Ionescu" }))).toBe(false);
  });
  it("does not merge same-length names via the token-subset rule", () => {
    expect(isSameEntity(m({ id: "a" }), m({ id: "b", matched_name: "Elena Popescu" }))).toBe(false);
  });
});

describe("consolidateMatches", () => {
  it("merges duplicate listings and unions categories", () => {
    const groups = consolidateMatches([
      m({ id: "1", categories: ["pep"], category_labels: ["PEP"], name_similarity: 92 }),
      m({ id: "2", matched_name: "Udrea Elena", categories: ["sanction"], category_labels: ["Sanctions"], name_similarity: 100 }),
      m({ id: "3", categories: ["adverse-media"], category_labels: ["Adverse Media"], name_similarity: 88 }),
      m({ id: "4", matched_name: "Marian Vanghelie", year_of_birth: 1968, name_similarity: 70 }),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups[0].listingCount).toBe(3);
    expect(groups[0].primary.id).toBe("2");
    expect(groups[0].categories.sort()).toEqual(["adverse-media", "pep", "sanction"]);
    expect(groups[0].categoryLabels).toContain("Sanctions");
    expect(groups[1].listingCount).toBe(1);
  });

  it("returns an empty array for no matches", () => {
    expect(consolidateMatches([])).toEqual([]);
  });
});
