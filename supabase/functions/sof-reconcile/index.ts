// AI-assisted Source of Funds reconciliation
// Compares declared income vs. actual transaction inflows
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    if (declaredIncome > 0 && actualInflow > declaredIncome * 1.5) {
      flagsDetailed.push({
        code: "inflow_exceeds_declared",
        severity: "high",
        message: `Inflows exceed declared income by ${variance.toFixed(0)}% (declared ${declaredIncome.toLocaleString()} ${decl.currency}, actual ${actualInflow.toLocaleString()} ${decl.currency})`,
        calculation: {
          formula: "((actual_inflow_12m − declared_annual_income) / declared_annual_income) × 100",
          declared_annual_income: declaredIncome,
          actual_inflow_12m: Number(actualInflow.toFixed(2)),
          variance_pct: Number(variance.toFixed(1)),
          threshold: "actual > declared × 1.5",
          excess_amount: Number((actualInflow - declaredIncome).toFixed(2)),
        },
        contributing_transactions: topTxns,
      });
    }
    if (declaredIncome > 0 && actualInflow < declaredIncome * 0.3 && allTxns.length > 0) {
      flagsDetailed.push({
        code: "inflow_below_declared",
        severity: "medium",
        message: `Inflows are unusually low vs. declared income (${variance.toFixed(0)}% variance)`,
        calculation: {
          formula: "((actual_inflow_12m − declared_annual_income) / declared_annual_income) × 100",
          declared_annual_income: declaredIncome,
          actual_inflow_12m: Number(actualInflow.toFixed(2)),
          variance_pct: Number(variance.toFixed(1)),
          threshold: "actual < declared × 0.3",
          shortfall_amount: Number((declaredIncome - actualInflow).toFixed(2)),
        },
        contributing_transactions: topTxns,
      });
    }
    if (sourceCountry && foreignCount >= 3) {
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
          threshold: "distinct_foreign_countries ≥ 3",
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

    // Optional AI narrative summary via Lovable AI
    let aiSummary = "";
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
            messages: [{
              role: "user",
              content: `As an AML compliance analyst, write a 2-sentence assessment of this Source of Funds reconciliation.
Declared annual income: ${declaredIncome} ${decl.currency}
Actual 12-month inflows: ${actualInflow.toFixed(2)} ${decl.currency}
Variance: ${variance.toFixed(1)}%
Source country: ${sourceCountry || "not declared"}
Foreign counterparty countries: ${foreignCount}
Flags: ${flags.join("; ") || "none"}
Income sources declared: ${JSON.stringify(decl.income_sources)}`,
            }],
          }),
        });
        if (aiRes.ok) {
          const j = await aiRes.json();
          aiSummary = j.choices?.[0]?.message?.content || "";
        }
      } catch (_) { /* non-fatal */ }
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
      summary: `AI reconciliation: ${flags.length} flag(s)${flags.length > 0 ? ", risk_flag=true" : ""}`,
      details: {
        flags,
        variance_pct: reconciliation.variance_pct,
        declared_annual_income: reconciliation.declared_annual_income,
        actual_inflow_12m: reconciliation.actual_inflow_12m,
        transaction_count: reconciliation.transaction_count,
        foreign_counterparty_countries: reconciliation.foreign_counterparty_countries,
        ai_summary: reconciliation.ai_summary,
        risk_flag: flags.length > 0,
      },
    });

    return new Response(JSON.stringify({ success: true, reconciliation }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
