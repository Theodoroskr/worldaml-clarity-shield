import { describe, it, expect } from "vitest";
import { publicClient as supabase } from "./helpers/academyTestClient";

const MIN_QUIZ_QUESTIONS = 9;
const MIN_LEARNING_OUTCOMES = 3;
const MIN_PAID_DURATION_MINUTES = 20;
const MIN_MODULES_ANY = 1;
const MIN_MODULES_PAID = 2;

/**
 * Module counts come from the public get_academy_module_counts lookup (the
 * same one the Academy listing uses), because module content itself is only
 * readable by learners with course access.
 */
async function moduleCounts() {
  const { data, error } = await supabase.rpc("get_academy_module_counts");
  expect(error).toBeNull();
  expect(data).toBeTruthy();
  const counts = new Map<string, number>();
  for (const row of (data ?? []) as Array<{ course_id: string; module_count: number }>) {
    counts.set(row.course_id, Number(row.module_count));
  }
  return counts;
}

describe("Academy paid-credential standard", () => {
  it("every published course has learning_outcomes populated", async () => {
    const { data: courses, error } = await supabase
      .from("academy_courses")
      .select("slug, title, learning_outcomes")
      .eq("is_published", true);

    expect(error).toBeNull();
    expect(courses).toBeTruthy();

    const offenders = (courses ?? []).filter(
      (c) =>
        !Array.isArray(c.learning_outcomes) ||
        c.learning_outcomes.length < MIN_LEARNING_OUTCOMES,
    );

    expect(
      offenders,
      `Courses missing learning_outcomes (>=${MIN_LEARNING_OUTCOMES}): ${offenders
        .map((c) => c.slug)
        .join(", ")}`,
    ).toEqual([]);
  });

  it(`every published course has at least ${MIN_QUIZ_QUESTIONS} quiz questions`, async () => {
    const { data, error } = await supabase.rpc(
      "academy_course_question_counts",
    );

    expect(error).toBeNull();
    expect(data).toBeTruthy();

    const rows = (data ?? []) as Array<{
      slug: string;
      question_count: number;
    }>;

    const offenders = rows.filter(
      (r) => Number(r.question_count) < MIN_QUIZ_QUESTIONS,
    );

    expect(
      offenders,
      `Courses below ${MIN_QUIZ_QUESTIONS} questions: ${offenders
        .map((r) => `${r.slug} (${r.question_count})`)
        .join(", ")}`,
    ).toEqual([]);
  });

  it(`every paid (non-beginner) course is at least ${MIN_PAID_DURATION_MINUTES} minutes`, async () => {
    const { data: courses, error } = await supabase
      .from("academy_courses")
      .select("slug, difficulty, duration_minutes")
      .eq("is_published", true)
      .neq("difficulty", "beginner");

    expect(error).toBeNull();
    expect(courses).toBeTruthy();

    const offenders = (courses ?? []).filter(
      (c) => (c.duration_minutes ?? 0) < MIN_PAID_DURATION_MINUTES,
    );

    expect(
      offenders,
      `Paid courses below ${MIN_PAID_DURATION_MINUTES} min: ${offenders
        .map((c) => `${c.slug} (${c.duration_minutes}m)`)
        .join(", ")}`,
    ).toEqual([]);
  });

  it(`every published course has at least ${MIN_MODULES_ANY} module`, async () => {
    const { data: courses, error: coursesError } = await supabase
      .from("academy_courses")
      .select("id, slug")
      .eq("is_published", true);

    expect(coursesError).toBeNull();
    expect(courses).toBeTruthy();

    const counts = await moduleCounts();

    const offenders = (courses ?? []).filter(
      (c) => (counts.get(c.id) ?? 0) < MIN_MODULES_ANY,
    );

    expect(
      offenders,
      `Published courses with no modules: ${offenders
        .map((c) => c.slug)
        .join(", ")}`,
    ).toEqual([]);
  });

  it(`every paid (non-beginner) published course has at least ${MIN_MODULES_PAID} modules`, async () => {
    const { data: courses, error: coursesError } = await supabase
      .from("academy_courses")
      .select("id, slug, difficulty")
      .eq("is_published", true)
      .neq("difficulty", "beginner");

    expect(coursesError).toBeNull();
    expect(courses).toBeTruthy();

    const counts = await moduleCounts();

    const offenders = (courses ?? []).filter(
      (c) => (counts.get(c.id) ?? 0) < MIN_MODULES_PAID,
    );

    expect(
      offenders,
      `Paid courses below ${MIN_MODULES_PAID} modules: ${offenders
        .map((c) => `${c.slug} (${counts.get(c.id) ?? 0})`)
        .join(", ")}`,
    ).toEqual([]);
  });
});
