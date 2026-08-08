import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, CheckCircle2, Circle, GraduationCap } from "lucide-react";
import { usePartner } from "@/hooks/usePartner";
import { usePartnerProgramme } from "@/hooks/usePartnerProgramme";

const eur = (cents: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);

export default function PartnerCertification() {
  const { partner, deals } = usePartner();
  const { certifications, specialisations, seats } = usePartnerProgramme();

  const currentLevel = (partner?.certification_level || "none").toLowerCase();
  const wonDeals = useMemo(
    () => (deals as any[]).filter((d) => d.status === "won").length,
    [deals],
  );
  const wonRevenueCents = useMemo(
    () =>
      (deals as any[])
        .filter((d) => d.status === "won")
        .reduce((s, d) => s + Number(d.estimated_value || 0) * 100, 0),
    [deals],
  );

  const currentIndex = certifications.findIndex((c) => c.level === currentLevel);
  const next = certifications[currentIndex + 1];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Certification &amp; Specialisations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your partner tier, what unlocks the next one, and the specialisations you hold.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-teal" /> Current tier
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-teal/10 text-teal border-teal/20 capitalize text-sm px-3 py-1">
              {certifications[currentIndex]?.label ?? "Registered"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Commission rate {certifications[currentIndex]?.commission_rate ?? 5}%
            </span>
          </div>

          {next ? (
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="text-sm font-medium text-foreground">
                Progress to {next.label}
              </div>
              <RequirementBar
                label="Closed deals"
                current={wonDeals}
                target={next.required_closed_deals}
              />
              <RequirementBar
                label="Closed revenue"
                current={wonRevenueCents}
                target={next.required_revenue_cents}
                format={eur}
              />
              <RequirementBar
                label="Academy courses completed by your team"
                current={0}
                target={next.required_courses}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              You are at the highest partner tier. Thank you for the partnership.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All tiers</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          {certifications.map((c, i) => (
            <div
              key={c.id}
              className={`rounded-lg border p-4 ${
                c.level === currentLevel ? "border-teal bg-teal/5" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm text-foreground">{c.label}</div>
                <Badge variant="outline" className="text-xs">
                  {c.commission_rate}% commission
                </Badge>
              </div>
              {c.description && (
                <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
              )}
              <ul className="mt-3 space-y-1">
                {c.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-xs text-muted-foreground">
                    {i <= currentIndex ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    )}
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Specialisations</CardTitle>
          </CardHeader>
          <CardContent>
            {specialisations.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No specialisations yet. Complete product training with your partner manager to
                earn your first one.
              </p>
            ) : (
              <div className="space-y-3">
                {specialisations.map((s) => (
                  <div key={s.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{s.label}</span>
                      <Badge
                        variant="outline"
                        className={
                          s.status === "awarded"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-amber-100 text-amber-800 border-amber-200"
                        }
                      >
                        {s.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <Progress value={s.progress_percent} className="h-1.5 mt-1.5" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-teal" /> Academy seats
            </CardTitle>
          </CardHeader>
          <CardContent>
            {seats.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                Your free Academy seats have not been provisioned yet. Ask your partner manager to
                allocate them.
              </p>
            ) : (
              <div className="space-y-2">
                {seats.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                  >
                    <div className="text-sm">
                      <div className="text-foreground">{s.assigned_name || "Unassigned seat"}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.assigned_email || "Available to assign"}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {s.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RequirementBar({
  label,
  current,
  target,
  format,
}: {
  label: string;
  current: number;
  target: number;
  format?: (n: number) => string;
}) {
  const pct = target === 0 ? 100 : Math.min(100, Math.round((current / target) * 100));
  const fmt = format ?? ((n: number) => String(n));
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-medium">
          {fmt(current)} / {fmt(target)}
        </span>
      </div>
      <Progress value={pct} className="h-1.5 mt-1" />
    </div>
  );
}
