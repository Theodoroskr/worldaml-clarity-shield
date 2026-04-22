import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uxjjxnnyrjkhcggptihx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4amp4bm55cmpraGNnZ3B0aWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMTE5MzIsImV4cCI6MjA4NTU4NzkzMn0.19w0NamKWVZHENxcfXxVNgmhywd3PQUKdKaO3bh_WrQ";

const MIN_QUIZ_QUESTIONS = 9;
const MIN_LEARNING_OUTCOMES = 3;
const MIN_PAID_DURATION_MINUTES = 20;
const MIN_MODULES_ANY = 1;
const MIN_MODULES_PAID = 3;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

    const { data: modules, error: modulesError } = await supabase
      .from("academy_modules")
      .select("course_id");

    expect(modulesError).toBeNull();

    const counts = new Map<string, number>();
    for (const m of modules ?? []) {
      counts.set(m.course_id, (counts.get(m.course_id) ?? 0) + 1);
    }

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

    const { data: modules, error: modulesError } = await supabase
      .from("academy_modules")
      .select("course_id");

    expect(modulesError).toBeNull();

    const counts = new Map<string, number>();
    for (const m of modules ?? []) {
      counts.set(m.course_id, (counts.get(m.course_id) ?? 0) + 1);
    }

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
