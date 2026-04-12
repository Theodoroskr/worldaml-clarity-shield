import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Transaction {
  id: string; user_id: string; customer_id: string; amount: number;
  currency: string; counterparty: string | null; counterparty_country: string | null;
  direction: string; created_at: string; monitoring_status: string; risk_flag: boolean;
}

interface Customer { id: string; risk_level: string; kyc_status: string; country: string | null; }

interface RuleCondition { field: string; operator: string; value: string; }

interface AlertRule { id: string; user_id: string; name: string; conditions: RuleCondition[]; severity: string; is_active: boolean; }

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
  if (f.includes("customer") && f.includes("risk") || f === "customer.riskScore") {
    const riskMap: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
    return customer ? riskMap[customer.risk_level] ?? 0 : 0;
  }
  if (f.includes("customer") && (f.includes("nationality") || f.includes("country"))) return customer?.country ?? null;
  return null;
}

function parseNumericValue(val: string): number {
  const cleaned = val.replace(/[^0-9.,\-]/g, "").replace(/,/g, "");
  return parseFloat(cleaned) || 0;
}

function evaluateCondition(cond: RuleCondition, tx: Transaction, _customer: Customer | null): boolean {
  const actual = resolveField(cond.field, tx, _customer);
  const op = cond.operator.trim().toUpperCase();
  const expected = cond.value;

  if (actual === null || actual === undefined) return false;

  // IS operator - string matching
  if (op === "IS") {
    const ev = expected.toLowerCase().trim();
    // FATF check
    if (ev.includes("fatf") && (ev.includes("grey") || ev.includes("black"))) {
      const country = String(actual).toUpperCase();
      return FATF_GREY_BLACK.includes(country);
    }
    // Direction check
    if (ev === "inbound" || ev === "outbound") {
      return String(actual).toLowerCase() === ev;
    }
    return String(actual).toLowerCase() === ev;
  }

  // Numeric comparisons
  if (op === ">" || op === ">=" || op === "≥" || op === "<" || op === "<=" || op === "≤") {
    const numActual = typeof actual === "number" ? actual : parseFloat(String(actual));
    const numExpected = parseNumericValue(expected);
    if (isNaN(numActual) || isNaN(numExpected)) return false;
    if (op === ">") return numActual > numExpected;
    if (op === ">=" || op === "≥") return numActual >= numExpected;
    if (op === "<") return numActual < numExpected;
    if (op === "<=" || op === "≤") return numActual <= numExpected;
  }

  if (op === "BETWEEN") {
    const numActual = typeof actual === "number" ? actual : parseFloat(String(actual));
    const parts = expected.replace(/[^0-9.,\s]/g, "").trim().split(/\s+/);
    if (parts.length >= 2) {
      const low = parseFloat(parts[0].replace(/,/g, ""));
      const high = parseFloat(parts[parts.length - 1].replace(/,/g, ""));
      return numActual >= low && numActual <= high;
    }
    return false;
  }

  // Equality
  if (op === "==" || op === "=" || op === "EQ") {
    return String(actual).toLowerCase() === expected.toLowerCase();
  }

  if (op === "IN" || op === "CONTAINS") {
    return String(actual).toLowerCase().includes(expected.toLowerCase());
  }

  return false;
}

function evaluateRule(rule: AlertRule, tx: Transaction, customer: Customer | null): boolean {
  const conditions = (rule.conditions || []).filter((c: RuleCondition) => c.field && c.operator && c.value);
  if (conditions.length === 0) return false;

  // All conditions must be true (AND logic for IBANERA rules)
  return conditions.every((c: RuleCondition) => evaluateCondition(c, tx, customer));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { user_id, transaction_ids } = body;

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: rules, error: ruleErr } = await supabaseAdmin
      .from("suite_alert_rules").select("*").eq("user_id", user_id).eq("is_active", true);

    if (ruleErr) throw ruleErr;
    if (!rules || rules.length === 0) {
      return new Response(JSON.stringify({ evaluated: 0, alerts_created: 0, message: "No active rules" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let txQuery = supabaseAdmin.from("suite_transactions").select("*").eq("user_id", user_id);
    if (transaction_ids?.length) {
      txQuery = txQuery.in("id", transaction_ids);
    } else {
      txQuery = txQuery.eq("monitoring_status", "pending");
    }

    const { data: transactions, error: txErr } = await txQuery.limit(1000);
    if (txErr) throw txErr;
    if (!transactions || transactions.length === 0) {
      return new Response(JSON.stringify({ evaluated: 0, alerts_created: 0, message: "No pending transactions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerIds = [...new Set(transactions.map((t: Transaction) => t.customer_id))];
    const { data: customersRaw } = await supabaseAdmin
      .from("suite_customers").select("id, risk_level, kyc_status, country").in("id", customerIds);

    const customers: Record<string, Customer> = {};
    (customersRaw ?? []).forEach((c: Customer) => { customers[c.id] = c; });

    const alertsToCreate: object[] = [];
    const ruleHits: Record<string, number> = {};

    for (const tx of transactions as Transaction[]) {
      const customer = customers[tx.customer_id] ?? null;
      let triggered = false;

      for (const rule of rules as AlertRule[]) {
        if (evaluateRule(rule, tx, customer)) {
          triggered = true;
          ruleHits[rule.name] = (ruleHits[rule.name] || 0) + 1;
          
          const severity = rule.severity || "medium";
          const isHardStop = rule.name.includes("Hard Stop") || severity === "critical";

          alertsToCreate.push({
            user_id, customer_id: tx.customer_id,
            alert_type: "transaction_monitoring", severity,
            title: `Rule triggered: ${rule.name}`,
            description: `Transaction ${tx.id} · ${tx.amount} ${tx.currency} ${tx.direction} · ${isHardStop ? "HARD STOP" : "Soft Stop"}`,
            transaction_id: tx.id, rule_id: rule.id,
          });
        }
      }

      await supabaseAdmin.from("suite_transactions")
        .update({ monitoring_status: triggered ? "flagged" : "clear", risk_flag: triggered || tx.risk_flag })
        .eq("id", tx.id);
    }

    // Batch insert alerts
    if (alertsToCreate.length > 0) {
      for (let i = 0; i < alertsToCreate.length; i += 50) {
        await supabaseAdmin.from("suite_alerts").insert(alertsToCreate.slice(i, i + 50));
      }
    }

    await supabaseAdmin.from("suite_audit_log").insert({
      user_id,
      action: `Rule engine: evaluated ${transactions.length} txns against ${rules.length} rules, created ${alertsToCreate.length} alerts`,
      entity_type: "transaction_monitoring",
      details: { evaluated: transactions.length, alerts_created: alertsToCreate.length, rules_active: rules.length, rule_hits: ruleHits },
    });

    return new Response(JSON.stringify({
      evaluated: transactions.length, alerts_created: alertsToCreate.length,
      rules_applied: rules.length, rule_hits: ruleHits,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Evaluate error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
