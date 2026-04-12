import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Transaction {
  id: string;
  user_id: string;
  customer_id: string;
  amount: number;
  currency: string;
  counterparty_country: string | null;
  direction: string;
  created_at: string;
  monitoring_status: string;
}

interface Customer {
  id: string;
  risk_level: string;
  kyc_status: string;
  country: string | null;
}

interface RuleCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logic: "AND" | "OR";
  action: string;
}

interface AlertRule {
  id: string;
  user_id: string;
  name: string;
  conditions: RuleCondition[];
  severity: string;
  is_active: boolean;
}

function resolveField(field: string, tx: Transaction, customer: Customer | null): string | number | null {
  switch (field) {
    case "transaction.amount": return tx.amount;
    case "transaction.currency": return tx.currency;
    case "transaction.country": return tx.counterparty_country;
    case "transaction.direction": return tx.direction;
    case "customer.riskScore":
    case "customer.status": {
      const riskMap: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
      return customer ? riskMap[customer.risk_level] ?? 0 : 0;
    }
    case "customer.nationality": return customer?.country ?? null;
    default: return null;
  }
}

function evaluateCondition(condition: RuleCondition, tx: Transaction, customer: Customer | null): boolean {
  const actual = resolveField(condition.field, tx, customer);
  const expected = condition.value;
  if (actual === null) return false;

  switch (condition.operator) {
    case ">": return Number(actual) > Number(expected);
    case ">=": return Number(actual) >= Number(expected);
    case "<": return Number(actual) < Number(expected);
    case "<=": return Number(actual) <= Number(expected);
    case "==": return String(actual).toLowerCase() === expected.toLowerCase();
    case "!=": return String(actual).toLowerCase() !== expected.toLowerCase();
    case "IN":
      return expected.split(",").map(v => v.trim().toLowerCase()).includes(String(actual).toLowerCase());
    case "NOT IN":
      return !expected.split(",").map(v => v.trim().toLowerCase()).includes(String(actual).toLowerCase());
    case "CONTAINS":
      return String(actual).toLowerCase().includes(expected.toLowerCase());
    default: return false;
  }
}

function evaluateRule(rule: AlertRule, tx: Transaction, customer: Customer | null): boolean {
  const conditions = rule.conditions.filter((c: RuleCondition) => c.field && c.operator);
  if (conditions.length === 0) return false;
  const logic = conditions[0]?.logic ?? "AND";
  const results = conditions.map((c: RuleCondition) => evaluateCondition(c, tx, customer));
  return logic === "AND" ? results.every(Boolean) : results.some(Boolean);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { user_id, transaction_ids } = body;

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: rules, error: ruleErr } = await supabaseAdmin
      .from("suite_alert_rules")
      .select("*")
      .eq("user_id", user_id)
      .eq("is_active", true);

    if (ruleErr) throw ruleErr;
    if (!rules || rules.length === 0) {
      return new Response(JSON.stringify({ evaluated: 0, alerts_created: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let txQuery = supabaseAdmin
      .from("suite_transactions")
      .select("*")
      .eq("user_id", user_id)
      .eq("monitoring_status", "pending");

    if (transaction_ids?.length) {
      txQuery = txQuery.in("id", transaction_ids);
    }

    const { data: transactions, error: txErr } = await txQuery.limit(500);
    if (txErr) throw txErr;
    if (!transactions || transactions.length === 0) {
      return new Response(JSON.stringify({ evaluated: 0, alerts_created: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerIds = [...new Set(transactions.map((t: Transaction) => t.customer_id))];
    const { data: customersRaw } = await supabaseAdmin
      .from("suite_customers")
      .select("id, risk_level, kyc_status, country")
      .in("id", customerIds);

    const customers: Record<string, Customer> = {};
    (customersRaw ?? []).forEach((c: Customer) => { customers[c.id] = c; });

    const alertsToCreate: object[] = [];

    for (const tx of transactions as Transaction[]) {
      const customer = customers[tx.customer_id] ?? null;
      let triggered = false;

      for (const rule of rules as AlertRule[]) {
        if (evaluateRule(rule, tx, customer)) {
          triggered = true;
          const action = rule.conditions[0]?.action ?? "Alert";
          alertsToCreate.push({
            user_id,
            customer_id: tx.customer_id,
            alert_type: "transaction_monitoring",
            severity: rule.severity,
            title: `Rule triggered: ${rule.name}`,
            description: `Transaction ${tx.id} · ${tx.amount} ${tx.currency} · Action: ${action}`,
            transaction_id: tx.id,
            rule_id: rule.id,
          });
        }
      }

      await supabaseAdmin
        .from("suite_transactions")
        .update({ monitoring_status: triggered ? "flagged" : "clear" })
        .eq("id", tx.id);
    }

    if (alertsToCreate.length > 0) {
      await supabaseAdmin.from("suite_alerts").insert(alertsToCreate);
    }

    await supabaseAdmin.from("suite_audit_log").insert({
      user_id,
      action: `Transaction monitoring: evaluated ${transactions.length} transactions, created ${alertsToCreate.length} alerts`,
      entity_type: "transaction_monitoring",
      details: {
        evaluated: transactions.length,
        alerts_created: alertsToCreate.length,
        rules_active: rules.length,
      },
    });

    return new Response(
      JSON.stringify({
        evaluated: transactions.length,
        alerts_created: alertsToCreate.length,
        rules_applied: rules.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
