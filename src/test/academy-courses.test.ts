import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uxjjxnnyrjkhcggptihx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4amp4bm55cmpraGNnZ3B0aWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMTE5MzIsImV4cCI6MjA4NTU4NzkzMn0.19w0NamKWVZHENxcfXxVNgmhywd3PQUKdKaO3bh_WrQ";

const MIN_QUIZ_QUESTIONS = 9;
const MIN_LEARNING_OUTCOMES = 3;

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
    const { data: courses, error: cErr } = await supabase
      .from("academy_courses")
      .select("id, slug")
      .eq("is_published", true);

    expect(cErr).toBeNull();
    expect(courses).toBeTruthy();

    const counts = await Promise.all(
      (courses ?? []).map(async (c) => {
        const { data, error } = await supabase
          .from("academy_questions_safe")
          .select("id")
          .eq("course_id", c.id);
        expect(error).toBeNull();
        return { slug: c.slug, count: data?.length ?? 0 };
      }),
    );

    const offenders = counts.filter((c) => c.count < MIN_QUIZ_QUESTIONS);

    expect(
      offenders,
      `Courses below ${MIN_QUIZ_QUESTIONS} questions: ${offenders
        .map((c) => `${c.slug} (${c.count})`)
        .join(", ")}`,
    ).toEqual([]);
  });
});
