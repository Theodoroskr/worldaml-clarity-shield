import { Link } from "react-router-dom";
import {
  PlayCircle, BookOpen, Award, Search, GraduationCap, CheckCircle2, Clock,
  ArrowRight, Library, Scale, FileText, Building2, Landmark,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { academyHref } from "@/lib/academyHost";
import type { AcademyOverview, LearningCourse, CertificateRow } from "@/hooks/useAcademyOverview";
import { formatDistanceToNow } from "date-fns";

const courseUrl = (slug: string) => academyHref(`/academy/${slug}`);
const certUrl = (token: string) => academyHref(`/academy/certificate/${token}`);

export function courseCta(c: LearningCourse): { label: string; href: string } {
  if (c.quizPassed) {
    return c.certificateToken
      ? { label: "View Certificate", href: certUrl(c.certificateToken) }
      : { label: "View Results", href: courseUrl(c.course.slug) };
  }
  if (c.totalModules > 0 && c.completedModules >= c.totalModules) {
    return { label: "Take Final Quiz", href: courseUrl(c.course.slug) };
  }
  if (c.completedModules === 0) return { label: "Start Course", href: courseUrl(c.course.slug) };
  return { label: "Continue Course", href: courseUrl(c.course.slug) };
}

/* ── Quick actions ───────────────────────────────────────────── */
export function QuickActions({ current }: { current: LearningCourse | null }) {
  const items = [
    current
      ? { label: courseCta(current).label, href: courseCta(current).href, icon: PlayCircle, external: true }
      : { label: "Browse Courses", href: academyHref("/academy"), icon: BookOpen, external: true },
    { label: "Browse Courses", href: academyHref("/academy"), icon: BookOpen, external: true },
    { label: "Quick Check", href: "#quick-check", icon: Search, external: false },
    { label: "Certificates", href: "/certificates", icon: Award, external: false },
  ].filter((v, i, arr) => arr.findIndex((x) => x.label === v.label) === i);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
      {items.map((it) => {
        const inner = (
          <>
            <it.icon className="h-4 w-4 text-accent" />
            <span className="truncate">{it.label}</span>
          </>
        );
        const cls =
          "flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground hover:border-accent/50 hover:bg-accent/5 transition-colors";
        return it.external ? (
          <a key={it.label} href={it.href} className={cls}>{inner}</a>
        ) : it.href.startsWith("#") ? (
          <a key={it.label} href={it.href} className={cls}>{inner}</a>
        ) : (
          <Link key={it.label} to={it.href} className={cls}>{inner}</Link>
        );
      })}
    </div>
  );
}

/* ── Continue learning ───────────────────────────────────────── */
export function ContinueLearning({ current }: { current: LearningCourse | null }) {
  if (!current) {
    return (
      <Card className="border-border">
        <CardContent className="py-8 text-center space-y-3">
          <GraduationCap className="h-8 w-8 mx-auto text-accent" />
          <div>
            <h3 className="font-semibold text-foreground">Welcome to WorldAML Academy</h3>
            <p className="text-sm text-muted-foreground mt-1">Start building your compliance expertise.</p>
          </div>
          <Button asChild size="sm"><a href={academyHref("/academy")}>Browse Courses</a></Button>
        </CardContent>
      </Card>
    );
  }

  const cta = courseCta(current);
  return (
    <Card className="border-border overflow-hidden">
      <div className="h-1 bg-accent" />
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-accent mb-1">
              {current.quizPassed ? "Recently completed" : "Continue learning"}
            </div>
            <h3 className="text-lg font-semibold text-foreground truncate">{current.course.title}</h3>
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
  );
}

/* ── Learning KPIs ───────────────────────────────────────────── */
export function LearningOverview({ data }: { data: AcademyOverview }) {
  const stats = [
    { value: data.inProgress.length, label: data.inProgress.length === 1 ? "Course in Progress" : "Courses in Progress" },
    { value: data.completed.length, label: "Completed" },
    { value: data.certificates.length, label: "Certificates" },
  ];
  if (data.cpdHours > 0) stats.push({ value: data.cpdHours, label: "CPD Hours" });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-lg border border-border bg-card px-4 py-3">
          <div className="text-2xl font-bold text-foreground tabular-nums">{s.value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── My courses ──────────────────────────────────────────────── */
export function CourseRow({ c }: { c: LearningCourse }) {
  const cta = courseCta(c);
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground truncate">{c.course.title}</span>
          {c.quizPassed && <Badge variant="secondary" className="text-[10px] gap-1"><CheckCircle2 className="h-3 w-3" /> Completed</Badge>}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <Progress value={c.percent} className="h-1.5 max-w-[200px] flex-1" />
          <span className="text-[11px] text-muted-foreground tabular-nums">{c.percent}%</span>
          {c.course.difficulty && <span className="text-[11px] text-muted-foreground capitalize hidden sm:inline">· {c.course.difficulty}</span>}
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
        <Link to="/my-learning" className="text-xs font-medium text-accent hover:underline">View all courses →</Link>
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
          <Link to="/certificates" className="text-xs font-medium text-accent hover:underline">View all certificates →</Link>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {certificates.length === 0 ? (
          <div className="text-center py-5 space-y-3">
            <p className="text-sm text-muted-foreground">Complete a course to earn your first WorldAML certificate.</p>
            <Button asChild variant="outline" size="sm"><a href={academyHref("/academy")}>Browse Courses</a></Button>
          </div>
        ) : (
          certificates.slice(0, 2).map((c) => <CertificateRowItem key={c.id} cert={c} />)
        )}
      </CardContent>
    </Card>
  );
}

/* ── Recommended next ────────────────────────────────────────── */
export function RecommendedNext({ course }: { course: AcademyOverview["recommended"] }) {
  if (!course) return null;
  return (
    <Card className="border-border">
      <CardContent className="p-4 flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recommended next</div>
          <div className="text-sm font-semibold text-foreground mt-0.5 truncate">{course.title}</div>
          {course.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{course.description}</p>}
        </div>
        <Button asChild variant="outline" size="sm"><a href={courseUrl(course.slug)}>View Course</a></Button>
      </CardContent>
    </Card>
  );
}

/* ── Resources ───────────────────────────────────────────────── */
const RESOURCES = [
  { label: "Compliance Glossary", href: "/resources/glossary", icon: Library },
  { label: "Sanctions Lists", href: "/resources/sanctions-lists", icon: Scale },
  { label: "AML Regulations", href: "/resources/aml-regulations", icon: FileText },
  { label: "Best Practices", href: "/resources/best-practices", icon: BookOpen },
];

export function ResourcesSection() {
  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground mb-2">Compliance Resources</h2>
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

/* ── Explore WorldAML (discovery only) ───────────────────────── */
export function ExploreWorldAML({ hasSuite, hasRcm }: { hasSuite: boolean; hasRcm: boolean }) {
  const items = [
    !hasSuite && {
      title: "WorldAML Suite",
      icon: Building2,
      body: "KYC, KYB, screening, monitoring and compliance workflows.",
      href: "/platform/suite",
      cta: "Learn more",
    },
    !hasRcm && {
      title: "Regulatory Compliance Management",
      icon: Landmark,
      body: "Manage regulatory obligations, controls, assessments and evidence.",
      href: "/contact-sales",
      cta: "Request access",
    },
  ].filter(Boolean) as { title: string; icon: any; body: string; href: string; cta: string }[];

  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground mb-2">Explore WorldAML</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((i) => (
          <div key={i.title} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <i.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">{i.title}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{i.body}</p>
            <a href={i.href} className="inline-flex items-center gap-1 text-xs font-medium text-accent mt-2 hover:underline">
              {i.cta} <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
