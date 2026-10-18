import { describe, it, expect } from "vitest";
import { isFreeLearner } from "@/lib/adminUserIntel";
describe("isFreeLearner", () => {
  it("academy-only gmail with no purchase is a free learner", () => expect(isFreeLearner(["academy"], "a@gmail.com", 0)).toBe(true));
  it("company email stays in corporate view", () => expect(isFreeLearner(["academy"], "a@pwc.com", 0)).toBe(false));
  it("paying learner stays in corporate view", () => expect(isFreeLearner(["academy"], "a@gmail.com", 1)).toBe(false));
  it("business user is never a free learner", () => expect(isFreeLearner(["academy", "business"], "a@gmail.com", 0)).toBe(false));
});
