import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Loader2, GraduationCap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AppPageHeader } from "@/components/app-shell/AppShellLayout";
import { useAcademyOverview } from "@/hooks/useAcademyOverview";
import { LearningOverview } from "@/components/dashboard/DashboardSections";
import { useAcademyCatalogue, CatalogueCourse } from "@/hooks/useAcademyCatalogue";
import CourseMarketCard from "@/components/dashboard/CourseMarketCard";
import { useCart } from "@/contexts/CartContext";
import { useRegion } from "@/contexts/RegionContext";
import { AcademyCurrency, REGION_TO_CURRENCY } from "@/lib/academyFx";
import { useAcademyCheckout } from "@/hooks/useAcademyCheckout";

export default function MyLearning() {
  const academy = useAcademyOverview();
  const { courses, isLoading } = useAcademyCatalogue();
  const cart = useCart();
  const { region } = useRegion();
  const currency: AcademyCurrency = REGION_TO_CURRENCY[region] ?? "eur";
  const { buyNow, buyingSlug } = useAcademyCheckout();
  const [q, setQ] = useState("");

  const owned = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return courses
      .filter((c) => c.owned)
      .filter((c) => !needle || c.title.toLowerCase().includes(needle));
  }, [courses, q]);

  const groups: Record<string, CatalogueCourse[]> = {
    all: owned,
    "in-progress": owned.filter((c) => c.status === "in-progress"),
    "not-started": owned.filter((c) => c.status === "not-started"),
    completed: owned.filter((c) => c.status === "completed"),
  };

  const Grid = ({ list }: { list: CatalogueCourse[] }) =>
    list.length === 0 ? (
      <Card className="border-dashed border-border">
        <CardContent className="py-10 text-center space-y-3">
          <GraduationCap className="h-6 w-6 mx-auto text-accent" />
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
          <Button asChild size="sm"><Link to="/dashboard/courses">Browse all courses</Link></Button>
        </CardContent>
      </Card>
    ) : (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => (
          <CourseMarketCard
            key={c.id}
            course={c}
            currency={currency}
            inCart={cart.has(c.slug)}
            onToggleCart={(s) => cart.toggle(s)}
            onBuyNow={(s) => buyNow(s)}
            buying={buyingSlug === c.slug}
          />
        ))}
      </div>
    );

  if (academy.isLoading || isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <>
      <Helmet><title>My Courses | WorldAML Academy</title><meta name="robots" content="noindex" /></Helmet>
      <AppPageHeader
        title="My Courses"
        description="Everything you have access to, with progress and next steps."
        actions={<Button asChild variant="outline" size="sm"><Link to="/dashboard/courses">Browse all courses</Link></Button>}
      />

      <div className="space-y-6">
        <LearningOverview data={academy} />

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search my courses..." className="pl-9" />
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({groups.all.length})</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress ({groups["in-progress"].length})</TabsTrigger>
            <TabsTrigger value="not-started">Not Started ({groups["not-started"].length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({groups.completed.length})</TabsTrigger>
          </TabsList>
          {Object.entries(groups).map(([key, list]) => (
            <TabsContent key={key} value={key} className="mt-4"><Grid list={list} /></TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
}
