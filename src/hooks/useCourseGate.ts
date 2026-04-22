import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CourseRow {
  id: string;
  slug: string;
  title: string;
  sort_order: number;
  category: string | null;
}

interface GateResult {
  loading: boolean;
  isAccessible: boolean;
  redirectSlug: string | null;
  prereqTitle: string | null;
  currentCourse: CourseRow | null;
}

/**
 * Gate access to a course based on whether the learner has passed
 * (i.e. holds a certificate for) the previous course in the same category.
 * Mirrors the sequential-unlock UX on the Academy index.
 */
export const useCourseGate = (slug: string | undefined): GateResult => {
  const { user, isLoading: authLoading } = useAuth();

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["academy-courses-gate"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_courses")
        .select("id, slug, title, sort_order, category")
        .eq("is_published", true)
        .order("sort_order");
      if (error) throw error;
      return (data || []) as CourseRow[];
    },
  });

  const { data: certs, isLoading: certsLoading } = useQuery({
    queryKey: ["academy-certs-gate", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_certificates")
        .select("course_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data || []).map((r) => r.course_id as string);
    },
  });

  const loading = authLoading || coursesLoading || (!!user && certsLoading);

  if (loading || !courses || !slug) {
    return {
      loading: true,
      isAccessible: false,
      redirectSlug: null,
      prereqTitle: null,
      currentCourse: null,
    };
  }

  const currentCourse = courses.find((c) => c.slug === slug) ?? null;
  if (!currentCourse) {
    // Unknown slug — let the page render its own not-found state.
    return {
      loading: false,
      isAccessible: true,
      redirectSlug: null,
      prereqTitle: null,
      currentCourse: null,
    };
  }

  // Logged-out: only the first course of each category is accessible.
  const passed = new Set(certs ?? []);
  const category = currentCourse.category || "global";
  const sameCategory = courses
    .filter((c) => (c.category || "global") === category)
    .sort((a, b) => a.sort_order - b.sort_order);

  const idx = sameCategory.findIndex((c) => c.id === currentCourse.id);
  if (idx <= 0) {
    return {
      loading: false,
      isAccessible: true,
      redirectSlug: null,
      prereqTitle: null,
      currentCourse,
    };
  }

  const previous = sameCategory[idx - 1];
  const prevPassed = !!user && passed.has(previous.id);

  if (prevPassed) {
    return {
      loading: false,
      isAccessible: true,
      redirectSlug: null,
      prereqTitle: null,
      currentCourse,
    };
  }

  return {
    loading: false,
    isAccessible: false,
    redirectSlug: previous.slug,
    prereqTitle: previous.title,
    currentCourse,
  };
};
