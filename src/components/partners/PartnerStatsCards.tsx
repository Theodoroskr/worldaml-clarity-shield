import { Card, CardContent } from "@/components/ui/card";
import { Users, MousePointerClick, DollarSign, Clock } from "lucide-react";

interface Props {
  totalReferrals: number;
  conversions: number;
  pendingCommission: number;
  totalEarned: number;
}

const PartnerStatsCards = ({ totalReferrals, conversions, pendingCommission, totalEarned }: Props) => {
  const stats = [
    { icon: MousePointerClick, label: "Total Referrals", value: totalReferrals, color: "text-blue-500" },
    { icon: Users, label: "Conversions", value: conversions, color: "text-teal" },
    { icon: Clock, label: "Pending Commission", value: `$${pendingCommission.toFixed(2)}`, color: "text-amber-500" },
    { icon: DollarSign, label: "Total Earned", value: `$${totalEarned.toFixed(2)}`, color: "text-green-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="pt-6 flex items-center gap-3">
            <s.icon className={`h-5 w-5 ${s.color}`} />
            <div>
              <p className="text-2xl font-bold text-navy">{s.value}</p>
              <p className="text-text-secondary text-sm">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PartnerStatsCards;
