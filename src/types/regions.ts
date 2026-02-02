export type Region = 'eu-me' | 'uk-ie' | 'na';

export type Lane = 'platform' | 'data-source';

export interface RegionConfig {
  id: Region;
  name: string;
  currency: string;
  currencySymbol: string;
}

export const REGIONS: Record<Region, RegionConfig> = {
  'eu-me': {
    id: 'eu-me',
    name: 'EU & Middle East',
    currency: 'EUR',
    currencySymbol: '€',
  },
  'uk-ie': {
    id: 'uk-ie',
    name: 'UK & Ireland',
    currency: 'GBP',
    currencySymbol: '£',
  },
  'na': {
    id: 'na',
    name: 'North America',
    currency: 'USD',
    currencySymbol: '$',
  },
};

export const LANE_LABELS: Record<Lane, string> = {
  platform: 'WorldAML Platform',
  'data-source': 'Data Source: LexisNexis',
};
