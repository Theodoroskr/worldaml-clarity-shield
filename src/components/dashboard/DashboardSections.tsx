import { Link } from "react-router-dom";
import {
  PlayCircle, BookOpen, Award, Search, GraduationCap, CheckCircle2, Clock,
  ArrowRight, Library, Scale, FileText, FileSpreadsheet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { academyHref } from "@/lib/academyHost";
import { getCourseCover } from "@/assets/academy";
import type { AcademyOverview, LearningCourse, CertificateRow } from "@/hooks/useAcademyOverview";
import { formatDistanceToNow } from "date-fns";

const courseUrl = (slug: string) => `/dashboard/courses/${slug}`;
const certUrl = (token: string) => academyHref(`/academy/certificate/${token}`);

export function courseStatus(c: LearningCourse): "Not Started" | "In Progress" | "Completed" {
  if (c.quizPassed) return "Completed";
  if (c.completedModules === 0) return "Not Started";
  return "In Progress";
}

export function courseCta(c: LearningCourse): { label: string; href: string } {
  if (c.quizPassed) {
    return c.certificateToken
      ? { label: "View Certificate", href: certUrl(c.certificateToken) }
      : { label: "Review Course", href: courseUrl(c.course.slug) };
  }
  if (c.totalModules > 0 && c.completedModules >= c.totalModules) {
    return { label: "Take Final Quiz", href: courseUrl(c.course.slug) };
  }
  if (c.completedModules === 0) return { label: "Start Course", href: courseUrl(c.course.slug) };
  return { label: "Continue Course", href: courseUrl(c.course.slug) };
}

/* ── Continue learning (primary component) ───────────────────── */
export function ContinueLearning({ current, others }: { current: LearningCourse | null; others?: LearningCourse[] }) {
  if (!current) {
    return (
      <Card className="border-border">
        <CardContent className="py-8 text-center space-y-3">
          <GraduationCap className="h-8 w-8 mx-auto text-accent" />
          <div>
            <h3 className="font-semibold text-foreground">Start your first course</h3>
            <p className="text-sm text-muted-foreground mt-1">Build your compliance expertise with WorldAML Academy.</p>
          </div>
          <Button asChild size="sm"><Link to="/dashboard/courses">Browse Courses</Link></Button>
        </CardContent>
      </Card>
    );
  }

  const cta = courseCta(current);
  const cover = getCourseCover(current.course.slug);
  return (
    <div className="space-y-2">
      <Card className="border-border overflow-hidden">
        <div className="h-1 bg-accent" />
        <CardContent className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            {cover && (
              <a href={cta.href} className="shrink-0 hidden sm:block">
                <img
                  src={cover}
                  alt={`${current.course.title} course cover`}
                  loading="lazy"
                  className="h-24 w-40 rounded-lg object-cover border border-border"
                />
              </a>
            )}
            <div className="min-w-0 flex-1">

              <div className="text-[11px] font-semibold uppercase tracking-wider text-accent mb-1">
                {current.quizPassed ? "Recently completed" : "Continue learning"}
              </div>
              <h2 className="text-lg font-semibold text-foreground truncate">{current.course.title}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {current.course.difficulty && <Badge variant="secondary" className="capitalize text-[11px]">{current.course.difficulty}</Badge>}
                {current.totalModules > 0 && (
                  <span className="text-xs text-muted-foreground">{current.completedModules} of {current.totalModules} modules</span>
                )}
                {current.lastActivity && (
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(current.lastActivity), { addSuffix: true })}
                  </span>
                )}
              </div>
              <div className="mt-3 max-w-md">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold text-foreground">{current.percent}%</span>
                </div>
                <Progress value={current.percent} className="h-2" />
              </div>
            </div>
            <Button asChild className="shrink-0">
              <a href={cta.href}>{cta.label} <ArrowRight className="h-4 w-4 ml-1.5" /></a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {others && others.length > 0 && (
        <div className="space-y-2">
          {others.slice(0, 2).map((c) => <CourseRow key={c.course.id} c={c} />)}
        </div>
      )}
    </div>
  );
}

/* ── Learning progress metrics ───────────────────────────────── */
export function LearningOverview({ data }: { data: AcademyOverview }) {
  const stats = [
    { value: data.inProgress.length, label: "Courses in Progress" },
    { value: data.completed.length, label: "Courses Completed" },
    { value: data.certificates.length, label: "Certificates Earned" },
  ];
  if (data.cpdHours > 0) stats.push({ value: data.cpdHours, label: "CPD Hours" });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-accent/40"
        >
          <div className="text-2xl font-bold text-foreground tabular-nums leading-none">{s.value}</div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mt-1.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Course row ──────────────────────────────────────────────── */
export function CourseRow({ c }: { c: LearningCourse }) {
  const cta = courseCta(c);
  const status = courseStatus(c);
  const cover = getCourseCover(c.course.slug);
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
      {cover && (
        <img
          src={cover}
          alt={`${c.course.title} course cover`}
          loading="lazy"
          className="h-11 w-16 rounded-md object-cover border border-border shrink-0 hidden sm:block"
        />
      )}
      <div className="min-w-0 flex-1">

        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground truncate">{c.course.title}</span>
          {status === "Completed" && (
            <Badge variant="secondary" className="text-[10px] gap-1"><CheckCircle2 className="h-3 w-3" /> Completed</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <Progress value={c.percent} className="h-1.5 max-w-[200px] flex-1" />
          <span className="text-[11px] text-muted-foreground tabular-nums">{c.percent}%</span>
          {c.totalModules > 0 && (
            <span className="text-[11px] text-muted-foreground hidden sm:inline">· {c.completedModules}/{c.totalModules} modules</span>
          )}
          {c.course.difficulty && <span className="text-[11px] text-muted-foreground capitalize hidden md:inline">· {c.course.difficulty}</span>}
        </div>
      </div>
      <Button asChild variant="outline" size="sm"><a href={cta.href}>{cta.label}</a></Button>
    </div>
  );
}

export function MyCourses({ courses }: { courses: LearningCourse[] }) {
  if (courses.length === 0) return null;
  return (
    <Card className="border-border">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">My Courses</CardTitle>
        <Link to="/dashboard/my-courses" className="text-xs font-medium text-accent hover:underline">View all courses →</Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {courses.slice(0, 3).map((c) => <CourseRow key={c.course.id} c={c} />)}
      </CardContent>
    </Card>
  );
}

/* ── Certificates ────────────────────────────────────────────── */
export function CertificateRowItem({ cert }: { cert: CertificateRow }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
      <Award className="h-4 w-4 text-accent shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground truncate">{cert.course?.title ?? "Course"}</div>
        <div className="text-[11px] text-muted-foreground">
          {cert.score != null && <>Score {cert.score}% · </>}
          Issued {new Date(cert.issued_at).toLocaleDateString()}
        </div>
      </div>
      <Button asChild variant="outline" size="sm"><a href={certUrl(cert.share_token)}>View</a></Button>
    </div>
  );
}

export function CertificatesSection({ certificates }: { certificates: CertificateRow[] }) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">My Certificates</CardTitle>
        {certificates.length > 0 && (
          <Link to="/dashboard/certificates" className="text-xs font-medium text-accent hover:underline">View all certificates →</Link>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {certificates.length === 0 ? (
          <div className="text-center py-5 space-y-3">
            <p className="text-sm text-muted-foreground">Complete a course to earn your first WorldAML certificate.</p>
            <Button asChild variant="outline" size="sm"><Link to="/dashboard/courses">Browse Courses</Link></Button>
          </div>
        ) : (
          certificates.slice(0, 2).map((c) => <CertificateRowItem key={c.id} cert={c} />)
        )}
      </CardContent>
    </Card>
  );
}

/* ── Recommended (simple rule-based, not AI) ─────────────────── */
export function RecommendedNext({ courses }: { courses: AcademyOverview["recommendedList"] }) {
  if (!courses || courses.length === 0) return null;
  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground mb-2">Recommended for You</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        {courses.slice(0, 3).map((course) => {
          const cover = getCourseCover(course.slug);
          return (
          <div key={course.id} className="rounded-lg border border-border bg-card flex flex-col overflow-hidden">
            {cover && (
              <a href={courseUrl(course.slug)} className="block">
                <img
                  src={cover}
                  alt={`${course.title} course cover`}
                  loading="lazy"
                  className="h-28 w-full object-cover"
                />
              </a>
            )}
            <div className="p-4 flex flex-col flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {course.category && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{course.category}</span>}
              {course.difficulty && <Badge variant="secondary" className="text-[10px] capitalize">{course.difficulty}</Badge>}
            </div>

            <div className="text-sm font-semibold text-foreground mt-1.5 line-clamp-2">{course.title}</div>
            {course.duration_minutes ? (
              <div className="text-[11px] text-muted-foreground mt-1 inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {course.duration_minutes} min
              </div>
            ) : null}
            <Button asChild variant="outline" size="sm" className="mt-3 self-start">
              <a href={courseUrl(course.slug)}>View Course</a>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Academy resources (secondary) ───────────────────────────── */
const RESOURCES = [
  { label: "AML Glossary", href: "/resources/glossary", icon: Library, external: true },
  { label: "Sanctions Lists", href: "/resources/sanctions-lists", icon: Scale, external: true },
  { label: "AML Regulations", href: "/resources/aml-regulations", icon: FileText, external: true },
  { label: "Templates & Toolkit", href: academyHref("/academy/templates"), icon: FileSpreadsheet, external: true },
];

export function ResourcesSection() {
  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground mb-2">Academy Resources</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {RESOURCES.map((r) => (
          <a key={r.href} href={r.href} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground hover:border-accent/50 hover:bg-accent/5 transition-colors">
            <r.icon className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{r.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ── Sanctions Quick Check (small secondary member tool) ─────── */
export function QuickCheckLink() {
  return (
    <a
      href="/sanctions-check"
      className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-accent/50 hover:bg-accent/5 transition-colors"
    >
      <Search className="h-4 w-4 text-accent shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">Sanctions Quick Check</span>
        <span className="block text-xs text-muted-foreground">Practise screening a name against global sanctions lists.</span>
      </span>
      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </a>
  );
}

export { PlayCircle, BookOpen };
