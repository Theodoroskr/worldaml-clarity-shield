import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { allEUSanctionsRegimes } from "@/data/euSanctionsRegimes";

// Map slug → ISO alpha-2 code for SVG path matching
const slugToIso: Record<string, string> = {
  afghanistan: "AF",
  belarus: "BY",
  "bosnia-herzegovina": "BA",
  burundi: "BI",
  "central-african-republic": "CF",
  china: "CN",
  "north-korea": "KP",
  "democratic-republic-congo": "CD",
  guatemala: "GT",
  guinea: "GN",
  "guinea-bissau": "GW",
  haiti: "HT",
  iran: "IR",
  iraq: "IQ",
  lebanon: "LB",
  libya: "LY",
  mali: "ML",
  moldova: "MD",
  montenegro: "ME",
  myanmar: "MM",
  nicaragua: "NI",
  niger: "NE",
  russia: "RU",
  serbia: "RS",
  somalia: "SO",
  "south-sudan": "SS",
  sudan: "SD",
  syria: "SY",
  tunisia: "TN",
  turkiye: "TR",
  ukraine: "UA",
  "united-states": "US",
  venezuela: "VE",
  yemen: "YE",
  zimbabwe: "ZW",
};

// Region → fill color for sanctioned countries
const regionFills: Record<string, string> = {
  europe: "#3b82f6",
  africa: "#f59e0b",
  "middle-east": "#f97316",
  asia: "#10b981",
  americas: "#8b5cf6",
  thematic: "#f43f5e",
};

// Build lookup: ISO code → regime info
const isoToRegime = new Map<string, { slug: string; country: string; region: string; regimeCount: number }>();
allEUSanctionsRegimes.forEach((r) => {
  const iso = slugToIso[r.slug];
  if (iso) {
    isoToRegime.set(iso, {
      slug: r.slug,
      country: r.country,
      region: r.region,
      regimeCount: r.regimes.length,
    });
  }
});

// Simplified world map SVG paths — key countries with recognizable shapes
// Using a Natural Earth–style simplified projection (Robinson-like)
const countryPaths: Record<string, string> = {
  // North America
  US: "M 48,130 L 55,118 62,115 68,112 80,110 95,108 105,112 115,118 120,125 118,132 115,138 108,142 100,145 92,148 85,150 78,148 70,145 62,142 55,138 50,135 Z M 25,105 L 32,98 40,95 48,98 52,105 55,112 52,118 45,120 38,118 30,115 25,110 Z",
  CA: "M 30,62 L 40,55 55,50 70,48 85,50 100,48 115,52 125,58 130,65 128,75 125,82 118,88 110,92 100,95 90,98 80,100 70,102 60,100 50,98 42,95 35,90 30,82 28,72 Z",
  MX: "M 52,148 L 58,142 65,140 72,142 78,148 82,155 80,162 75,168 68,170 62,168 55,165 52,158 Z",
  GT: "M 62,168 L 65,165 68,164 70,166 68,170 65,172 62,170 Z",
  NI: "M 68,172 L 72,170 75,170 77,173 75,176 72,177 69,175 Z",
  HT: "M 82,162 L 85,160 88,161 89,164 87,166 84,165 Z",
  VE: "M 92,178 L 98,174 105,172 110,175 112,180 108,185 102,188 95,186 92,182 Z",
  // Europe
  BY: "M 270,88 L 276,85 282,86 285,90 283,95 278,97 272,95 269,92 Z",
  BA: "M 260,108 L 263,105 267,106 268,110 265,113 261,112 Z",
  MD: "M 278,100 L 281,98 284,100 283,104 280,105 277,103 Z",
  ME: "M 261,114 L 263,112 266,113 266,116 264,118 261,117 Z",
  RS: "M 264,106 L 268,103 272,104 273,108 270,112 266,112 263,109 Z",
  TR: "M 282,112 L 290,108 300,106 310,108 318,112 320,118 315,122 308,124 298,122 290,120 284,118 Z",
  UA: "M 272,90 L 280,86 290,85 298,88 302,94 300,100 295,105 288,108 280,108 274,105 270,100 268,95 Z",
  RU: "M 290,25 L 310,20 340,18 370,22 400,25 430,28 460,30 480,35 490,42 495,52 490,62 482,72 470,78 458,82 445,85 430,88 418,90 405,88 392,85 380,80 368,78 355,75 345,72 335,70 325,72 315,78 308,85 300,88 295,82 290,75 288,65 290,55 295,45 298,38 295,30 Z",
  // Africa
  BI: "M 292,230 L 294,228 297,229 297,232 295,234 292,233 Z",
  CF: "M 275,210 L 282,207 290,208 295,212 292,218 285,220 278,218 274,214 Z",
  CD: "M 278,222 L 286,218 295,220 300,226 298,235 292,240 285,242 278,238 274,232 275,226 Z",
  GN: "M 215,198 L 218,196 222,197 223,200 220,202 216,201 Z",
  GW: "M 212,196 L 214,194 217,195 216,198 213,198 Z",
  LY: "M 260,155 L 270,148 280,150 288,155 290,165 285,172 278,175 268,172 262,165 Z",
  ML: "M 222,185 L 232,180 242,182 248,188 245,195 238,200 228,198 222,192 Z",
  NE: "M 245,182 L 255,178 265,180 270,186 268,192 260,196 252,194 246,188 Z",
  SO: "M 318,200 L 322,195 328,195 330,200 328,210 325,218 320,222 316,215 315,208 Z",
  SS: "M 290,210 L 298,206 305,208 308,214 305,220 298,222 292,218 Z",
  SD: "M 285,180 L 295,175 305,178 310,185 308,195 302,200 292,198 286,192 284,185 Z",
  TN: "M 252,140 L 255,136 258,138 258,145 255,148 252,146 Z",
  ZW: "M 292,260 L 298,257 304,258 306,264 302,268 296,268 292,264 Z",
  // Middle East
  IR: "M 320,120 L 332,115 345,118 352,125 350,135 345,142 335,145 325,142 318,135 316,128 Z",
  IQ: "M 305,120 L 312,115 320,118 322,125 318,132 312,135 305,132 302,126 Z",
  LB: "M 298,125 L 300,122 302,124 301,128 299,128 Z",
  SY: "M 298,115 L 305,112 312,114 312,120 308,124 300,124 296,120 Z",
  YE: "M 315,165 L 322,160 330,162 332,168 328,174 320,175 314,172 Z",
  // Asia
  AF: "M 348,118 L 356,112 365,115 368,122 365,128 358,132 350,130 346,124 Z",
  CN: "M 370,85 L 385,78 402,75 418,80 430,88 438,98 440,110 435,122 425,130 412,135 398,132 385,128 375,120 368,112 365,102 366,92 Z",
  KP: "M 438,98 L 442,94 446,96 447,102 444,105 440,104 Z",
  MM: "M 395,140 L 400,135 405,138 408,145 406,155 402,160 397,158 394,150 Z",
};

interface TooltipData {
  x: number;
  y: number;
  country: string;
  regimeCount: number;
  region: string;
}

interface InteractiveSanctionsMapProps {
  activeRegion: string | null;
}

const regionLabelMap: Record<string, string> = {
  europe: "Europe",
  africa: "Africa",
  "middle-east": "Middle East",
  asia: "Asia",
  americas: "Americas",
};

export const InteractiveSanctionsMap = ({ activeRegion }: InteractiveSanctionsMapProps) => {
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent, iso: string) => {
    const info = isoToRegime.get(iso);
    if (!info || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 12,
      country: info.country,
      regimeCount: info.regimeCount,
      region: info.region,
    });
    setHoveredCountry(iso);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
    setHoveredCountry(null);
  }, []);

  const handleClick = useCallback((iso: string) => {
    const info = isoToRegime.get(iso);
    if (info) navigate(`/eu-sanctions/${info.slug}`);
  }, [navigate]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        viewBox="0 0 520 320"
        className="w-full h-auto"
        style={{ maxHeight: "500px" }}
      >
        {/* Background */}
        <rect x="0" y="0" width="520" height="320" fill="none" />

        {/* Ocean hint */}
        <rect x="0" y="0" width="520" height="320" rx="12" fill="hsl(var(--muted))" opacity="0.3" />

        {/* All country paths */}
        {Object.entries(countryPaths).map(([iso, d]) => {
          const info = isoToRegime.get(iso);
          const isSanctioned = !!info;
          const isFiltered = activeRegion ? info?.region === activeRegion : true;
          const isHovered = hoveredCountry === iso;

          let fill = "hsl(var(--muted-foreground) / 0.15)";
          if (isSanctioned && isFiltered) {
            fill = regionFills[info.region] || "#6b7280";
          } else if (isSanctioned && !isFiltered) {
            fill = "hsl(var(--muted-foreground) / 0.08)";
          }

          return (
            <path
              key={iso}
              d={d}
              fill={fill}
              stroke={isHovered ? "hsl(var(--foreground))" : "hsl(var(--border))"}
              strokeWidth={isHovered ? 1.5 : 0.5}
              opacity={isSanctioned && isFiltered ? (isHovered ? 1 : 0.85) : 0.5}
              className={isSanctioned ? "cursor-pointer transition-all duration-150" : ""}
              onMouseMove={(e) => isSanctioned && handleMouseMove(e, iso)}
              onMouseLeave={handleMouseLeave}
              onClick={() => isSanctioned && handleClick(iso)}
            />
          );
        })}

        {/* Continent labels */}
        <text x="80" y="95" className="fill-muted-foreground text-[7px]" textAnchor="middle" fontWeight="600" opacity="0.4">NORTH AMERICA</text>
        <text x="95" y="190" className="fill-muted-foreground text-[7px]" textAnchor="middle" fontWeight="600" opacity="0.4">SOUTH AMERICA</text>
        <text x="260" y="75" className="fill-muted-foreground text-[7px]" textAnchor="middle" fontWeight="600" opacity="0.4">EUROPE</text>
        <text x="270" y="195" className="fill-muted-foreground text-[7px]" textAnchor="middle" fontWeight="600" opacity="0.4">AFRICA</text>
        <text x="330" y="130" className="fill-muted-foreground text-[7px]" textAnchor="middle" fontWeight="600" opacity="0.4">MIDDLE EAST</text>
        <text x="410" y="90" className="fill-muted-foreground text-[7px]" textAnchor="middle" fontWeight="600" opacity="0.4">ASIA</text>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-50 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg px-3 py-2 text-sm"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="font-semibold">{tooltip.country}</div>
          <div className="text-xs text-muted-foreground">
            {tooltip.regimeCount} regime{tooltip.regimeCount > 1 ? "s" : ""} · {regionLabelMap[tooltip.region] || tooltip.region}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        {Object.entries(regionFills).map(([region, color]) => (
          <div key={region} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: color }} />
            {regionLabelMap[region] || region}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-3 h-3 rounded-sm inline-block bg-muted-foreground/15" />
          Not sanctioned
        </div>
      </div>
    </div>
  );
};

export default InteractiveSanctionsMap;
