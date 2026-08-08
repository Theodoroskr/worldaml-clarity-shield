import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield, ShieldCheck, Medal, User, Award, UserCheck, Scale, Activity,
  Landmark, Gauge, Briefcase, Building2, ArrowRight, Check, Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  useRecognition, trackRecognition,
  type RecognitionBadge, type RecognitionLevel, type RecognitionStatus,
} from "@/hooks/useRecognition";
import ShareRecognition from "@/components/dashboard/ShareRecognition";

/* ── Visual language ─────────────────────────────────────────── */

const LEVEL_ICONS: Record<string, any> = {
  user: User, medal: Medal, shield: Shield, "shield-check": ShieldCheck,
};

const BADGE_ICONS: Record<string, any> = {
  shield: Shield, "user-check": UserCheck, scale: Scale, activity: Activity,
  landmark: Landmark, gauge: Gauge, briefcase: Briefcase, "building-2": Building2, award: Award,
};

/** Restrained metallic treatment per tier — driven by design tokens, never raw hex. */
export function tierStyle(key?: string) {
  const token = `--tier-${key ?? "member"}`;
  return {
    color: `hsl(var(${token}, var(--tier-member)))`,
    borderColor: `hsl(var(${token}, var(--tier-member)) / 0.35)`,
    background: `linear-gradient(135deg, hsl(var(${token}, var(--tier-member)) / 0.12), hsl(var(${token}, var(--tier-member)) / 0.02))`,
  };
}

export function TierMark({ level, size = "md" }: { level: RecognitionLevel | null; size?: "sm" | "md" | "lg" }) {
  const Icon = LEVEL_ICONS[level?.icon ?? "user"] ?? Shield;
  const s = tierStyle(level?.key);
  const box = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-8 w-8" : "h-11 w-11";
  const icon = size === "lg" ? "h-7 w-7" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div
      className={cn("shrink-0 rounded-full border flex items-center justify-center", box)}
      style={{ borderColor: s.borderColor, background: s.background, color: s.color }}
    >
      <Icon className={icon} strokeWidth={1.6} />
    </div>
  );
}

/* ── Compact dashboard card ──────────────────────────────────── */

export function MemberLevelCard({ data }: { data?: RecognitionStatus }) {
  const live = useRecognition();
  const r = data ?? live;
  if (!r.authenticated && !r.level) return null;

  const s = tierStyle(r.level?.key);
  const nearly = r.nextLevel && r.coursesToNextLevel > 0 && r.coursesToNextLevel <= 1;

  return (
    <Card className="border-border overflow-hidden">
      <div className="h-1" style={{ background: s.color, opacity: 0.65 }} />
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <TierMark level={r.level} />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              WorldAML Member Level
            </div>
            <div className="text-lg font-semibold text-foreground leading-tight mt-0.5">
              {r.level?.name ?? "Member"}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {r.completedCourses} {r.completedCourses === 1 ? "course" : "courses"} completed
              {r.certificates > 0 && ` · ${r.certificates} certificate${r.certificates === 1 ? "" : "s"}`}
            </p>

            {r.nextLevel && (
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress to {r.nextLevel.name}</span>
                  <span className="font-medium text-foreground">
                    {r.completedCourses}/{r.nextLevel.min_courses}
                  </span>
                </div>
                <Progress value={r.nextLevelPercent} className="h-1.5" />
                <p className="text-xs text-muted-foreground">
                  {nearly
                    ? `You're 1 course away from ${r.nextLevel.name}.`
                    : `${r.coursesToNextLevel} more course${r.coursesToNextLevel === 1 ? "" : "s"} to ${r.nextLevel.name}.`}
                </p>
              </div>
            )}

            {r.earnedBadges.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.earnedBadges.slice(0, 3).map((b) => (
                  <Badge key={b.key} variant="outline" className="text-[10px] border-accent/30 text-accent">
                    {b.name}
                  </Badge>
                ))}
                {r.earnedBadges.length > 3 && (
                  <span className="text-[10px] text-muted-foreground self-center">
                    +{r.earnedBadges.length - 3} more
                  </span>
                )}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" onClick={() => trackRecognition("view_progress")}>
                <Link to="/dashboard/recognition">View Progress</Link>
              </Button>
              <ShareRecognition data={r} />
              <Button asChild size="sm" variant="ghost" className="text-muted-foreground">
                <Link to="/dashboard/courses">Explore Courses</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Specialisation badge card ───────────────────────────────── */

export function BadgeCard({ badge }: { badge: RecognitionBadge }) {
  const [open, setOpen] = useState(false);
  const Icon = BADGE_ICONS[badge.icon] ?? Award;
  const remaining = Math.max(0, badge.required_count - badge.earned_count);
  const percent = Math.min(100, Math.round((badge.earned_count / Math.max(1, badge.required_count)) * 100));

  return (
    <Card className={cn("border-border", badge.earned && "border-accent/40")}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "shrink-0 h-9 w-9 rounded-md border flex items-center justify-center",
              badge.earned ? "border-accent/40 bg-accent/10 text-accent" : "border-border bg-muted text-muted-foreground",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.7} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground leading-snug">{badge.name}</h3>
              {badge.earned ? (
                <Badge variant="outline" className="text-[10px] border-accent/30 text-accent shrink-0">Earned</Badge>
              ) : (
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {badge.earned_count}/{badge.required_count}
                </span>
              )}
            </div>
            {badge.description && (
              <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
            )}

            {!badge.earned && (
              <div className="mt-2.5 space-y-1.5">
                <Progress value={percent} className="h-1.5" />
                <p className="text-xs text-muted-foreground">
                  {badge.earned_count} of {badge.required_count} required courses completed ·{" "}
                  {remaining} course{remaining === 1 ? "" : "s"} remaining
                </p>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="mt-2 -ml-2 h-7 px-2 text-xs text-muted-foreground"
              onClick={() => { setOpen((o) => !o); trackRecognition(`badge_courses_${badge.key}`); }}
            >
              {open ? "Hide required courses" : "View Required Courses"}
              <ArrowRight className={cn("h-3 w-3 ml-1 transition-transform", open && "rotate-90")} />
            </Button>

            {open && (
              <ul className="mt-1 space-y-1 border-t border-border pt-2">
                {badge.qualifying_courses.map((c) => (
                  <li key={c.slug} className="flex items-center gap-2 text-xs">
                    {c.completed
                      ? <Check className="h-3.5 w-3.5 text-accent shrink-0" />
                      : <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
                    <Link
                      to={`/dashboard/courses/${c.slug}`}
                      className={cn("truncate hover:text-accent transition-colors",
                        c.completed ? "text-muted-foreground line-through" : "text-foreground")}
                    >
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Level-up recognition moment ─────────────────────────────── */

const LS_KEY = "worldaml.recognition.lastLevelRank";

export function LevelUpMoment() {
  const r = useRecognition();
  const [shown, setShown] = useState<RecognitionLevel | null>(null);

  useEffect(() => {
    if (!r.authenticated || !r.level) return;
    const stored = Number(localStorage.getItem(LS_KEY));
    if (!Number.isFinite(stored)) {
      localStorage.setItem(LS_KEY, String(r.level.rank));
      return;
    }
    if (r.level.rank > stored) {
      setShown(r.level);
      trackRecognition(`level_up_${r.level.key}`);
    }
    localStorage.setItem(LS_KEY, String(r.level.rank));
  }, [r.authenticated, r.level?.rank]);

  if (!shown) return null;

  return (
    <Dialog open onOpenChange={() => setShown(null)}>
      <DialogContent className="max-w-sm text-center">
        <div className="flex flex-col items-center gap-3 py-2 animate-in fade-in zoom-in-95 duration-500">
          <TierMark level={shown} size="lg" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">You've reached {shown.name} status.</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {r.completedCourses} WorldAML Academy course{r.completedCourses === 1 ? "" : "s"} completed.
            </p>
          </div>
          <Button asChild size="sm" onClick={() => setShown(null)}>
            <Link to="/dashboard/recognition">View Recognition</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Post-completion recognition summary (course player) ─────── */

export function CompletionRecognition({ courseSlug }: { courseSlug?: string }) {
  const r = useRecognition();
  const related = useMemo(
    () => r.badges.filter((b) => b.qualifying_courses.some((c) => c.slug === courseSlug)),
    [r.badges, courseSlug],
  );

  if (!r.authenticated) return null;

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Medal className="h-4 w-4 text-accent" /> Your recognition
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <TierMark level={r.level} size="sm" />
          <div className="text-sm">
            <span className="font-medium text-foreground">{r.level?.name ?? "Member"}</span>
            <span className="text-muted-foreground">
              {" "}· {r.completedCourses}
              {r.nextLevel ? `/${r.nextLevel.min_courses}` : ""} courses completed
            </span>
          </div>
        </div>

        {related.map((b) => (
          <div key={b.key} className="text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{b.name}</span>
              <span className="text-muted-foreground">
                {b.earned ? "Earned" : `${b.earned_count} / ${b.required_count} courses completed`}
              </span>
            </div>
            <Progress value={Math.round((b.earned_count / Math.max(1, b.required_count)) * 100)} className="h-1.5 mt-1" />
          </div>
        ))}

        <Button asChild size="sm" variant="outline">
          <Link to="/dashboard/recognition">View Recognition</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/* ── Compact profile summary ─────────────────────────────────── */

export function ProfileRecognition() {
  const r = useRecognition();
  if (!r.authenticated) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="outline" className="text-[11px]" style={{ ...tierStyle(r.level?.key), background: undefined }}>
        {r.level?.name ?? "Member"} · WorldAML Academy
      </Badge>
      {r.earnedBadges.map((b) => (
        <Badge key={b.key} variant="outline" className="text-[11px] border-accent/30 text-accent">
          {b.name}
        </Badge>
      ))}
    </div>
  );
}
