import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Loader2, Award, GraduationCap, Layers, BadgeCheck } from "lucide-react";
import { AppPageHeader } from "@/components/app-shell/AppShellLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRecognition } from "@/hooks/useRecognition";
import { BadgeCard, TierMark, tierStyle } from "@/components/dashboard/RecognitionSections";

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card className="border-border">
      <CardContent className="p-4 flex items-center gap-3">
        <Icon className="h-4 w-4 text-accent shrink-0" />
        <div>
          <div className="text-lg font-semibold text-foreground leading-none">{value}</div>
          <div className="text-xs text-muted-foreground mt-1">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Recognition() {
  const r = useRecognition();

  if (r.isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const s = tierStyle(r.level?.key);
  const notStarted = r.badges.filter((b) => !b.earned && b.earned_count === 0);

  return (
    <>
      <Helmet><title>My Recognition | WorldAML Academy</title><meta name="robots" content="noindex" /></Helmet>
      <AppPageHeader
        title="My Recognition"
        description="Your professional standing in WorldAML Academy, based on completed courses and certificates."
      />

      <div className="space-y-6">
        <Card className="border-border overflow-hidden">
          <div className="h-1" style={{ background: s.color, opacity: 0.65 }} />
          <CardContent className="p-6 flex flex-wrap items-center gap-5">
            <TierMark level={r.level} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Current member level
              </div>
              <h2 className="text-xl font-semibold text-foreground">{r.level?.name ?? "Member"}</h2>
              {r.level?.description && (
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">{r.level.description}</p>
              )}
              <div className="mt-3"><ShareRecognition data={r} /></div>
            </div>
            {r.nextLevel && (
              <div className="w-full sm:w-64 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Next: {r.nextLevel.name}</span>
                  <span className="font-medium text-foreground">
                    {r.completedCourses}/{r.nextLevel.min_courses}
                  </span>
                </div>
                <Progress value={r.nextLevelPercent} className="h-1.5" />
                <p className="text-xs text-muted-foreground">
                  {r.coursesToNextLevel} more course{r.coursesToNextLevel === 1 ? "" : "s"}
                  {r.nextLevel.min_advanced_courses > 0 && `, incl. ${r.nextLevel.min_advanced_courses} advanced`}
                  {r.nextLevel.min_categories > 0 && `, across ${r.nextLevel.min_categories} categories`}.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={GraduationCap} label="Courses completed" value={r.completedCourses} />
          <Stat icon={Award} label="Certificates earned" value={r.certificates} />
          <Stat icon={Layers} label="Categories covered" value={r.categories} />
          <Stat icon={BadgeCheck} label="Specialisation badges" value={r.earnedBadges.length} />
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Specialisation badges</h2>
          {r.earnedBadges.length > 0 && (
            <div className="grid md:grid-cols-2 gap-3">
              {r.earnedBadges.map((b) => <BadgeCard key={b.key} badge={b} />)}
            </div>
          )}
          {r.inProgressBadges.length > 0 && (
            <>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">In progress</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {r.inProgressBadges.map((b) => <BadgeCard key={b.key} badge={b} />)}
              </div>
            </>
          )}
          {notStarted.length > 0 && (
            <>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">Available</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {notStarted.map((b) => <BadgeCard key={b.key} badge={b} />)}
              </div>
            </>
          )}
        </section>

        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Continue your progression</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild size="sm"><Link to="/dashboard/courses">Explore Courses</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to="/dashboard/certificates">My Certificates</Link></Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
