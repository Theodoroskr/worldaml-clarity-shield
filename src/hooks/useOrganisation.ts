// src/hooks/useOrganisation.ts
//
// Central hook for multi-tenant context.
// Every suite page should use this instead of calling supabase.auth.getUser()
// and then querying with .eq("user_id", user.id).
//
// Usage:
//   const { orgId, org, role, isLoading } = useOrganisation();
//   // Then: supabase.from("suite_customers").select("*").eq("organisation_id", orgId)

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type OrgRole = "admin" | "mlro" | "compliance_officer" | "analyst" | "viewer";

export interface Organisation {
  id: string;
  name: string;
  status: string;
  subscription_tier: string;
  industry: string | null;
  country: string | null;
  regulator: string | null;
  max_users: number;
  max_screenings_per_month: number;
  max_api_requests_per_day: number;
}

export interface OrgMember {
  id: string;
  user_id: string;
  organization_id: string;
  role: OrgRole;
  invited_email: string | null;
  joined_at: string | null;
  created_at: string;
}

export interface OrgContext {
  isLoading: boolean;
  orgId: string | null;
  org: Organisation | null;
  role: OrgRole | null;
  userId: string | null;
  // Permission helpers
  canEdit: boolean;        // admin | mlro | compliance_officer | analyst
  canManage: boolean;      // admin | mlro only
  isAdmin: boolean;        // admin only
  // Actions
  refetch: () => Promise<void>;
}

export function useOrganisation(): OrgContext {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [org, setOrg] = useState<Organisation | null>(null);
  const [role, setRole] = useState<OrgRole | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }
    setUserId(user.id);

    // Get the user's primary org membership
    const { data: membership } = await supabase
      .from("suite_org_members")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!membership) { setIsLoading(false); return; }

    setOrgId(membership.organization_id);
    setRole(membership.role as OrgRole);

    const { data: organisation } = await supabase
      .from("suite_organizations")
      .select("*")
      .eq("id", membership.organization_id)
      .single();

    setOrg(organisation as Organisation | null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const editRoles: OrgRole[] = ["admin", "mlro", "compliance_officer", "analyst"];
  const manageRoles: OrgRole[] = ["admin", "mlro"];

  return {
    isLoading,
    orgId,
    org,
    role,
    userId,
    canEdit:   role ? editRoles.includes(role) : false,
    canManage: role ? manageRoles.includes(role) : false,
    isAdmin:   role === "admin",
    refetch:   fetch,
  };
}
