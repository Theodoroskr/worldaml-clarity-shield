// AI-assisted Source of Funds reconciliation
// Compares declared income vs. actual transaction inflows
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_THRESHOLDS = {
  inflow_high_multiplier: 1.5,
  inflow_low_multiplier: 0.3,
  foreign_countries_min: 3,
  high_severity_variance_pct: 100,
  min_confidence_for_auto_clear: 80,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { declaration_id } = await req.json();
    if (!declaration_id || typeof declaration_id !== "string") {
      return new Response(JSON.stringify({ error: "declaration_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load declaration
    const { data: decl, error: dErr } = await supabase
      .from("suite_sof_declarations")
      .select("*")
      .eq("id", declaration_id)
      .single();
    if (dErr || !decl) {
      return new Response(JSON.stringify({ error: "Declaration not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ownership check: verify caller belongs to the declaration's organisation
    if (decl.organisation_id) {
      const { data: membership } = await supabase
        .from("suite_org_members")
        .select("id")
        .eq("user_id", userData.user.id)
        .eq("organization_id", decl.organisation_id)
        .maybeSingle();
      if (!membership) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Load org thresholds (fallback to defaults)
    let thresholds = { ...DEFAULT_THRESHOLDS };
    if (decl.organisation_id) {
      const { data: thr } = await supabase
        .from("suite_sof_thresholds")
        .select("*")
        .eq("organisation_id", decl.organisation_id)
        .maybeSingle();
      if (thr) {
        thresholds = {
          inflow_high_multiplier: Number(thr.inflow_high_multiplier),
          inflow_low_multiplier: Number(thr.inflow_low_multiplier),
          foreign_countries_min: Number(thr.foreign_countries_min),
          high_severity_variance_pct: Number(thr.high_severity_variance_pct),
          min_confidence_for_auto_clear: Number(thr.min_confidence_for_auto_clear),
        };
      }
    }

    // Load last 12 months of credit (incoming) transactions
    const since = new Date();
    since.setMonth(since.getMonth() - 12);
    const { data: txns } = await supabase
      .from("suite_transactions")
      .select("id, amount, currency, direction, counterparty, counterparty_country, description, risk_flag, created_at")
      .eq("customer_id", decl.customer_id)
      .eq("direction", "credit")
      .gte("created_at", since.toISOString());

    const allTxns = (txns || []) as any[];
    const actualInflow = allTxns.reduce((s, t) => s + Number(t.amount || 0), 0);
    const declaredIncome = Number(decl.declared_annual_income || 0);
    const variance = declaredIncome > 0 ? ((actualInflow - declaredIncome) / declaredIncome) * 100 : 0;

    // Load supporting documents (for confidence scoring)
    const { data: docs } = await supabase
      .from("suite_sof_documents")
      .select("id, verification_status")
      .eq("declaration_id", declaration_id);
    const docList = (docs || []) as any[];
    const verifiedDocCount = docList.filter((d) => d.verification_status === "verified").length;

    const sourceCountry = (decl.source_country || "").toUpperCase();
    const foreignTxns = allTxns.filter(
      (t) => t.counterparty_country && String(t.counterparty_country).toUpperCase() !== sourceCountry,
    );
    const countries = new Set(allTxns.map((t) => t.counterparty_country).filter(Boolean));
    const foreignCount = [...countries].filter((c) => String(c).toUpperCase() !== sourceCountry).length;

    const slim = (t: any) => ({
      id: t.id,
      amount: Number(t.amount || 0),
      currency: t.currency,
      counterparty: t.counterparty,
      counterparty_country: t.counterparty_country,
      description: t.description,
      risk_flag: t.risk_flag,
      created_at: t.created_at,
    });
    const topTxns = [...allTxns]
      .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
      .slice(0, 10)
      .map(slim);

    type Flag = {
      code: string;
      severity: "high" | "medium" | "low";
      message: string;
      calculation: Record<string, any>;
      contributing_transactions: any[];
    };
    const flagsDetailed: Flag[] = [];

    if (declaredIncome > 0 && actualInflow > declaredIncome * thresholds.inflow_high_multiplier) {
      const sev: Flag["severity"] = Math.abs(variance) >= thresholds.high_severity_variance_pct ? "high" : "medium";
      flagsDetailed.push({
        code: "inflow_exceeds_declared",
        severity: sev,
        message: `Inflows exceed declared income by ${variance.toFixed(0)}% (declared ${declaredIncome.toLocaleString()} ${decl.currency}, actual ${actualInflow.toLocaleString()} ${decl.currency})`,
        calculation: {
          formula: "((actual_inflow_12m − declared_annual_income) / declared_annual_income) × 100",
          declared_annual_income: declaredIncome,
          actual_inflow_12m: Number(actualInflow.toFixed(2)),
          variance_pct: Number(variance.toFixed(1)),
          threshold: `actual > declared × ${thresholds.inflow_high_multiplier}`,
          high_severity_variance_pct: thresholds.high_severity_variance_pct,
          excess_amount: Number((actualInflow - declaredIncome).toFixed(2)),
        },
        contributing_transactions: topTxns,
      });
    }
    if (declaredIncome > 0 && actualInflow < declaredIncome * thresholds.inflow_low_multiplier && allTxns.length > 0) {
      flagsDetailed.push({
        code: "inflow_below_declared",
        severity: "medium",
        message: `Inflows are unusually low vs. declared income (${variance.toFixed(0)}% variance)`,
        calculation: {
          formula: "((actual_inflow_12m − declared_annual_income) / declared_annual_income) × 100",
          declared_annual_income: declaredIncome,
          actual_inflow_12m: Number(actualInflow.toFixed(2)),
          variance_pct: Number(variance.toFixed(1)),
          threshold: `actual < declared × ${thresholds.inflow_low_multiplier}`,
          shortfall_amount: Number((declaredIncome - actualInflow).toFixed(2)),
        },
        contributing_transactions: topTxns,
      });
    }
    if (sourceCountry && foreignCount >= thresholds.foreign_countries_min) {
      const byCountry: Record<string, { count: number; total: number }> = {};
      for (const t of foreignTxns) {
        const k = String(t.counterparty_country).toUpperCase();
        byCountry[k] = byCountry[k] || { count: 0, total: 0 };
        byCountry[k].count += 1;
        byCountry[k].total += Number(t.amount || 0);
      }
      flagsDetailed.push({
        code: "foreign_counterparties",
        severity: "medium",
        message: `${foreignCount} foreign counterparty countries detected vs. declared source country ${sourceCountry}`,
        calculation: {
          source_country: sourceCountry,
          distinct_foreign_countries: foreignCount,
          threshold: `distinct_foreign_countries ≥ ${thresholds.foreign_countries_min}`,
          breakdown_by_country: byCountry,
          total_foreign_inflow: Number(foreignTxns.reduce((s, t) => s + Number(t.amount || 0), 0).toFixed(2)),
        },
        contributing_transactions: foreignTxns
          .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
          .slice(0, 10)
          .map(slim),
      });
    }
    if (!declaredIncome && allTxns.length > 0) {
      flagsDetailed.push({
        code: "missing_income_declaration",
        severity: "high",
        message: `Customer has ${allTxns.length} inbound transactions but no declared income`,
        calculation: {
          declared_annual_income: 0,
          transaction_count: allTxns.length,
          actual_inflow_12m: Number(actualInflow.toFixed(2)),
          threshold: "declared_income == 0 AND transactions > 0",
        },
        contributing_transactions: topTxns,
      });
    }

    const flags = flagsDetailed.map((f) => f.message);

    // ===== Confidence score (deterministic, pre-LLM) =====
    type Penalty = { code: string; label: string; points: number };
    const penalties: Penalty[] = [];
    for (const f of flagsDetailed) {
      const pts = f.severity === "high" ? 30 : f.severity === "medium" ? 15 : 5;
      penalties.push({ code: f.code, label: `${f.severity} severity flag: ${f.code.replace(/_/g, " ")}`, points: pts });
    }
    if (docList.length === 0) {
      penalties.push({ code: "no_supporting_docs", label: "No supporting documents uploaded", points: 20 });
    } else if (verifiedDocCount === 0) {
      penalties.push({ code: "no_verified_docs", label: "Documents uploaded but none verified yet", points: 10 });
    }
    if (allTxns.length < 5) {
      penalties.push({ code: "low_sample_size", label: `Low transaction sample size (${allTxns.length})`, points: 10 });
    }
    const totalPenalty = penalties.reduce((s, p) => s + p.points, 0);
    const confidenceScore = Math.max(0, Math.min(100, 100 - totalPenalty));

    // Optional AI narrative summary + confidence explanation via Lovable AI
    let aiSummary = "";
    let confidenceExplanation = "";
    const aiKey = Deno.env.get("LOVABLE_API_KEY");
    if (aiKey) {
      try {
        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${aiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            response_format: { type: "json_object" },
            messages: [{
              role: "user",
              content: `You are an AML compliance analyst. Reply in strict JSON: {"summary": string, "confidence_explanation": string}.
- "summary": 2 sentences assessing this Source of Funds reconciliation.
- "confidence_explanation": 1 short paragraph (2-3 sentences, plain language) justifying the confidence score of ${confidenceScore}/100, referring to the listed deductions.

Declared annual income: ${declaredIncome} ${decl.currency}
Actual 12-month inflows: ${actualInflow.toFixed(2)} ${decl.currency}
Variance: ${variance.toFixed(1)}%
Source country: ${sourceCountry || "not declared"}
Foreign counterparty countries: ${foreignCount}
Transactions: ${allTxns.length}
Supporting documents: ${docList.length} uploaded, ${verifiedDocCount} verified
Confidence score: ${confidenceScore}/100
Confidence deductions: ${penalties.map((p) => `−${p.points} ${p.label}`).join("; ") || "none"}
Flags: ${flags.join("; ") || "none"}
Income sources declared: ${JSON.stringify(decl.income_sources)}`,
            }],
          }),
        });
        if (aiRes.ok) {
          const j = await aiRes.json();
          const raw = j.choices?.[0]?.message?.content || "";
          try {
            const parsed = JSON.parse(raw);
            aiSummary = String(parsed.summary || "");
            confidenceExplanation = String(parsed.confidence_explanation || "");
          } catch {
            aiSummary = raw;
          }
        }
      } catch (_) { /* non-fatal */ }
    }

    // Rule-based fallback explanation
    if (!confidenceExplanation) {
      if (penalties.length === 0) {
        confidenceExplanation = `Confidence is ${confidenceScore}/100: declared figures reconcile with observed transactions and no risk indicators were triggered.`;
      } else {
        const top = penalties.slice(0, 3).map((p) => `−${p.points} for ${p.label.toLowerCase()}`).join(", ");
        confidenceExplanation = `Confidence is ${confidenceScore}/100. Score reduced by: ${top}.`;
      }
    }

    const reconciliation = {
      declared_annual_income: declaredIncome,
      actual_inflow_12m: Number(actualInflow.toFixed(2)),
      variance_pct: Number(variance.toFixed(1)),
      transaction_count: allTxns.length,
      foreign_counterparty_countries: foreignCount,
      flags,
      flags_detailed: flagsDetailed,
      top_transactions: topTxns,
      ai_summary: aiSummary,
      confidence_score: confidenceScore,
      confidence_explanation: confidenceExplanation,
      confidence_penalties: penalties,
      thresholds_used: thresholds,
      supporting_documents: { total: docList.length, verified: verifiedDocCount },
      model: "google/gemini-2.5-flash",
      analysed_at: new Date().toISOString(),
    };


    await supabase
      .from("suite_sof_declarations")
      .update({
        ai_reconciliation: reconciliation,
        ai_risk_flag: flags.length > 0,
      })
      .eq("id", declaration_id);

    // Append AI run to the audit trail (uses service role to bypass RLS; insert-only)
    await supabase.from("suite_sof_audit_events").insert({
      declaration_id,
      organisation_id: decl.organisation_id ?? null,
      actor_user_id: userData.user.id,
      event_type: "ai_reconciliation",
      summary: `AI reconciliation: ${flags.length} flag(s), confidence ${confidenceScore}/100${flags.length > 0 ? ", risk_flag=true" : ""}`,
      details: {
        flags,
        variance_pct: reconciliation.variance_pct,
        declared_annual_income: reconciliation.declared_annual_income,
        actual_inflow_12m: reconciliation.actual_inflow_12m,
        transaction_count: reconciliation.transaction_count,
        foreign_counterparty_countries: reconciliation.foreign_counterparty_countries,
        ai_summary: reconciliation.ai_summary,
        confidence_score: confidenceScore,
        confidence_explanation: confidenceExplanation,
        confidence_penalties: penalties,
        thresholds_used: thresholds,
        risk_flag: flags.length > 0,
      },
    });

    return new Response(JSON.stringify({ success: true, reconciliation }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sof-reconcile error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
