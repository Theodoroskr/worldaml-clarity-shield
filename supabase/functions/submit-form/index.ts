import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const NOTIFY_EMAIL = "info@worldaml.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      form_type,
      first_name,
      last_name,
      email,
      phone,
      company,
      job_title,
      country,
      industry,
      message,
      products,
      account_type,
      region,
      metadata,
    } = body;

    // Validate required fields
    if (!form_type || !first_name || !last_name || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: form_type, first_name, last_name, email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: dbError } = await supabase.from("form_submissions").insert({
      form_type,
      first_name: first_name.trim().slice(0, 100),
      last_name: last_name.trim().slice(0, 100),
      email: email.trim().slice(0, 255),
      phone: phone?.trim().slice(0, 50) || null,
      company: company?.trim().slice(0, 200) || null,
      job_title: job_title?.trim().slice(0, 100) || null,
      country: country?.trim().slice(0, 100) || null,
      industry: industry?.trim().slice(0, 100) || null,
      message: message?.trim().slice(0, 2000) || null,
      products: products || null,
      account_type: account_type?.trim().slice(0, 50) || null,
      region: region?.trim().slice(0, 50) || null,
      metadata: metadata || {},
    });

    if (dbError) {
      console.error("Database insert error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save submission" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email notification via Supabase's built-in SMTP (using edge function fetch to Resend or similar)
    // For now, we'll use a simple approach: log and rely on DB storage
    // Email can be sent via a webhook or external service in the future
    console.log(`📧 New ${form_type} submission from ${first_name} ${last_name} (${email}) — notify ${NOTIFY_EMAIL}`);
    console.log("Submission details:", JSON.stringify({
      form_type,
      name: `${first_name} ${last_name}`,
      email,
      company,
      phone,
      country,
      industry,
      products,
      message,
    }));

    return new Response(
      JSON.stringify({ success: true, message: "Form submitted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Submit form error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
