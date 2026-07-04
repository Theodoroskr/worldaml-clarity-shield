import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_EVENTS = new Set([
  "aml_page_view",
  "sanctions_search",
]);

const AML_PAGE_VIEW_THRESHOLD = 3;
const SANCTIONS_SEARCH_THRESHOLD = 5;
const WINDOW_DAYS = 30;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { event_type, path, metadata } = body as {
      event_type?: string;
      path?: string;
      metadata?: Record<string, unknown>;
    };

    if (!event_type || !ALLOWED_EVENTS.has(event_type)) {
      return new Response(JSON.stringify({ error: "Invalid event_type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const safePath = typeof path === "string" ? path.slice(0, 512) : null;
    const safeMeta = metadata && typeof metadata === "object" ? metadata : {};

    // Log the event
    await supabase.from("outreach_events").insert({
      user_id: user.id,
      event_type,
      path: safePath,
      metadata: safeMeta,
    });

    // Only run the threshold check for AML-signal events
    const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const [{ count: pageViews }, { count: searches }] = await Promise.all([
      supabase.from("outreach_events").select("id", { count: "exact", head: true })
        .eq("user_id", user.id).eq("event_type", "aml_page_view").gte("created_at", since),
      supabase.from("sanctions_searches").select("id", { count: "exact", head: true })
        .eq("user_id", user.id).gte("created_at", since),
    ]);

    const hitPageViews = (pageViews ?? 0) >= AML_PAGE_VIEW_THRESHOLD;
    const hitSearches = (searches ?? 0) >= SANCTIONS_SEARCH_THRESHOLD;

    let enqueued: string | null = null;
    if (hitPageViews || hitSearches) {
      // Check eligibility first (consent + not opted out + approved etc.)
      const { data: eligibility } = await supabase.rpc(
        "is_eligible_for_sales_outreach",
        { _user_id: user.id },
      );
      if (eligibility?.eligible) {
        const { data: qid } = await supabase.rpc("enqueue_outreach", {
          _user_id: user.id,
          _trigger_type: "aml_signal",
          _template_id: "aml-signal-outreach",
          _metadata: {
            aml_page_views_30d: pageViews ?? 0,
            sanctions_searches_30d: searches ?? 0,
            hit: hitPageViews ? "aml_page_view" : "sanctions_search",
          },
          _delay: "24 hours",
        });
        enqueued = (qid as string) ?? null;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      counts: { aml_page_views_30d: pageViews ?? 0, sanctions_searches_30d: searches ?? 0 },
      enqueued,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("log-outreach-event error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message ?? "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
