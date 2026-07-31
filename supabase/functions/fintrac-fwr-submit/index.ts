// FINTRAC Web Reporting (FWR) submission endpoint.
//
// Receives a validated FWR JSON package from the suite and forwards it to the
// FINTRAC FWR API when credentials are configured. Without credentials it
// responds `configured: false` so the caller keeps the submission queued for
// manual filing through the FWR portal.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // Caller must be an authenticated suite user
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

  let body: { submissionId?: string; reportKind?: string; payload?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { submissionId, payload } = body;
  if (!submissionId || typeof submissionId !== "string") {
    return json({ error: "submissionId is required" }, 400);
  }
  if (!payload || typeof payload !== "object") {
    return json({ error: "payload is required" }, 400);
  }
  if ((payload as { schemaVersion?: string }).schemaVersion !== "1.0") {
    return json({ error: "payload must be an FWR v1.0 package" }, 400);
  }

  const apiKey = Deno.env.get("FINTRAC_FWR_API_KEY");
  const apiUrl = Deno.env.get("FINTRAC_FWR_API_URL");

  if (!apiKey || !apiUrl) {
    return json({
      configured: false,
      accepted: false,
      message:
        "FINTRAC FWR API credentials are not configured. Download the validated FWR package and file it through the FINTRAC Web Reporting portal, then record the receipt reference.",
    });
  }

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let parsed: Record<string, unknown> = {};
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      parsed = { raw: text.slice(0, 2000) };
    }

    if (!res.ok) {
      return json({
        configured: true,
        accepted: false,
        message: `FINTRAC rejected the submission (HTTP ${res.status})`,
        details: parsed,
      });
    }

    return json({
      configured: true,
      accepted: true,
      reference:
        (parsed.receiptReference as string) ??
        (parsed.reference as string) ??
        (parsed.id as string) ??
        undefined,
      details: parsed,
    });
  } catch (e) {
    return json({
      configured: true,
      accepted: false,
      message: `FINTRAC FWR API call failed: ${(e as Error).message}`,
    });
  }
});
