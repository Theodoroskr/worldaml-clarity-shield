import { useCallback, useEffect, useState } from "react";
import {
  fetchScreeningModules,
  isModuleActive,
  type ScreeningModulesSnapshot,
} from "@/lib/suite/screeningModules";

/** Loads the signed-in user's organisation add-on modules for Screening & Monitoring. */
export function useScreeningModules() {
  const [snapshot, setSnapshot] = useState<ScreeningModulesSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchScreeningModules();
      setSnapshot(next);
    } catch {
      setSnapshot(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    isLoading,
    snapshot,
    organisationId: snapshot?.organisationId ?? null,
    memberRole: snapshot?.memberRole ?? null,
    hasModule: (key: string) => isModuleActive(snapshot, key),
    refresh,
  };
}
