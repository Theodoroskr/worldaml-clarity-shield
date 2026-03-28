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
  // Central & South America
  CU: "M 72,158 L 78,155 84,156 88,159 85,162 79,162 74,160 Z",
  CO: "M 82,185 L 88,180 95,178 100,182 98,190 92,195 85,193 82,188 Z",
  BR: "M 100,195 L 112,188 125,185 135,190 140,200 142,215 138,230 130,242 120,248 110,245 102,238 95,228 92,218 94,208 Z",
  AR: "M 95,252 L 100,245 108,248 112,255 115,268 112,280 108,290 102,295 96,290 92,280 90,268 92,260 Z",
  CL: "M 88,255 L 92,250 95,255 94,268 92,280 90,290 86,295 84,288 84,275 85,265 Z",
  PE: "M 78,210 L 85,205 92,208 95,215 92,225 86,230 80,228 76,220 Z",
  EC: "M 75,198 L 80,195 84,198 83,204 79,206 76,202 Z",
  BO: "M 92,230 L 98,226 104,228 106,235 102,242 96,242 92,236 Z",
  PY: "M 104,242 L 108,238 114,240 115,246 110,250 106,248 Z",
  UY: "M 112,255 L 116,252 120,254 119,258 115,260 112,258 Z",
  // Europe
  BY: "M 270,88 L 276,85 282,86 285,90 283,95 278,97 272,95 269,92 Z",
  BA: "M 260,108 L 263,105 267,106 268,110 265,113 261,112 Z",
  MD: "M 278,100 L 281,98 284,100 283,104 280,105 277,103 Z",
  ME: "M 261,114 L 263,112 266,113 266,116 264,118 261,117 Z",
  RS: "M 264,106 L 268,103 272,104 273,108 270,112 266,112 263,109 Z",
  TR: "M 282,112 L 290,108 300,106 310,108 318,112 320,118 315,122 308,124 298,122 290,120 284,118 Z",
  UA: "M 272,90 L 280,86 290,85 298,88 302,94 300,100 295,105 288,108 280,108 274,105 270,100 268,95 Z",
  RU: "M 290,25 L 310,20 340,18 370,22 400,25 430,28 460,30 480,35 490,42 495,52 490,62 482,72 470,78 458,82 445,85 430,88 418,90 405,88 392,85 380,80 368,78 355,75 345,72 335,70 325,72 315,78 308,85 300,88 295,82 290,75 288,65 290,55 295,45 298,38 295,30 Z",
  GB: "M 238,78 L 241,74 244,75 245,80 243,85 240,86 237,83 Z",
  FR: "M 240,92 L 246,88 252,90 254,96 250,102 244,102 240,98 Z",
  DE: "M 252,82 L 258,78 264,80 265,88 261,92 255,92 252,87 Z",
  IT: "M 258,100 L 261,96 264,98 265,105 263,112 260,115 257,110 256,104 Z",
  ES: "M 230,102 L 238,98 244,100 244,108 238,112 232,110 229,106 Z",
  PT: "M 226,102 L 229,100 230,106 228,110 225,108 Z",
  PL: "M 262,82 L 268,78 274,80 276,86 272,90 266,90 262,86 Z",
  RO: "M 272,98 L 278,95 284,97 285,102 280,106 274,105 271,101 Z",
  NO: "M 250,55 L 255,48 260,50 262,58 260,65 256,70 252,68 250,62 Z",
  SE: "M 258,50 L 263,44 268,48 269,58 266,65 262,68 258,62 256,55 Z",
  FI: "M 272,45 L 278,40 283,44 284,55 280,62 275,60 272,52 Z",
  GR: "M 268,115 L 272,112 276,114 276,120 273,124 269,122 267,118 Z",
  BG: "M 274,108 L 278,105 282,107 282,112 278,114 274,112 Z",
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
  EG: "M 278,148 L 285,142 292,145 295,152 292,160 286,165 280,162 276,155 Z",
  ZA: "M 275,272 L 282,268 292,268 300,272 304,280 300,288 292,292 282,290 276,284 274,278 Z",
  NG: "M 248,200 L 255,196 262,198 265,204 262,210 255,212 248,208 Z",
  KE: "M 308,218 L 314,214 320,216 322,222 318,228 312,228 308,224 Z",
  ET: "M 305,198 L 312,194 320,196 324,202 320,210 314,212 308,210 304,204 Z",
  TZ: "M 302,230 L 308,226 314,228 316,235 312,242 306,242 302,236 Z",
  MZ: "M 306,252 L 312,248 316,252 318,260 314,268 308,268 305,260 Z",
  AO: "M 268,238 L 275,234 282,236 284,244 280,250 272,250 268,244 Z",
  GH: "M 238,204 L 242,200 246,202 246,210 242,214 238,210 Z",
  CI: "M 228,204 L 232,200 237,202 238,208 234,212 228,210 Z",
  CM: "M 260,204 L 265,200 270,202 272,210 268,216 262,214 260,208 Z",
  SN: "M 210,192 L 216,190 220,192 220,196 216,198 210,196 Z",
  MG: "M 320,255 L 324,250 328,254 327,262 323,268 320,264 Z",
  MA: "M 228,142 L 235,138 242,140 242,148 236,152 228,150 Z",
  DZ: "M 240,138 L 250,132 260,135 262,148 258,155 248,158 240,155 236,148 Z",
  // Middle East
  IR: "M 320,120 L 332,115 345,118 352,125 350,135 345,142 335,145 325,142 318,135 316,128 Z",
  IQ: "M 305,120 L 312,115 320,118 322,125 318,132 312,135 305,132 302,126 Z",
  LB: "M 298,125 L 300,122 302,124 301,128 299,128 Z",
  SY: "M 298,115 L 305,112 312,114 312,120 308,124 300,124 296,120 Z",
  YE: "M 315,165 L 322,160 330,162 332,168 328,174 320,175 314,172 Z",
  SA: "M 305,138 L 315,132 325,135 332,142 335,152 330,160 320,162 310,158 305,150 Z",
  AE: "M 338,148 L 342,145 346,148 345,152 341,153 338,150 Z",
  OM: "M 340,152 L 345,148 350,152 348,160 344,162 340,158 Z",
  JO: "M 298,128 L 302,125 306,128 305,134 300,135 297,132 Z",
  IL: "M 296,128 L 298,126 300,128 299,134 297,135 295,132 Z",
  KW: "M 310,135 L 313,133 315,136 313,138 310,137 Z",
  QA: "M 322,148 L 324,146 326,148 325,152 323,152 Z",
  BH: "M 320,144 L 322,142 323,145 321,146 Z",
  // Asia
  AF: "M 348,118 L 356,112 365,115 368,122 365,128 358,132 350,130 346,124 Z",
  CN: "M 370,85 L 385,78 402,75 418,80 430,88 438,98 440,110 435,122 425,130 412,135 398,132 385,128 375,120 368,112 365,102 366,92 Z",
  KP: "M 438,98 L 442,94 446,96 447,102 444,105 440,104 Z",
  MM: "M 395,140 L 400,135 405,138 408,145 406,155 402,160 397,158 394,150 Z",
  IN: "M 358,135 L 368,128 378,130 385,138 390,150 388,162 382,172 374,175 366,170 360,160 355,150 354,142 Z",
  PK: "M 348,125 L 356,118 364,122 366,130 362,138 355,142 348,138 344,132 Z",
  BD: "M 390,148 L 394,144 398,146 398,152 395,155 391,153 Z",
  TH: "M 402,152 L 406,148 410,150 411,158 408,164 404,162 402,156 Z",
  VN: "M 412,140 L 416,136 420,140 418,150 415,158 412,155 410,148 Z",
  ID: "M 405,185 L 412,180 420,182 428,180 435,184 440,188 435,194 425,195 415,193 408,190 Z",
  JP: "M 448,95 L 452,90 456,92 458,100 455,108 450,110 447,105 446,98 Z",
  KR: "M 440,105 L 443,102 446,104 446,110 443,113 440,110 Z",
  PH: "M 432,155 L 436,150 440,153 439,160 436,164 432,162 Z",
  MY: "M 408,175 L 413,172 418,174 418,180 414,182 408,180 Z",
  KZ: "M 330,72 L 345,68 362,70 375,75 378,82 372,88 358,90 345,88 335,85 328,80 Z",
  UZ: "M 340,85 L 348,82 356,84 358,90 352,94 344,92 340,88 Z",
  TM: "M 328,95 L 336,92 344,94 346,100 340,104 332,102 328,98 Z",
  LK: "M 376,176 L 379,174 381,177 380,182 377,182 375,179 Z",
  NP: "M 370,132 L 376,128 382,130 382,136 378,138 372,136 Z",
  // Oceania
  AU: "M 418,252 L 432,245 448,248 460,255 465,268 458,280 445,285 432,282 420,275 415,265 Z",
  NZ: "M 472,280 L 476,276 480,280 478,288 474,290 470,286 Z",
  PG: "M 458,210 L 465,206 472,208 474,214 470,218 462,218 458,214 Z",
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
