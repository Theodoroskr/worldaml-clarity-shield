import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Clock, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import ScreeningLayout from "@/components/screening/ScreeningLayout";
import SEO from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScreeningModules } from "@/hooks/useScreeningModules";
import {
  SCREENING_MODULES,
  isSeniorReviewer,
  requestScreeningModule,
} from "@/lib/suite/screeningModules";

/** Opt-in catalogue of separately priced Screening & Monitoring add-ons. */
export default function ScreeningModules() {
  const { isLoading, snapshot, organisationId, memberRole, refresh } = useScreeningModules();
  const [pending, setPending] = useState<string | null>(null);

  const canRequest = ["admin", "mlro"].includes(String(memberRole ?? ""));

  const onRequest = async (key: string) => {
    if (!organisationId) {
      toast.error("No organisation found for your account");
      return;
    }
    setPending(key);
    try {
      await requestScreeningModule(organisationId, key);
      toast.success("Request sent — our team will confirm activation and billing");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "The request could not be sent");
    } finally {
      setPending(null);
    }
  };

  return (
    <ScreeningLayout
      head={
        <SEO
          title="Screening Add-on Modules"
          description="Optional, separately priced modules for the WorldAML Screening & Monitoring workspace."
          noindex
        />
      }
    >
      <div className="max-w-4xl">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/screening"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to workspace</Link>
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal" /> Add-on modules
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Optional capabilities you can switch on for your organisation. Each module is billed in
            addition to your Screening & Monitoring subscription.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading your modules…
          </div>
        ) : (
          <div className="space-y-4">
            {SCREENING_MODULES.map((mod) => {
              const state = snapshot?.modules[mod.key];
              const status = state?.status ?? "not_requested";
              return (
                <Card key={mod.key} className="overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-teal/70 to-primary/60" />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-base flex items-center gap-2">
                        <ShieldCheck className="h-4.5 w-4.5 text-teal" /> {mod.name}
                      </CardTitle>
                      {status === "active" && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Active
                        </Badge>
                      )}
                      {status === "requested" && (
                        <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
                          <Clock className="mr-1 h-3.5 w-3.5" /> Requested
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{mod.tagline}</p>
                    <ul className="space-y-1.5">
                      {mod.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-teal mt-0.5 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
                      <span className="text-sm font-medium">{mod.priceNote}</span>
                      {status === "active" ? (
                        <Button asChild variant="outline" size="sm">
                          <Link to="/screening">Open workspace</Link>
                        </Button>
                      ) : status === "requested" ? (
                        <Button size="sm" variant="outline" disabled>
                          Awaiting activation
                        </Button>
                      ) : canRequest ? (
                        <Button
                          size="sm"
                          variant="accent"
                          disabled={pending === mod.key}
                          onClick={() => onRequest(mod.key)}
                        >
                          {pending === mod.key && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                          Opt in
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Ask your organisation admin or MLRO to opt in
                        </span>
                      )}
                    </div>
                    {status !== "active" && !isSeniorReviewer(memberRole) && (
                      <p className="text-xs text-muted-foreground">
                        Prefer to talk it through first?{" "}
                        <Link className="underline" to="/contact-sales?product=Screening%20Add-on%20Modules">
                          Contact our team
                        </Link>
                        .
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ScreeningLayout>
  );
}
