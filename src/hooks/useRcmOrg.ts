import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type RcmMembership = {
  orgId: string;
  orgName: string;
  role: "admin" | "mlro" | "compliance_officer" | "analyst" | "viewer";
};

export function useRcmOrg() {
  const [userId, setUserId] = useState<string | null>(null);
  const [membership, setMembership] = useState<RcmMembership | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      setUserId(user?.id ?? null);
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("rcm_org_members")
        .select("organization_id, role, rcm_organizations(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (mounted && data) {
        setMembership({
          orgId: data.organization_id,
          orgName: (data as any).rcm_organizations?.name ?? "RCM Org",
          role: data.role as RcmMembership["role"],
        });
      }
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const canEdit = !!membership && ["admin","mlro","compliance_officer","analyst"].includes(membership.role);
  const canManage = !!membership && ["admin","mlro","compliance_officer"].includes(membership.role);

  return { userId, membership, loading, canEdit, canManage };
}
