import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useRcmOrg } from "@/hooks/useRcmOrg";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Trans } from "react-i18next";

export default function RcmDashboard() {
  const { t } = useTranslation();
  const { membership, userId, loading: orgLoading } = useRcmOrg();
  const [k, setK] = useState({ regs: 0, obls: 0, gaps: 0, overdue: 0, highRisk: 0, score: 0 });
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!membership) { setLoading(false); return; }
    (async () => {
      const org = membership.orgId;
      const [{ count: regs }, { data: obls }] = await Promise.all([
        supabase.from("rcm_regulations").select("id", { count: "exact", head: true }).eq("organization_id", org),
        supabase.from("rcm_obligations").select("compliance_status, risk_level, deadline").eq("organization_id", org),
      ]);
      const list = obls || [];
      const compliant = list.filter(o => o.compliance_status === "compliant").length;
      const gaps = list.filter(o => ["non_compliant","partial"].includes(o.compliance_status)).length;
      const highRisk = list.filter(o => ["high","critical"].includes(o.risk_level)).length;
      const score = list.length ? Math.round((compliant / list.length) * 100) : 0;
      const { count: overdue } = await supabase.from("rcm_tasks").select("id", { count: "exact", head: true })
        .eq("organization_id", org).lt("due_date", new Date().toISOString().slice(0,10))
        .neq("status", "completed");
      setK({ regs: regs || 0, obls: list.length, gaps, overdue: overdue || 0, highRisk, score });
      setLoading(false);
    })();
  }, [membership]);

  const joinDemo = async () => {
    if (!userId) return;
    setJoining(true);
    const { data: org } = await supabase.from("rcm_organizations").select("id").eq("slug","region-trade-bank").maybeSingle();
    if (org) {
      await supabase.from("rcm_org_members").insert({ organization_id: org.id, user_id: userId, role: "admin" });
      window.location.reload();
    }
    setJoining(false);
  };

  if (orgLoading) return <div className="p-8 flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin"/> {t("rcm.common.loading")}</div>;

  if (!membership) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">{t("rcm.common.no_org")}</p>
          <Button onClick={joinDemo} disabled={joining || !userId}>
            {joining ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
            {t("rcm.common.join_demo")}
          </Button>
          {!userId && (
            <p className="text-xs text-muted-foreground mt-3">
              <Trans i18nKey="rcm.dashboard.sign_in_first" components={{ 1: <Link to="/login" className="underline" /> }} />
            </p>
          )}
        </Card>
      </div>
    );
  }

  if (loading) return <div className="p-8"><Loader2 className="w-4 h-4 animate-spin"/></div>;

  const tiles = [
    { label: t("rcm.dashboard.kpi_regulations"), value: k.regs },
    { label: t("rcm.dashboard.kpi_obligations"), value: k.obls },
    { label: t("rcm.dashboard.kpi_score"), value: `${k.score}%` },
    { label: t("rcm.dashboard.kpi_open_gaps"), value: k.gaps },
    { label: t("rcm.dashboard.kpi_overdue"), value: k.overdue },
    { label: t("rcm.dashboard.kpi_high_risk"), value: k.highRisk },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{t("rcm.nav.dashboard")}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {tiles.map(tile => (
          <Card key={tile.label} className="p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{tile.label}</div>
            <div className="text-2xl font-bold mt-1">{tile.value}</div>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">{t("rcm.dashboard.scaffold_note")}</p>
      </Card>
    </div>
  );
}
