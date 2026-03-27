import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://worldaml-clarity-shield.lovable.app";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response("Missing token", { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase.rpc("get_certificate_by_token", {
      _token: token,
    });

    if (error || !data) {
      return new Response("Certificate not found", { status: 404, headers: corsHeaders });
    }

    const cert = data as any;
    const course = cert.academy_courses;
    const holderName = cert.holder_name || "Learner";
    const courseTitle = course?.title || "Compliance Course";
    const score = cert.score || 0;
    const cpdHours = course?.cpd_hours || 0;
    const cpdText = cpdHours > 0 ? ` | ${cpdHours} CPD Hour${cpdHours !== 1 ? "s" : ""}` : "";

    const pageTitle = `${holderName} — ${courseTitle} Certificate | WorldAML Academy`;
    const pageDescription = `${holderName} earned the "${courseTitle}" certificate from WorldAML Academy with a score of ${score}%${cpdText}. Verify this credential online.`;
    const certificatePageUrl = `${SITE_URL}/academy/certificate/${token}`;

    // Generate a dynamic OG image using SVG → data URI
    const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f2a4a"/>
          <stop offset="100%" stop-color="#1e3a5f"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)"/>
      <rect x="60" y="60" width="1080" height="510" rx="20" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
      <text x="600" y="140" font-family="Arial,Helvetica,sans-serif" font-size="28" fill="rgba(255,255,255,0.7)" text-anchor="middle" font-weight="600">WorldAML Academy</text>
      <text x="600" y="180" font-family="Arial,Helvetica,sans-serif" font-size="16" fill="rgba(94,234,212,0.9)" text-anchor="middle" letter-spacing="3">CERTIFICATE OF COMPLETION</text>
      <line x1="450" y1="200" x2="750" y2="200" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <text x="600" y="270" font-family="Georgia,serif" font-size="44" fill="white" text-anchor="middle" font-weight="700">${escapeXml(holderName)}</text>
      <text x="600" y="330" font-family="Arial,Helvetica,sans-serif" font-size="22" fill="rgba(255,255,255,0.8)" text-anchor="middle">${escapeXml(courseTitle)}</text>
      <text x="600" y="400" font-family="Arial,Helvetica,sans-serif" font-size="48" fill="#5eead4" text-anchor="middle" font-weight="800">${score}%</text>
      <text x="600" y="435" font-family="Arial,Helvetica,sans-serif" font-size="14" fill="rgba(255,255,255,0.5)" text-anchor="middle" letter-spacing="2">FINAL SCORE${cpdText ? " " + escapeXml(cpdText) : ""}</text>
      <text x="600" y="530" font-family="Arial,Helvetica,sans-serif" font-size="14" fill="rgba(255,255,255,0.35)" text-anchor="middle">www.worldaml.com/academy • Verified Certificate</text>
    </svg>`;

    // Convert SVG to a data URI for the og:image
    const ogImageDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(ogSvg)}`;

    // Serve an HTML page with OG meta tags that redirects browsers to the real certificate page
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(pageDescription)}"/>
  <meta property="og:title" content="${escapeHtml(pageTitle)}"/>
  <meta property="og:description" content="${escapeHtml(pageDescription)}"/>
  <meta property="og:image" content="${ogImageDataUri}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:url" content="${certificatePageUrl}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:site_name" content="WorldAML Academy"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${escapeHtml(pageTitle)}"/>
  <meta name="twitter:description" content="${escapeHtml(pageDescription)}"/>
  <meta name="twitter:image" content="${ogImageDataUri}"/>
  <meta http-equiv="refresh" content="0;url=${certificatePageUrl}"/>
</head>
<body>
  <p>Redirecting to <a href="${certificatePageUrl}">your certificate</a>...</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("certificate-og error:", err);
    return new Response("Internal server error", { status: 500, headers: corsHeaders });
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
