import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { recordSearchTerm } from "@/lib/interestSignals";
import { Loader2, Search, SlidersHorizontal, X, ShoppingCart } from "lucide-react";
import { AppPageHeader } from "@/components/app-shell/AppShellLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAcademyCatalogue, CatalogueCourse, categoryLabel } from "@/hooks/useAcademyCatalogue";
import CourseMarketCard from "@/components/dashboard/CourseMarketCard";
import { useRecognition } from "@/hooks/useRecognition";
import { useCart } from "@/contexts/CartContext";
import { useRegion } from "@/contexts/RegionContext";
import { AcademyCurrency, REGION_TO_CURRENCY } from "@/lib/academyFx";
import { useAcademyCheckout } from "@/hooks/useAcademyCheckout";

type SortKey = "recommended" | "newest" | "price-asc" | "price-desc" | "az";

const LEVELS = ["beginner", "intermediate", "advanced"];
const STATUSES: { value: string; label: string }[] = [
  { value: "not-owned", label: "Not purchased" },
  { value: "not-started", label: "Not started" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

export default function AllCourses() {
  const { courses, isLoading } = useAcademyCatalogue();
  const cart = useCart();
  const { region } = useRegion();
  const currency: AcademyCurrency = REGION_TO_CURRENCY[region] ?? "eur";
  const { buyNow, buyingSlug } = useAcademyCheckout();

  const recognition = useRecognition();
  const badgeMap = useMemo(() => {
    const m: Record<string, string[]> = {};
    for (const b of recognition.badges) {
      for (const c of b.qualifying_courses) (m[c.slug] ??= []).push(b.name);
    }
    return m;
  }, [recognition.badges]);
  const [q, setQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => recordSearchTerm(q), 900);
    return () => clearTimeout(t);
  }, [q]);
  const [cats, setCats] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const priceParam = searchParams.get("price");
  const [price, setPrice] = useState<"all" | "free" | "paid">(
    priceParam === "free" || priceParam === "paid" ? priceParam : "all"
  );
  const [statuses, setStatuses] = useState<string[]>([]);
  const [maxDuration, setMaxDuration] = useState<"all" | "15" | "30" | "60">("all");
  const [cpdOnly, setCpdOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("recommended");

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    courses.forEach((c) => c.category && counts.set(c.category, (counts.get(c.category) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [courses]);

  const availableLevels = useMemo(
    () => LEVELS.filter((l) => courses.some((c) => (c.difficulty ?? "").toLowerCase() === l)),
    [courses],
  );

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = courses.filter((c) => {
      if (needle) {
        const hay = `${c.title} ${c.description ?? ""} ${categoryLabel(c.category)} ${c.difficulty ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (cats.length && !(c.category && cats.includes(c.category))) return false;
      if (levels.length && !levels.includes((c.difficulty ?? "").toLowerCase())) return false;
      if (price === "free" && !c.isFree) return false;
      if (price === "paid" && c.isFree) return false;
      if (statuses.length && !statuses.includes(c.status)) return false;
      if (maxDuration !== "all" && (c.durationMinutes ?? 0) > Number(maxDuration)) return false;
      if (cpdOnly && !(c.cpdHours && c.cpdHours > 0)) return false;
      return true;
    });

    const byTitle = (a: CatalogueCourse, b: CatalogueCourse) => a.title.localeCompare(b.title);
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "newest":
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
        case "price-asc":
          return a.priceEurCents - b.priceEurCents || byTitle(a, b);
        case "price-desc":
          return b.priceEurCents - a.priceEurCents || byTitle(a, b);
        case "az":
          return byTitle(a, b);
        default:
          return a.sortOrder - b.sortOrder;
      }
    });
    return list;
  }, [courses, q, cats, levels, price, statuses, maxDuration, cpdOnly, sort]);

  const activeFilters =
    cats.length + levels.length + statuses.length + (price !== "all" ? 1 : 0) + (maxDuration !== "all" ? 1 : 0) + (cpdOnly ? 1 : 0);

  const clearFilters = () => {
    setCats([]); setLevels([]); setStatuses([]); setPrice("all"); setMaxDuration("all"); setCpdOnly(false);
  };

  const Filters = () => (
    <div className="space-y-5 text-sm">
      <div className="space-y-2">
        <div className="font-medium text-foreground">Category</div>
        {categories.map(([cat, count]) => (
          <label key={cat} className="flex items-center gap-2 text-muted-foreground cursor-pointer">
            <Checkbox checked={cats.includes(cat)} onCheckedChange={() => toggle(cats, setCats, cat)} />
            <span className="flex-1">{categoryLabel(cat)}</span>
            <span className="text-[11px]">{count}</span>
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <div className="font-medium text-foreground">Price</div>
        {(["all", "free", "paid"] as const).map((p) => (
          <label key={p} className="flex items-center gap-2 text-muted-foreground cursor-pointer">
            <input type="radio" name="price" className="accent-current" checked={price === p} onChange={() => setPrice(p)} />
            <span className="capitalize">{p === "all" ? "All prices" : p}</span>
          </label>
        ))}
      </div>

      {availableLevels.length > 0 && (
        <div className="space-y-2">
          <div className="font-medium text-foreground">Level</div>
          {availableLevels.map((l) => (
            <label key={l} className="flex items-center gap-2 text-muted-foreground cursor-pointer capitalize">
              <Checkbox checked={levels.includes(l)} onCheckedChange={() => toggle(levels, setLevels, l)} />
              {l}
            </label>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <div className="font-medium text-foreground">Duration</div>
        <Select value={maxDuration} onValueChange={(v) => setMaxDuration(v as any)}>
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">Any length</SelectItem>
            <SelectItem value="15">Up to 15 min</SelectItem>
            <SelectItem value="30">Up to 30 min</SelectItem>
            <SelectItem value="60">Up to 60 min</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="font-medium text-foreground">My status</div>
        {STATUSES.map((s) => (
          <label key={s.value} className="flex items-center gap-2 text-muted-foreground cursor-pointer">
            <Checkbox checked={statuses.includes(s.value)} onCheckedChange={() => toggle(statuses, setStatuses, s.value)} />
            {s.label}
          </label>
        ))}
      </div>

      <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
        <Checkbox checked={cpdOnly} onCheckedChange={() => setCpdOnly((v) => !v)} />
        CPD hours included
      </label>

      {activeFilters > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="px-0 text-accent">
          <X className="h-3.5 w-3.5 mr-1" /> Clear filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      <Helmet><title>All Courses | WorldAML Academy</title><meta name="robots" content="noindex" /></Helmet>
      <AppPageHeader
        title="All Courses"
        description="The full WorldAML Academy catalogue."
        actions={
          cart.count > 0 ? (
            <Button asChild size="sm" variant="outline">
              <Link to="/dashboard/cart"><ShoppingCart className="h-4 w-4 mr-1.5" /> Cart ({cart.count})</Link>
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses..." className="pl-9" />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="recommended">Recommended order</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: low to high</SelectItem>
            <SelectItem value="price-desc">Price: high to low</SelectItem>
            <SelectItem value="az">A–Z</SelectItem>
          </SelectContent>
        </Select>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <SlidersHorizontal className="h-4 w-4 mr-1.5" /> Filters
              {activeFilters > 0 && <Badge className="ml-1.5 h-5 px-1.5">{activeFilters}</Badge>}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <div className="pt-6"><Filters /></div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-6">
        <aside className="hidden lg:block w-56 shrink-0"><Filters /></aside>

        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="text-xs text-muted-foreground mb-3">
                {filtered.length} {filtered.length === 1 ? "course" : "courses"}
              </div>
              {filtered.length === 0 ? (
                <Card className="border-dashed border-border">
                  <CardContent className="py-10 text-center space-y-3">
                    <p className="text-sm text-muted-foreground">No courses match your filters.</p>
                    <Button size="sm" variant="outline" onClick={() => { clearFilters(); setQ(""); }}>Clear filters</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((c) => (
                    <CourseMarketCard
                      badgeNames={badgeMap[c.slug] ?? []}
                      key={c.id}
                      course={c}
                      currency={currency}
                      inCart={cart.has(c.slug)}
                      onToggleCart={(slug) => cart.toggle(slug)}
                      onBuyNow={(slug) => buyNow(slug)}
                      buying={buyingSlug === c.slug}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
