import { useMemo, useState } from "react";
import { usePartner } from "@/hooks/usePartner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, MousePointerClick, UserPlus, BadgeCheck, TrendingUp, Euro, Link2 } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLOR: Record<string, string> = {
  clicked: "bg-slate-100 text-slate-700 border-slate-200",
  signed_up: "bg-amber-100 text-amber-800 border-amber-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  converted: "bg-green-100 text-green-800 border-green-200",
  paid: "bg-teal/10 text-teal border-teal/20",
  expired: "bg-slate-100 text-slate-700 border-slate-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  clicked: "Clicked",
  signed_up: "Signed up",
  pending: "Pending",
  converted: "Converted",
  paid: "Paid",
  expired: "Expired",
  rejected: "Rejected",
};

const SOURCE_LABEL: Record<string, string> = {
  contact_sales: "Contact sales",
  academy_checkout: "Academy checkout",
  signup: "Sign-up",
  link: "Referral link",
};

const eur = (n: number) => `€${Math.round(n).toLocaleString()}`;

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Icon className={`w-3.5 h-3.5 ${accent ? "text-teal" : ""}`} />
          {label}
        </div>
        <div className={`mt-2 text-2xl font-bold tabular-nums ${accent ? "text-teal" : "text-foreground"}`}>
          {value}
        </div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}

export default function PartnerReferrals() {
  const { partner, referrals } = usePartner();
  const [copied, setCopied] = useState<"link" | "code" | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const referralUrl = partner ? `${window.location.origin}?ref=${partner.referral_code}` : "";

  const stats = useMemo(() => {
    const list = referrals as any[];
    const count = (s: string) => list.filter((r) => r.status === s).length;
    const converted = list.filter((r) => ["converted", "paid"].includes(r.status));
    const value = list.reduce((s, r) => s + Number(r.conversion_value || 0), 0);
    const commission = list.reduce((s, r) => s + Number(r.commission_earned || 0), 0);
    const bySource = list.reduce<Record<string, { total: number; converted: number }>>((acc, r) => {
      const key = r.source || "link";
      acc[key] = acc[key] || { total: 0, converted: 0 };
      acc[key].total += 1;
      if (["converted", "paid"].includes(r.status)) acc[key].converted += 1;
      return acc;
    }, {});
    const last30 = list.filter(
      (r) => new Date(r.created_at).getTime() > Date.now() - 30 * 864e5,
    ).length;
    return {
      total: list.length,
      clicked: count("clicked"),
      signedUp: count("signed_up") + count("pending"),
      converted: converted.length,
      rate: list.length ? Math.round((converted.length / list.length) * 100) : 0,
      value,
      commission,
      bySource: Object.entries(bySource).sort((a, b) => b[1].total - a[1].total),
      last30,
    };
  }, [referrals]);

  if (!partner) return null;

  const copy = async (text: string, what: "link" | "code") => {
    await navigator.clipboard.writeText(text);
    setCopied(what);
    toast.success(what === "link" ? "Referral link copied" : "Referral code copied");
    setTimeout(() => setCopied(null), 1500);
  };

  const filtered =
    filter === "all"
      ? (referrals as any[])
      : (referrals as any[]).filter((r) =>
          filter === "converted" ? ["converted", "paid"].includes(r.status) : r.status === filter,
        );

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Referrals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every use of your code or link is tracked — from first click through to paid commission.
        </p>
      </div>

      {/* Tracking dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Kpi icon={MousePointerClick} label="Clicks" value={String(stats.clicked)} sub="Link opened" />
        <Kpi icon={UserPlus} label="Sign-ups" value={String(stats.signedUp)} sub="Code submitted" />
        <Kpi icon={BadgeCheck} label="Converted" value={String(stats.converted)} sub="Became customers" />
        <Kpi
          icon={TrendingUp}
          label="Conversion rate"
          value={`${stats.rate}%`}
          sub={`${stats.total} attributed total`}
        />
        <Kpi
          icon={Euro}
          label="Commission earned"
          value={eur(stats.commission)}
          sub={`${eur(stats.value)} tracked value`}
          accent
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="w-4 h-4 text-teal" /> Your referral link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input readOnly value={referralUrl} className="font-mono text-xs" />
              <Button onClick={() => copy(referralUrl, "link")} variant="outline" className="shrink-0">
                {copied === "link" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Referral code</Label>
                <button
                  type="button"
                  onClick={() => copy(partner.referral_code, "code")}
                  className="w-full text-left font-mono text-sm bg-muted/50 hover:bg-muted rounded-md px-3 py-2 border border-border mt-1 transition-colors"
                >
                  {partner.referral_code}
                </button>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Commission rate</Label>
                <div className="font-mono text-sm bg-muted/50 rounded-md px-3 py-2 border border-border mt-1">
                  {Math.round(Number(partner.commission_rate) * 100)}%
                  {partner.commission_lifetime_months
                    ? ` · for ${partner.commission_lifetime_months} months`
                    : ""}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Prospects can also type your code manually on the contact sales form or at Academy checkout —
              both are attributed to you automatically.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Where referrals come from</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.bySource.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No attributed activity yet.</p>
            ) : (
              stats.bySource.map(([source, s]) => {
                const pct = stats.total ? (s.total / stats.total) * 100 : 0;
                return (
                  <div key={source}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground/90">{SOURCE_LABEL[source] ?? source}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {s.total} · {s.converted} won
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted mt-1.5 overflow-hidden">
                      <div className="h-full bg-teal rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
            <div className="pt-2 border-t border-border text-xs text-muted-foreground">
              {stats.last30} new in the last 30 days
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between gap-3 flex-wrap space-y-0">
          <CardTitle className="text-base">Attributed activity</CardTitle>
          <div className="flex flex-wrap gap-1.5">
            {[
              ["all", "All"],
              ["clicked", "Clicks"],
              ["signed_up", "Sign-ups"],
              ["converted", "Converted"],
            ].map(([k, label]) => (
              <Button
                key={k}
                size="sm"
                variant={filter === k ? "default" : "outline"}
                className="h-7 px-3 text-xs"
                onClick={() => setFilter(k)}
              >
                {label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {referrals.length === 0
                ? "No referrals yet. Share your link to start earning."
                : "No referrals match this filter."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground border-b border-border">
                  <tr>
                    <th className="pb-2 font-medium">Contact</th>
                    <th className="pb-2 font-medium">Source</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Value</th>
                    <th className="pb-2 font-medium text-right">Commission</th>
                    <th className="pb-2 font-medium text-right">First seen</th>
                    <th className="pb-2 font-medium text-right">Converted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((r: any) => (
                    <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-2.5 truncate max-w-[220px]">
                        {r.referred_email || <span className="text-muted-foreground">Anonymous visit</span>}
                        {r.referral_code_used && (
                          <div className="text-[11px] font-mono text-muted-foreground">
                            {r.referral_code_used}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 text-muted-foreground text-xs">
                        {SOURCE_LABEL[r.source] ?? r.source ?? "Referral link"}
                      </td>
                      <td className="py-2.5">
                        <Badge variant="outline" className={STATUS_COLOR[r.status] || ""}>
                          {STATUS_LABEL[r.status] ?? r.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right font-mono">
                        {r.conversion_value ? eur(Number(r.conversion_value)) : "—"}
                      </td>
                      <td className="py-2.5 text-right font-mono text-teal">
                        {r.commission_earned ? eur(Number(r.commission_earned)) : "—"}
                      </td>
                      <td className="py-2.5 text-right text-xs text-muted-foreground">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-2.5 text-right text-xs text-muted-foreground">
                        {r.converted_at ? new Date(r.converted_at).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
