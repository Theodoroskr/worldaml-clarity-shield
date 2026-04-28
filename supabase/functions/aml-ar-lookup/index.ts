// Mastercard AML Account Risk — DEMO MODE
// Returns deterministic fake "sandbox-like" results based on PAN.
// Swap to real mTLS sandbox call when MASTERCARD_* secrets + cert proxy are wired.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LookupBody {
  pan: string;          // raw PAN — never persisted
  customer_id?: string; // optional link to suite_customers
}

// Deterministic SHA-256 hex
async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Generate a deterministic but realistic-looking AR response from the PAN.
function buildDemoResponse(panHash: string) {
  // Use first 8 hex chars as a stable pseudo-random seed.
  const seed = parseInt(panHash.slice(0, 8), 16);
  const score = seed % 101; // 0–100

  let level: "low" | "medium" | "high" | "critical";
  const indicators: { code: string; label: string; severity: string }[] = [];

  if (score >= 80) {
    level = "critical";
    indicators.push(
      { code: "AR_SANCTIONS_HIT", label: "Account linked to sanctions exposure", severity: "critical" },
      { code: "AR_DARKNET", label: "Activity associated with darknet marketplace", severity: "high" },
      { code: "AR_HIGH_RISK_GEO", label: "Repeated transactions to high-risk jurisdictions", severity: "high" },
    );
  } else if (score >= 60) {
    level = "high";
    indicators.push(
      { code: "AR_PEP_LINK", label: "Possible PEP-related counterparty", severity: "high" },
      { code: "AR_VELOCITY", label: "Abnormal transaction velocity (last 30d)", severity: "medium" },
    );
  } else if (score >= 35) {
    level = "medium";
    indicators.push(
      { code: "AR_GAMBLING", label: "Frequent online gambling spend", severity: "medium" },
      { code: "AR_CRYPTO_EXCHANGE", label: "Funds routed through crypto exchanges", severity: "low" },
    );
  } else {
    level = "low";
  }

  return {
    arRequestId: `MTF-DEMO-${panHash.slice(0, 12).toUpperCase()}`,
    riskScore: score,
    riskLevel: level,
    riskIndicators: indicators,
    evaluatedAt: new Date().toISOString(),
    environment: "demo",
    notice:
      "DEMO MODE — synthetic data generated locally. Not a Mastercard API call.",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // User-context client (for org lookup + RLS-safe inserts)
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !userRes.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userRes.user.id;

    // Resolve org
    const { data: orgRow } = await supabaseUser
      .from("suite_org_members")
      .select("organization_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!orgRow?.organization_id) {
      return new Response(
        JSON.stringify({ error: "No organisation membership" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    const organisationId = orgRow.organization_id;

    const body: LookupBody = await req.json();
    const rawPan = (body.pan ?? "").replace(/[^0-9]/g, "");

    if (rawPan.length < 12 || rawPan.length > 19) {
      return new Response(
        JSON.stringify({ error: "PAN must be 12–19 digits" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const panHash = await sha256Hex(`${organisationId}:${rawPan}`);
    const panBin = rawPan.slice(0, 6);
    const panLast4 = rawPan.slice(-4);

    const startedAt = Date.now();
    // Simulate sandbox latency
    await new Promise((r) => setTimeout(r, 250 + Math.random() * 350));
    const ar = buildDemoResponse(panHash);
    const latencyMs = Date.now() - startedAt;

    // Service-role client for trusted insert
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const { data: lookup, error: insErr } = await supabaseAdmin
      .from("suite_aml_ar_lookups")
      .insert({
        organisation_id: organisationId,
        user_id: userId,
        customer_id: body.customer_id ?? null,
        pan_hash: panHash,
        pan_bin: panBin,
        pan_last4: panLast4,
        ar_risk_score: ar.riskScore,
        ar_risk_level: ar.riskLevel,
        ar_risk_indicators: ar.riskIndicators,
        ar_raw_response: ar,
        ar_request_id: ar.arRequestId,
        status: "success",
        latency_ms: latencyMs,
        environment: "demo",
      })
      .select()
      .single();

    if (insErr) {
      console.error("Insert lookup failed:", insErr);
      return new Response(JSON.stringify({ error: insErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update customer + auto-create alert if high/critical
    if (body.customer_id) {
      await supabaseAdmin
        .from("suite_customers")
        .update({
          aml_ar_last_score: ar.riskScore,
          aml_ar_last_risk_level: ar.riskLevel,
          aml_ar_last_checked_at: new Date().toISOString(),
          aml_ar_payment_account_ref: panHash,
          aml_ar_pan_bin: panBin,
          aml_ar_pan_last4: panLast4,
        })
        .eq("id", body.customer_id);

      if (ar.riskLevel === "high" || ar.riskLevel === "critical") {
        await supabaseAdmin.from("suite_alerts").insert({
          organisation_id: organisationId,
          user_id: userId,
          customer_id: body.customer_id,
          alert_type: "aml_ar",
          severity: ar.riskLevel === "critical" ? "critical" : "high",
          title: `Mastercard AR ${ar.riskLevel.toUpperCase()} — •••• ${panLast4}`,
          description: `DEMO. Score ${ar.riskScore}/100. Indicators: ${
            ar.riskIndicators.map((i) => i.label).join("; ")
          }`,
          status: "open",
        });
      }
    }

    return new Response(JSON.stringify({ ok: true, lookup, ar }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("aml-ar-lookup error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
