// FINTRAC FWR (FINTRAC Web Reporting) structured payload generator.
//
// Produces a JSON document aligned with FINTRAC's electronic submission schema
// for STR / LCTR / EFTR / TPR reports. This payload is intended for either:
//   1. Direct ingestion via the FINTRAC API (when the reporting entity is
//      onboarded to API submission), or
//   2. As an audit-friendly machine-readable companion to the PDF export.
//
// Schema mirrors the six required FWR sections:
//   A. General Information
//   B. Transaction Information
//   C. Starting Action(s)
//   D. Completing Action(s)
//   E. Details of Suspicion
//   F. Action Taken
//
// NOTE: This is a vendor-neutral structured representation. Mapping to the
// exact XML/JSON wire format used by FINTRAC's secure channel should be done
// at the submission edge function layer once the entity has API credentials.

import {
  startingActionsFor,
  completingActionsFor,
  formatAddress,
  formatName,
  type FINTRACSTRExportOptions,
  type FINTRACManualFields,
  type FINTRACTransaction,
  type FINTRACStartingAction,
  type FINTRACCompletingAction,
  type FINTRACRelatedReport,
} from "./fintracStrExport";

export interface FwrPayload {
  schemaVersion: "1.0";
  generatedAt: string;
  reportType: "STR" | "LCTR" | "EFTR" | "LVCTR" | "CDR" | "LPEPR";
  reportReference: string;
  /** Companion / related FINTRAC reports covering the same activity. */
  relatedReports?: FINTRACRelatedReport[];


  // A. General Information
  generalInformation: {
    reportingEntity: {
      name: string;
      fintracIdentifier?: string;
      contactName: string;       // CAMLO
      contactEmail?: string;
      submittedBy: string;
    };
    reportDate: string;
    reasonableGroundsToSuspect: boolean;   // STR: required true
    asSoonAsPracticableAck: boolean;       // STR: timing acknowledgment
    tippingOffAck: boolean;                // STR: tipping-off prohibition ack
  };

  // B. Transaction Information
  transactionInformation: {
    transactions: Array<{
      internalId: string;
      dateTime: string;
      amount: number;
      currency: string;
      direction: string;
      description?: string | null;
      counterparty?: string | null;
      counterpartyCountry?: string | null;
      isVirtualCurrency: boolean;
      virtualCurrency?: {
        type: string;
        senderAddress?: string;
        receiverAddress?: string;
        transactionHash?: string;
        exchangeRateToCad?: string;
        walletProvider?: string;
      };
      isEmt: boolean;
      emt?: {
        reference?: string;
        message?: string;
        type?: string;
        senderInstitution?: string;
        receiverInstitution?: string;
        senderAccount?: string;
        receiverAccount?: string;
      };
      isPpp: boolean;
      ppp?: {
        pppType: string;
        pppNumber?: string;
        pppProvider?: string;
        pppHolderName?: string;
        loadMethod?: string;
        unloadMethod?: string;
      };
      transactionStatus?: "completed" | "attempted";
      attemptedReason?: string;
      reasonableMeasuresTaken?: string;
      transactionLocation?: string;
      transactionPurpose?: string;
    }>;
  };

  // C. Starting Action(s) — one or more per transaction
  startingActions: Array<{
    transactionId: string;
    sequence: number;
    methodOfTransaction?: string;
    sourceOfFunds?: string;
    conductorName?: string;
    onBehalfOf: "own_behalf" | "third_party";
    thirdPartyName?: string;
    accountFrom?: string;
    institutionFrom?: string;
    direction?: string;
    location?: string;
    purpose?: string;
    amount?: string;
    currency?: string;
  }>;

  // D. Completing Action(s) — one or more per transaction
  completingActions: Array<{
    transactionId: string;
    sequence: number;
    dispositionOfFunds?: string;
    beneficiaryName?: string;
    beneficiaryAccount?: string;
    beneficiaryCountry?: string;
    accountTo?: string;
    institutionTo?: string;
    direction?: string;
    location?: string;
    purpose?: string;
    amount?: string;
    currency?: string;
  }>;


  // Parties (multi-entry, FWR-aligned)
  parties: {
    conductors: FINTRACManualFields["conductors"];
    beneficialOwners: FINTRACManualFields["beneficialOwners"];
    thirdParties: FINTRACManualFields["thirdParties"];
    customerOnFile?: {
      name: string;
      type: string;
      country?: string | null;
      dateOfBirth?: string | null;
      registrationNumber?: string | null;
      riskLevel?: string;
    };
  };

  // E. Details of Suspicion
  detailsOfSuspicion: {
    suspicionType: string;
    isPEP: boolean;
    fintracIndicatorIds: number[];
    narrative: string;
  };

  // F. Action Taken
  actionTaken: {
    camloName: string;
    actionDescription: string;
    declaration: {
      reasonableGroundsToSuspect: true;
      tippingOffProhibitionAck: true;
      retentionPeriodYears: 5;
    };
  };

  // LPEPR-specific block (omitted for non-LPEPR reports)
  terroristProperty?: {
    entityName: string;
    entityType: string;
    listedUnder: string;
    propertyType: string;
    propertyDescription: string;
    propertyValue: string;
    propertyCurrency: string;
    propertyLocation: string;
    dispositionAction: string;
    dateDiscovered: string;
    relationshipToEntity: string;
  };
}

/** Starting actions for a transaction, with report-level defaults applied to the first action. */
function resolveStartingActions(
  tx: FINTRACTransaction,
  mf: FINTRACManualFields,
): FINTRACStartingAction[] {
  const override = mf.transactionActions?.[tx.id];
  const list = startingActionsFor(override);
  const base = list.length > 0 ? list : [{}];
  return base.map((a, i) =>
    i > 0
      ? a
      : {
          ...a,
          methodOfTransaction: a.methodOfTransaction || mf.methodOfTransaction,
          sourceOfFunds: a.sourceOfFunds || mf.sourceOfFunds,
          conductorName: a.conductorName || mf.conductorName,
          thirdPartyIndicator:
            (a.thirdPartyIndicator as "own_behalf" | "third_party") ||
            (mf.thirdPartyIndicator as "own_behalf" | "third_party"),
          thirdPartyName: a.thirdPartyName || mf.thirdPartyName,
        },
  );
}

/** Completing actions for a transaction, with report-level defaults applied to the first action. */
function resolveCompletingActions(
  tx: FINTRACTransaction,
  mf: FINTRACManualFields,
): FINTRACCompletingAction[] {
  const override = mf.transactionActions?.[tx.id];
  const list = completingActionsFor(override);
  const base = list.length > 0 ? list : [{}];
  return base.map((a, i) =>
    i > 0
      ? a
      : {
          ...a,
          dispositionOfFunds: a.dispositionOfFunds || mf.dispositionOfFunds,
          beneficiaryName: a.beneficiaryName || mf.beneficiaryName,
          beneficiaryAccount: a.beneficiaryAccount || mf.beneficiaryAccount,
          beneficiaryCountry: a.beneficiaryCountry || mf.beneficiaryCountry,
        },
  );
}


export function buildFwrPayload(opts: FINTRACSTRExportOptions): FwrPayload {
  const mf = opts.manualFields!;
  // `tpr` is the legacy internal code for the Listed Person or Entity Property Report
  const reportType = (opts.strType === "tpr"
    ? "LPEPR"
    : opts.strType.toUpperCase()) as FwrPayload["reportType"];

  const ref =
    opts.reportingEntityRef ||
    `FINTRAC-${reportType}-${opts.caseItem.id.slice(0, 8).toUpperCase()}`;

  const narrative = (opts.notes || [])
    .map((n) => `[${n.created_at}] ${n.content}`)
    .join("\n\n");

  const payload: FwrPayload = {
    schemaVersion: "1.0",
    generatedAt: new Date().toISOString(),
    reportType,
    reportReference: ref,
    relatedReports: (mf.relatedReports || []).filter((r) => (r.reportType || "").trim()),



    generalInformation: {
      reportingEntity: {
        name: opts.reportingEntity,
        contactName: mf.camloName,
        submittedBy: opts.submittedBy,
      },
      reportDate: new Date().toISOString().slice(0, 10),
      reasonableGroundsToSuspect: opts.strType === "str",
      asSoonAsPracticableAck: true,
      tippingOffAck: true,
    },

    transactionInformation: {
      transactions: opts.transactions.map((tx) => {
        const txDetails = mf.transactionDetails?.[tx.id];
        return {
          internalId: tx.id,
          dateTime: tx.created_at,
          amount: tx.amount,
          currency: tx.currency,
          direction: tx.direction,
          description: tx.description,
          counterparty: tx.counterparty,
          counterpartyCountry: tx.counterparty_country,
          isVirtualCurrency: mf.isVirtualCurrency,
          virtualCurrency: mf.isVirtualCurrency
            ? {
                type: mf.virtualCurrency.vcType,
                senderAddress: mf.virtualCurrency.senderAddress,
                receiverAddress: mf.virtualCurrency.receiverAddress,
                transactionHash: mf.virtualCurrency.transactionHash,
                exchangeRateToCad: mf.virtualCurrency.exchangeRateToCad,
                walletProvider: mf.virtualCurrency.walletProvider,
              }
            : undefined,
          isEmt: mf.isEmt,
          emt: mf.isEmt
            ? {
                reference: mf.emt.emtReference,
                message: mf.emt.emtMessage,
                type: mf.emt.emtType,
                senderInstitution: mf.emt.senderInstitution,
                receiverInstitution: mf.emt.receiverInstitution,
                senderAccount: mf.emt.senderAccount,
                receiverAccount: mf.emt.receiverAccount,
              }
            : undefined,
          isPpp: mf.isPpp,
          ppp: mf.isPpp
            ? {
                pppType: mf.ppp.pppType,
                pppNumber: mf.ppp.pppNumber,
                pppProvider: mf.ppp.pppProvider,
                pppHolderName: mf.ppp.pppHolderName,
                loadMethod: mf.ppp.loadMethod,
                unloadMethod: mf.ppp.unloadMethod,
              }
            : undefined,
          transactionStatus: txDetails?.transactionStatus ?? tx.transaction_status ?? undefined,
          attemptedReason: txDetails?.attemptedReason ?? tx.attempted_reason ?? undefined,
          reasonableMeasuresTaken: txDetails?.reasonableMeasuresTaken ?? tx.reasonable_measures_taken ?? undefined,
          transactionLocation: txDetails?.transactionLocation ?? tx.transaction_location ?? undefined,
          transactionPurpose: txDetails?.transactionPurpose ?? tx.transaction_purpose ?? undefined,
        };
      }),
    },

    startingActions: opts.transactions.flatMap((tx) =>
      resolveStartingActions(tx, mf).map((a, i) => ({
        transactionId: tx.id,
        sequence: i + 1,
        methodOfTransaction: a.methodOfTransaction,
        sourceOfFunds: a.sourceOfFunds,
        conductorName: a.conductorName,
        onBehalfOf: (a.thirdPartyIndicator || "own_behalf") as "own_behalf" | "third_party",
        thirdPartyName: a.thirdPartyName,
        accountFrom: a.accountFrom,
        institutionFrom: a.institutionFrom,
        direction: a.direction,
        location: a.location,
        purpose: a.purpose,
        amount: a.amount,
        currency: a.currency,
      })),
    ),

    completingActions: opts.transactions.flatMap((tx) =>
      resolveCompletingActions(tx, mf).map((a, i) => ({
        transactionId: tx.id,
        sequence: i + 1,
        dispositionOfFunds: a.dispositionOfFunds,
        beneficiaryName: a.beneficiaryName,
        beneficiaryAccount: a.beneficiaryAccount,
        beneficiaryCountry: a.beneficiaryCountry,
        accountTo: a.accountTo,
        institutionTo: a.institutionTo,
        direction: a.direction,
        location: a.location,
        purpose: a.purpose,
        amount: a.amount,
        currency: a.currency,
      })),
    ),

    parties: {
      conductors: (mf.conductors || []).map((c) => ({
        ...c,
        fullName: formatName(c.name, c.fullName),
        address: formatAddress(c.addressDetail, c.address),
        role: c.role || "Conductor",
      })),
      beneficialOwners: (mf.beneficialOwners || []).map((b) => ({
        ...b,
        fullName: formatName(b.name, b.fullName),
        address: formatAddress(b.addressDetail, b.address),
        role: b.role || "Beneficial owner",
      })),
      thirdParties: (mf.thirdParties || []).map((t) => ({
        ...t,
        fullName: formatName(t.name, t.fullName),
        address: formatAddress(t.addressDetail, t.address),
        role: t.role || "Third party (on whose behalf)",
      })),
      customerOnFile: opts.customer
        ? {
            name: opts.customer.name,
            type: opts.customer.type,
            country: opts.customer.country,
            dateOfBirth: opts.customer.date_of_birth,
            registrationNumber: opts.customer.registration_number,
            riskLevel: opts.customer.risk_level,
          }
        : undefined,
    },


    detailsOfSuspicion: {
      suspicionType: mf.suspicionType,
      isPEP: mf.isPEP === "yes",
      fintracIndicatorIds: mf.selectedIndicators,
      narrative,
    },

    actionTaken: {
      camloName: mf.camloName,
      actionDescription: mf.actionTaken,
      declaration: {
        reasonableGroundsToSuspect: true,
        tippingOffProhibitionAck: true,
        retentionPeriodYears: 5,
      },
    },
  };

  if (opts.strType === "tpr") {
    payload.terroristProperty = {
      entityName: mf.tprTerroristEntityName,
      entityType: mf.tprTerroristEntityType,
      listedUnder: mf.tprListedUnder,
      propertyType: mf.tprPropertyType,
      propertyDescription: mf.tprPropertyDescription,
      propertyValue: mf.tprPropertyValue,
      propertyCurrency: mf.tprPropertyCurrency,
      propertyLocation: mf.tprPropertyLocation,
      dispositionAction: mf.tprDispositionAction,
      dateDiscovered: mf.tprDateDiscovered,
      relationshipToEntity: mf.tprRelationshipToEntity,
    };
  }

  return stripPlaceholders(payload) as FwrPayload;
}

/** UI placeholders that must never reach FINTRAC. */
const PLACEHOLDER_VALUES = new Set(["", "—", "-", "--", "n/a", "na", "none", "null", "undefined", "tbd", "unknown"]);

/**
 * Recursively remove empty strings, em-dash/"N/A" placeholders, empty objects and
 * empty arrays so the FWR payload only carries real reported values.
 */
export function stripPlaceholders<T>(value: T): T | undefined {
  if (value === null || value === undefined) return undefined;

  if (typeof value === "string") {
    const trimmed = value.trim();
    return PLACEHOLDER_VALUES.has(trimmed.toLowerCase()) ? undefined : (trimmed as unknown as T);
  }

  if (Array.isArray(value)) {
    const cleaned = value.map((v) => stripPlaceholders(v)).filter((v) => v !== undefined);
    return (cleaned.length > 0 ? cleaned : undefined) as unknown as T;
  }

  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const cleaned = stripPlaceholders(v);
      if (cleaned !== undefined) out[k] = cleaned;
    }
    return (Object.keys(out).length > 0 ? out : undefined) as unknown as T;
  }

  return value;
}


export function downloadFwrPayload(payload: FwrPayload): { blobUrl: string; fileName: string } {
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const blobUrl = URL.createObjectURL(blob);
  const fileName = `FINTRAC_${payload.reportType}_FWR_${payload.reportReference.replace(/[^A-Z0-9]/gi, "_")}_${payload.generatedAt.slice(0, 10)}.json`;
  return { blobUrl, fileName };
}
