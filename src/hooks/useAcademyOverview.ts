import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AcademyCourseRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  duration_minutes: number | null;
  cpd_hours: number | null;
  sort_order: number | null;
  price_eur_cents: number | null;
}

export interface LearningCourse {
  course: AcademyCourseRow;
  completedModules: number;
  totalModules: number;
  percent: number;
  quizPassed: boolean;
  completedAt: string | null;
  lastActivity: string | null;
  certificateToken: string | null;
}

export interface CertificateRow {
  id: string;
  score: number | null;
  issued_at: string;
  share_token: string;
  holder_name: string | null;
  course: { title: string; slug: string; cpd_hours: number | null } | null;
}

export interface AcademyOverview {
  inProgress: LearningCourse[];
  completed: LearningCourse[];
  all: LearningCourse[];
  certificates: CertificateRow[];
  cpdHours: number;
  /** Best "continue learning" candidate: furthest along, else most recent. */
  current: LearningCourse | null;
  recommended: AcademyCourseRow | null;
  recommendedList: AcademyCourseRow[];
}

const EMPTY: AcademyOverview = {
  inProgress: [],
  completed: [],
  all: [],
  certificates: [],
  cpdHours: 0,
  current: null,
  recommended: null,
  recommendedList: [],
};

/**
 * Aggregates the REAL Academy tables: academy_progress (+ get_academy_module_counts RPC),
 * academy_courses and academy_certificates. Nothing here is fabricated — every value
 * is derived from a row that exists in the database.
 */
export function useAcademyOverview() {
  const { user } = useAuth();

  const query = useQuery<AcademyOverview>({
    queryKey: ["academy-overview", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const [progressRes, coursesRes, certsRes, moduleRes] = await Promise.all([
        supabase
          .from("academy_progress")
          .select("course_id, completed_modules, quiz_passed, quiz_score, completed_at, created_at")
          .eq("user_id", user!.id),
        supabase
          .from("academy_courses")
          .select("id, slug, title, description, category, difficulty, duration_minutes, cpd_hours, sort_order, price_eur_cents")
          .eq("is_published", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("academy_certificates")
          .select("id, score, issued_at, share_token, holder_name, course_id, academy_courses(title, slug, cpd_hours)")
          .eq("user_id", user!.id)
          .order("issued_at", { ascending: false }),
        supabase.rpc("get_academy_module_counts"),
      ]);

      const courses = (coursesRes.data ?? []) as AcademyCourseRow[];
      const byId = new Map(courses.map((c) => [c.id, c]));

      const totals: Record<string, number> = {};
      ((moduleRes.data ?? []) as { course_id: string; module_count: number }[]).forEach((m) => {
        totals[m.course_id] = Number(m.module_count) || 0;
      });

      const certificates: CertificateRow[] = (certsRes.data ?? []).map((c: any) => ({
        id: c.id,
        score: c.score,
        issued_at: c.issued_at,
        share_token: c.share_token,
        holder_name: c.holder_name,
        course: c.academy_courses
          ? { title: c.academy_courses.title, slug: c.academy_courses.slug, cpd_hours: c.academy_courses.cpd_hours }
          : null,
      }));
      const certByCourseSlug = new Map(
        certificates.filter((c) => c.course?.slug).map((c) => [c.course!.slug, c.share_token]),
      );

      const all: LearningCourse[] = [];
      (progressRes.data ?? []).forEach((p: any) => {
        const course = byId.get(p.course_id);
        if (!course) return;
        const total = totals[p.course_id] ?? 0;
        const done = Array.isArray(p.completed_modules) ? p.completed_modules.length : 0;
        const percent = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
        all.push({
          course,
          completedModules: Math.min(done, total || done),
          totalModules: total,
          percent,
          quizPassed: !!p.quiz_passed,
          completedAt: p.completed_at ?? null,
          lastActivity: p.completed_at ?? p.created_at ?? null,
          certificateToken: certByCourseSlug.get(course.slug) ?? null,
        });
      });

      const completed = all.filter((c) => c.quizPassed);
      const inProgress = all.filter((c) => !c.quizPassed);

      const sortByActivity = (a: LearningCourse, b: LearningCourse) =>
        new Date(b.lastActivity ?? 0).getTime() - new Date(a.lastActivity ?? 0).getTime();
      inProgress.sort((a, b) => b.percent - a.percent || sortByActivity(a, b));
      completed.sort(sortByActivity);

      const current = inProgress[0] ?? completed[0] ?? null;

      // CPD hours = sum of cpd_hours on courses the user actually holds a certificate for.
      const cpdHours = certificates.reduce((sum, c) => sum + (Number(c.course?.cpd_hours) || 0), 0);

      // Rule-based recommendation: next unseen published course, preferring the same
      // category as the user's current/most-recent course, then lowest sort_order.
      const seen = new Set(all.map((c) => c.course.id));
      const preferredCategory = current?.course.category ?? null;
      const candidates = courses.filter((c) => !seen.has(c.id));
      const ranked = [...candidates].sort((a, b) => {
        const aMatch = preferredCategory && a.category === preferredCategory ? 0 : 1;
        const bMatch = preferredCategory && b.category === preferredCategory ? 0 : 1;
        return aMatch - bMatch || (a.sort_order ?? 999) - (b.sort_order ?? 999);
      });
      const recommendedList = ranked.slice(0, 3);
      const recommended = recommendedList[0] ?? null;

      return { inProgress, completed, all, certificates, cpdHours, current, recommended, recommendedList };
    },
  });

  return {
    ...(query.data ?? EMPTY),
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
