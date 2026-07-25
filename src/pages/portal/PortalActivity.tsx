import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";
import { usePortalSession } from "@/hooks/usePortalSession";

interface Row {
  id: string;
  event: string;
  actor_role: string;
  details: Record<string, unknown>;
  created_at: string;
}

const EVENT_LABEL: Record<string, string> = {
  invite_sent: "Portal invitation sent",
  logged_in: "Signed in to portal",
  document_uploaded: "You uploaded a document",
  document_replaced: "Compliance team accepted your document",
  document_rejected: "Compliance team rejected your upload",
  rerequest_responded: "Re-request responded to",
  profile_updated: "Profile updated",
};

export default function PortalActivity() {
  const s = usePortalSession();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!s.customerId) return;
    supabase
      .from("suite_customer_portal_audit")
      .select("id, event, actor_role, details, created_at")
      .eq("customer_id", s.customerId)
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => setRows((data as Row[]) ?? []));
  }, [s.customerId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-accent" />
        <h1 className="text-xl font-semibold">Activity log</h1>
      </div>
      <Card className="p-0 overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Nothing here yet.</div>
        ) : (
          <ul className="divide-y divide-border/50">
            {rows.map((r) => (
              <li key={r.id} className="p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">{EVENT_LABEL[r.event] ?? r.event}</div>
                  <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase">{r.actor_role}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
