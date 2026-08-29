import { ComplyAdvantageAdapter } from "./complyadvantage.ts";
import { ProviderError, ScreeningProviderAdapter } from "./types.ts";

export * from "./types.ts";
export * from "./nameMatch.ts";
export { describeChange } from "./complyadvantage.ts";

/**
 * Resolve the configured data provider. The provider is an internal
 * implementation detail — nothing here is exposed to the customer UI.
 */
export function getProvider(): ScreeningProviderAdapter {
  const name = (Deno.env.get("SCREENING_PROVIDER") || "complyadvantage").toLowerCase();
  switch (name) {
    case "complyadvantage":
    default:
      return new ComplyAdvantageAdapter();
  }
}

export function providerErrorResponse(err: unknown, cors: Record<string, string>) {
  if (err instanceof ProviderError) {
    // Technical detail stays server-side (logs only); the client sees userMessage.
    console.error("[screening] provider error", err.userMessage, "|", err.detail);
    return new Response(JSON.stringify({ error: err.userMessage }), {
      status: err.httpStatus,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  console.error("[screening] unexpected error", err instanceof Error ? err.stack : String(err));
  return new Response(JSON.stringify({ error: "Screening could not be completed" }), {
    status: 500,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

