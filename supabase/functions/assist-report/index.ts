import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) throw new Error("Unauthorized");

    const { regulator, reportType, reportTitle, periodYear, currentContent } = await req.json();
    if (!regulator || !reportType) throw new Error("Missing regulator or reportType");

    // Fetch stats from DB
    const [customers, screenings, alerts, transactions, cases, strs, profile] = await Promise.all([
      supabase.from("suite_customers").select("id, risk_level, type, country", { count: "exact" }).eq("user_id", user.id),
      supabase.from("suite_screenings").select("id, match_count, screening_type", { count: "exact" }).eq("user_id", user.id),
      supabase.from("suite_alerts").select("id, status, severity, alert_type", { count: "exact" }).eq("user_id", user.id),
      supabase.from("suite_transactions").select("id, risk_flag, amount, currency, direction", { count: "exact" }).eq("user_id", user.id),
      supabase.from("suite_cases").select("id, status, priority", { count: "exact" }).eq("user_id", user.id),
      supabase.from("str_reports").select("id, filing_status", { count: "exact" }).eq("user_id", user.id),
      supabase.from("profiles").select("company_name, full_name, regulator").eq("user_id", user.id).single(),
    ]);

    const totalCustomers = customers.count || 0;
    const highRiskCustomers = (customers.data || []).filter((c: any) => c.risk_level === "high").length;
    const individualCustomers = (customers.data || []).filter((c: any) => c.type === "individual").length;
    const corporateCustomers = (customers.data || []).filter((c: any) => c.type === "corporate").length;
    const totalScreenings = screenings.count || 0;
    const matchScreenings = (screenings.data || []).filter((s: any) => s.match_count > 0).length;
    const totalAlerts = alerts.count || 0;
    const resolvedAlerts = (alerts.data || []).filter((a: any) => a.status === "resolved").length;
    const highSeverityAlerts = (alerts.data || []).filter((a: any) => a.severity === "high" || a.severity === "critical").length;
    const totalTransactions = transactions.count || 0;
    const flaggedTransactions = (transactions.data || []).filter((t: any) => t.risk_flag).length;
    const totalCases = cases.count || 0;
    const totalSTRs = strs.count || 0;
    const filedSTRs = (strs.data || []).filter((s: any) => s.filing_status === "filed").length;

    const countries = [...new Set((customers.data || []).map((c: any) => c.country).filter(Boolean))];
    const companyName = profile.data?.company_name || "the firm";
    const preparedBy = profile.data?.full_name || "the Compliance Officer";

    const statsContext = `
COMPANY CONTEXT:
- Company: ${companyName}
- Compliance Officer: ${preparedBy}
- Regulator: ${regulator.toUpperCase()}
- Report: ${reportTitle} (${reportType}) for period ${periodYear}

DATABASE STATISTICS (auto-populated from the compliance platform):
- Total customers: ${totalCustomers} (${individualCustomers} individuals, ${corporateCustomers} corporates)
- High-risk customers: ${highRiskCustomers} (${totalCustomers > 0 ? ((highRiskCustomers / totalCustomers) * 100).toFixed(1) : 0}%)
- Jurisdictions served: ${countries.length > 0 ? countries.join(", ") : "N/A"}
- Total screenings conducted: ${totalScreenings}
- Screenings with matches: ${matchScreenings} (${totalScreenings > 0 ? ((matchScreenings / totalScreenings) * 100).toFixed(1) : 0}% match rate)
- Total alerts generated: ${totalAlerts}
- Alerts resolved: ${resolvedAlerts} (${totalAlerts > 0 ? ((resolvedAlerts / totalAlerts) * 100).toFixed(1) : 0}% resolution rate)
- High/Critical severity alerts: ${highSeverityAlerts}
- Total transactions monitored: ${totalTransactions}
- Flagged transactions: ${flaggedTransactions} (${totalTransactions > 0 ? ((flaggedTransactions / totalTransactions) * 100).toFixed(1) : 0}% flag rate)
- Cases opened: ${totalCases}
- STR/SAR reports: ${totalSTRs} total, ${filedSTRs} filed

CURRENT CONTENT (fields already filled by the user — do NOT overwrite non-empty fields):
${JSON.stringify(currentContent || {}, null, 2)}
`;

    const systemPrompt = `You are a senior AML/CFT compliance consultant helping prepare a ${reportTitle} for submission to ${regulator.toUpperCase()}.

Your task is to draft the qualitative sections of this periodic report based on the database statistics provided. Write in a professional, regulatory-appropriate tone suitable for submission to the supervisory authority.

RULES:
1. Use the actual statistics from the database to support your narrative.
2. If a field already has user content (non-empty string), keep the existing text — do NOT overwrite it.
3. For empty fields, write substantive, regulator-appropriate content.
4. Reference the specific regulator's requirements and legal framework.
5. Be specific — use the actual numbers. Don't use placeholders.
6. Keep each field concise but thorough (2-4 sentences for short fields, 1-2 paragraphs for long fields).
7. For risk assessment: identify real patterns from the data (e.g., high-risk ratio, match rates).
8. For recommendations: base them on actual gaps visible in the data.

${statsContext}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate the content for all qualitative fields of this ${reportTitle}. Return ONLY a valid JSON object with these exact keys matching the content fields. Each value should be a string with the drafted text. Do not include any markdown formatting, code fences, or explanation — just the raw JSON object.

Fields to fill:
- complianceOfficer: Name and role
- officerQualifications: Professional qualifications and experience
- policiesLastUpdated: When AML policies were last reviewed/updated
- trainingConducted: Description of AML/CFT training programme
- trainingDates: Training dates during the period
- independentAudit: Whether independent audit was conducted and by whom
- auditFindings: Summary of audit findings
- riskAssessmentSummary: Comprehensive risk assessment narrative
- keyRisksIdentified: Specific risks identified from the data
- mitigatingControls: Controls in place to address identified risks
- actionsTaken: Remediation actions taken during the period
- recommendations: Forward-looking recommendations`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "fill_report_fields",
              description: "Fill in the qualitative fields of the periodic compliance report",
              parameters: {
                type: "object",
                properties: {
                  complianceOfficer: { type: "string" },
                  officerQualifications: { type: "string" },
                  policiesLastUpdated: { type: "string" },
                  trainingConducted: { type: "string" },
                  trainingDates: { type: "string" },
                  independentAudit: { type: "string" },
                  auditFindings: { type: "string" },
                  riskAssessmentSummary: { type: "string" },
                  keyRisksIdentified: { type: "string" },
                  mitigatingControls: { type: "string" },
                  actionsTaken: { type: "string" },
                  recommendations: { type: "string" },
                },
                required: [
                  "complianceOfficer", "officerQualifications", "policiesLastUpdated",
                  "trainingConducted", "trainingDates", "independentAudit",
                  "auditFindings", "riskAssessmentSummary", "keyRisksIdentified",
                  "mitigatingControls", "actionsTaken", "recommendations",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "fill_report_fields" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error("AI gateway error");
    }

    const aiResult = await aiResponse.json();

    let generated: Record<string, string> = {};
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      generated = typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    }

    // Merge: keep user content if non-empty
    const merged: Record<string, string> = {};
    for (const [key, val] of Object.entries(generated)) {
      const existing = currentContent?.[key];
      if (existing && String(existing).trim().length > 0) {
        merged[key] = existing;
      } else {
        merged[key] = val;
      }
    }

    return new Response(JSON.stringify({ content: merged }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("assist-report error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
