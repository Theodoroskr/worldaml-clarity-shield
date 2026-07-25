import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { usePortalSession } from "@/hooks/usePortalSession";

export default function PortalOverview() {
  const s = usePortalSession();
  const [counts, setCounts] = useState({ outstanding: 0, expiring: 0, pending: 0, total: 0 });

  useEffect(() => {
    if (!s.customerId) return;
    supabase
      .from("suite_customer_documents")
      .select("status")
      .eq("customer_id", s.customerId)
      .then(({ data }) => {
        const rows = data ?? [];
        setCounts({
          outstanding: rows.filter((r) => ["rerequested", "expired"].includes(r.status)).length,
          expiring: rows.filter((r) => r.status === "expiring_soon").length,
          pending: rows.filter((r) => r.status === "pending_review").length,
          total: rows.length,
        });
      });
  }, [s.customerId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome{s.customerName ? `, ${s.customerName}` : ""}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review requested documents and upload replacements when items expire or need refreshing.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile label="Action needed" value={counts.outstanding} tone="red" icon={<AlertTriangle className="w-4 h-4" />} />
        <Tile label="Expiring soon" value={counts.expiring} tone="amber" icon={<Clock className="w-4 h-4" />} />
        <Tile label="Awaiting review" value={counts.pending} tone="blue" icon={<Clock className="w-4 h-4" />} />
        <Tile label="Documents on file" value={counts.total} icon={<FileText className="w-4 h-4" />} />
      </div>

      <Card className="p-6 flex items-center justify-between">
        <div>
          <div className="font-medium">Refresh a document</div>
          <p className="text-sm text-muted-foreground">Upload a new version to replace an expiring or requested item.</p>
        </div>
        <Button asChild>
          <Link to="/portal/documents">Open documents <ArrowRight className="w-4 h-4 ml-2" /></Link>
        </Button>
      </Card>
    </div>
  );
}

function Tile({ label, value, tone, icon }: { label: string; value: number; tone?: "amber" | "red" | "blue"; icon: React.ReactNode }) {
  const cls = tone === "red" ? "text-red-500" : tone === "amber" ? "text-amber-500" : tone === "blue" ? "text-blue-500" : "text-foreground";
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        {icon}
      </div>
      <div className={`text-2xl font-bold mt-1 ${cls}`}>{value}</div>
    </Card>
  );
}
