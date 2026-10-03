// Settings > Modules — the client's own Suite admin switches purchased modules
// on/off and chooses which team members can use each module. What the company
// has bought is set by WorldAML (admin_set_org_module), never from here.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ModuleRow = {
  module: string; status: string | null; purchased: boolean;
  enabled: boolean; member_allowed: boolean; ends_at: string | null;
};
type Member = { user_id: string; email?: string; full_name?: string; invited_email: string | null };

const MODULE_META: Record<string, { label: string; description: string }> = {
  screening: { label: "Screening", description: "Manual and automatic sanctions, PEP and adverse media screening with ongoing monitoring." },
  kyc_kyb: { label: "KYC / KYB", description: "Client onboarding, UBOs, documents, risk scoring and reviews." },
  rcm: { label: "Regulatory Compliance Management", description: "Obligations, controls, tasks and evidence." },
};

export default function SuiteModulesPanel({ isAdmin, members }: { isAdmin: boolean; members: Member[] }) {
  const [rows, setRows] = useState<ModuleRow[]>([]);
  const [memberMods, setMemberMods] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.rpc("current_user_suite_modules");
    if (error) { toast.error("Could not load modules"); return; }
    setRows((data ?? []) as ModuleRow[]);
    const { data: mm } = await supabase.from("suite_member_module_access").select("user_id, module");
    const map: Record<string, string[]> = {};
    (mm ?? []).forEach((r) => { (map[r.user_id] ||= []).push(r.module); });
    setMemberMods(map);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (module: string, enabled: boolean) => {
    setBusy(true);
    const { error } = await supabase.rpc("org_set_module_enabled", { _module: module as never, _enabled: enabled });
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success(enabled ? "Module switched on" : "Module switched off"); load(); }
  };

  const setMember = async (userId: string, module: string, allowed: boolean) => {
    const purchased = rows.filter((r) => r.purchased).map((r) => r.module);
    const current = memberMods[userId] ?? purchased; // no rows = all modules
    const next = allowed ? Array.from(new Set([...current, module])) : current.filter((m) => m !== module);
    const { error } = await supabase.rpc("org_set_member_modules", {
      _user_id: userId,
      _modules: (next.length === purchased.length && purchased.every((m) => next.includes(m)) ? [] : next) as never,
    });
    if (error) toast.error(error.message); else load();
  };

  const purchased = rows.filter((r) => r.purchased);
  const available = rows.filter((r) => !r.purchased);

  return (
    <div className="space-y-6 max-w-3xl">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Included in your plan</h2>
        {purchased.length === 0 && <p className="text-sm text-muted-foreground">No modules yet.</p>}
        {purchased.map((r) => (
          <div key={r.module} className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{MODULE_META[r.module]?.label ?? r.module}</span>
                {r.status === "trial" && <Badge variant="secondary">Trial</Badge>}
                {r.ends_at && <span className="text-xs text-muted-foreground">until {new Date(r.ends_at).toLocaleDateString()}</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{MODULE_META[r.module]?.description}</p>
            </div>
            <Switch checked={r.enabled} disabled={!isAdmin || busy} onCheckedChange={(v) => toggle(r.module, v)} aria-label={`Switch ${r.module}`} />
          </div>
        ))}
        {!isAdmin && <p className="text-xs text-muted-foreground">Only your Suite admin can change modules.</p>}
      </section>

      {isAdmin && purchased.length > 0 && members.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Who can use each module</h2>
          <div className="rounded-lg border border-border divide-y divide-border">
            {members.filter((m) => m.user_id).map((m) => (
              <div key={m.user_id} className="flex items-center justify-between gap-4 p-3">
                <span className="text-sm text-foreground truncate">{m.full_name || m.email || m.invited_email}</span>
                <div className="flex gap-4">
                  {purchased.map((r) => {
                    const allowed = !memberMods[m.user_id] || memberMods[m.user_id].includes(r.module);
                    return (
                      <label key={r.module} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Switch checked={allowed} onCheckedChange={(v) => setMember(m.user_id, r.module, v)} />
                        {MODULE_META[r.module]?.label ?? r.module}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {available.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Add more modules</h2>
          {available.map((r) => (
            <div key={r.module} className="flex items-start justify-between gap-4 rounded-lg border border-dashed border-border p-4">
              <div>
                <span className="font-medium text-foreground">{MODULE_META[r.module]?.label ?? r.module}</span>
                <p className="text-xs text-muted-foreground mt-1">{MODULE_META[r.module]?.description}</p>
              </div>
              <Button asChild size="sm" variant="outline">
                <a href={`/contact-sales?product=${r.module}`}>Request module</a>
              </Button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
