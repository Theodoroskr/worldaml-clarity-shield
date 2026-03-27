import { Badge } from "@/components/ui/badge";

interface Referral {
  id: string;
  referred_email: string | null;
  referral_code_used: string;
  status: string;
  conversion_value: number | null;
  commission_earned: number | null;
  created_at: string;
  converted_at: string | null;
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    clicked: "bg-blue-100 text-blue-800 border-blue-200",
    signed_up: "bg-amber-100 text-amber-800 border-amber-200",
    converted: "bg-green-100 text-green-800 border-green-200",
  };
  return <Badge className={map[status] || ""}>{status.replace("_", " ")}</Badge>;
};

const ReferralTable = ({ referrals }: { referrals: Referral[] }) => {
  if (referrals.length === 0) {
    return <p className="text-text-secondary text-sm py-8 text-center">No referrals yet. Share your link to get started!</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-divider text-left">
            <th className="pb-3 pr-4 font-semibold text-navy">Email</th>
            <th className="pb-3 pr-4 font-semibold text-navy">Status</th>
            <th className="pb-3 pr-4 font-semibold text-navy">Value</th>
            <th className="pb-3 pr-4 font-semibold text-navy">Commission</th>
            <th className="pb-3 font-semibold text-navy">Date</th>
          </tr>
        </thead>
        <tbody>
          {referrals.map((r) => (
            <tr key={r.id} className="border-b border-divider/50 hover:bg-surface-subtle transition-colors">
              <td className="py-3 pr-4 text-navy">{r.referred_email || "—"}</td>
              <td className="py-3 pr-4">{statusBadge(r.status)}</td>
              <td className="py-3 pr-4 text-text-secondary">{r.conversion_value != null ? `$${r.conversion_value.toFixed(2)}` : "—"}</td>
              <td className="py-3 pr-4 text-text-secondary">{r.commission_earned != null ? `$${r.commission_earned.toFixed(2)}` : "—"}</td>
              <td className="py-3 text-text-secondary">{new Date(r.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReferralTable;
