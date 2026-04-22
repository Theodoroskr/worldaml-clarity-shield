import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Region, RegionConfig, REGIONS } from "@/types/regions";

interface RegionContextType {
  region: Region;
  regionConfig: RegionConfig;
  setRegion: (region: Region) => void;
  isLoading: boolean;
  /** True when the current region was auto-detected from IP (no saved cookie at mount). */
  wasAutoDetected: boolean;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

const REGION_COOKIE_KEY = "worldaml_region";

// Map country codes to regions
const countryToRegion: Record<string, Region> = {
  // EU & Middle East
  AT: 'eu-me', BE: 'eu-me', BG: 'eu-me', HR: 'eu-me', CY: 'eu-me',
  CZ: 'eu-me', DK: 'eu-me', EE: 'eu-me', FI: 'eu-me', FR: 'eu-me',
  DE: 'eu-me', GR: 'eu-me', HU: 'eu-me', IT: 'eu-me', LV: 'eu-me',
  LT: 'eu-me', LU: 'eu-me', MT: 'eu-me', NL: 'eu-me', PL: 'eu-me',
  PT: 'eu-me', RO: 'eu-me', SK: 'eu-me', SI: 'eu-me', ES: 'eu-me',
  SE: 'eu-me', AE: 'eu-me', SA: 'eu-me', QA: 'eu-me', KW: 'eu-me',
  BH: 'eu-me', OM: 'eu-me', JO: 'eu-me', LB: 'eu-me', EG: 'eu-me',
  // UK & Ireland
  GB: 'uk-ie', IE: 'uk-ie',
  // North America
  US: 'na', CA: 'na', MX: 'na',
};

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<Region>('eu-me');
  const [isLoading, setIsLoading] = useState(true);
  const [wasAutoDetected, setWasAutoDetected] = useState(false);

  useEffect(() => {
    const detectRegion = async () => {
      // Check for saved preference first
      const savedRegion = getCookie(REGION_COOKIE_KEY) as Region | null;
      if (savedRegion && REGIONS[savedRegion]) {
        setRegionState(savedRegion);
        setWasAutoDetected(false);
        setIsLoading(false);
        return;
      }

      // Try IP-based detection
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code;
        const detectedRegion = countryToRegion[countryCode] || 'eu-me';
        setRegionState(detectedRegion);
        setCookie(REGION_COOKIE_KEY, detectedRegion);
        setWasAutoDetected(true);
      } catch (error) {
        console.error('Failed to detect region:', error);
        setRegionState('eu-me'); // Default to EU & ME
        setWasAutoDetected(true);
      }
      setIsLoading(false);
    };

    detectRegion();
  }, []);

  const setRegion = (newRegion: Region) => {
    setRegionState(newRegion);
    setCookie(REGION_COOKIE_KEY, newRegion);
    setWasAutoDetected(false);
  };

  return (
    <RegionContext.Provider
      value={{
        region,
        regionConfig: REGIONS[region],
        setRegion,
        isLoading,
        wasAutoDetected,
      }}
    >
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}
