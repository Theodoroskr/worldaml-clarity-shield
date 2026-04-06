import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WorkflowNode {
  id: string;
  data: {
    label: string;
    nodeType: string;
    config?: Record<string, unknown>;
  };
}

interface WorkflowEdge {
  source: string;
  target: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { trigger_type, entity_type, entity_id, user_id, entity_data } = body;

    if (!trigger_type || !entity_type || !user_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: trigger_type, entity_type, user_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Workflow trigger: ${trigger_type} for ${entity_type}/${entity_id}`);

    // Find all active workflows matching this trigger
    const { data: workflows, error: wfErr } = await supabaseAdmin
      .from("admin_workflows")
      .select("*")
      .eq("is_active", true)
      .eq("trigger_type", trigger_type);

    if (wfErr) {
      console.error("Error fetching workflows:", wfErr);
      return new Response(
        JSON.stringify({ error: "Failed to fetch workflows" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!workflows || workflows.length === 0) {
      console.log(`No active workflows for trigger: ${trigger_type}`);
      return new Response(
        JSON.stringify({ executed: 0, message: "No matching workflows" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const workflow of workflows) {
      const nodes = (workflow.nodes || []) as WorkflowNode[];
      const edges = (workflow.edges || []) as WorkflowEdge[];
      const executionLog: Array<Record<string, unknown>> = [];

      // Find trigger node
      const triggerNode = nodes.find((n) => n.data?.nodeType === "trigger");
      if (!triggerNode) {
        executionLog.push({ step: "error", message: "No trigger node found" });
        continue;
      }

      // Walk the graph from trigger node using BFS
      const visited = new Set<string>();
      const queue = [triggerNode.id];
      let status = "completed";

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        const currentNode = nodes.find((n) => n.id === currentId);
        if (!currentNode) continue;

        const nodeType = currentNode.data?.nodeType;
        const nodeLabel = currentNode.data?.label || "Untitled";
        const nodeConfig = currentNode.data?.config || {};

        executionLog.push({
          step: currentId,
          nodeType,
          label: nodeLabel,
          timestamp: new Date().toISOString(),
          status: "executed",
        });

        // Execute node actions
        if (nodeType === "action") {
          const actionResult = await executeAction(
            supabaseAdmin,
            nodeConfig,
            nodeLabel,
            entity_type,
            entity_id,
            user_id,
            entity_data
          );
          executionLog.push({ step: currentId, action_result: actionResult });
        }

        if (nodeType === "condition") {
          const conditionMet = evaluateCondition(nodeConfig, entity_data);
          executionLog.push({ step: currentId, condition_result: conditionMet });
          if (!conditionMet) {
            executionLog.push({ step: currentId, message: "Condition not met, stopping branch" });
            continue; // Don't follow edges from this node
          }
        }

        if (nodeType === "end") {
          executionLog.push({ step: currentId, message: "Workflow ended" });
          continue;
        }

        // Find outgoing edges and enqueue targets
        const outgoing = edges.filter((e) => e.source === currentId);
        for (const edge of outgoing) {
          queue.push(edge.target);
        }
      }

      // Log execution
      const { error: execErr } = await supabaseAdmin
        .from("admin_workflow_executions")
        .insert({
          workflow_id: workflow.id,
          entity_type,
          entity_id: entity_id || null,
          user_id,
          status,
          execution_log: executionLog,
          completed_at: new Date().toISOString(),
        });

      if (execErr) console.error("Failed to log execution:", execErr);

      results.push({
        workflow_id: workflow.id,
        workflow_name: workflow.name,
        status,
        steps_executed: visited.size,
      });
    }

    console.log(`Executed ${results.length} workflow(s)`);

    return new Response(
      JSON.stringify({ executed: results.length, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Workflow execution error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function executeAction(
  supabase: ReturnType<typeof createClient>,
  config: Record<string, unknown>,
  label: string,
  entityType: string,
  entityId: string | null,
  userId: string,
  entityData?: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const actionType = (config.action_type as string) || label.toLowerCase().replace(/\s+/g, "_");

  switch (actionType) {
    case "change_risk_level": {
      if (entityType === "customer" && entityId) {
        const newLevel = (config.risk_level as string) || "high";
        const { error } = await supabase
          .from("suite_customers")
          .update({ risk_level: newLevel })
          .eq("id", entityId);
        return { action: "change_risk_level", success: !error, new_level: newLevel };
      }
      return { action: "change_risk_level", skipped: true, reason: "Not a customer entity" };
    }

    case "create_case": {
      const { error } = await supabase.from("suite_cases").insert({
        title: `Auto: ${label} - ${entityType}/${entityId}`,
        user_id: userId,
        customer_id: entityType === "customer" ? entityId : null,
        priority: (config.priority as string) || "medium",
      });
      return { action: "create_case", success: !error };
    }

    case "send_alert": {
      const severity = (config.severity as string) || "medium";
      const { error } = await supabase.from("suite_alerts").insert({
        title: `Workflow Alert: ${label}`,
        description: `Triggered by ${entityType} event on ${entityId}`,
        user_id: userId,
        customer_id: entityType === "customer" ? entityId : null,
        severity,
        alert_type: "workflow",
      });
      return { action: "send_alert", success: !error };
    }

    case "assign_reviewer": {
      return { action: "assign_reviewer", note: "Assignment logged", assignee: config.assignee || "unassigned" };
    }

    case "request_edd": {
      return { action: "request_edd", note: "EDD request logged for review" };
    }

    default:
      return { action: actionType, note: "Action logged (no handler)" };
  }
}

function evaluateCondition(
  config: Record<string, unknown>,
  entityData?: Record<string, unknown>
): boolean {
  if (!entityData || !config.field) return true; // pass through if no condition configured

  const field = config.field as string;
  const operator = (config.operator as string) || "equals";
  const value = config.value;
  const actual = entityData[field];

  switch (operator) {
    case "equals":
      return String(actual) === String(value);
    case "not_equals":
      return String(actual) !== String(value);
    case "greater_than":
      return Number(actual) > Number(value);
    case "less_than":
      return Number(actual) < Number(value);
    case "contains":
      return String(actual).includes(String(value));
    case "in_list":
      return Array.isArray(value) ? value.includes(actual) : false;
    default:
      return true;
  }
}
