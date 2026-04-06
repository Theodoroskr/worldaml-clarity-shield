import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Activity, AlertTriangle, TrendingUp, Globe, RefreshCw } from "lucide-react";

interface TxRow {
  id: string; time: string; sender: string; receiver: string; amount: number;
  currency: string; country: string; countryCode: string; type: string;
  riskScore: number; status: "Clean" | "Review" | "Flagged" | "Blocked";
}

const COUNTRIES: [string, string][] = [
  ["Cyprus", "CY"], ["Greece", "GR"], ["Malta", "MT"], ["Germany", "DE"],
  ["Russia", "RU"], ["Iran", "IR"], ["UAE", "AE"], ["UK", "GB"],
  ["Panama", "PA"], ["Switzerland", "CH"],
];
const HIGH_RISK = ["RU", "IR", "PA"];
const TXN_TYPES = ["Wire Transfer", "Cash Deposit", "Card Payment", "SWIFT", "Crypto Convert", "Internal Transfer"];
const NAMES = ["John Cameron", "Maria P.", "Nikos S.", "Elena K.", "Costas V.", "Sofia A.", "Andreas N.", "Dimitris C."];

let counter = 100;
function generateTx(): TxRow {
  counter++;
  const amount = Math.round(Math.random() * 49000 + 1000);
  const [country, code] = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  const isHighRisk = HIGH_RISK.includes(code);
  const isLarge = amount > 30000;
  const risk = Math.min(100, Math.round((isHighRisk ? 40 : 0) + (isLarge ? 30 : 0) + Math.random() * 30));
  const status: TxRow["status"] = risk >= 80 ? "Flagged" : risk >= 60 ? "Review" : "Clean";
  const now = new Date();
  return { id: `TXN-${counter}`, time: `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}:${now.getSeconds().toString().padStart(2,"0")}`, sender: NAMES[Math.floor(Math.random() * NAMES.length)], receiver: NAMES[Math.floor(Math.random() * NAMES.length)], amount, currency: "EUR", country, countryCode: code, type: TXN_TYPES[Math.floor(Math.random() * TXN_TYPES.length)], riskScore: risk, status };
}

const INITIAL_TXS: TxRow[] = Array.from({ length: 18 }, () => generateTx()).reverse();

const statusStyle: Record<TxRow["status"], string> = {
  Clean: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Review: "bg-amber-50 text-amber-700 border-amber-200",
  Flagged: "bg-red-50 text-red-700 border-red-200",
  Blocked: "bg-slate-100 text-slate-600 border-slate-200",
};

const riskColor = (s: number) => s >= 80 ? "text-destructive" : s >= 60 ? "text-amber-600" : "text-emerald-600";

export default function SuiteTransactions() {
  const [txs, setTxs] = useState<TxRow[]>(INITIAL_TXS);
  const [live, setLive] = useState(true);
  const [filter, setFilter] = useState<"All" | TxRow["status"]>("All");

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => { setTxs((prev) => [generateTx(), ...prev.slice(0, 49)]); }, 3000);
    return () => clearInterval(id);
  }, [live]);

  const filtered = filter === "All" ? txs : txs.filter((t) => t.status === filter);
  const stats = { total: txs.length, flagged: txs.filter((t) => t.status === "Flagged").length, review: txs.filter((t) => t.status === "Review").length, volume: txs.reduce((s, t) => s + t.amount, 0) };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className={cn("w-2 h-2 rounded-full", live ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground")} />
          <span className="text-sm font-semibold text-foreground">Transaction Monitor</span>
          <span className="text-xs text-muted-foreground">{live ? "Live Feed" : "Paused"}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLive(!live)} className={cn("flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border font-medium transition-colors", live ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border bg-muted text-muted-foreground")}>
            <Activity className="w-3 h-3" />{live ? "Live" : "Paused"}
          </button>
          <button onClick={() => setTxs(Array.from({ length: 18 }, () => generateTx()).reverse())} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-border hover:bg-muted transition-colors text-foreground"><RefreshCw className="w-3 h-3" />Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-0 border-b border-border bg-card shrink-0">
        {[
          { label: "Total", value: stats.total, icon: TrendingUp, color: "text-primary" },
          { label: "Flagged", value: stats.flagged, icon: AlertTriangle, color: "text-destructive" },
          { label: "Review", value: stats.review, icon: Activity, color: "text-amber-600" },
          { label: "Volume", value: `€${stats.volume.toLocaleString()}`, icon: Globe, color: "text-foreground" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-3 px-5 py-3 border-r border-border last:border-r-0">
            <Icon className={cn("w-4 h-4 shrink-0", color)} />
            <div>
              <div className={cn("text-lg font-bold font-mono", color)}>{value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 px-5 py-2 border-b border-border bg-card shrink-0">
        {(["All", "Clean", "Review", "Flagged"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={cn("text-xs px-3 py-1 rounded-full border font-medium transition-colors", filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary")}>
            {s}{s !== "All" && <span className="ml-1 font-mono">{txs.filter(t => t.status === s).length}</span>}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-card border-b border-border z-10">
            <tr>{["Time", "ID", "Sender", "Receiver", "Amount", "Type", "Country", "Risk", "Status"].map((h) => (<th key={h} className="px-3 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">{h}</th>))}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((tx) => (
              <tr key={tx.id} className={cn("hover:bg-muted/30 transition-colors", tx.status === "Flagged" && "bg-red-50/40", tx.status === "Review" && "bg-amber-50/20")}>
                <td className="px-3 py-2.5 font-mono text-muted-foreground">{tx.time}</td>
                <td className="px-3 py-2.5 font-mono font-bold text-primary">{tx.id}</td>
                <td className="px-3 py-2.5 text-foreground font-medium truncate max-w-[100px]">{tx.sender}</td>
                <td className="px-3 py-2.5 text-muted-foreground truncate max-w-[100px]">{tx.receiver}</td>
                <td className="px-3 py-2.5 font-mono font-bold text-foreground">€{tx.amount.toLocaleString()}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{tx.type}</td>
                <td className="px-3 py-2.5">
                  <span className={cn("flex items-center gap-1", HIGH_RISK.includes(tx.countryCode) ? "text-destructive font-semibold" : "text-muted-foreground")}>
                    {HIGH_RISK.includes(tx.countryCode) && <AlertTriangle className="w-3 h-3" />}{tx.country}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden"><div className={cn("h-full rounded-full", tx.riskScore >= 80 ? "bg-destructive" : tx.riskScore >= 60 ? "bg-amber-400" : "bg-emerald-400")} style={{ width: `${tx.riskScore}%` }} /></div>
                    <span className={cn("font-mono font-bold text-[11px]", riskColor(tx.riskScore))}>{tx.riskScore}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5"><span className={cn("px-2 py-0.5 rounded border font-medium text-[10px]", statusStyle[tx.status])}>{tx.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
