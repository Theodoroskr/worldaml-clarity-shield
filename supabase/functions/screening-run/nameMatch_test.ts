import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  computeNameMatch,
  labelMatchTypes,
  nameSimilarity,
} from "../_shared/screening/nameMatch.ts";

const run = (
  subjectName: string,
  matchedName: string,
  opts: { aliases?: string[]; matchTypes?: string[]; providerScore?: number; debug?: boolean } = {},
) =>
  computeNameMatch({
    subjectName,
    matchedName,
    aliases: opts.aliases ?? [],
    matchTypes: opts.matchTypes ?? [],
    providerScore: opts.providerScore ?? 0.7,
    debug: opts.debug,
  });

Deno.test("exact name match scores 100", () => {
  const r = run("Elena Udrea", "Elena Udrea", { matchTypes: ["name_exact"] });
  assertEquals(r.name_similarity, 100);
  assertEquals(r.match_basis, "exact_name");
});

Deno.test("case, accents and punctuation are ignored for exact matches", () => {
  for (const candidate of ["ELENA UDREA", "  elena   udrea ", "Elena Údrea", "Elena-Udrea"]) {
    const r = run("Elena Udrea", candidate);
    assertEquals(r.name_similarity, 100, `expected 100 for "${candidate}"`);
    assertEquals(r.match_basis, "exact_name");
  }
});

Deno.test("reordered name tokens score 98", () => {
  const r = run("Elena Udrea", "Udrea Elena");
  assertEquals(r.name_similarity, 98);
  assertEquals(r.match_basis, "reordered_name");
});

Deno.test("extra middle names score in the 92-99 range", () => {
  const r = run("Elena Udrea", "Udrea Elena Gabriela");
  assert(r.name_similarity! >= 92 && r.name_similarity! <= 99, `got ${r.name_similarity}`);
  assertEquals(r.match_basis, "partial_name");
});

Deno.test("exact alias match scores 100 with alias basis", () => {
  const r = run("Elena Udrea", "Elena Gabriela Udrea", {
    aliases: ["Elena Udrea"],
    matchTypes: ["aka_exact"],
  });
  assertEquals(r.name_similarity, 100);
  assertEquals(r.match_basis, "exact_alias");
});

Deno.test("different surnames stay well below 90 and are fuzzy", () => {
  const r = run("Elena Udrea", "Elena Popescu");
  assert(r.name_similarity! < 90, `got ${r.name_similarity}`);
  assertEquals(r.match_basis, "fuzzy_name");
});

Deno.test("provider exact flag cannot promote a weak name to 100", () => {
  const r = run("Elena Udrea", "Marius Ionescu", { matchTypes: ["name_exact"] });
  assert(r.name_similarity! < 90, `got ${r.name_similarity}`);
  assert(r.match_basis !== "exact_name");
});

Deno.test("provider relevance never leaks into the displayed similarity", () => {
  const r = run("Elena Udrea", "Elena Udrea", { providerScore: 0.7 });
  assertEquals(r.provider_relevance, 70);
  assertEquals(r.name_similarity, 100);
});

Deno.test("no subject name falls back to provider relevance", () => {
  const r = computeNameMatch({ subjectName: null, matchedName: "Elena Udrea", providerScore: 0.7 });
  assertEquals(r.name_similarity, 70);
  assertEquals(r.match_basis, "provider_only");
});

Deno.test("match types map to de-duplicated plain-English labels", () => {
  assertEquals(labelMatchTypes(["name_exact", "exact_match"]), ["Name matched exactly"]);
  assertEquals(labelMatchTypes(["aka_fuzzy"]), ["Alias matched approximately"]);
  assertEquals(labelMatchTypes(["some_new_signal"]), ["Some new signal"]);
  assertEquals(labelMatchTypes([]), []);
});

Deno.test("debug mode returns the inputs used for scoring", () => {
  const r = run("Elena Udrea", "Elena Gabriela Udrea", {
    aliases: ["Udrea Elena"],
    matchTypes: ["name_fuzzy"],
    debug: true,
  });
  const d = r.debug!;
  assertEquals(d.subject_name, "Elena Udrea");
  assertEquals(d.normalised_subject_name, "elena udrea");
  assertEquals(d.candidates.length, 2);
  assertEquals(d.candidates[0].kind, "primary_name");
  assertEquals(d.candidates[1].kind, "alias");
  assert(d.best_candidate);
  assert(d.applied_rule.length > 0);
  assertEquals(d.provider_relevance, 70);
});

Deno.test("debug output is omitted unless requested", () => {
  assertEquals(run("Elena Udrea", "Elena Udrea").debug, undefined);
});

Deno.test("raw similarity helper is symmetric and bounded", () => {
  assertEquals(nameSimilarity("Elena Udrea", "Elena Udrea"), 1);
  assert(nameSimilarity("Elena Udrea", "") === 0);
});
