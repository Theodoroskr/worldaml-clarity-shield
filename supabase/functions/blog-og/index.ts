// Dynamic Open Graph image generator for blog posts.
// Renders a branded 1200x630 PNG so LinkedIn (and other social platforms)
// show a large, unique preview card per article.
//
// URL: /functions/v1/blog-og?title=...&category=...&slug=...
//
// All parameters are optional; sensible fallbacks are used.

import { ImageResponse } from "https://deno.land/x/og_edge@0.0.6/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Colour palette (matches WorldAML brand — deep navy + teal accent)
const NAVY_1 = "#0B1F3A";
const NAVY_2 = "#12315C";
const TEAL = "#5EEAD4";
const WHITE_80 = "rgba(255,255,255,0.82)";
const WHITE_50 = "rgba(255,255,255,0.55)";

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1).trimEnd() + "…";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const rawTitle = url.searchParams.get("title") ?? "WorldAML Insights";
    const rawCategory = url.searchParams.get("category") ?? "Compliance";

    const title = truncate(rawTitle, 140);
    const category = truncate(rawCategory, 40).toUpperCase();

    const element = {
      type: "div",
      props: {
        style: {
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          backgroundImage: `linear-gradient(135deg, ${NAVY_1} 0%, ${NAVY_2} 100%)`,
          fontFamily: "sans-serif",
          position: "relative",
        },
        children: [
          // Decorative accent bar
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "8px",
                backgroundColor: TEAL,
              },
            },
          },
          // Top: brand + category
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      color: "white",
                      fontSize: 30,
                      fontWeight: 700,
                      letterSpacing: "-0.5px",
                    },
                    children: "WorldAML",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      color: TEAL,
                      fontSize: 18,
                      fontWeight: 700,
                      letterSpacing: "3px",
                      border: `2px solid ${TEAL}`,
                      padding: "8px 18px",
                      borderRadius: "999px",
                    },
                    children: category,
                  },
                },
              ],
            },
          },
          // Title
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                color: "white",
                fontSize: title.length > 90 ? 52 : title.length > 60 ? 60 : 68,
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-1.5px",
                maxWidth: "1040px",
              },
              children: title,
            },
          },
          // Footer
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid rgba(255,255,255,0.12)",
                paddingTop: "24px",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      color: WHITE_80,
                      fontSize: 22,
                      fontWeight: 500,
                    },
                    children: "Compliance intelligence for regulated businesses",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      color: WHITE_50,
                      fontSize: 20,
                      fontWeight: 600,
                    },
                    children: "worldaml.com",
                  },
                },
              ],
            },
          },
        ],
      },
    };

    return new ImageResponse(element as unknown as React.ReactElement, {
      width: 1200,
      height: 630,
      headers: {
        ...corsHeaders,
        // Cache for a week at CDN; LinkedIn re-fetches when its own cache expires
        "Cache-Control": "public, max-age=604800, s-maxage=604800, immutable",
      },
    });
  } catch (err) {
    console.error("blog-og error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
