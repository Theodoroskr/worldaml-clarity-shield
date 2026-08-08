import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAcademyPurchases } from "@/hooks/useAcademyPurchases";
import { ACADEMY_PRICING, FREE_ACADEMY_COURSES } from "@/data/academyPricing";

export type OwnershipSource = "free" | "purchase" | "annual-pass" | "admin" | null;
export type CourseStatus = "not-owned" | "not-started" | "in-progress" | "completed";

export interface CatalogueCourse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  durationMinutes: number | null;
  cpdHours: number | null;
  imageUrl: string | null;
  sortOrder: number;
  createdAt: string | null;
  /** Base EUR price in cents. 0 = free. */
  priceEurCents: number;
  isFree: boolean;
  owned: boolean;
  ownedVia: OwnershipSource;
  status: CourseStatus;
  percent: number;
  completedModules: number;
  totalModules: number;
  quizPassed: boolean;
  certificateToken: string | null;
  lastActivity: string | null;
}

/** Human labels for the real `category` values stored on academy_courses. */
export const CATEGORY_LABELS: Record<string, string> = {
  foundational: "Foundational",
  "global-foundational": "Global Foundational",
  specialisation: "Specialisation",
  "global-specialisation": "Global Specialisation",
  regional: "Regional AML",
  sector: "Industry-Specific",
};

export const categoryLabel = (c: string | null | undefined) =>
  (c && CATEGORY_LABELS[c]) || (c ? c.replace(/-/g, " ") : "General");

export const difficultyLabel = (d: string | null | undefined) =>
  d ? d.charAt(0).toUpperCase() + d.slice(1) : "All levels";

interface RawCourse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  duration_minutes: number | null;
  cpd_hours: number | null;
  image_url: string | null;
  sort_order: number | null;
  created_at: string | null;
  price_eur_cents: number | null;
}

/**
 * Full authenticated Academy catalogue: every published course enriched with the
 * learner's real ownership (free / purchase / annual pass / admin) and progress.
 * Ownership is always re-derived from the database — never from local state.
 */
export function useAcademyCatalogue() {
  const { user, isAdmin } = useAuth();
  const { purchasedSlugs, hasAnnualPass, isLoading: purchasesLoading } = useAcademyPurchases();

  const query = useQuery({
    queryKey: ["academy-catalogue", user?.id],
    queryFn: async () => {
      const [coursesRes, moduleRes, progressRes, certsRes] = await Promise.all([
        supabase
          .from("academy_courses")
          .select(
            "id, slug, title, description, category, difficulty, duration_minutes, cpd_hours, image_url, sort_order, created_at, price_eur_cents",
          )
          .eq("is_published", true)
          .order("sort_order", { ascending: true }),
        supabase.rpc("get_academy_module_counts"),
        user
          ? supabase
              .from("academy_progress")
              .select("course_id, completed_modules, quiz_passed, completed_at, created_at")
              .eq("user_id", user.id)
          : Promise.resolve({ data: [] as any[] }),
        user
          ? supabase
              .from("academy_certificates")
              .select("course_id, share_token")
              .eq("user_id", user.id)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const courses = (coursesRes.data ?? []) as RawCourse[];
      const totals = new Map<string, number>();
      ((moduleRes as any).data ?? []).forEach((m: any) =>
        totals.set(m.course_id, Number(m.module_count) || 0),
      );
      const progressByCourse = new Map<string, any>();
      ((progressRes as any).data ?? []).forEach((p: any) => progressByCourse.set(p.course_id, p));
      const certByCourse = new Map<string, string>();
      ((certsRes as any).data ?? []).forEach((c: any) => certByCourse.set(c.course_id, c.share_token));

      return { courses, totals, progressByCourse, certByCourse };
    },
  });

  const raw = query.data;

  const courses: CatalogueCourse[] = (raw?.courses ?? []).map((c) => {
    const priceEurCents = c.price_eur_cents ?? ACADEMY_PRICING[c.slug]?.eurCents ?? 0;
    const isFree = priceEurCents <= 0 || FREE_ACADEMY_COURSES.has(c.slug);

    let ownedVia: OwnershipSource = null;
    if (isFree) ownedVia = "free";
    else if (purchasedSlugs.has(c.slug)) ownedVia = "purchase";
    else if (hasAnnualPass) ownedVia = "annual-pass";
    else if (isAdmin) ownedVia = "admin";
    const owned = !!user && ownedVia !== null;

    const p = raw?.progressByCourse.get(c.id);
    const totalModules = raw?.totals.get(c.id) ?? 0;
    const completedModules = Array.isArray(p?.completed_modules) ? p.completed_modules.length : 0;
    const percent = totalModules > 0 ? Math.min(100, Math.round((completedModules / totalModules) * 100)) : 0;
    const quizPassed = !!p?.quiz_passed;

    let status: CourseStatus = "not-owned";
    if (owned) {
      if (quizPassed) status = "completed";
      else if (completedModules > 0) status = "in-progress";
      else status = "not-started";
    }

    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      category: c.category,
      difficulty: c.difficulty,
      durationMinutes: c.duration_minutes,
      cpdHours: c.cpd_hours != null ? Number(c.cpd_hours) : null,
      imageUrl: c.image_url,
      sortOrder: c.sort_order ?? 999,
      createdAt: c.created_at,
      priceEurCents,
      isFree,
      owned,
      ownedVia,
      status,
      percent,
      completedModules,
      totalModules,
      quizPassed,
      certificateToken: raw?.certByCourse.get(c.id) ?? null,
      lastActivity: p?.completed_at ?? p?.created_at ?? null,
    };
  });

  return {
    courses,
    isLoading: query.isLoading || purchasesLoading,
    refetch: query.refetch,
    hasAnnualPass,
  };
}
