import { usePartner } from "@/hooks/usePartner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CalendarDays, LifeBuoy } from "lucide-react";

const PARTNERSHIPS_EMAIL = "partners@worldaml.com";
const SUPPORT_EMAIL = "info@worldaml.com";

export default function PartnerManager() {
  const { partner } = usePartner();

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Partner Manager</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your direct line into the WorldAML partnerships team.
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal/10 text-teal flex items-center justify-center shrink-0">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Your WorldAML partner manager
              </div>
              <h2 className="font-semibold text-foreground mt-0.5">WorldAML Partnerships Team</h2>
              <p className="text-sm text-muted-foreground mt-1">
                A named partner manager is assigned as your programme activity grows. Until then the
                partnerships team handles deal reviews, pricing questions and co-selling support.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button asChild size="sm">
                  <a
                    href={`mailto:${PARTNERSHIPS_EMAIL}?subject=${encodeURIComponent(
                      `Partner enquiry — ${partner?.display_name || "WorldAML Partner"}`,
                    )}`}
                  >
                    <Mail className="mr-1.5 w-3.5 h-3.5" /> Send email
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a
                    href={`mailto:${PARTNERSHIPS_EMAIL}?subject=${encodeURIComponent(
                      `Meeting request — ${partner?.display_name || "WorldAML Partner"}`,
                    )}&body=${encodeURIComponent(
                      "Please suggest a few times for a partner call.\n\nTopics:\n- \n",
                    )}`}
                  >
                    <CalendarDays className="mr-1.5 w-3.5 h-3.5" /> Request a meeting
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-foreground text-sm">Help & support</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              Product or technical questions —{" "}
              <a className="text-teal hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>
                {SUPPORT_EMAIL}
              </a>
            </li>
            <li>
              Commercial, commission and payout questions —{" "}
              <a className="text-teal hover:underline" href={`mailto:${PARTNERSHIPS_EMAIL}`}>
                {PARTNERSHIPS_EMAIL}
              </a>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
