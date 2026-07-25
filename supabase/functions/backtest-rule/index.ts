import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Transaction {
  id: string; user_id: string; customer_id: string; amount: number;
  currency: string; counterparty: string | null; counterparty_country: string | null;
  direction: string; created_at: string;
}
interface Customer { id: string; risk_level: string; kyc_status: string; country: string | null; full_name?: string; }
interface RuleCondition { field: string; operator: string; value: string; }

const FATF_GREY_BLACK = ["KP","IR","SY","MM","YE","AF","AL","BF","CM","CD","HT","KE","ML","MZ","NG","PH","SS","TZ","VN","PA","JM","TT","UG","ZW","RU"];

function resolveField(field: string, tx: Transaction, customer: Customer | null): string | number | null {
  const f = field.toLowerCase().trim();
  if (f.includes("transaction amount") || f === "transaction.amount" || f === "amount") return tx.amount;
  if (f.includes("transaction direction") || f === "transaction.direction" || f === "direction") {
    return tx.direction === "inbound" ? "Inbound" : tx.direction === "outbound" ? "Outbound" : tx.direction;
  }
  if (f.includes("counterparty country") || f === "transaction.country") return tx.counterparty_country;
  if (f.includes("counterparty") && !f.includes("country")) return tx.counterparty;
  if (f.includes("currency")) return tx.currency;
  if ((f.includes("customer") && f.includes("risk")) || f === "customer.riskscore") {
    const riskMap: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
    return customer ? riskMap[customer.risk_level] ?? 0 : 0;
  }
  if (f.includes("customer") && (f.includes("nationality") || f.includes("country"))) return customer?.country ?? null;
  return null;
}

function parseNumericValue(val: string): number {
  const cleaned = String(val).replace(/[^0-9.,\-]/g, "").replace(/,/g, "");
  return parseFloat(cleaned) || 0;
}

function evaluateCondition(cond: RuleCondition, tx: Transaction, customer: Customer | null): boolean {
  const actual = resolveField(cond.field, tx, customer);
  const op = String(cond.operator || "").trim().toUpperCase();
  const expected = String(cond.value ?? "");
  if (actual === null || actual === undefined) return false;

  if (op === "IS") {
    const ev = expected.toLowerCase().trim();
    if (ev.includes("fatf") && (ev.includes("grey") || ev.includes("black"))) {
      return FATF_GREY_BLACK.includes(String(actual).toUpperCase());
    }
    return String(actual).toLowerCase() === ev;
  }
  if ([">", ">=", "≥", "<", "<=", "≤"].includes(op)) {
    const a = typeof actual === "number" ? actual : parseFloat(String(actual));
    const e = parseNumericValue(expected);
    if (isNaN(a) || isNaN(e)) return false;
    if (op === ">") return a > e;
    if (op === ">=" || op === "≥") return a >= e;
    if (op === "<") return a < e;
    if (op === "<=" || op === "≤") return a <= e;
  }
  if (op === "BETWEEN") {
    const a = typeof actual === "number" ? actual : parseFloat(String(actual));
    const parts = expected.replace(/[^0-9.,\s]/g, "").trim().split(/\s+/);
    if (parts.length >= 2) {
      const low = parseFloat(parts[0].replace(/,/g, ""));
      const high = parseFloat(parts[parts.length - 1].replace(/,/g, ""));
      return a >= low && a <= high;
    }
    return false;
  }
  if (op === "==" || op === "=" || op === "EQ") return String(actual).toLowerCase() === expected.toLowerCase();
  if (op === "!=" || op === "NEQ") return String(actual).toLowerCase() !== expected.toLowerCase();
  if (op === "IN" || op === "CONTAINS") return String(actual).toLowerCase().includes(expected.toLowerCase());
  if (op === "NOT IN") return !String(actual).toLowerCase().includes(expected.toLowerCase());
  return false;
}

function evaluateRule(conditions: RuleCondition[], logic: string, tx: Transaction, customer: Customer | null): boolean {
  const valid = (conditions || []).filter(c => c && c.field && c.operator && c.value !== undefined && c.value !== "");
  if (valid.length === 0) return false;
  const gate = (logic || "AND").toUpperCase();
  return gate === "OR"
    ? valid.some(c => evaluateCondition(c, tx, customer))
    : valid.every(c => evaluateCondition(c, tx, customer));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: authErr } = await supabaseAuth.auth.getUser();
    if (authErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user_id = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const { conditions, logic = "AND", severity = "medium", name = "Draft rule", days = 90, rule_id = null } = body;
    if (!Array.isArray(conditions) || conditions.length === 0) {
      return new Response(JSON.stringify({ error: "conditions[] required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const since = new Date(Date.now() - days * 86400_000).toISOString();
    const { data: transactions, error: txErr } = await admin
      .from("suite_transactions").select("*")
      .eq("user_id", user_id)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(20000);
    if (txErr) throw txErr;
    const txs = (transactions ?? []) as Transaction[];

    let customersMap: Record<string, Customer> = {};
    if (txs.length) {
      const customerIds = [...new Set(txs.map(t => t.customer_id).filter(Boolean))];
      const { data: crs } = await admin
        .from("suite_customers").select("id, risk_level, kyc_status, country, full_name").in("id", customerIds);
      (crs ?? []).forEach((c: Customer) => { customersMap[c.id] = c; });
    }

    // For comparison, load rule's existing alerts count if rule_id provided
    let existingAlertsInWindow = 0;
    if (rule_id) {
      const { count } = await admin
        .from("suite_alerts").select("id", { count: "exact", head: true })
        .eq("user_id", user_id).eq("rule_id", rule_id).gte("created_at", since);
      existingAlertsInWindow = count ?? 0;
    }

    const matches: Array<{ tx_id: string; customer_id: string; customer_name?: string; amount: number; currency: string; direction: string; counterparty: string | null; counterparty_country: string | null; created_at: string; }> = [];
    const byDay: Record<string, number> = {};
    const byCustomer: Record<string, number> = {};
    const byCountry: Record<string, number> = {};

    for (const tx of txs) {
      const cust = customersMap[tx.customer_id] ?? null;
      if (evaluateRule(conditions, logic, tx, cust)) {
        const day = tx.created_at.slice(0, 10);
        byDay[day] = (byDay[day] || 0) + 1;
        byCustomer[tx.customer_id] = (byCustomer[tx.customer_id] || 0) + 1;
        if (tx.counterparty_country) byCountry[tx.counterparty_country] = (byCountry[tx.counterparty_country] || 0) + 1;
        if (matches.length < 100) {
          matches.push({
            tx_id: tx.id, customer_id: tx.customer_id,
            customer_name: cust?.full_name,
            amount: Number(tx.amount), currency: tx.currency,
            direction: tx.direction, counterparty: tx.counterparty,
            counterparty_country: tx.counterparty_country,
            created_at: tx.created_at,
          });
        }
      }
    }

    const totalMatches = Object.values(byDay).reduce((s, n) => s + n, 0);
    const uniqueCustomers = Object.keys(byCustomer).length;
    const evaluated = txs.length;
    const matchRate = evaluated > 0 ? +(totalMatches / evaluated * 100).toFixed(2) : 0;
    const dailyAvg = days > 0 ? +(totalMatches / days).toFixed(2) : 0;

    // FP estimate heuristic: high match rate against low-risk customers
    const lowRiskHits = Object.entries(byCustomer).filter(([cid]) => {
      const c = customersMap[cid];
      return c && (c.risk_level === "low" || c.risk_level === "medium");
    }).reduce((s, [, n]) => s + n, 0);
    const fpEstimate = totalMatches > 0 ? +(lowRiskHits / totalMatches * 100).toFixed(1) : 0;

    return new Response(JSON.stringify({
      rule: { name, severity, logic, conditions_count: conditions.length },
      window_days: days,
      evaluated,
      total_matches: totalMatches,
      match_rate_pct: matchRate,
      daily_average: dailyAvg,
      unique_customers: uniqueCustomers,
      fp_estimate_pct: fpEstimate,
      existing_alerts_in_window: existingAlertsInWindow,
      by_day: byDay,
      top_customers: Object.entries(byCustomer).sort((a,b)=>b[1]-a[1]).slice(0,10)
        .map(([id, n]) => ({ customer_id: id, name: customersMap[id]?.full_name ?? "Unknown", risk_level: customersMap[id]?.risk_level ?? "unknown", hits: n })),
      top_countries: Object.entries(byCountry).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([code, n]) => ({ country: code, hits: n })),
      sample_matches: matches,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("Backtest error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
