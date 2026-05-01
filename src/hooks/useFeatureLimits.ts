import { useMemo } from "react";
import { useAccess } from "./useAccess";

export interface FeatureLimits {
  screeningsPerMonth: number;
  casesTotal: number;
  monitoringRules: number;
  customersTotal: number;
  transactionEval: boolean;
  riskScoring: boolean;
  regulatoryExports: boolean;
  apiAccess: boolean;
}

const TIER_LIMITS: Record<string, FeatureLimits> = {
  free: {
    screeningsPerMonth: 10,
    casesTotal: 5,
    monitoringRules: 3,
    customersTotal: 25,
    transactionEval: false,
    riskScoring: false,
    regulatoryExports: false,
    apiAccess: false,
  },
  starter: {
    screeningsPerMonth: 100,
    casesTotal: 50,
    monitoringRules: 10,
    customersTotal: 500,
    transactionEval: true,
    riskScoring: true,
    regulatoryExports: false,
    apiAccess: false,
  },
  suite: {
    screeningsPerMonth: 5000,
    casesTotal: Infinity,
    monitoringRules: 100,
    customersTotal: Infinity,
    transactionEval: true,
    riskScoring: true,
    regulatoryExports: true,
    apiAccess: true,
  },
  enterprise: {
    screeningsPerMonth: Infinity,
    casesTotal: Infinity,
    monitoringRules: Infinity,
    customersTotal: Infinity,
    transactionEval: true,
    riskScoring: true,
    regulatoryExports: true,
    apiAccess: true,
  },
};

export type FeatureKey = keyof FeatureLimits;

export interface UpgradeContext {
  feature: FeatureKey;
  label: string;
  current: number | boolean;
  limit: number | boolean;
  isAtLimit: boolean;
  nextTier: string | null;
  nextLimit: number | boolean;
}

const TIER_ORDER = ["free", "starter", "suite", "enterprise"];

export function useFeatureLimits() {
  const { subscriptionTier, isLoading } = useAccess();

  const limits = useMemo(
    () => TIER_LIMITS[subscriptionTier] ?? TIER_LIMITS.free,
    [subscriptionTier],
  );

  const getNextTier = (): string | null => {
    const idx = TIER_ORDER.indexOf(subscriptionTier);
    if (idx < 0 || idx >= TIER_ORDER.length - 1) return null;
    return TIER_ORDER[idx + 1];
  };

  const checkLimit = (feature: FeatureKey, currentUsage: number): UpgradeContext => {
    const limit = limits[feature];
    const nextTier = getNextTier();
    const nextLimits = nextTier ? TIER_LIMITS[nextTier] : null;

    if (typeof limit === "boolean") {
      return {
        feature,
        label: featureLabel(feature),
        current: limit,
        limit,
        isAtLimit: !limit,
        nextTier,
        nextLimit: nextLimits?.[feature] ?? false,
      };
    }

    return {
      feature,
      label: featureLabel(feature),
      current: currentUsage,
      limit,
      isAtLimit: currentUsage >= limit,
      nextTier,
      nextLimit: nextLimits?.[feature] ?? Infinity,
    };
  };

  return { limits, subscriptionTier, isLoading, checkLimit, getNextTier };
}

function featureLabel(key: FeatureKey): string {
  const map: Record<FeatureKey, string> = {
    screeningsPerMonth: "AML Screenings",
    casesTotal: "Investigation Cases",
    monitoringRules: "Monitoring Rules",
    customersTotal: "Onboarded Customers",
    transactionEval: "Transaction Evaluation",
    riskScoring: "Risk Scoring Engine",
    regulatoryExports: "Regulatory Exports",
    apiAccess: "API Access",
  };
  return map[key] ?? key;
}
