import { usePartner } from "@/hooks/usePartner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "lucide-react";

const eur = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-slate-100 text-slate-800 border-slate-200",
};

export default function PartnerPayouts() {
  const { payouts, summary, partner } = usePartner();
  const next = (payouts as any[]).find((p) => p.status !== "paid" && p.status !== "cancelled");

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Payouts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Payments issued by WorldAML against approved commission. Amounts and status are set internally.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Next payout</div>
            <div className="text-xl font-bold mt-1 text-foreground">
              {next ? eur(Number(next.amount_eur)) : "—"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {next ? `${next.status}${next.period_end ? ` · period to ${new Date(next.period_end).toLocaleDateString()}` : ""}` : "None scheduled"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total paid</div>
            <div className="text-xl font-bold mt-1 text-green-700">{eur(summary.paid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Payout method</div>
            <div className="text-sm font-medium mt-2 text-foreground capitalize">
              {partner?.payout_method || "Not set"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payout history</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-10">
              <Wallet className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No payouts yet. Payouts appear here once approved commission is scheduled for payment.
              </p>
            </div>
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
                    <th className="pb-2 font-medium text-right">Payment date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(payouts as any[]).map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 text-xs">
                        {p.period_start && p.period_end
                          ? `${new Date(p.period_start).toLocaleDateString()} → ${new Date(p.period_end).toLocaleDateString()}`
                          : "—"}
                      </td>
                      <td className="py-2.5 text-xs capitalize">{p.method || "—"}</td>
                      <td className="py-2.5 text-xs font-mono">{p.reference || "—"}</td>
                      <td className="py-2.5">
                        <Badge variant="outline" className={STATUS_COLOR[p.status] || ""}>{p.status}</Badge>
                      </td>
                      <td className="py-2.5 text-right font-mono">{eur(Number(p.amount_eur))}</td>
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
