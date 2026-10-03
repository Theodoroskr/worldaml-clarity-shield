import { useState } from "react";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { revealPii, type PiiTable, type RevealedPii } from "@/lib/suite/pii";

const prettify = (k: string) =>
  k.split(".").map((p) => (/^\d+$/.test(p) ? `#${Number(p) + 1}` : p.replace(/_/g, " "))).join(" › ");

/** Shows a "Show sensitive details" button; reveals decrypted values on click (logged). */
export function RevealPiiButton({ table, id, purpose = "View record" }: { table: PiiTable; id: string; purpose?: string }) {
  const [data, setData] = useState<RevealedPii | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (data) { setData(null); return; }
    setLoading(true);
    try {
      setData(await revealPii(table, id, purpose));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const rows: [string, string][] = [];
  if (data?.date_of_birth) rows.push(["Date of birth", data.date_of_birth]);
  if (data?.dob) rows.push(["Date of birth", data.dob]);
  if (data?.identification_number) rows.push(["Identification number", data.identification_number]);
  Object.entries(data?.extra ?? {}).forEach(([k, v]) => rows.push([prettify(k), String(v)]));

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" size="sm" onClick={toggle} disabled={loading}>
        {loading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : data ? <EyeOff className="h-3.5 w-3.5 mr-1.5" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
        {data ? "Hide sensitive details" : "Show sensitive details"}
      </Button>
      {data && (
        <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-1">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Decrypted for you. This view has been logged.
          </p>
          {rows.length === 0 ? (
            <p className="text-muted-foreground">No sensitive details stored.</p>
          ) : rows.map(([k, v], i) => (
            <div key={i} className="flex justify-between gap-4">
              <span className="text-muted-foreground capitalize">{k}</span>
              <span className="font-mono">{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
