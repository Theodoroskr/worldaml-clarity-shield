import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface RecognitionLevel {
  key: string;
  name: string;
  rank: number;
  description: string | null;
  icon: string;
  min_courses: number;
  min_advanced_courses: number;
  min_categories: number;
  min_certificates: number;
}

export interface BadgeCourse {
  slug: string;
  title: string;
  category: string | null;
  difficulty: string | null;
  completed: boolean;
}

export interface RecognitionBadge {
  key: string;
  name: string;
  description: string | null;
  icon: string;
  required_count: number;
  sort_order: number;
  earned_count: number;
  earned: boolean;
  qualifying_courses: BadgeCourse[];
}

export interface RecognitionStatus {
  authenticated: boolean;
  completedCourses: number;
  advancedCourses: number;
  categories: number;
  certificates: number;
  level: RecognitionLevel | null;
  nextLevel: RecognitionLevel | null;
  badges: RecognitionBadge[];
  /** Courses still needed for the next level (course-count criterion only). */
  coursesToNextLevel: number;
  /** 0-100 progress toward the next level. */
  nextLevelPercent: number;
  earnedBadges: RecognitionBadge[];
  inProgressBadges: RecognitionBadge[];
}

const EMPTY: RecognitionStatus = {
  authenticated: false,
  completedCourses: 0,
  advancedCourses: 0,
  categories: 0,
  certificates: 0,
  level: null,
  nextLevel: null,
  badges: [],
  coursesToNextLevel: 0,
  nextLevelPercent: 0,
  earnedBadges: [],
  inProgressBadges: [],
};

function shape(raw: any): RecognitionStatus {
  if (!raw?.authenticated) return EMPTY;
  const badges: RecognitionBadge[] = (raw.badges ?? []).map((b: any) => ({
    ...b,
    earned_count: Number(b.earned_count) || 0,
    qualifying_courses: (b.qualifying_courses ?? []).filter(Boolean),
  }));

  const level: RecognitionLevel | null = raw.level ?? null;
  const nextLevel: RecognitionLevel | null = raw.next_level ?? null;
  const completed = Number(raw.completed_courses) || 0;

  const from = level?.min_courses ?? 0;
  const to = nextLevel?.min_courses ?? from;
  const span = Math.max(1, to - from);
  const nextLevelPercent = nextLevel
    ? Math.min(100, Math.max(0, Math.round(((completed - from) / span) * 100)))
    : 100;

  return {
    authenticated: true,
    completedCourses: completed,
    advancedCourses: Number(raw.advanced_courses) || 0,
    categories: Number(raw.categories) || 0,
    certificates: Number(raw.certificates) || 0,
    level,
    nextLevel,
    badges,
    coursesToNextLevel: nextLevel ? Math.max(0, (nextLevel.min_courses ?? 0) - completed) : 0,
    nextLevelPercent,
    earnedBadges: badges.filter((b) => b.earned),
    inProgressBadges: badges.filter((b) => !b.earned && b.earned_count > 0),
  };
}

/**
 * Member level + specialisation badge progress.
 *
 * Everything is computed server-side by the `academy_recognition_status`
 * security-definer function from real completions and certificates — the
 * frontend never awards or infers recognition on its own.
 */
export function useRecognition() {
  const { user } = useAuth();

  const query = useQuery<RecognitionStatus>({
    queryKey: ["academy-recognition", user?.id],
    enabled: !!user?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("academy_recognition_status");
      if (error) throw error;
      return shape(data);
    },
  });

  return { ...(query.data ?? EMPTY), isLoading: query.isLoading, refetch: query.refetch };
}

export function trackRecognition(event: string) {
  try {
    (window as any).clarity?.("event", `recognition_${event}`);
  } catch {
    /* analytics must never break the UI */
  }
}
