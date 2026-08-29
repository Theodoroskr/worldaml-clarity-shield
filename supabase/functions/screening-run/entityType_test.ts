// Verifies that the provider adapter maps subject types onto the
// filters.entity_type field correctly — and that "any" omits the filter so a
// single search returns both Individuals and Organisations.

import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { ComplyAdvantageAdapter } from "../_shared/screening/complyadvantage.ts";
import type { ScreeningOptions, ScreeningSubjectInput, SubjectType } from "../_shared/screening/types.ts";

Deno.env.set("COMPLYADVANTAGE_API_KEY", "test-key");

const OPTIONS: ScreeningOptions = {
  categories: ["sanctions", "pep_rca", "warnings"],
  nameThreshold: 0.75,
  exactMatch: false,
  maxResults: 50,
  monitoring: false,
};

function subjectOf(type: SubjectType): ScreeningSubjectInput {
  return { subject_type: type, full_name: "Elena Udrea" };
}

/** Runs createScreening against a stubbed fetch and returns the payload sent. */
async function capturePayload(type: SubjectType): Promise<Record<string, unknown>> {
  const originalFetch = globalThis.fetch;
  let captured: Record<string, unknown> = {};
  globalThis.fetch = (async (_input: unknown, init?: RequestInit) => {
    captured = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
    return new Response(
      JSON.stringify({ content: { data: { id: "search-1", hits: [] } } }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;
  try {
    const adapter = new ComplyAdvantageAdapter();
    await adapter.createScreening(subjectOf(type), OPTIONS, `test-${type}`);
  } finally {
    globalThis.fetch = originalFetch;
  }
  return captured;
}

Deno.test("Individual sends filters.entity_type = person", async () => {
  const payload = await capturePayload("person");
  assertEquals((payload.filters as Record<string, unknown>).entity_type, "person");
});

Deno.test("Organisation sends filters.entity_type = organisation", async () => {
  const payload = await capturePayload("organisation");
  assertEquals((payload.filters as Record<string, unknown>).entity_type, "organisation");
});

Deno.test("Company sends filters.entity_type = company", async () => {
  const payload = await capturePayload("company");
  assertEquals((payload.filters as Record<string, unknown>).entity_type, "company");
});

Deno.test("Any entity type omits the entity_type filter entirely", async () => {
  const payload = await capturePayload("any");
  const filters = payload.filters as Record<string, unknown>;
  assertEquals("entity_type" in filters, false);
});

Deno.test("Any entity type still sends source type filters", async () => {
  const payload = await capturePayload("any");
  const filters = payload.filters as Record<string, unknown>;
  assertEquals(Array.isArray(filters.types), true);
});
