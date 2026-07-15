import { useState } from "react";
import { usePartner } from "@/hooks/usePartner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  converted: "bg-green-100 text-green-800 border-green-200",
  paid: "bg-teal/10 text-teal border-teal/20",
  expired: "bg-slate-100 text-slate-800 border-slate-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export default function PartnerReferrals() {
  const { partner, referrals } = usePartner();
  const [copied, setCopied] = useState(false);
  if (!partner) return null;

  const referralUrl = `${window.location.origin}?ref=${partner.referral_code}`;

  const copy = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success("Referral link copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Referrals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Share your unique link — every conversion is tracked automatically.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your referral link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input readOnly value={referralUrl} className="font-mono text-xs" />
            <Button onClick={copy} variant="outline" className="shrink-0">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Referral code</Label>
              <div className="font-mono text-sm bg-muted/50 rounded-md px-3 py-2 border border-border mt-1">
                {partner.referral_code}
              </div>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Referred leads</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No referrals yet. Share your link to start earning.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground border-b border-border">
                  <tr>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Value</th>
                    <th className="pb-2 font-medium text-right">Commission</th>
                    <th className="pb-2 font-medium text-right">Converted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {referrals.map((r: any) => (
                    <tr key={r.id}>
                      <td className="py-2.5 truncate max-w-[220px]">{r.referred_email || "—"}</td>
                      <td className="py-2.5">
                        <Badge variant="outline" className={STATUS_COLOR[r.status] || ""}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right font-mono">
                        {r.conversion_value ? `€${Number(r.conversion_value).toLocaleString()}` : "—"}
                      </td>
                      <td className="py-2.5 text-right font-mono text-teal">
                        {r.commission_earned ? `€${Number(r.commission_earned).toLocaleString()}` : "—"}
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
