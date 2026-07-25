import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PortalSession {
  loading: boolean;
  authed: boolean;
  customerId: string | null;
  organisationId: string | null;
  email: string | null;
  customerName: string | null;
  error: string | null;
}

export function usePortalSession(): PortalSession {
  const [state, setState] = useState<PortalSession>({
    loading: true,
    authed: false,
    customerId: null,
    organisationId: null,
    email: null,
    customerName: null,
    error: null,
  });

  useEffect(() => {
    let alive = true;

    const hydrate = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        if (alive) setState({ loading: false, authed: false, customerId: null, organisationId: null, email: null, customerName: null, error: null });
        return;
      }

      // Link/refresh portal row + log the login
      const { data: cid, error: aErr } = await supabase.rpc("portal_activate_session" as never);
      if (aErr || !cid) {
        if (alive) setState({
          loading: false, authed: true, customerId: null, organisationId: null,
          email: session.user.email ?? null, customerName: null,
          error: aErr?.message ?? "No portal invitation is linked to this account.",
        });
        return;
      }

      const { data: cust } = await supabase
        .from("suite_customers")
        .select("id, name, company_name, organisation_id")
        .eq("id", cid as unknown as string)
        .maybeSingle();

      if (alive) setState({
        loading: false,
        authed: true,
        customerId: (cid as unknown as string) ?? null,
        organisationId: cust?.organisation_id ?? null,
        email: session.user.email ?? null,
        customerName: cust?.company_name || cust?.name || null,
        error: null,
      });
    };

    hydrate();
    const { data: sub } = supabase.auth.onAuthStateChange(() => { hydrate(); });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  return state;
}
