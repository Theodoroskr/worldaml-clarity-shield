import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, Loader2, Mail } from "lucide-react";
import PartnerApplicationForm from "@/components/partners/PartnerApplicationForm";
import { Button } from "@/components/ui/button";

type AppRow = {
  id: string;
  status: string | null;
  company_name: string | null;
  partner_type: string | null;
  created_at: string;
  reviewed_at: string | null;
};

const STAGES = [
  { key: "submitted", label: "Application submitted" },
  { key: "review", label: "Under review by partnerships team" },
  { key: "decision", label: "Approval decision" },
  { key: "activation", label: "Portal activated" },
] as const;

export default function PartnerOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);

  const { data: application, isLoading, refetch } = useQuery({
    queryKey: ["partner-application", user?.id, tick],
    enabled: !!user,
    queryFn: async (): Promise<AppRow | null> => {
      const { data, error } = await supabase
        .from("partner_applications")
        .select("id,status,company_name,partner_type,created_at,reviewed_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as any) ?? null;
    },
  });

  // Auto-poll every 15s while pending in case admin approves during the session
  useEffect(() => {
    if (!application || application.status === "approved") return;
    const t = setInterval(() => setTick((n) => n + 1), 15000);
    return () => clearInterval(t);
  }, [application]);

  // If approved, redirect will happen from PartnerPortalLayout once partner row exists
  useEffect(() => {
    if (application?.status === "approved") {
      // Nudge the parent portal to re-check partner
      const t = setTimeout(() => window.location.reload(), 800);
      return () => clearTimeout(t);
    }
  }, [application]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-teal" />
      </div>
    );
  }

  // No application yet → show inline form
  if (!application) {
    return (
      <div className="min-h-screen bg-surface-subtle py-12">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Join the WorldAML Partner Program</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Apply once and get access to referral tracking, deal registration, commissions & marketing assets.
            </p>
          </div>
          <PartnerApplicationForm />
          <div className="text-center">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>Back to dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  // Application exists → status tracker
  const status = (application.status || "pending").toLowerCase();
  const currentStage =
    status === "approved" ? 3 :
    status === "rejected" ? 2 :
    status === "under_review" || status === "in_review" ? 1 :
    0;

  return (
    <div className="min-h-screen bg-surface-subtle py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
              {status === "rejected" ? (
                <Mail className="w-5 h-5 text-red-600" />
              ) : (
                <Clock className="w-5 h-5 text-amber-700" />
              )}
            </div>
            <CardTitle>
              {status === "approved" && "Application approved — activating your portal"}
              {status === "rejected" && "Application decision"}
              {status !== "approved" && status !== "rejected" && "Application under review"}
            </CardTitle>
            <CardDescription>
              {application.company_name ? `${application.company_name} · ` : ""}
              {application.partner_type ? `${application.partner_type} tier · ` : ""}
              Submitted {new Date(application.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ol className="space-y-3">
              {STAGES.map((s, i) => {
                const done = i < currentStage;
                const active = i === currentStage;
                return (
                  <li key={s.key} className="flex items-start gap-3">
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-teal mt-0.5" />
                    ) : active ? (
                      <Circle className="w-5 h-5 text-teal fill-teal/20 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />
                    )}
                    <div>
                      <p className={`text-sm ${active || done ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {s.label}
                      </p>
                      {active && status !== "rejected" && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Typical response within 1–2 business days.
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {status === "rejected" && (
              <div className="p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-900">
                Unfortunately your application wasn't approved this time. Please email
                {" "}<a className="underline" href="mailto:partners@worldaml.com">partners@worldaml.com</a>{" "}
                to discuss next steps.
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 justify-between pt-2">
              <Button variant="ghost" onClick={() => refetch()}>
                Refresh status
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Go to dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
