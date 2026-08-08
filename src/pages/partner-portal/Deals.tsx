import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePartner } from "@/hooks/usePartner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, PlusCircle, Briefcase, ArrowUpDown, SlidersHorizontal, ChevronRight, X } from "lucide-react";
import {
  eur,
  shortDate,
  StageBadge,
  ProtectionCell,
  DEAL_STAGE_LABEL,
  commissionEstimate,
  NotProvided,
  protectionState,
} from "@/components/partner/dealUi";

export default function PartnerDeals() {
  const { partner, deals } = usePartner();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [product, setProduct] = useState("all");
  const [country, setCountry] = useState("all");
  const [sortDesc, setSortDesc] = useState(true);
  const [open, setOpen] = useState<any | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const all = (deals ?? []) as any[];

  const products = useMemo(
    () => Array.from(new Set(all.flatMap((d) => d.product_interest ?? []))).sort(),
    [all],
  );
  const countries = useMemo(
    () => Array.from(new Set(all.map((d) => d.prospect_country).filter(Boolean))).sort(),
    [all],
  );

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return all
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
  }, [all, q, status, product, country, sortDesc]);

  const activeFilterCount = [status, product, country].filter((v) => v !== "all").length;
  const showCommission = !!partner?.commission_rate;

  if (!partner) return null;

  const filterControls = (
    <>
      <FilterSelect
        value={status}
        onChange={setStatus}
        placeholder="Status"
        options={Object.keys(DEAL_STAGE_LABEL).map((s) => ({ value: s, label: DEAL_STAGE_LABEL[s] }))}
      />
      <FilterSelect
        value={product}
        onChange={setProduct}
        placeholder="Product"
        options={products.map((p) => ({ value: p, label: p }))}
      />
      <FilterSelect
        value={country}
        onChange={setCountry}
        placeholder="Country"
        options={countries.map((c) => ({ value: c, label: c }))}
      />
      <Button
        variant="outline"
        size="sm"
        className="h-10 w-full sm:w-[140px] justify-start font-normal"
        onClick={() => setSortDesc((s) => !s)}
      >
        <ArrowUpDown className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
        {sortDesc ? "Newest first" : "Oldest first"}
      </Button>
    </>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">My deals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registered opportunities, protection status and progress.
          </p>
        </div>
        <Button asChild size="sm" className="h-10">
          <Link to="/partner/deals/new">
            <PlusCircle className="mr-1.5 w-4 h-4" /> Register deal
          </Link>
        </Button>
      </div>

      {all.length === 0 ? (
        <Card>
          <CardContent className="px-6 py-14 text-center">
            <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-base font-semibold text-foreground">No registered opportunities yet.</p>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
              Register your first opportunity to begin tracking deal protection and commission eligibility.
            </p>
            <Button asChild size="sm" className="mt-5 h-10">
              <Link to="/partner/deals/new">
                <PlusCircle className="mr-1.5 w-4 h-4" /> Register deal
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Filter bar */}
            <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/25">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search company, contact or email…"
                  aria-label="Search deals"
                  className="pl-9 pr-8 h-10 bg-background"
                />
                {q && (
                  <button
                    type="button"
                    onClick={() => setQ("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="hidden md:flex items-center gap-2">{filterControls}</div>

              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 md:hidden shrink-0">
                    <SlidersHorizontal className="w-4 h-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="ml-1.5 rounded-full bg-teal text-white text-[10px] px-1.5 py-0.5 leading-none">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-xl">
                  <SheetHeader className="text-left">
                    <SheetTitle className="text-base">Filter deals</SheetTitle>
                  </SheetHeader>
                  <div className="grid gap-3 mt-4 pb-2">{filterControls}</div>
                  <Button
                    className="w-full h-10 mt-2"
                    onClick={() => setFiltersOpen(false)}
                  >
                    Show {rows.length} deal{rows.length === 1 ? "" : "s"}
                  </Button>
                </SheetContent>
              </Sheet>
            </div>

            {rows.length === 0 ? (
              <div className="text-center py-14 px-4">
                <p className="text-sm font-medium text-foreground">No deals match these filters.</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-9 text-teal"
                  onClick={() => {
                    setQ("");
                    setStatus("all");
                    setProduct("all");
                    setCountry("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-[0.06em] text-muted-foreground border-b border-border">
                        <th className="py-2.5 px-4 font-semibold">Company</th>
                        <th className="py-2.5 px-3 font-semibold">Product</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Deal value</th>
                        {showCommission && (
                          <th className="py-2.5 px-3 font-semibold text-right">Est. commission</th>
                        )}
                        <th className="py-2.5 px-3 font-semibold">Stage</th>
                        <th className="py-2.5 px-3 font-semibold">Protection</th>
                        <th className="py-2.5 px-3 font-semibold">Registered</th>
                        <th className="py-2.5 px-3 font-semibold">Last update</th>
                        <th className="py-2.5 px-3 w-8" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rows.map((d) => {
                        const est = commissionEstimate(d.estimated_arr_eur, partner.commission_rate);
                        return (
                          <tr
                            key={d.id}
                            tabIndex={0}
                            onClick={() => setOpen(d)}
                            onKeyDown={(e) => e.key === "Enter" && setOpen(d)}
                            className="group cursor-pointer hover:bg-muted/50 focus:bg-muted/60 focus:outline-none transition-colors"
                          >
                            <td className="py-3 px-4 align-middle">
                              <div className="font-medium text-foreground">{d.prospect_company}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {d.prospect_contact_name || d.prospect_email || <NotProvided />}
                                {d.prospect_country ? ` · ${d.prospect_country}` : ""}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-xs text-muted-foreground align-middle">
                              {(d.product_interest ?? []).join(", ") || <NotProvided />}
                            </td>
                            <td className="py-3 px-3 text-right align-middle font-medium tabular-nums">
                              {d.estimated_arr_eur ? (
                                eur(Number(d.estimated_arr_eur))
                              ) : (
                                <NotProvided className="text-xs font-normal" />
                              )}
                            </td>
                            {showCommission && (
                              <td className="py-3 px-3 text-right align-middle text-xs tabular-nums text-teal">
                                {est !== null ? eur(est) : <NotProvided className="font-normal" />}
                              </td>
                            )}
                            <td className="py-3 px-3 align-middle">
                              <StageBadge status={d.status} />
                            </td>
                            <td className="py-3 px-3 align-middle">
                              <ProtectionCell deal={d} />
                            </td>
                            <td className="py-3 px-3 text-xs text-muted-foreground align-middle whitespace-nowrap">
                              {shortDate(d.created_at)}
                            </td>
                            <td className="py-3 px-3 text-xs text-muted-foreground align-middle whitespace-nowrap">
                              {shortDate(d.updated_at ?? d.created_at)}
                            </td>
                            <td className="py-3 px-3 align-middle">
                              <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile / tablet cards */}
                <ul className="lg:hidden divide-y divide-border">
                  {rows.map((d) => {
                    const est = commissionEstimate(d.estimated_arr_eur, partner.commission_rate);
                    return (
                      <li key={d.id}>
                        <button
                          type="button"
                          onClick={() => setOpen(d)}
                          className="w-full text-left px-4 py-3.5 hover:bg-muted/50 transition-colors focus:outline-none focus:bg-muted/60"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-medium text-foreground truncate">{d.prospect_company}</div>
                              <div className="text-xs text-muted-foreground truncate mt-0.5">
                                {(d.product_interest ?? []).join(", ") || d.prospect_country || "WorldAML"}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0 mt-1" />
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2.5">
                            <StageBadge status={d.status} />
                            <span className="text-sm font-semibold text-foreground tabular-nums">
                              {d.estimated_arr_eur ? eur(Number(d.estimated_arr_eur)) : ""}
                            </span>
                            {est !== null && (
                              <span className="text-xs text-teal">{eur(est)} est.</span>
                            )}
                          </div>
                          <div className="mt-1.5">
                            <ProtectionCell deal={d} />
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className="px-4 py-2.5 border-t border-border text-[11px] text-muted-foreground">
                  Showing {rows.length} of {all.length} registered opportunit{all.length === 1 ? "y" : "ies"}
                </div>
              </>
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
                <div className="flex flex-wrap items-center gap-2">
                  <StageBadge status={open.status} />
                  <span className="text-xs text-muted-foreground">
                    Registered {shortDate(open.created_at)}
                  </span>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                    Deal protection
                  </div>
                  <div className="mt-1">
                    <ProtectionCell deal={open} />
                  </div>
                  {protectionState(open).tone === "warn" && !open.protection_expires_at && (
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      Protection is confirmed once the partnerships team approves the registration.
                    </p>
                  )}
                </div>
                <Row label="Contact" value={open.prospect_contact_name} />
                <Row label="Email" value={open.prospect_email} />
                <Row label="Country" value={open.prospect_country} />
                <Row label="Product" value={(open.product_interest ?? []).join(", ")} />
                <Row
                  label="Estimated value"
                  value={open.estimated_arr_eur ? eur(Number(open.estimated_arr_eur)) : ""}
                />
                {(() => {
                  const est = commissionEstimate(open.estimated_arr_eur, partner.commission_rate);
                  return est !== null ? (
                    <Row label="Estimated commission" value={`${eur(est)} (${partner.commission_rate}%)`} />
                  ) : null;
                })()}
                {open.actual_arr_eur ? (
                  <Row label="Closed value" value={eur(Number(open.actual_arr_eur))} />
                ) : null}
                {open.notes ? (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Notes</div>
                    <pre className="whitespace-pre-wrap text-xs bg-muted/40 border border-border rounded p-3 font-sans">
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

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 pb-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground text-right">
        {value ? value : <NotProvided className="text-xs" />}
      </span>
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
      <SelectTrigger
        aria-label={placeholder}
        className="h-10 w-full sm:w-[150px] text-sm bg-background"
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {placeholder.toLowerCase()}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
