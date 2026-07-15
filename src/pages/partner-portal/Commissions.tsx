import { usePartner } from "@/hooks/usePartner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

const eur = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-slate-100 text-slate-800 border-slate-200",
};

export default function PartnerCommissions() {
  const { summary, payouts, referrals } = usePartner();

  const monthly = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of referrals as any[]) {
      if (!r.converted_at) continue;
      const key = new Date(r.converted_at).toISOString().slice(0, 7);
      map.set(key, (map.get(key) ?? 0) + Number(r.commission_earned || 0));
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-12)
      .map(([month, amount]) => ({ month, amount: Math.round(amount) }));
  }, [referrals]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Commissions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track earnings, pending balance and payout history.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat label="Lifetime earned" value={eur(summary.lifetimeEarned)} tone="text-teal" />
        <MiniStat label="Paid out" value={eur(summary.paid)} tone="text-green-700" />
        <MiniStat label="Pending" value={eur(summary.pending)} tone="text-amber-700" />
        <MiniStat label="Deals won value" value={eur(summary.wonDealsValue)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly commissions (last 12 months)</CardTitle>
        </CardHeader>
        <CardContent>
          {monthly.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No commission history yet.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: any) => [eur(Number(v)), "Commission"]}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--teal))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payout history</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No payouts on file yet. Pending balance is paid out monthly once minimum threshold is met.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground border-b border-border">
                  <tr>
                    <th className="pb-2 font-medium">Period</th>
                    <th className="pb-2 font-medium">Method</th>
                    <th className="pb-2 font-medium">Reference</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Amount</th>
                    <th className="pb-2 font-medium text-right">Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payouts.map((p: any) => (
                    <tr key={p.id}>
                      <td className="py-2.5 text-xs">
                        {p.period_start && p.period_end
                          ? `${new Date(p.period_start).toLocaleDateString()} → ${new Date(p.period_end).toLocaleDateString()}`
                          : "—"}
                      </td>
                      <td className="py-2.5 text-xs">{p.method || "—"}</td>
                      <td className="py-2.5 text-xs font-mono">{p.reference || "—"}</td>
                      <td className="py-2.5">
                        <Badge variant="outline" className={STATUS_COLOR[p.status] || ""}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right font-mono">€{Number(p.amount_eur).toLocaleString()}</td>
                      <td className="py-2.5 text-right text-xs text-muted-foreground">
                        {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "—"}
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

function MiniStat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-2xl font-bold mt-1 ${tone ?? "text-foreground"}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
