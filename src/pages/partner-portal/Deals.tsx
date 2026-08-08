import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePartner } from "@/hooks/usePartner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, PlusCircle, Briefcase, ArrowUpDown } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending Review",
  approved: "Approved",
  won: "Won",
  lost: "Lost",
  rejected: "Rejected",
  expired: "Expired",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-blue-100 text-blue-800 border-blue-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  won: "bg-green-100 text-green-800 border-green-200",
  lost: "bg-slate-100 text-slate-800 border-slate-200",
  expired: "bg-slate-100 text-slate-800 border-slate-200",
};

const eur = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

function protection(d: any) {
  if (!d.protection_expires_at) return { label: "—", tone: "text-muted-foreground" };
  const exp = new Date(d.protection_expires_at);
  const days = Math.ceil((exp.getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: "Expired", tone: "text-red-600" };
  if (days <= 30) return { label: `${days}d left`, tone: "text-amber-600" };
  return { label: `Until ${exp.toLocaleDateString()}`, tone: "text-muted-foreground" };
}

export default function PartnerDeals() {
  const { partner, deals } = usePartner();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [product, setProduct] = useState("all");
  const [country, setCountry] = useState("all");
  const [sortDesc, setSortDesc] = useState(true);
  const [open, setOpen] = useState<any | null>(null);

  const products = useMemo(
    () => Array.from(new Set((deals as any[]).flatMap((d) => d.product_interest ?? []))).sort(),
    [deals],
  );
  const countries = useMemo(
    () => Array.from(new Set((deals as any[]).map((d) => d.prospect_country).filter(Boolean))).sort(),
    [deals],
  );

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (deals as any[])
      .filter((d) => {
        if (status !== "all" && d.status !== status) return false;
        if (product !== "all" && !(d.product_interest ?? []).includes(product)) return false;
        if (country !== "all" && d.prospect_country !== country) return false;
        if (!term) return true;
        return [d.prospect_company, d.prospect_contact_name, d.prospect_email, d.prospect_country]
          .filter(Boolean)
          .some((v: string) => v.toLowerCase().includes(term));
      })
      .sort((a, b) => {
        const av = new Date(a.created_at).getTime();
        const bv = new Date(b.created_at).getTime();
        return sortDesc ? bv - av : av - bv;
      });
  }, [deals, q, status, product, country, sortDesc]);

  if (!partner) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">My deals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registered opportunities, protection status and progress.
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/partner/deals/new"><PlusCircle className="mr-1.5 w-4 h-4" /> Register deal</Link>
        </Button>
      </div>

      {deals.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <Briefcase className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Register your first WorldAML opportunity.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Registering a deal locks in protection and commission eligibility.
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link to="/partner/deals/new">Register deal</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search company, contact, email…"
                  className="pl-8 h-9"
                />
              </div>
              <FilterSelect value={status} onChange={setStatus} placeholder="Status"
                options={Object.keys(STATUS_LABEL).map((s) => ({ value: s, label: STATUS_LABEL[s] }))} />
              <FilterSelect value={product} onChange={setProduct} placeholder="Product"
                options={products.map((p) => ({ value: p, label: p }))} />
              <FilterSelect value={country} onChange={setCountry} placeholder="Country"
                options={countries.map((c) => ({ value: c, label: c }))} />
              <Button variant="outline" size="sm" className="h-9" onClick={() => setSortDesc((s) => !s)}>
                <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" /> {sortDesc ? "Newest" : "Oldest"}
              </Button>
            </div>

            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                No deals match these filters. Try adjusting your filters.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground border-b border-border">
                    <tr>
                      <th className="py-2 font-medium">Company</th>
                      <th className="py-2 font-medium">Product</th>
                      <th className="py-2 font-medium text-right">Deal value</th>
                      <th className="py-2 font-medium">Stage</th>
                      <th className="py-2 font-medium">Registered</th>
                      <th className="py-2 font-medium">Protection</th>
                      <th className="py-2 font-medium">Last update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((d) => {
                      const p = protection(d);
                      return (
                        <tr
                          key={d.id}
                          onClick={() => setOpen(d)}
                          className="cursor-pointer hover:bg-muted/40 transition-colors"
                        >
                          <td className="py-2.5">
                            <div className="font-medium text-foreground">{d.prospect_company}</div>
                            <div className="text-xs text-muted-foreground">
                              {d.prospect_contact_name || d.prospect_email || "—"}
                              {d.prospect_country ? ` · ${d.prospect_country}` : ""}
                            </div>
                          </td>
                          <td className="py-2.5 text-xs text-muted-foreground">
                            {(d.product_interest ?? []).join(", ") || "—"}
                          </td>
                          <td className="py-2.5 text-right font-mono text-xs">
                            {d.estimated_arr_eur ? eur(Number(d.estimated_arr_eur)) : "—"}
                          </td>
                          <td className="py-2.5">
                            <Badge variant="outline" className={STATUS_COLOR[d.status] || ""}>
                              {STATUS_LABEL[d.status] ?? d.status}
                            </Badge>
                          </td>
                          <td className="py-2.5 text-xs text-muted-foreground">
                            {new Date(d.created_at).toLocaleDateString()}
                          </td>
                          <td className={`py-2.5 text-xs ${p.tone}`}>{p.label}</td>
                          <td className="py-2.5 text-xs text-muted-foreground">
                            {new Date(d.updated_at ?? d.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-lg">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base">{open.prospect_company}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={STATUS_COLOR[open.status] || ""}>
                    {STATUS_LABEL[open.status] ?? open.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Registered {new Date(open.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Row label="Contact" value={open.prospect_contact_name || "—"} />
                <Row label="Email" value={open.prospect_email || "—"} />
                <Row label="Country" value={open.prospect_country || "—"} />
                <Row label="Product" value={(open.product_interest ?? []).join(", ") || "—"} />
                <Row
                  label="Estimated value"
                  value={open.estimated_arr_eur ? eur(Number(open.estimated_arr_eur)) : "—"}
                />
                {open.actual_arr_eur ? (
                  <Row label="Closed value" value={eur(Number(open.actual_arr_eur))} />
                ) : null}
                <Row label="Protection" value={protection(open).label} />
                {open.notes ? (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Notes</div>
                    <pre className="whitespace-pre-wrap text-xs bg-muted/40 border border-border rounded p-3">
                      {open.notes}
                    </pre>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground text-right">{value}</span>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-[150px] text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {placeholder.toLowerCase()}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
