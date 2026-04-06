import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const COUNTRY_NAMES: Record<string, string> = {
  MM:"Myanmar",HT:"Haiti",CD:"DR Congo",TD:"Chad",GQ:"Equatorial Guinea",VE:"Venezuela",
  LA:"Laos",GA:"Gabon",CF:"Central African Republic",GW:"Guinea-Bissau",CG:"Congo",
  CN:"China",DJ:"Djibouti",NE:"Niger",DZ:"Algeria",MG:"Madagascar",TM:"Turkmenistan",
  KH:"Cambodia",VN:"Vietnam",KM:"Comoros",NI:"Nicaragua",PG:"Papua New Guinea",KE:"Kenya",
  AO:"Angola",SZ:"Eswatini",TJ:"Tajikistan",TG:"Togo",GN:"Guinea",SR:"Suriname",CM:"Cameroon",
  SL:"Sierra Leone",MZ:"Mozambique",BJ:"Benin",SB:"Solomon Islands",MR:"Mauritania",
  LR:"Liberia",ML:"Mali",NG:"Nigeria",KW:"Kuwait",AE:"UAE",CI:"Côte d'Ivoire",LS:"Lesotho",
  ZW:"Zimbabwe",TH:"Thailand",KG:"Kyrgyzstan",ST:"São Tomé & Príncipe",LB:"Lebanon",
  IQ:"Iraq",NP:"Nepal",SA:"Saudi Arabia",PA:"Panama",GM:"Gambia",BF:"Burkina Faso",
  UG:"Uganda",RW:"Rwanda",BY:"Belarus",ET:"Ethiopia",TO:"Tonga",HN:"Honduras",IN:"India",
  SV:"El Salvador",TR:"Turkey",PK:"Pakistan",ZA:"South Africa",BD:"Bangladesh",MY:"Malaysia",
  BO:"Bolivia",TL:"Timor-Leste",BA:"Bosnia & Herzegovina",ID:"Indonesia",MX:"Mexico",
  TZ:"Tanzania",BT:"Bhutan",PH:"Philippines",AZ:"Azerbaijan",KN:"Saint Kitts & Nevis",
  CV:"Cape Verde",GT:"Guatemala",MW:"Malawi",BR:"Brazil",UA:"Ukraine",HK:"Hong Kong",
  SN:"Senegal",ZM:"Zambia",UZ:"Uzbekistan",QA:"Qatar",EG:"Egypt",RS:"Serbia",KZ:"Kazakhstan",
  BH:"Bahrain",CU:"Cuba",GY:"Guyana",HU:"Hungary",LK:"Sri Lanka",MT:"Malta",GH:"Ghana",
  BS:"Bahamas",DO:"Dominican Republic",CO:"Colombia",MA:"Morocco",BG:"Bulgaria",CR:"Costa Rica",
  DE:"Germany",VU:"Vanuatu",MN:"Mongolia",BB:"Barbados",EC:"Ecuador",PY:"Paraguay",
  MH:"Marshall Islands",PE:"Peru",GD:"Grenada",JO:"Jordan",US:"United States",RO:"Romania",
  JM:"Jamaica",NA:"Namibia",CY:"Cyprus",IT:"Italy",TN:"Tunisia",FJ:"Fiji",JP:"Japan",
  SG:"Singapore",MU:"Mauritius",MD:"Moldova",CA:"Canada",SC:"Seychelles",LC:"Saint Lucia",
  WS:"Samoa",NL:"Netherlands",KR:"South Korea",TW:"Taiwan",PL:"Poland",CH:"Switzerland",
  BE:"Belgium",AR:"Argentina",IE:"Ireland",SK:"Slovakia",AL:"Albania",ME:"Montenegro",
  GE:"Georgia",AT:"Austria",CL:"Chile",OM:"Oman",ES:"Spain",UY:"Uruguay",BN:"Brunei",
  MK:"North Macedonia",HR:"Croatia",DM:"Dominica",AU:"Australia",BW:"Botswana",TT:"Trinidad & Tobago",
  LI:"Liechtenstein",BZ:"Belize",IL:"Israel",VC:"St Vincent & Grenadines",GB:"United Kingdom",
  LT:"Lithuania",LV:"Latvia",FR:"France",GR:"Greece",AG:"Antigua & Barbuda",AM:"Armenia",
  LU:"Luxembourg",NR:"Nauru",PT:"Portugal",CZ:"Czech Republic",NZ:"New Zealand",NO:"Norway",
  SI:"Slovenia",AD:"Andorra",SE:"Sweden",EE:"Estonia",DK:"Denmark",SM:"San Marino",
  IS:"Iceland",FI:"Finland",IR:"Iran",KP:"North Korea",SY:"Syria",AF:"Afghanistan",
  YE:"Yemen",SO:"Somalia",LY:"Libya",SD:"Sudan",SS:"South Sudan",BI:"Burundi",
};

interface Props {
  baselScores: Record<string, number>;
}

type SortKey = "rank" | "code" | "name" | "score" | "risk";
type SortDir = "asc" | "desc";

function riskLabel(score: number): { label: string; color: string } {
  const s = Math.round(score * 10);
  if (s >= 80) return { label: "Critical", color: "bg-red-500/15 text-red-600 border-red-500/20" };
  if (s >= 60) return { label: "High", color: "bg-orange-500/15 text-orange-600 border-orange-500/20" };
  if (s >= 40) return { label: "Medium", color: "bg-yellow-500/15 text-yellow-700 border-yellow-500/20" };
  return { label: "Low", color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20" };
}

export default function CountryRiskTable({ baselScores }: Props) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const rows = useMemo(() => {
    return Object.entries(baselScores)
      .map(([code, score]) => ({
        code,
        name: COUNTRY_NAMES[code] || code,
        score,
        normalized: Math.round(score * 10),
        risk: riskLabel(score),
      }))
      .sort((a, b) => b.score - a.score)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, [baselScores]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = q ? rows.filter(r => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q)) : rows;

    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "rank": cmp = a.rank - b.rank; break;
        case "code": cmp = a.code.localeCompare(b.code); break;
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "score": cmp = a.score - b.score; break;
        case "risk": cmp = a.normalized - b.normalized; break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
    return list;
  }, [rows, search, sortKey, sortDir]);

  const toggle = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  const stats = useMemo(() => ({
    total: rows.length,
    critical: rows.filter(r => r.normalized >= 80).length,
    high: rows.filter(r => r.normalized >= 60 && r.normalized < 80).length,
    medium: rows.filter(r => r.normalized >= 40 && r.normalized < 60).length,
    low: rows.filter(r => r.normalized < 40).length,
  }), [rows]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, cls: "text-foreground" },
          { label: "Critical", value: stats.critical, cls: "text-red-600" },
          { label: "High", value: stats.high, cls: "text-orange-600" },
          { label: "Medium", value: stats.medium, cls: "text-yellow-700" },
          { label: "Low", value: stats.low, cls: "text-emerald-600" },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-3 text-center">
            <p className={cn("text-lg font-bold", s.cls)}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by country name or ISO code…"
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="max-h-[500px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
              <tr>
                {([
                  ["rank", "#", "w-14"],
                  ["code", "ISO", "w-16"],
                  ["name", "Country", ""],
                  ["score", "Basel Score", "w-28"],
                  ["risk", "Risk (0-100)", "w-28"],
                ] as [SortKey, string, string][]).map(([k, label, w]) => (
                  <th
                    key={k}
                    onClick={() => toggle(k)}
                    className={cn("px-3 py-2 text-left font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors", w)}
                  >
                    <span className="flex items-center gap-1">
                      {label} <SortIcon k={k} />
                    </span>
                  </th>
                ))}
                <th className="px-3 py-2 text-left font-medium text-muted-foreground w-24">Category</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Score Bar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.code} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 text-muted-foreground font-mono text-xs">{r.rank}</td>
                  <td className="px-3 py-2 font-mono text-xs font-semibold">{r.code}</td>
                  <td className="px-3 py-2 font-medium">{r.name}</td>
                  <td className="px-3 py-2 font-mono">{r.score.toFixed(2)}</td>
                  <td className="px-3 py-2 font-mono font-bold">{r.normalized}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className={cn("text-[10px] border", r.risk.color)}>{r.risk.label}</Badge>
                  </td>
                  <td className="px-3 py-2 w-32">
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          r.normalized >= 80 ? "bg-red-500" : r.normalized >= 60 ? "bg-orange-500" : r.normalized >= 40 ? "bg-yellow-500" : "bg-emerald-500"
                        )}
                        style={{ width: `${r.normalized}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">No countries match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Source: Basel Institute on Governance — Basel AML Index 2025 (Public Edition). FATF black-listed jurisdictions include manual overrides.
      </p>
    </div>
  );
}
