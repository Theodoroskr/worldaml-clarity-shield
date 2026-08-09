import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Realtime subscription for the operational (cheap, low-volume) tables that
 * back the Admin Portal. Aggregated analytics stay on the cached RPC — see
 * `useAdminAnalytics` — because forcing realtime on them would be expensive.
 */
export type OperationalTable =
  | "form_submissions"
  | "partner_applications"
  | "deal_registrations"
  | "academy_course_purchases"
  | "ecosystem_events";

export function useAdminRealtime(
  tables: OperationalTable[],
  onChange: (table: OperationalTable) => void,
  enabled = true,
) {
  const cb = useRef(onChange);
  cb.current = onChange;
  const key = tables.join(",");

  useEffect(() => {
    if (!enabled || !key) return;
    const list = key.split(",") as OperationalTable[];
    const channel = supabase.channel(`admin-live-${key}`);

    list.forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => cb.current(table),
      );
    });

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [key, enabled]);
}
