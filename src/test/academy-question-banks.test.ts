import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uxjjxnnyrjkhcggptihx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4amp4bm55cmpraGNnZ3B0aWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMTE5MzIsImV4cCI6MjA4NTU4NzkzMn0.19w0NamKWVZHENxcfXxVNgmhywd3PQUKdKaO3bh_WrQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const REQUIRED_COUNT = 30;

/**
 * Source-of-truth map of the ✅ correct answer text for each
 * foundational course, keyed by sort_order (1..30).
 *
 * These mirror the question banks loaded for:
 * - AML Fundamentals
 * - CDD & KYC
 * - Suspicious Activity & Reporting
 *
 * The test asserts options[correct_index] === EXPECTED_CORRECT[slug][sort_order].
 */
const EXPECTED_CORRECT: Record<string, Record<number, string>> = {
  "aml-fundamentals": {
    1: "Making illegal funds appear legal",
    2: "Placement",
    3: "Hiding the origin of funds through complex transactions",
    4: "Returning funds to the economy as legitimate",
    5: "Funds derived from criminal activity",
    6: "All obliged entities",
    7: "A suspicious indicator",
    8: "Funding terrorism using legal or illegal funds",
    9: "The AML Compliance Officer",
    10: "A crime that generates the funds being laundered",
    11: "Layering",
    12: "Splitting transactions to avoid reporting thresholds",
    13: "Continuous review of customer activity",
    14: "Risk linked to a country or jurisdiction",
    15: "Report internally to the AMLCO",
    16: "Prevent financial crime and protect the financial system",
    17: "Legal, financial and reputational damage",
    18: "Weak AML controls or sanctions exposure",
    19: "Customer Due Diligence",
    20: "Focusing controls on higher-risk clients and activities",
    21: "Placement",
    22: "Prevent misuse of the financial system",
    23: "Immediately, without delay",
    24: "Personal criminal liability for the individual",
    25: "Yes",
    26: "Funds appear legitimate and re-enter the economy",
    27: "Multiple transactions designed to obscure origin",
    28: "Effective AML controls in place and tested",
    29: "Entry of illegal funds into the financial system",
    30: "Documented AML procedures and controls",
  },
  "kyc-customer-due-diligence": {
    1: "Customer Due Diligence",
    2: "Identify the client",
    3: "Confirming the client's identity using reliable sources",
    4: "Ultimate Beneficial Owner",
    5: "25%",
    6: "Passport",
    7: "Recent utility bill",
    8: "At onboarding and on an ongoing basis",
    9: "An ongoing relationship of expected duration",
    10: "To know your client and assess risk",
    11: "Simplified Due Diligence",
    12: "Enhanced Due Diligence",
    13: "High-risk clients such as PEPs and high-risk jurisdictions",
    14: "Complex or opaque ownership structures",
    15: "Continuous review of activity against the client profile",
    16: "Identity fraud and impersonation risk",
    17: "The origin of the specific money used in a transaction",
    18: "How a client's overall wealth was generated",
    19: "Suspicion or material changes in the client profile",
    20: "Do not proceed and consider reporting",
    21: "Adjusting CDD intensity to the client's risk",
    22: "Senior management or AMLCO",
    23: "The obliged entity remains liable for the CDD",
    24: "Complex or layered ownership structures",
    25: "All identification, verification, decisions and risk assessment",
    26: "Additional verification, source of funds and senior approval",
    27: "A Politically Exposed Person with elevated risk",
    28: "Control can exist without ownership, e.g. via voting rights",
    29: "To detect inconsistencies between activity and the client profile",
    30: "Poor or undocumented verification",
  },
  "transaction-monitoring-sar": {
    1: "A reasonable concern that something may be wrong",
    2: "No, reasonable grounds are sufficient",
    3: "A risk indicator that warrants attention",
    4: "The AMLCO internally",
    5: "A Suspicious Activity / Transaction Report",
    6: "Informing the client they are under suspicion",
    7: "Yes, it is a legal obligation",
    8: "Restricting information about a suspicion to those who need to know",
    9: "Evaluate suspicions and decide on external reporting",
    10: "An unusual pattern or behaviour",
    11: "What a reasonable professional in your position would suspect",
    12: "Your own personal suspicion",
    13: "Unusual transactions inconsistent with the client profile",
    14: "Trust structures and complex vehicles",
    15: "Exposure to high-risk or sanctioned jurisdictions",
    16: "Risk arising from the client's behaviour, activity or structure",
    17: "Wait for AMLCO instructions",
    18: "No, not without AMLCO approval",
    19: "The suspicion and the reasoning supporting it",
    20: "Multiple unexplained red flags",
    21: "It is a criminal offence",
    22: "Immediately, without undue delay",
    23: "Clear, factual and well-structured narrative",
    24: "The AMLCO and the competent authorities",
    25: "Compliance failure and potential liability",
    26: "Report the suspicion through internal channels",
    27: "Do not disclose the report to the client",
    28: "Stop and wait for instructions; maintain records",
    29: "Personal legal exposure including criminal liability",
    30: "Act on suspicion promptly and through the right channels",
  },
};

describe("Foundational course question banks", () => {
  for (const slug of Object.keys(EXPECTED_CORRECT)) {
    describe(slug, () => {
      it(`has exactly ${REQUIRED_COUNT} questions and correct_index points to the ✅ option`, async () => {
        const { data: course, error: courseError } = await supabase
          .from("academy_courses")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

        expect(courseError).toBeNull();
        expect(course, `Course ${slug} not found`).toBeTruthy();

        const { data: questions, error: qError } = await supabase
          .from("academy_questions")
          .select("question, options, correct_index, sort_order")
          .eq("course_id", course!.id)
          .order("sort_order", { ascending: true });

        expect(qError).toBeNull();
        expect(questions).toBeTruthy();

        // 1. Exactly 30 questions
        expect(
          questions!.length,
          `${slug} has ${questions!.length} questions, expected ${REQUIRED_COUNT}`,
        ).toBe(REQUIRED_COUNT);

        // 2. correct_index must be a valid index into options
        // 3. options[correct_index] must equal the expected ✅ answer
        const expected = EXPECTED_CORRECT[slug];
        const mismatches: string[] = [];

        for (const q of questions!) {
          const opts = q.options as unknown as string[];
          if (!Array.isArray(opts) || opts.length < 2) {
            mismatches.push(
              `Q${q.sort_order}: options is not a valid array`,
            );
            continue;
          }
          if (
            typeof q.correct_index !== "number" ||
            q.correct_index < 0 ||
            q.correct_index >= opts.length
          ) {
            mismatches.push(
              `Q${q.sort_order}: correct_index ${q.correct_index} out of range (0..${opts.length - 1})`,
            );
            continue;
          }
          const actual = opts[q.correct_index];
          const want = expected[q.sort_order];
          if (want && actual !== want) {
            mismatches.push(
              `Q${q.sort_order}: correct option is "${actual}", expected "${want}"`,
            );
          }
        }

        expect(
          mismatches,
          `${slug} answer-key mismatches:\n - ${mismatches.join("\n - ")}`,
        ).toEqual([]);
      });
    });
  }
});
