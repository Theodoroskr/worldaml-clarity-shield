import { AlertTriangle, ClipboardList, FileSignature, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  pendingApplications: number;
  moreInfoApplications: number;
  pendingDeals: number;
  accessIssues: number;
  onReviewApplications: () => void;
  onReviewDeals: () => void;
  onReviewAccess: () => void;
}

function Item({
  count, label, hint, tone, icon: Icon, cta, onClick,
}: {
  count: number; label: string; hint: string;
  tone: "amber" | "blue" | "red" | "green";
  icon: any; cta: string; onClick: () => void;
}) {
  const tones: Record<string, string> = {
    amber: "border-amber-200 bg-amber-50/60 text-amber-900",
    blue: "border-blue-200 bg-blue-50/60 text-blue-900",
    red: "border-red-200 bg-red-50/60 text-red-900",
    green: "border-green-200 bg-green-50/50 text-green-900",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 min-w-[220px] text-left rounded-lg border p-4 transition-shadow hover:shadow-sm",
        tones[tone],
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 shrink-0 opacity-80" />
        <div className="min-w-0">
          <div className="text-2xl font-bold leading-none">{count}</div>
          <div className="text-sm font-semibold mt-1">{label}</div>
          <div className="text-xs opacity-80">{hint}</div>
          <span className="mt-2 inline-block text-xs font-semibold underline underline-offset-2">
            {cta}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function PartnerActionCentre({
  pendingApplications, moreInfoApplications, pendingDeals, accessIssues,
  onReviewApplications, onReviewDeals, onReviewAccess,
}: Props) {
  const nothingToDo =
    pendingApplications === 0 && pendingDeals === 0 && accessIssues === 0 && moreInfoApplications === 0;

  return (
    <Card className="border-l-4 border-l-teal">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-teal" />
          <h2 className="text-sm font-semibold text-navy uppercase tracking-wide">Action required</h2>
        </div>
        {nothingToDo ? (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Nothing needs your attention right now.
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <Item
              count={pendingApplications}
              label={pendingApplications === 1 ? "Partner application awaiting review" : "Partner applications awaiting review"}
              hint={moreInfoApplications > 0 ? `${moreInfoApplications} awaiting applicant information` : "Requires review"}
              tone={pendingApplications > 0 ? "amber" : "green"}
              icon={ClipboardList}
              cta="Review applications"
              onClick={onReviewApplications}
            />
            <Item
              count={pendingDeals}
              label={pendingDeals === 1 ? "Deal registration awaiting review" : "Deal registrations awaiting review"}
              hint="Deal protection pending"
              tone={pendingDeals > 0 ? "blue" : "green"}
              icon={FileSignature}
              cta="Review deals"
              onClick={onReviewDeals}
            />
            <Item
              count={accessIssues}
              label={accessIssues === 1 ? "Partner access issue" : "Partner access issues"}
              hint="Active partners without portal access"
              tone={accessIssues > 0 ? "red" : "green"}
              icon={ShieldAlert}
              cta="Review partners"
              onClick={onReviewAccess}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
