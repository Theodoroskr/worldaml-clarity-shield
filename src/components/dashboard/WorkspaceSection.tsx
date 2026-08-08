import { useQuery } from "@tanstack/react-query";
import { Building2, Landmark, Handshake, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/hooks/useOrganisation";

function Metric({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-md bg-muted/50 px-3 py-2">
      <div className="text-lg font-bold text-foreground tabular-nums">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function SuiteCard() {
  const { orgId, org } = useOrganisation();

  const { data } = useQuery({
    queryKey: ["dashboard-suite-metrics", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const [alerts, cases, customers] = await Promise.all([
        supabase.from("suite_alerts").select("id", { count: "exact", head: true })
          .eq("organisation_id", orgId!).eq("status", "open"),
        supabase.from("suite_cases").select("id", { count: "exact", head: true })
          .eq("organisation_id", orgId!).neq("status", "closed"),
        supabase.from("suite_customers").select("id", { count: "exact", head: true })
          .eq("organisation_id", orgId!),
      ]);
      return {
        openAlerts: alerts.count ?? 0,
        openCases: cases.count ?? 0,
        customers: customers.count ?? 0,
      };
    },
  });

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="h-4 w-4 text-accent shrink-0" />
            <span className="text-sm font-semibold text-foreground truncate">
              {org?.name ? `${org.name} · Suite` : "WorldAML Suite"}
            </span>
          </div>
          <a href="/suite" className="text-xs font-medium text-accent hover:underline inline-flex items-center gap-1 shrink-0">
            Open <ArrowRight className="h-3 w-3" />
          </a>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <Metric value={data?.openAlerts ?? 0} label="Open alerts" />
          <Metric value={data?.openCases ?? 0} label="Open cases" />
          <Metric value={data?.customers ?? 0} label="Customers" />
        </div>
      </CardContent>
    </Card>
  );
}

function SimpleCard({ icon: Icon, title, body, href }: { icon: any; title: string; body: string; href: string }) {
  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="h-4 w-4 text-accent shrink-0" />
            <span className="text-sm font-semibold text-foreground truncate">{title}</span>
          </div>
          <a href={href} className="text-xs font-medium text-accent hover:underline inline-flex items-center gap-1 shrink-0">
            Open <ArrowRight className="h-3 w-3" />
          </a>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{body}</p>
      </CardContent>
    </Card>
  );
}

export function WorkspaceSection({
  hasSuite, hasRcm, hasPartner,
}: { hasSuite: boolean; hasRcm: boolean; hasPartner: boolean }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground mb-2">My Workspaces</h2>
      <div className="grid md:grid-cols-2 gap-3">
        {hasSuite && <SuiteCard />}
        {hasRcm && (
          <SimpleCard icon={Landmark} title="Regulatory Compliance Management"
            body="Obligations, controls and evidence management." href="/rcm" />
        )}
        {hasPartner && (
          <SimpleCard icon={Handshake} title="Partner Portal"
            body="Referrals, deal registrations, commissions and assets." href="/partner-portal" />
        )}
      </div>
    </div>
  );
}
