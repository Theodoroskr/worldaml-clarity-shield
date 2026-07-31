/**
 * Regulator adapter interface.
 *
 * Each adapter knows how to package a report for one filing channel
 * (goAML XML, FINTRAC EFT, FinCEN BSA, manual portal upload, etc.).
 *
 * Real API integrations plug in by registering an implementation
 * against an `adapter_key` — the DB row in `suite_regulator_adapters`
 * describes metadata & SLA; this file provides the runtime contract.
 */

import { supabase } from "@/integrations/supabase/client";

export type SubmissionStatus =
  | "queued"
  | "submitting"
  | "submitted"
  | "acknowledged"
  | "rejected"
  | "failed"
  | "cancelled";

export interface AdapterSubmitInput {
  submissionId: string;
  organisationId: string;
  reportKind: string;
  reportId?: string | null;
  requestPayload: Record<string, unknown>;
}

export interface AdapterSubmitResult {
  status: SubmissionStatus;
  externalReference?: string;
  responsePayload?: Record<string, unknown>;
  error?: string;
}

export interface RegulatorAdapter {
  key: string;
  label: string;
  /** True if this adapter actually calls a live regulator API. */
  isLive: boolean;
  submit(input: AdapterSubmitInput): Promise<AdapterSubmitResult>;
}

/* ------------------------------------------------------------------ */
/* Built-in stub adapters                                             */
/* ------------------------------------------------------------------ */

const manualUpload: RegulatorAdapter = {
  key: "manual_upload",
  label: "Manual portal upload",
  isLive: true,
  async submit({ requestPayload }) {
    // Manual channel: caller records the reference themselves.
    return {
      status: "submitted",
      externalReference: (requestPayload.reference as string) || undefined,
      responsePayload: { channel: "manual", recordedAt: new Date().toISOString() },
    };
  },
};

const goAmlStub: RegulatorAdapter = {
  key: "goaml_xml_v5",
  label: "UNODC goAML XML v5",
  isLive: false,
  async submit() {
    return {
      status: "queued",
      responsePayload: {
        note: "goAML XML v5 package generated. Live submission not yet wired — download the XML from the case bundle and upload to the FIU portal.",
      },
    };
  },
};

const fintracStub: RegulatorAdapter = {
  key: "fintrac_eft",
  label: "FINTRAC F2R / EFT",
  isLive: false,
  async submit() {
    return {
      status: "queued",
      responsePayload: { note: "FINTRAC adapter is a stub — enable API credentials to go live." },
    };
  },
};

/** Minimum structural checks before anything is sent to FINTRAC. */
function validateFwrPayload(p: Record<string, unknown>): string[] {
  const errs: string[] = [];
  if (p.schemaVersion !== "1.0") errs.push("Payload is not an FWR v1.0 package.");
  const allowed = ["STR", "LCTR", "EFTR", "LVCTR", "CDR", "LPEPR"];
  if (!allowed.includes(String(p.reportType))) errs.push(`Unsupported reportType "${p.reportType}".`);
  if (!p.reportReference) errs.push("Missing report reference.");
  const gi = p.generalInformation as { reportingEntity?: { name?: string } } | undefined;
  if (!gi?.reportingEntity?.name) errs.push("Missing reporting entity name.");
  const details = p.detailsOfSuspicion as { narrative?: string } | undefined;
  if (p.reportType === "STR" && !details?.narrative) {
    errs.push("STR requires a details-of-suspicion narrative (Part G).");
  }
  return errs;
}

/**
 * FINTRAC FINTRAC Web Reporting (FWR) API adapter.
 *
 * Validates the generated FWR JSON package, then hands it to the
 * `fintrac-fwr-submit` edge function which holds the API credentials.
 * When credentials are not configured the submission stays queued with a
 * clear instruction to file through the FWR portal manually.
 */
const fintracFwrApi: RegulatorAdapter = {
  key: "fintrac_fwr_api",
  label: "FINTRAC FWR API",
  isLive: true,
  async submit({ submissionId, reportKind, requestPayload }) {
    const errors = validateFwrPayload(requestPayload);
    if (errors.length > 0) {
      return {
        status: "failed",
        error: `FWR validation failed: ${errors.join(" ")}`,
        responsePayload: { validationErrors: errors },
      };
    }

    const { data, error } = await supabase.functions.invoke("fintrac-fwr-submit", {
      body: { submissionId, reportKind, payload: requestPayload },
    });

    if (error) {
      return {
        status: "failed",
        error: error.message,
        responsePayload: { channel: "fintrac_fwr_api" },
      };
    }

    const res = (data ?? {}) as {
      configured?: boolean;
      accepted?: boolean;
      reference?: string;
      message?: string;
    };

    if (res.configured === false) {
      return {
        status: "queued",
        responsePayload: {
          channel: "fintrac_fwr_api",
          note:
            res.message ||
            "FINTRAC FWR API credentials are not configured. The validated FWR package is ready — upload it through the FWR portal and record the reference.",
        },
      };
    }

    return {
      status: res.accepted ? "submitted" : "failed",
      externalReference: res.reference,
      error: res.accepted ? undefined : res.message,
      responsePayload: { channel: "fintrac_fwr_api", ...res },
    };
  },
};


const fincenStub: RegulatorAdapter = {
  key: "fincen_bsa",
  label: "FinCEN BSA E-Filing",
  isLive: false,
  async submit() {
    return {
      status: "queued",
      responsePayload: { note: "FinCEN BSA adapter is a stub — enable API credentials to go live." },
    };
  },
};

const mokasStub: RegulatorAdapter = {
  key: "mokas_email",
  label: "MOKAS secure email",
  isLive: false,
  async submit() {
    return {
      status: "queued",
      responsePayload: { note: "MOKAS secure-email packaging pending — deliver via approved encrypted channel." },
    };
  },
};

/* ------------------------------------------------------------------ */
/* Registry                                                           */
/* ------------------------------------------------------------------ */

const registry = new Map<string, RegulatorAdapter>();

export function registerAdapter(adapter: RegulatorAdapter) {
  registry.set(adapter.key, adapter);
}

export function getAdapter(key: string): RegulatorAdapter | undefined {
  return registry.get(key);
}

export function listAdapterKeys(): string[] {
  return [...registry.keys()];
}

// Seed built-ins
[manualUpload, goAmlStub, fintracStub, fincenStub, mokasStub].forEach(registerAdapter);

/* ------------------------------------------------------------------ */
/* Runner: dispatch + persist the outcome                             */
/* ------------------------------------------------------------------ */

export async function runSubmission(submissionId: string): Promise<AdapterSubmitResult> {
  const { data: sub, error } = await supabase
    .from("suite_regulator_submissions" as never)
    .select("*")
    .eq("id", submissionId)
    .maybeSingle();

  if (error) throw error;
  if (!sub) throw new Error(`Submission ${submissionId} not found`);

  const row = sub as {
    id: string;
    organisation_id: string;
    adapter: string;
    report_kind: string;
    report_id: string | null;
    request_payload: Record<string, unknown>;
    attempt_count: number;
  };

  const adapter = getAdapter(row.adapter);
  if (!adapter) {
    await supabase
      .from("suite_regulator_submissions" as never)
      .update({
        status: "failed",
        last_error: `No adapter registered for key "${row.adapter}"`,
        attempt_count: (row.attempt_count ?? 0) + 1,
      } as never)
      .eq("id", submissionId);
    throw new Error(`No adapter registered for key "${row.adapter}"`);
  }

  // Mark submitting
  await supabase
    .from("suite_regulator_submissions" as never)
    .update({ status: "submitting", attempt_count: (row.attempt_count ?? 0) + 1 } as never)
    .eq("id", submissionId);

  try {
    const result = await adapter.submit({
      submissionId: row.id,
      organisationId: row.organisation_id,
      reportKind: row.report_kind,
      reportId: row.report_id,
      requestPayload: row.request_payload ?? {},
    });

    await supabase
      .from("suite_regulator_submissions" as never)
      .update({
        status: result.status,
        external_reference: result.externalReference ?? null,
        response_payload: result.responsePayload ?? {},
        last_error: result.error ?? null,
      } as never)
      .eq("id", submissionId);

    return result;
  } catch (e) {
    const msg = (e as Error).message;
    await supabase
      .from("suite_regulator_submissions" as never)
      .update({ status: "failed", last_error: msg } as never)
      .eq("id", submissionId);
    throw e;
  }
}
