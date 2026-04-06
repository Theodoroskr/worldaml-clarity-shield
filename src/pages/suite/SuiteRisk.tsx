import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, ChevronRight, Search, SlidersHorizontal, Loader2, Shield, Globe, Users, ArrowUpDown, FileSearch, Banknote, BarChart3 } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

/*
 * ─── Basel AML Index 2025 (Public Edition) ───
 * Source: Basel Institute on Governance – index.baselgovernance.org/ranking
 * Scale: 0 (low risk) → 10 (high risk). We normalise to 0-100 for the scoring engine.
 * Countries not listed default to 50 (medium-unknown).
 * FATF black-list jurisdictions without a Basel score get 95.
 */
const BASEL_AML_SCORES: Record<string, number> = {
  // 1–10: Very High Risk
  MM: 8.18, HT: 8.12, CD: 7.63, TD: 7.56, GQ: 7.55, VE: 7.55,
  LA: 7.50, GA: 7.46, CF: 7.44, GW: 7.30,
  // 11–20
  CG: 7.27, CN: 7.26, DJ: 6.93, NE: 6.84, DZ: 6.82, MG: 6.77,
  TM: 6.73, KH: 6.72, VN: 6.69, KM: 6.67,
  // 21–30
  NI: 6.61, PG: 6.61, KE: 6.60, AO: 6.55, SZ: 6.51, TJ: 6.44,
  TG: 6.44, GN: 6.43, SR: 6.42, CM: 6.41,
  // 31–40
  SL: 6.41, MZ: 6.38, BJ: 6.33, SB: 6.31, MR: 6.29, LR: 6.26,
  ML: 6.22, NG: 6.18, KW: 6.13, AE: 6.11,
  // 41–50
  CI: 6.05, LS: 6.04, ZW: 5.99, TH: 5.98, KG: 5.96, ST: 5.96,
  LB: 5.93, IQ: 5.90, NP: 5.88, SA: 5.87,
  // 51–60
  PA: 5.83, GM: 5.76, BF: 5.75, UG: 5.72, RW: 5.71, BY: 5.70,
  ET: 5.68, TO: 5.67, HN: 5.66, IN: 5.66,
  // 61–70
  SV: 5.65, TR: 5.65, PK: 5.63, ZA: 5.63, BD: 5.62, MY: 5.60,
  BO: 5.58, TL: 5.58, BA: 5.54, ID: 5.52,
  // 71–80
  MX: 5.52, TZ: 5.51, BT: 5.49, PH: 5.48, AZ: 5.46, KN: 5.46,
  CV: 5.45, GT: 5.44, MW: 5.44, BR: 5.40,
  // 81–90
  UA: 5.38, HK: 5.37, SN: 5.36, ZM: 5.31, UZ: 5.27, QA: 5.25,
  EG: 5.22, RS: 5.21, KZ: 5.18, BH: 5.16,
  // 91–100
  CU: 5.16, GY: 5.16, HU: 5.16, LK: 5.16, MT: 5.15, GH: 5.13,
  BS: 5.08, DO: 5.08, CO: 5.05, MA: 5.04,
  // 101–110
  BG: 5.00, CR: 4.97, DE: 4.97, VU: 4.97, MN: 4.96, BB: 4.91,
  EC: 4.91, PY: 4.91, MH: 4.89, PE: 4.88,
  // 111–120
  GD: 4.85, JO: 4.85, US: 4.83, RO: 4.81, JM: 4.78, NA: 4.78,
  CY: 4.77, IT: 4.76, TN: 4.75, FJ: 4.73,
  // 121–130
  JP: 4.73, SG: 4.73, MU: 4.65, MD: 4.64, CA: 4.61, SC: 4.60,
  LC: 4.58, WS: 4.56, NL: 4.53, KR: 4.51,
  // 131–140
  TW: 4.49, PL: 4.49, CH: 4.47, BE: 4.46, AR: 4.44, IE: 4.40,
  SK: 4.38, AL: 4.36, ME: 4.33, GE: 4.32,
  // 141–150
  AT: 4.28, CL: 4.28, OM: 4.25, ES: 4.24, UY: 4.23, BN: 4.22,
  MK: 4.20, HR: 4.18, DM: 4.17, AU: 4.13,
  // 151–160
  BW: 4.12, TT: 4.12, LI: 4.11, BZ: 4.06, IL: 4.06, VC: 4.05,
  GB: 4.04, LT: 4.03, LV: 4.01, FR: 3.99,
  // 161–177
  GR: 3.99, AG: 3.98, AM: 3.98, LU: 3.97, NR: 3.88, PT: 3.83,
  CZ: 3.82, NZ: 3.76, NO: 3.73, SI: 3.49, AD: 3.48, SE: 3.48,
  EE: 3.25, DK: 3.18, SM: 3.08, IS: 3.04, FI: 3.03,
  // FATF black-list / sanctioned (no Basel score available)
  IR: 8.50, KP: 9.00, SY: 8.50, AF: 8.00, YE: 8.00, SO: 8.00,
  LY: 7.80, SD: 7.80, SS: 8.00, BI: 7.00,
};

/* ─── Risk factor weights (total = 100) ─── */
const WEIGHTS = {
  country: 20,
  screening: 25,
  transaction: 20,
  customerType: 15,
  kycStatus: 20,
};

/* ─── Types ─── */
interface Customer {
  id: string;
  name: string;
  risk_level: string;
  kyc_status: string;
  country: string | null;
  type: string;
  email: string | null;
  created_at: string;
}

interface RiskBreakdown {
  country: number;
  screening: number;
  transaction: number;
  customerType: number;
  kycStatus: number;
  composite: number;
}

interface ScoredCustomer extends Customer {
  breakdown: RiskBreakdown;
}

/* ─── Scoring functions ─── */
function scoreCountry(country: string | null): number {
  if (!country) return 50; // unknown = medium risk
  const c = country.toUpperCase();
  const baselScore = BASEL_AML_SCORES[c];
  if (baselScore !== undefined) {
    // Normalise Basel 0-10 scale → 0-100 risk score
    return Math.round(baselScore * 10);
  }
  return 50; // unlisted country = medium risk
}

function scoreScreening(matchCount: number, hasMatches: boolean): number {
  if (matchCount >= 5) return 100;
  if (matchCount >= 3) return 85;
  if (matchCount >= 1) return 60;
  if (hasMatches) return 40;
  return 10;
}

function scoreTransactions(flaggedCount: number, totalCount: number, totalVolume: number): number {
  if (totalCount === 0) return 10;
  const flagRatio = flaggedCount / totalCount;
  let score = 10;
  if (flagRatio >= 0.3) score += 40;
  else if (flagRatio >= 0.1) score += 20;
  else if (flaggedCount > 0) score += 10;
  if (totalVolume > 500000) score += 30;
  else if (totalVolume > 100000) score += 20;
  else if (totalVolume > 50000) score += 10;
  if (flaggedCount >= 5) score += 20;
  else if (flaggedCount >= 2) score += 10;
  return Math.min(score, 100);
}

function scoreCustomerType(type: string): number {
  switch (type) {
    case "corporate": return 55;
    case "trust": return 70;
    case "pep": return 90;
    default: return 25; // individual
  }
}

function scoreKycStatus(status: string): number {
  switch (status) {
    case "rejected": return 90;
    case "pending": return 65;
    case "expired": return 75;
    case "verified": return 10;
    default: return 50;
  }
}

function computeComposite(b: Omit<RiskBreakdown, "composite">): number {
  return Math.round(
    (b.country * WEIGHTS.country +
      b.screening * WEIGHTS.screening +
      b.transaction * WEIGHTS.transaction +
      b.customerType * WEIGHTS.customerType +
      b.kycStatus * WEIGHTS.kycStatus) / 100
  );
}

/* ─── Visual helpers ─── */
const riskColor = (r: number) => r >= 75 ? "text-destructive" : r >= 55 ? "text-amber-600" : r >= 35 ? "text-foreground" : "text-emerald-600";
const riskBg = (r: number) => r >= 75 ? "bg-destructive" : r >= 55 ? "bg-amber-400" : r >= 35 ? "bg-primary" : "bg-emerald-500";
const riskBadge = (r: number) => r >= 75 ? "bg-red-50 text-red-700 border-red-200" : r >= 55 ? "bg-amber-50 text-amber-700 border-amber-200" : r >= 35 ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-emerald-50 text-emerald-700 border-emerald-200";
const riskLabel = (r: number) => r >= 75 ? "Critical" : r >= 55 ? "High" : r >= 35 ? "Medium" : "Low";

const PIE_COLORS = ["hsl(142,71%,45%)", "hsl(221,83%,53%)", "hsl(38,92%,50%)", "hsl(0,84%,60%)"];

/* ─── Component ─── */
export default function SuiteRisk() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"risk" | "name">("risk");
  const [customers, setCustomers] = useState<ScoredCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: custs }, { data: screenings }, { data: transactions }] = await Promise.all([
        supabase.from("suite_customers").select("id, name, risk_level, kyc_status, country, type, email, created_at").order("created_at", { ascending: false }),
        supabase.from("suite_screenings").select("customer_id, match_count, result"),
        supabase.from("suite_transactions").select("customer_id, risk_flag, amount"),
      ]);

      // Aggregate screening data per customer
      const screeningMap = new Map<string, { totalMatches: number; hasMatches: boolean }>();
      (screenings || []).forEach((s: any) => {
        const prev = screeningMap.get(s.customer_id) || { totalMatches: 0, hasMatches: false };
        prev.totalMatches += s.match_count || 0;
        if (s.result !== "clear") prev.hasMatches = true;
        screeningMap.set(s.customer_id, prev);
      });

      // Aggregate transaction data per customer
      const txMap = new Map<string, { flaggedCount: number; totalCount: number; totalVolume: number }>();
      (transactions || []).forEach((t: any) => {
        const prev = txMap.get(t.customer_id) || { flaggedCount: 0, totalCount: 0, totalVolume: 0 };
        prev.totalCount++;
        prev.totalVolume += Number(t.amount) || 0;
        if (t.risk_flag) prev.flaggedCount++;
        txMap.set(t.customer_id, prev);
      });

      const scored: ScoredCustomer[] = (custs || []).map((c: any) => {
        const scr = screeningMap.get(c.id) || { totalMatches: 0, hasMatches: false };
        const tx = txMap.get(c.id) || { flaggedCount: 0, totalCount: 0, totalVolume: 0 };
        const breakdown = {
          country: scoreCountry(c.country),
          screening: scoreScreening(scr.totalMatches, scr.hasMatches),
          transaction: scoreTransactions(tx.flaggedCount, tx.totalCount, tx.totalVolume),
          customerType: scoreCustomerType(c.type),
          kycStatus: scoreKycStatus(c.kyc_status),
          composite: 0,
        };
        breakdown.composite = computeComposite(breakdown);
        return { ...c, breakdown };
      });

      setCustomers(scored);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const filtered = useMemo(() =>
    customers
      .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.email || "").toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => sort === "risk" ? b.breakdown.composite - a.breakdown.composite : a.name.localeCompare(b.name)),
    [customers, search, sort]
  );

  // Stats
  const avgScore = customers.length ? Math.round(customers.reduce((s, c) => s + c.breakdown.composite, 0) / customers.length) : 0;
  const criticalCount = customers.filter(c => c.breakdown.composite >= 75).length;
  const highCount = customers.filter(c => c.breakdown.composite >= 55 && c.breakdown.composite < 75).length;
  const mediumCount = customers.filter(c => c.breakdown.composite >= 35 && c.breakdown.composite < 55).length;
  const lowCount = customers.filter(c => c.breakdown.composite < 35).length;

  const distributionData = [
    { range: "0–20", count: customers.filter(c => c.breakdown.composite <= 20).length },
    { range: "21–40", count: customers.filter(c => c.breakdown.composite > 20 && c.breakdown.composite <= 40).length },
    { range: "41–60", count: customers.filter(c => c.breakdown.composite > 40 && c.breakdown.composite <= 60).length },
    { range: "61–80", count: customers.filter(c => c.breakdown.composite > 60 && c.breakdown.composite <= 80).length },
    { range: "81–100", count: customers.filter(c => c.breakdown.composite > 80).length },
  ];

  const pieData = [
    { name: "Low", value: lowCount },
    { name: "Medium", value: mediumCount },
    { name: "High", value: highCount },
    { name: "Critical", value: criticalCount },
  ].filter(d => d.value > 0);

  // Top risk drivers across portfolio
  const avgDrivers = customers.length ? [
    { label: "Country", value: Math.round(customers.reduce((s, c) => s + c.breakdown.country, 0) / customers.length), icon: Globe, weight: WEIGHTS.country },
    { label: "Screening", value: Math.round(customers.reduce((s, c) => s + c.breakdown.screening, 0) / customers.length), icon: FileSearch, weight: WEIGHTS.screening },
    { label: "Transactions", value: Math.round(customers.reduce((s, c) => s + c.breakdown.transaction, 0) / customers.length), icon: Banknote, weight: WEIGHTS.transaction },
    { label: "Entity Type", value: Math.round(customers.reduce((s, c) => s + c.breakdown.customerType, 0) / customers.length), icon: Users, weight: WEIGHTS.customerType },
    { label: "KYC Status", value: Math.round(customers.reduce((s, c) => s + c.breakdown.kycStatus, 0) / customers.length), icon: Shield, weight: WEIGHTS.kycStatus },
  ] : [];

  const radarData = avgDrivers.map(d => ({ label: d.label, score: d.value }));

  return (
    <div className="p-6 space-y-5 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Risk Assessment Engine</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Composite scoring across 5 risk dimensions · Weights: Country {WEIGHTS.country}% · Screening {WEIGHTS.screening}% · Transactions {WEIGHTS.transaction}% · Entity {WEIGHTS.customerType}% · KYC {WEIGHTS.kycStatus}%
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard label="Portfolio Avg Score" value={avgScore} sub={`of ${customers.length} customers`} color={riskColor(avgScore)} icon={<BarChart3 className="w-4 h-4" />} />
            <SummaryCard label="Critical Risk" value={criticalCount} sub="score ≥ 75" color="text-destructive" icon={<AlertTriangle className="w-4 h-4" />} />
            <SummaryCard label="High Risk" value={highCount} sub="score 55–74" color="text-amber-600" icon={<AlertTriangle className="w-4 h-4" />} />
            <SummaryCard label="Low / Medium" value={lowCount + mediumCount} sub="score < 55" color="text-emerald-600" icon={<Shield className="w-4 h-4" />} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Distribution */}
            <div className="bg-card rounded-xl border border-border">
              <div className="px-4 py-3 border-b border-border"><h2 className="font-semibold text-foreground text-sm">Score Distribution</h2></div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={distributionData} margin={{ top: 0, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="range" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" name="Customers" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Breakdown Radar */}
            <div className="bg-card rounded-xl border border-border">
              <div className="px-4 py-3 border-b border-border"><h2 className="font-semibold text-foreground text-sm">Portfolio Risk Profile</h2></div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={160}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="label" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                    <PolarRadiusAxis tick={false} domain={[0, 100]} axisLine={false} />
                    <Radar name="Avg Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie */}
            <div className="bg-card rounded-xl border border-border">
              <div className="px-4 py-3 border-b border-border"><h2 className="font-semibold text-foreground text-sm">Risk Categories</h2></div>
              <div className="p-4 flex items-center gap-4">
                <ResponsiveContainer width="50%" height={140}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={2}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[["Low", "Medium", "High", "Critical"].indexOf(pieData[i].name)]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5">
                  {[{ label: "Low", color: PIE_COLORS[0], count: lowCount }, { label: "Medium", color: PIE_COLORS[1], count: mediumCount }, { label: "High", color: PIE_COLORS[2], count: highCount }, { label: "Critical", color: PIE_COLORS[3], count: criticalCount }].map(r => (
                    <div key={r.label} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className="font-semibold text-foreground">{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Factor Weights */}
          <div className="bg-card rounded-xl border border-border">
            <div className="px-4 py-3 border-b border-border"><h2 className="font-semibold text-foreground text-sm">Risk Factor Analysis (Portfolio Averages)</h2></div>
            <div className="p-4 grid grid-cols-5 gap-3">
              {avgDrivers.map(d => {
                const Icon = d.icon;
                return (
                  <div key={d.label} className="text-center space-y-1.5">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{d.label}</span>
                    </div>
                    <div className={cn("text-lg font-bold font-mono", riskColor(d.value))}>{d.value}</div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", riskBg(d.value))} style={{ width: `${d.value}%` }} />
                    </div>
                    <div className="text-[10px] text-muted-foreground">{d.weight}% weight</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Table */}
          <div className="bg-card rounded-xl border border-border">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-foreground text-sm">Customer Risk Scores</h2>
                <p className="text-xs text-muted-foreground">{filtered.length} of {customers.length} customers</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="pl-7 py-1.5 text-xs rounded border border-border bg-background text-foreground w-40 focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <button onClick={() => setSort(s => s === "risk" ? "name" : "risk")} className="flex items-center gap-1 text-xs px-2 py-1.5 rounded border border-border hover:bg-muted transition-colors text-muted-foreground">
                  <ArrowUpDown className="w-3 h-3" /> {sort === "risk" ? "Risk ↓" : "A–Z"}
                </button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">No customers found.</div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map(c => (
                  <div key={c.id}>
                    <div
                      className="flex items-center px-4 py-3 hover:bg-muted/20 transition-colors cursor-pointer group"
                      onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground text-sm truncate">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.email || "—"} · {c.type} · {c.country || "N/A"}</div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                            <div className={cn("h-full rounded-full", riskBg(c.breakdown.composite))} style={{ width: `${c.breakdown.composite}%` }} />
                          </div>
                          <span className={cn("text-sm font-mono font-bold w-8 text-right", riskColor(c.breakdown.composite))}>{c.breakdown.composite}</span>
                        </div>
                        <Badge variant="outline" className={cn("text-xs font-semibold", riskBadge(c.breakdown.composite))}>
                          {riskLabel(c.breakdown.composite)}
                        </Badge>
                        <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", expandedId === c.id && "rotate-90")} />
                      </div>
                    </div>

                    {/* Expanded breakdown */}
                    {expandedId === c.id && (
                      <div className="px-4 pb-4 pt-1 bg-muted/10">
                        <div className="grid grid-cols-5 gap-3">
                          <FactorBar label="Country" icon={Globe} value={c.breakdown.country} weight={WEIGHTS.country} />
                          <FactorBar label="Screening" icon={FileSearch} value={c.breakdown.screening} weight={WEIGHTS.screening} />
                          <FactorBar label="Transactions" icon={Banknote} value={c.breakdown.transaction} weight={WEIGHTS.transaction} />
                          <FactorBar label="Entity Type" icon={Users} value={c.breakdown.customerType} weight={WEIGHTS.customerType} />
                          <FactorBar label="KYC Status" icon={Shield} value={c.breakdown.kycStatus} weight={WEIGHTS.kycStatus} />
                        </div>
                        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>KYC: <span className="capitalize font-medium text-foreground">{c.kyc_status}</span></span>
                          <span>·</span>
                          <span>Stored Risk: <span className="capitalize font-medium text-foreground">{c.risk_level}</span></span>
                          <span>·</span>
                          <span>Composite: <span className={cn("font-bold font-mono", riskColor(c.breakdown.composite))}>{c.breakdown.composite}/100</span></span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Sub-components ─── */
function SummaryCard({ label, value, sub, color, icon }: { label: string; value: number; sub: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">{icon}<span>{label}</span></div>
      <div className={cn("text-2xl font-bold font-mono", color)}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function FactorBar({ label, icon: Icon, value, weight }: { label: string; icon: any; value: number; weight: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-xs text-muted-foreground"><Icon className="w-3 h-3" />{label}</div>
      <div className="flex items-center gap-1.5">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className={cn("h-full rounded-full", riskBg(value))} style={{ width: `${value}%` }} />
        </div>
        <span className={cn("text-xs font-mono font-bold", riskColor(value))}>{value}</span>
      </div>
      <div className="text-[10px] text-muted-foreground">{weight}% weight · contributes {Math.round(value * weight / 100)} pts</div>
    </div>
  );
}
