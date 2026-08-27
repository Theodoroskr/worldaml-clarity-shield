import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  Category,
  categoryForSourceType,
  getProvider,
  PROVIDER_SOURCE_TYPES,
  ProviderError,
  providerErrorResponse,
  ScreeningOptions,
  ScreeningSubjectInput,
  SUBJECT_TYPES,
} from "../_shared/screening/index.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: "Unauthorized" }, 401);

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid screening information" }, 400);
  }

  const rawSubject = (payload.subject ?? {}) as Record<string, unknown>;
  // Normalise: trim strings and drop blanks so empty optional inputs never fail validation.
  const subject = Object.fromEntries(
    Object.entries(rawSubject)
      .map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
      .filter(([, v]) => v !== "" && v !== null && v !== undefined),
  ) as unknown as ScreeningSubjectInput;
  const includeAdverseMedia = payload.include_adverse_media === true;
  const startMonitoring = payload.start_monitoring === true;
  const advanced = (payload.advanced ?? {}) as Record<string, unknown>;

  if (typeof subject.full_name !== "string" || !subject.full_name) {
    return json({ error: "Enter the name of the subject to screen" }, 400);
  }
  if (!(SUBJECT_TYPES as string[]).includes(String(subject.subject_type))) {
    return json({ error: "Select a subject type (individual, company, organisation, vessel or aircraft)" }, 400);
  }
  if (subject.full_name.length > 300) {
    return json({ error: "The name is too long (maximum 300 characters)" }, 400);
  }

  // ── resolve organisation ────────────────────────────────────────────────
  const { data: membership } = await admin
    .from("suite_org_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  const orgId = membership?.organization_id as string | undefined;
  if (!orgId) return json({ error: "No organisation is linked to your account" }, 403);

  // ── resolve policy ──────────────────────────────────────────────────────
  await admin.rpc("ensure_default_screening_policy", { _org: orgId });
  const { data: policy } = await admin
    .from("screening_policies")
    .select("id, name, config, current_version")
    .eq("organisation_id", orgId)
    .eq("is_active", true)
    .order("is_default", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!policy) return json({ error: "No screening policy is configured" }, 400);

  const cfg = (policy.config ?? {}) as Record<string, unknown>;
  const { data: version } = await admin
    .from("screening_policy_versions")
    .select("id")
    .eq("policy_id", policy.id)
    .eq("version", policy.current_version)
    .maybeSingle();

  const categories: Category[] = [];
  if (cfg.sanctions !== false) categories.push("sanctions");
  if (cfg.pep !== false) categories.push("pep_rca");
  if (cfg.warnings !== false) categories.push("warnings");
  const adverseMediaAllowed = cfg.adverse_media === true;
  const adverseMediaOn = includeAdverseMedia && adverseMediaAllowed;
  if (adverseMediaOn) categories.push("adverse_media");

  if (includeAdverseMedia && !adverseMediaAllowed) {
    return json({ error: "Adverse media is not included in your plan" }, 403);
  }

  const allowAdvanced = cfg.allow_user_advanced_options !== false;
  const options: ScreeningOptions = {
    categories,
    nameThreshold: allowAdvanced && typeof advanced.name_threshold === "number"
      ? Math.max(0.4, Math.min(1, advanced.name_threshold as number))
      : Number(cfg.name_threshold ?? 0.75),
    exactMatch: allowAdvanced ? advanced.exact_match === true : cfg.exact_match === true,
    countries: allowAdvanced && Array.isArray(advanced.countries)
      ? (advanced.countries as string[]).slice(0, 10)
      : undefined,
    yearOfBirth: (allowAdvanced && typeof advanced.year_of_birth === "number"
      ? advanced.year_of_birth
      : subject.year_of_birth) ?? null,
    maxResults: Math.min(Number(advanced.max_results ?? cfg.max_results ?? 50), 100),
    monitoring: startMonitoring,
  };

  const excluded: Category[] = (["sanctions", "pep_rca", "warnings", "adverse_media"] as Category[])
    .filter((c) => !categories.includes(c));

  // ── persist subject + search shell ──────────────────────────────────────
  const { data: subjectRow, error: subjectErr } = await admin
    .from("screening_subjects")
    .insert({
      organisation_id: orgId,
      subject_type: subject.subject_type,
      full_name: subject.full_name.trim(),
      first_name: subject.first_name ?? null,
      middle_name: subject.middle_name ?? null,
      last_name: subject.last_name ?? null,
      previous_name: subject.previous_name ?? null,
      date_of_birth: subject.date_of_birth || null,
      year_of_birth: subject.year_of_birth ?? null,
      incorporation_date: subject.incorporation_date || null,
      country_of_residence: subject.country_of_residence ?? null,
      nationality: subject.nationality ?? null,
      country_of_incorporation: subject.country_of_incorporation ?? null,
      identification_number: subject.identification_number ?? null,
      registration_number: subject.registration_number ?? null,
      registered_address: subject.registered_address ?? null,
      customer_reference: subject.customer_reference ?? null,
      created_by: user.id,
    })
    .select("id")
    .single();
  if (subjectErr || !subjectRow) return json({ error: "Screening could not be completed" }, 500);

  const { data: refData } = await admin.rpc("next_screening_reference", { _prefix: "SCR" });
  const reference = (refData as string) ?? `WAML-SCR-${new Date().getFullYear()}-${Date.now()}`;
  const idempotencyKey = `${orgId}:${reference}`;

  // ── call the provider ───────────────────────────────────────────────────
  const started = Date.now();
  let result;
  try {
    const provider = getProvider();
    result = await provider.createScreening(subject, options, idempotencyKey);
    if (startMonitoring) {
      try {
        await provider.startMonitoring(result.provider_search_id);
      } catch (_) {
        // monitoring failure must not void a completed screening
      }
    }
  } catch (err) {
    const detail = err instanceof ProviderError ? err.detail : String(err);
    const { data: failed } = await admin
      .from("screening_searches")
      .insert({
        organisation_id: orgId,
        subject_id: subjectRow.id,
        reference,
        policy_id: policy.id,
        policy_version_id: version?.id ?? null,
        policy_name: policy.name,
        categories_screened: [],
        categories_excluded: ["sanctions", "pep_rca", "warnings", "adverse_media"],
        search_parameters: { requested: options },
        adverse_media_requested: includeAdverseMedia,
        monitoring_requested: startMonitoring,
        status: "failed",
        error_message: err instanceof ProviderError ? err.userMessage : "Screening could not be completed",
        initiated_by: user.id,
      })
      .select("id")
      .single();
    await admin.from("provider_raw_responses").insert({
      organisation_id: orgId,
      search_id: failed?.id ?? null,
      provider: "provider",
      operation: "createScreening",
      error_detail: detail.slice(0, 4000),
      duration_ms: Date.now() - started,
    });
    // No credit is consumed when no valid search was created.
    return providerErrorResponse(err, corsHeaders);
  }

  // ── persist normalised results ──────────────────────────────────────────
  const { data: search } = await admin
    .from("screening_searches")
    .insert({
      organisation_id: orgId,
      subject_id: subjectRow.id,
      reference,
      policy_id: policy.id,
      policy_version_id: version?.id ?? null,
      policy_name: policy.name,
      categories_screened: categories,
      categories_excluded: excluded,
      search_parameters: {
        name_threshold: options.nameThreshold,
        exact_match: options.exactMatch,
        countries: options.countries ?? [],
        year_of_birth: options.yearOfBirth,
        max_results: options.maxResults,
      },
      adverse_media_requested: adverseMediaOn,
      monitoring_requested: startMonitoring,
      status: "completed",
      initiated_by: user.id,
    })
    .select("id")
    .single();

  await admin.from("provider_raw_responses").insert({
    organisation_id: orgId,
    search_id: search?.id ?? null,
    provider: result.provider,
    operation: "createScreening",
    request_payload: { subject: subject.full_name, options },
    response_payload: result.raw as Record<string, unknown>,
    http_status: 200,
    duration_ms: Date.now() - started,
  });
  await admin.from("provider_references").insert({
    organisation_id: orgId,
    entity_kind: "search",
    entity_id: search!.id,
    provider: result.provider,
    provider_id: result.provider_search_id,
    provider_ref: {},
  });

  const counts = { sanctions: 0, pep_rca: 0, warnings: 0, adverse_media: 0 } as Record<Category, number>;
  for (const m of result.matches) for (const c of m.categories) counts[c] = (counts[c] ?? 0) + 1;

  const hasMatches = result.matches.length > 0;
  const { data: caseRow } = await admin
    .from("screening_cases")
    .insert({
      organisation_id: orgId,
      case_reference: reference.replace("-SCR-", "-CASE-"),
      search_id: search!.id,
      subject_id: subjectRow.id,
      customer_reference: subject.customer_reference ?? null,
      status: hasMatches ? "potential_matches_require_review" : "no_potential_matches",
      priority: counts.sanctions > 0 ? "high" : "medium",
      assigned_to: user.id,
      monitoring_status: startMonitoring ? "active" : null,
      sanctions_matches: counts.sanctions,
      pep_matches: counts.pep_rca,
      warning_matches: counts.warnings,
      adverse_media_matches: counts.adverse_media,
      created_by: user.id,
    })
    .select("id, case_reference")
    .single();

  for (const m of result.matches) {
    const { data: matchRow } = await admin
      .from("screening_matches")
      .insert({
        organisation_id: orgId,
        case_id: caseRow!.id,
        search_id: search!.id,
        matched_name: m.matched_name,
        entity_type: m.entity_type,
        categories: m.categories,
        category_labels: m.category_labels,
        name_similarity: m.name_similarity,
        country: m.country,
        year_of_birth: m.year_of_birth,
        matched_attribute_count: m.matched_attribute_count,
        conflicting_attribute_count: m.conflicting_attribute_count,
        profile: m.profile,
        last_data_update: m.last_data_update,
      })
      .select("id")
      .single();
    if (!matchRow) continue;

    await admin.from("provider_references").insert({
      organisation_id: orgId,
      entity_kind: "match",
      entity_id: matchRow.id,
      provider: result.provider,
      provider_id: m.provider_id,
      provider_ref: { search_id: result.provider_search_id },
    });
    if (m.attributes.length) {
      await admin.from("match_attributes").insert(
        m.attributes.map((a) => ({ organisation_id: orgId, match_id: matchRow.id, ...a })),
      );
    }
    if (m.sources.length) {
      await admin.from("screening_sources").insert(
        m.sources.map((s) => ({ organisation_id: orgId, match_id: matchRow.id, ...s })),
      );
    }
    if (adverseMediaOn && m.adverse_media.length) {
      await admin.from("adverse_media_items").insert(
        m.adverse_media.map((a) => ({
          organisation_id: orgId,
          match_id: matchRow.id,
          case_id: caseRow!.id,
          ...a,
        })),
      );
    }
  }

  if (startMonitoring) {
    const { data: mon } = await admin
      .from("monitoring_subjects")
      .insert({
        organisation_id: orgId,
        subject_id: subjectRow.id,
        case_id: caseRow!.id,
        categories,
        frequency: String(cfg.monitoring_frequency ?? "daily"),
        assigned_to: user.id,
        created_by: user.id,
      })
      .select("id")
      .single();
    if (mon) {
      await admin.from("provider_references").insert({
        organisation_id: orgId,
        entity_kind: "monitor",
        entity_id: mon.id,
        provider: result.provider,
        provider_id: result.provider_search_id,
        provider_ref: {},
      });
    }
  }

  await admin.from("usage_transactions").insert({
    organisation_id: orgId,
    kind: "screening",
    credits: 1,
    search_id: search!.id,
    description: `Screening ${reference}`,
    created_by: user.id,
  });

  await admin.from("screening_audit_events").insert({
    organisation_id: orgId,
    case_id: caseRow!.id,
    event_type: "screening_run",
    description: `Screening ${reference} completed under policy ${policy.name}`,
    metadata: { categories, adverse_media: adverseMediaOn, monitoring: startMonitoring },
    actor_id: user.id,
  });

  return json({
    case_id: caseRow!.id,
    case_reference: caseRow!.case_reference,
    search_id: search!.id,
    reference,
    policy_name: policy.name,
    categories_screened: categories,
    categories_excluded: excluded,
    match_count: result.matches.length,
  });
});
