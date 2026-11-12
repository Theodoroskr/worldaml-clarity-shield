import { assertEquals } from "jsr:@std/assert@1";
import { monitorDifferencesToChange } from "./complyadvantage.ts";

Deno.test("no differences → no change", () => {
  assertEquals(monitorDifferencesToChange("123", "2026-11-11", []), null);
  assertEquals(monitorDifferencesToChange("123", "2026-11-11", undefined), null);
});

Deno.test("a newly added sanctions listing is reported as a new sanction", () => {
  const c = monitorDifferencesToChange("123", "2026-11-11", [
    { action: "added", name: "A", entity_id: "E1", listing_types: ["sanction"], changes: {} },
    { action: "updated", name: "B", entity_id: "E2", listing_types: ["adverse-media"], changes: {} },
  ])!;
  assertEquals(c.provider_monitor_id, "123");
  assertEquals(c.change_type, "new_sanction");
  assertEquals(c.details.summary, "1 new, 1 updated, 0 removed");
  assertEquals(c.detected_at, "2026-11-11T00:00:00.000Z");
});

Deno.test("an existing match gaining a sanctions listing is a new sanction", () => {
  const c = monitorDifferencesToChange("9", "2026-11-11", [
    { action: "updated", listing_types: ["pep"], changes: { listing_types: { added: ["sanction"], removed: [] } } },
  ])!;
  assertEquals(c.change_type, "new_sanction");
});

Deno.test("only removals → match removed", () => {
  const c = monitorDifferencesToChange("9", "2026-11-11", [{ action: "removed", listing_types: ["pep"] }])!;
  assertEquals(c.change_type, "match_removed");
});
