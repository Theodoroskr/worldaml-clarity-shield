// Reads the MRZ lines from a document photo. Transcription only — validity is
// decided by the deterministic ICAO 9303 validator in the app, never here.
// Images and MRZ text are never logged or stored.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

const MAX_BYTES = 8 * 1024 * 1024;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "unauthorized" }, 401);
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);

    const { image, customer_id } = await req.json();
    if (typeof image !== "string" || !/^data:image\/(png|jpe?g|webp);base64,/.test(image))
      return json({ error: "unsupported_image" }, 400);
    if (image.length * 0.75 > MAX_BYTES) return json({ error: "image_too_large" }, 413);

    // Tenant check: the customer must belong to one of the caller's companies (RLS enforces this).
    if (customer_id) {
      const { data: c } = await sb.from("suite_customers").select("id").eq("id", customer_id).maybeSingle();
      if (!c) return json({ error: "not_permitted" }, 403);
    }

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "ocr_not_configured" }, 503);

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "You are an OCR engine. Transcribe ONLY the machine readable zone (MRZ) of the identity document exactly as printed, character by character, using A-Z, 0-9 and '<'. Never correct, complete, or guess characters and never compute check digits. If a character is unreadable write '?'. If no MRZ is visible, return found=false.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Transcribe the MRZ lines." },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "mrz_transcription",
            parameters: {
              type: "object",
              properties: {
                found: { type: "boolean" },
                lines: { type: "array", items: { type: "string" } },
                uncertain: { type: "boolean", description: "true if any character was hard to read" },
                note: { type: "string", description: "short reason if not found or uncertain (no document data)" },
              },
              required: ["found", "lines", "uncertain"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "mrz_transcription" } },
      }),
    });
    if (res.status === 429) return json({ error: "rate_limited" }, 429);
    if (res.status === 402) return json({ error: "credits_exhausted" }, 402);
    if (!res.ok) {
      console.error("mrz-ocr gateway status", res.status);
      return json({ error: "ocr_failed" }, 502);
    }
    const data = await res.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const out = args ? JSON.parse(args) : null;
    if (!out?.found || !Array.isArray(out.lines) || out.lines.length === 0)
      return json({ found: false, lines: [], uncertain: true, note: out?.note || "No MRZ found in the image." });
    return json({
      found: true,
      lines: out.lines.map((l: unknown) => String(l).replace(/\s+/g, "").toUpperCase()).slice(0, 3),
      uncertain: !!out.uncertain || out.lines.some((l: string) => String(l).includes("?")),
      note: typeof out.note === "string" ? out.note.slice(0, 200) : undefined,
    });
  } catch (_e) {
    console.error("mrz-ocr error");
    return json({ error: "ocr_failed" }, 500);
  }
});
