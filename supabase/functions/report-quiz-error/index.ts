import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } =
      await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string | undefined;

    const body = await req.json();
    const { error_message, error_code, error_details, error_hint, course_id, course_slug, user_agent } = body;

    if (!error_message) {
      return new Response(JSON.stringify({ error: "error_message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert into a support log table
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await serviceClient.from("quiz_error_reports").insert({
      user_id: userId,
      user_email: userEmail || null,
      error_message: String(error_message).slice(0, 2000),
      error_code: error_code ? String(error_code).slice(0, 100) : null,
      error_details: error_details ? String(error_details).slice(0, 2000) : null,
      error_hint: error_hint ? String(error_hint).slice(0, 2000) : null,
      course_id: course_id || null,
      course_slug: course_slug ? String(course_slug).slice(0, 200) : null,
      user_agent: user_agent ? String(user_agent).slice(0, 500) : null,
    });

    // Also send admin notification email via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "WorldAML Platform <notifications@worldaml.com>",
          to: ["support@worldaml.com"],
          subject: `[Quiz Error] ${userEmail || userId} — ${error_code || "unknown"}`,
          html: `<h2>Quiz Submission Error Report</h2>
<p><strong>User:</strong> ${userEmail || "N/A"} (${userId})</p>
<p><strong>Course:</strong> ${course_slug || course_id || "N/A"}</p>
<p><strong>Error:</strong> ${error_message}</p>
<p><strong>Code:</strong> ${error_code || "N/A"}</p>
<p><strong>Details:</strong> ${error_details || "N/A"}</p>
<p><strong>Hint:</strong> ${error_hint || "N/A"}</p>
<p><strong>User Agent:</strong> ${user_agent || "N/A"}</p>
<p><strong>Reported at:</strong> ${new Date().toISOString()}</p>`,
        }),
      }).catch((e) => console.error("Resend email failed:", e));
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("report-quiz-error failed:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
