import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FREE_ACADEMY_COURSES } from "@/data/academyPricing";

interface CourseRow {
  id: string;
  slug: string;
  title: string;
  sort_order: number;
  category: string | null;
  price_eur_cents: number | null;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
}

interface PurchaseRow {
  course_slug: string;
  status: string;
  expires_at: string | null;
}

export interface GateResult {
  loading: boolean;
  /** Final verdict: can the learner access modules / quiz / certificate? */
  isAccessible: boolean;
  /** True if this course is a paid course (DB has a Stripe price OR not in free set). */
  isPaid: boolean;
  /** True if the learner needs to log in before they can access the course. */
  requiresLogin: boolean;
  /** True if the learner is logged in but needs to purchase first. */
  requiresPurchase: boolean;
  /** Course row from DB (or null if slug unknown). */
  currentCourse: CourseRow | null;
  // Legacy fields kept for backward-compat with old callers; no longer used.
  redirectSlug: string | null;
  prereqTitle: string | null;
}

/**
 * Access policy:
 *  - Visitors must be signed in to access any course modules/quiz/certificate.
 *  - Two free courses (see FREE_ACADEMY_COURSES) unlock as soon as the learner is signed in.
 *  - All other courses require a paid purchase (active row in academy_course_purchases).
 *  - Admins always have access.
 */
export const useCourseGate = (slug: string | undefined): GateResult => {
  const { user, isLoading: authLoading } = useAuth();

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["academy-course-gate", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_courses")
        .select("id, slug, title, sort_order, category, price_eur_cents, stripe_price_id, stripe_product_id")
        .eq("slug", slug!)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return (data as CourseRow | null) ?? null;
    },
  });

  const { data: purchases, isLoading: purchasesLoading } = useQuery({
    queryKey: ["academy-purchases-gate", user?.id, slug],
    enabled: !!user?.id && !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_course_purchases")
        .select("course_slug, status, expires_at")
        .eq("user_id", user!.id)
        .eq("course_slug", slug!)
        .eq("status", "paid");
      if (error) throw error;
      return (data || []) as PurchaseRow[];
    },
  });

  const { data: isAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ["academy-is-admin", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) return false;
      return !!data;
    },
  });

  const loading =
    authLoading ||
    (!!slug && courseLoading) ||
    (!!user && !!slug && purchasesLoading) ||
    (!!user && adminLoading);

  if (loading) {
    return {
      loading: true,
      isAccessible: false,
      isPaid: false,
      requiresLogin: false,
      requiresPurchase: false,
      currentCourse: null,
      redirectSlug: null,
      prereqTitle: null,
    };
  }

  // Unknown slug — let the page render its own not-found state.
  if (!course) {
    return {
      loading: false,
      isAccessible: true,
      isPaid: false,
      requiresLogin: false,
      requiresPurchase: false,
      currentCourse: null,
      redirectSlug: null,
      prereqTitle: null,
    };
  }

  const isFree = FREE_ACADEMY_COURSES.has(course.slug);
  // A course is "paid" when it isn't on the free list. We do NOT require a
  // Stripe price to be set — courses without one just can't be checked out yet,
  // but they still gate behind login + (eventually) purchase.
  const isPaid = !isFree;

  // Not signed in → blocked for every course (free included).
  if (!user) {
    return {
      loading: false,
      isAccessible: false,
      isPaid,
      requiresLogin: true,
      requiresPurchase: false,
      currentCourse: course,
      redirectSlug: null,
      prereqTitle: null,
    };
  }

  // Admins always have access.
  if (isAdmin) {
    return {
      loading: false,
      isAccessible: true,
      isPaid,
      requiresLogin: false,
      requiresPurchase: false,
      currentCourse: course,
      redirectSlug: null,
      prereqTitle: null,
    };
  }

  // Free course + signed in → accessible.
  if (isFree) {
    return {
      loading: false,
      isAccessible: true,
      isPaid: false,
      requiresLogin: false,
      requiresPurchase: false,
      currentCourse: course,
      redirectSlug: null,
      prereqTitle: null,
    };
  }

  // Paid course → must have an active (non-expired) paid purchase row.
  const now = Date.now();
  const hasActivePurchase = (purchases || []).some(
    (p) => !p.expires_at || new Date(p.expires_at).getTime() > now,
  );

  return {
    loading: false,
    isAccessible: hasActivePurchase,
    isPaid: true,
    requiresLogin: false,
    requiresPurchase: !hasActivePurchase,
    currentCourse: course,
    redirectSlug: null,
    prereqTitle: null,
  };
};
