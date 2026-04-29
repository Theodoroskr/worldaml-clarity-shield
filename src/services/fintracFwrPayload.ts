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

import type {
  FINTRACSTRExportOptions,
  FINTRACManualFields,
  FINTRACTransaction,
  FINTRACTransactionAction,
} from "./fintracStrExport";

export interface FwrPayload {
  schemaVersion: "1.0";
  generatedAt: string;
  reportType: "STR" | "LCTR" | "EFTR" | "TPR";
  reportReference: string;

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
    }>;
  };

  // C. Starting Action(s) — per-transaction
  startingActions: Array<{
    transactionId: string;
    methodOfTransaction?: string;
    sourceOfFunds?: string;
    conductorName?: string;
    onBehalfOf: "own_behalf" | "third_party";
    thirdPartyName?: string;
    accountFrom?: string;
    institutionFrom?: string;
  }>;

  // D. Completing Action(s) — per-transaction
  completingActions: Array<{
    transactionId: string;
    dispositionOfFunds?: string;
    beneficiaryName?: string;
    beneficiaryAccount?: string;
    beneficiaryCountry?: string;
    accountTo?: string;
    institutionTo?: string;
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

  // TPR-specific block (omitted for non-TPR reports)
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

function resolveAction(
  tx: FINTRACTransaction,
  mf: FINTRACManualFields,
): FINTRACTransactionAction {
  const override = mf.transactionActions?.[tx.id];
  return {
    starting: {
      methodOfTransaction: override?.starting?.methodOfTransaction || mf.methodOfTransaction,
      sourceOfFunds: override?.starting?.sourceOfFunds || mf.sourceOfFunds,
      conductorName: override?.starting?.conductorName || mf.conductorName,
      thirdPartyIndicator:
        (override?.starting?.thirdPartyIndicator as "own_behalf" | "third_party") ||
        (mf.thirdPartyIndicator as "own_behalf" | "third_party"),
      thirdPartyName: override?.starting?.thirdPartyName || mf.thirdPartyName,
      accountFrom: override?.starting?.accountFrom,
      institutionFrom: override?.starting?.institutionFrom,
    },
    completing: {
      dispositionOfFunds: override?.completing?.dispositionOfFunds || mf.dispositionOfFunds,
      beneficiaryName: override?.completing?.beneficiaryName || mf.beneficiaryName,
      beneficiaryAccount: override?.completing?.beneficiaryAccount || mf.beneficiaryAccount,
      beneficiaryCountry: override?.completing?.beneficiaryCountry || mf.beneficiaryCountry,
      accountTo: override?.completing?.accountTo,
      institutionTo: override?.completing?.institutionTo,
    },
  };
}

export function buildFwrPayload(opts: FINTRACSTRExportOptions): FwrPayload {
  const mf = opts.manualFields!;
  const reportType = opts.strType.toUpperCase() as FwrPayload["reportType"];
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
      transactions: opts.transactions.map((tx) => ({
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
      })),
    },

    startingActions: opts.transactions.map((tx) => {
      const a = resolveAction(tx, mf);
      return {
        transactionId: tx.id,
        methodOfTransaction: a.starting.methodOfTransaction,
        sourceOfFunds: a.starting.sourceOfFunds,
        conductorName: a.starting.conductorName,
        onBehalfOf: (a.starting.thirdPartyIndicator || "own_behalf") as
          | "own_behalf"
          | "third_party",
        thirdPartyName: a.starting.thirdPartyName,
        accountFrom: a.starting.accountFrom,
        institutionFrom: a.starting.institutionFrom,
      };
    }),

    completingActions: opts.transactions.map((tx) => {
      const a = resolveAction(tx, mf);
      return {
        transactionId: tx.id,
        dispositionOfFunds: a.completing.dispositionOfFunds,
        beneficiaryName: a.completing.beneficiaryName,
        beneficiaryAccount: a.completing.beneficiaryAccount,
        beneficiaryCountry: a.completing.beneficiaryCountry,
        accountTo: a.completing.accountTo,
        institutionTo: a.completing.institutionTo,
      };
    }),

    parties: {
      conductors: mf.conductors,
      beneficialOwners: mf.beneficialOwners,
      thirdParties: mf.thirdParties,
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

  return payload;
}

export function downloadFwrPayload(payload: FwrPayload): { blobUrl: string; fileName: string } {
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const blobUrl = URL.createObjectURL(blob);
  const fileName = `FINTRAC_${payload.reportType}_FWR_${payload.reportReference.replace(/[^A-Z0-9]/gi, "_")}_${payload.generatedAt.slice(0, 10)}.json`;
  return { blobUrl, fileName };
}
