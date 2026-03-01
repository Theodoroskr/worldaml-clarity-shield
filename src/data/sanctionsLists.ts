export type SanctionTag =
  | "Sanctions"
  | "Terrorism"
  | "AML"
  | "Export Controls"
  | "Debarment"
  | "High Risk"
  | "Regional";

export type SanctionUrl = string | { label: string; url: string }[];

export interface SanctionSource {
  id: string;
  name: string;
  jurisdiction: string;
  description: string;
  officialUrl: SanctionUrl;
  tag: SanctionTag;
  usedByWorldAML: boolean;
}

export interface SanctionSection {
  id: string;
  title: string;
  description: string;
  sources: SanctionSource[];
}

export const sanctionSections: SanctionSection[] = [
  {
    id: "global",
    title: "Global Sanctions Authorities",
    description:
      "Primary international sanctions lists issued by intergovernmental bodies and major financial jurisdiction regulators — the baseline for any global sanctions screening program.",
    sources: [
      {
        id: "un-sc",
        name: "United Nations Security Council Consolidated Sanctions List",
        jurisdiction: "Global",
        description:
          "The United Nations Security Council Consolidated Sanctions List contains individuals and entities subject to UN sanctions measures related to terrorism, proliferation, and international security threats. The list is maintained by the UN Security Council and forms the global baseline used by many jurisdictions when implementing sanctions programs.",
        officialUrl: "https://www.un.org/securitycouncil/sanctions/information",
        tag: "Sanctions",
        usedByWorldAML: true,
      },
      {
        id: "eu-consolidated",
        name: "European Union Consolidated Financial Sanctions List",
        jurisdiction: "European Union",
        description:
          "The EU Consolidated Financial Sanctions List includes individuals, companies, and organizations subject to restrictive measures adopted by the European Union. EU financial institutions and regulated entities must screen against this list to comply with EU sanctions regulations.",
        officialUrl:
          "https://data.europa.eu/data/datasets/consolidated-list-of-persons-groups-and-entities-subject-to-eu-financial-sanctions",
        tag: "Sanctions",
        usedByWorldAML: true,
      },
      {
        id: "ofac-sdn",
        name: "US OFAC Specially Designated Nationals (SDN) List",
        jurisdiction: "United States",
        description:
          "The OFAC SDN List is maintained by the U.S. Treasury's Office of Foreign Assets Control and includes individuals, companies, vessels, and organizations subject to U.S. economic sanctions. The list targets terrorism, narcotics trafficking, proliferation, and geopolitical sanctions programs.",
        officialUrl:
          "https://ofac.treasury.gov/specially-designated-nationals-list-data-formats-data-schemas",
        tag: "Sanctions",
        usedByWorldAML: true,
      },
      {
        id: "uk-ofsi",
        name: "UK Office of Financial Sanctions Implementation (OFSI) List",
        jurisdiction: "United Kingdom",
        description:
          "The UK Sanctions List is maintained by the Office of Financial Sanctions Implementation (OFSI) and contains individuals and entities subject to financial sanctions under UK legislation. It applies to UK businesses and international entities operating under UK jurisdiction.",
        officialUrl:
          "https://www.gov.uk/government/publications/the-uk-sanctions-list",
        tag: "Sanctions",
        usedByWorldAML: true,
      },
      {
        id: "seco",
        name: "Switzerland SECO Sanctions List",
        jurisdiction: "Switzerland",
        description:
          "The Swiss State Secretariat for Economic Affairs (SECO) publishes sanctions measures adopted by Switzerland in alignment with international sanctions regimes. The list includes asset freezes, trade restrictions, and financial prohibitions.",
        officialUrl:
          "https://www.seco.admin.ch/seco/en/home/Aussenwirtschaftspolitik_Wirtschaftliche_Zusammenarbeit/Wirtschaftsbeziehungen/exportkontrollen-und-sanktionen/sanktionen.html",
        tag: "Sanctions",
        usedByWorldAML: true,
      },
      {
        id: "canada",
        name: "Canada Consolidated Sanctions List",
        jurisdiction: "Canada",
        description:
          "Canada maintains a Consolidated Canadian Autonomous Sanctions List under the Special Economic Measures Act. The list identifies individuals and entities subject to Canadian economic sanctions and financial restrictions.",
        officialUrl:
          "https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/consolidated-consolidee.aspx",
        tag: "Sanctions",
        usedByWorldAML: true,
      },
      {
        id: "dfat",
        name: "Australia DFAT Consolidated Sanctions List",
        jurisdiction: "Australia",
        description:
          "The Australian Department of Foreign Affairs and Trade (DFAT) maintains the Consolidated Sanctions List which includes individuals and organizations subject to targeted financial sanctions or travel bans under Australian law.",
        officialUrl:
          "https://www.dfat.gov.au/international-relations/security/sanctions/consolidated-list",
        tag: "Sanctions",
        usedByWorldAML: true,
      },
      {
        id: "mas",
        name: "Singapore Monetary Authority Sanctions List",
        jurisdiction: "Singapore",
        description:
          "The Monetary Authority of Singapore (MAS) publishes financial sanctions measures aligned with UN Security Council resolutions and Singapore's domestic legislation. Financial institutions operating in Singapore must comply with MAS sanctions regulations.",
        officialUrl:
          "https://www.mas.gov.sg/regulation/anti-money-laundering/targeted-financial-sanctions",
        tag: "Sanctions",
        usedByWorldAML: true,
      },
    ],
  },
  {
    id: "terrorism",
    title: "Counter-Terrorism Lists",
    description:
      "Designated terrorist organisations and individuals subject to counterterrorism legislation across major jurisdictions.",
    sources: [
      {
        id: "us-fto",
        name: "United States Foreign Terrorist Organizations (FTO) List",
        jurisdiction: "United States",
        description:
          "The U.S. Department of State designates Foreign Terrorist Organizations (FTOs) engaged in terrorist activity that threatens U.S. nationals or national security. Financial institutions and regulated businesses must ensure they do not facilitate transactions involving designated organizations.",
        officialUrl: "https://www.state.gov/foreign-terrorist-organizations/",
        tag: "Terrorism",
        usedByWorldAML: true,
      },
      {
        id: "uk-proscribed",
        name: "UK Proscribed Terrorist Organisations",
        jurisdiction: "United Kingdom",
        description:
          "The UK Home Office maintains a list of terrorist organizations banned under the Terrorism Act. Membership, support, or financing of these organizations is prohibited under UK law.",
        officialUrl:
          "https://www.gov.uk/government/publications/proscribed-terror-groups-or-organisations--2",
        tag: "Terrorism",
        usedByWorldAML: true,
      },
      {
        id: "uae-terrorist",
        name: "UAE National Terrorist List",
        jurisdiction: "United Arab Emirates",
        description:
          "The United Arab Emirates maintains a national list of individuals and organizations designated for terrorism and terrorist financing. Financial institutions operating in the UAE must screen customers against this list as part of AML and CTF compliance.",
        officialUrl: "https://www.uaeiec.gov.ae/en-us/un-page",
        tag: "Terrorism",
        usedByWorldAML: true,
      },
    ],
  },
  {
    id: "debarment",
    title: "Development Bank Debarment Lists",
    description:
      "Entities and individuals barred from participating in internationally-funded development projects due to fraud, corruption, or misconduct.",
    sources: [
      {
        id: "world-bank",
        name: "World Bank Debarred Firms and Individuals",
        jurisdiction: "Global",
        description:
          "The World Bank maintains a list of firms and individuals that have been sanctioned and debarred from participating in World Bank-financed projects due to fraud, corruption, or misconduct.",
        officialUrl:
          "https://www.worldbank.org/en/projects-operations/procurement/debarred-firms",
        tag: "Debarment",
        usedByWorldAML: true,
      },
      {
        id: "adb",
        name: "Asian Development Bank Debarment List",
        jurisdiction: "Asia-Pacific",
        description:
          "The Asian Development Bank publishes entities and individuals debarred from participating in ADB-financed projects due to integrity violations such as corruption or fraud.",
        officialUrl:
          "https://www.adb.org/who-we-are/integrity/debarred-firms",
        tag: "Debarment",
        usedByWorldAML: false,
      },
      {
        id: "eib",
        name: "European Investment Bank Exclusion List",
        jurisdiction: "European Union",
        description:
          "The European Investment Bank publishes entities excluded from participating in EU-financed procurement due to fraud, corruption, or misconduct.",
        officialUrl: "https://www.eib.org/en/projects/cib/excluded",
        tag: "Debarment",
        usedByWorldAML: false,
      },
    ],
  },
  {
    id: "highrisk",
    title: "High Risk Jurisdictions",
    description:
      "Jurisdictions identified as having strategic deficiencies in AML/CFT frameworks, requiring enhanced due diligence from regulated entities.",
    sources: [
      {
        id: "fatf-highrisk",
        name: "Financial Action Task Force (FATF) High Risk Jurisdictions",
        jurisdiction: "Global",
        description:
          "The FATF identifies jurisdictions with strategic deficiencies in their AML and counter-terrorist financing frameworks. Financial institutions apply enhanced due diligence when dealing with entities linked to these jurisdictions.",
        officialUrl:
          "https://www.fatf-gafi.org/en/publications/High-risk-and-other-monitored-jurisdictions.html",
        tag: "High Risk",
        usedByWorldAML: true,
      },
      {
        id: "eu-highrisk",
        name: "EU High Risk Third Countries",
        jurisdiction: "European Union",
        description:
          "The European Commission publishes a list of high-risk third countries with strategic deficiencies in AML and counter-terrorist financing systems. EU financial institutions must apply enhanced customer due diligence for transactions involving these jurisdictions.",
        officialUrl:
          "https://finance.ec.europa.eu/financial-crime/high-risk-third-countries-and-international-context-content-anti-money-laundering-and-countering_en",
        tag: "High Risk",
        usedByWorldAML: true,
      },
    ],
  },
  {
    id: "regional",
    title: "Regional Sanctions Authorities",
    description:
      "National and regional supervisory authorities publishing sanctions and AML obligations relevant to their jurisdictions.",
    sources: [
      {
        id: "uae-cbuae",
        name: "UAE Central Bank Sanctions",
        jurisdiction: "United Arab Emirates",
        description:
          "The Central Bank of the UAE publishes regulatory guidance and enforcement measures related to sanctions compliance and financial crime prevention for financial institutions operating in the UAE.",
        officialUrl: "https://www.centralbank.ae",
        tag: "Regional",
        usedByWorldAML: true,
      },
      {
        id: "cyprus",
        name: "Cyprus Sanctions & AML Authorities",
        jurisdiction: "Cyprus",
        description:
          "Cyprus implements sanctions measures adopted by the European Union and the United Nations. Financial institutions supervised by the Central Bank of Cyprus and CySEC must comply with EU sanctions frameworks.",
        officialUrl: [
          { label: "Central Bank of Cyprus", url: "https://www.centralbank.cy" },
          { label: "Cyprus Securities and Exchange Commission", url: "https://www.cysec.gov.cy" },
        ],
        tag: "Regional",
        usedByWorldAML: true,
      },
      {
        id: "malta",
        name: "Malta Sanctions Monitoring Board",
        jurisdiction: "Malta",
        description:
          "Malta's Sanctions Monitoring Board oversees the implementation of international sanctions obligations within Malta's financial system and provides guidance to regulated entities.",
        officialUrl: "https://smb.gov.mt",
        tag: "Regional",
        usedByWorldAML: true,
      },
      {
        id: "greece",
        name: "Greece Sanctions Authority",
        jurisdiction: "Greece",
        description:
          "Greece enforces international sanctions through the Ministry of Foreign Affairs and financial supervision authorities in line with EU sanctions legislation.",
        officialUrl: "https://www.mfa.gr",
        tag: "Regional",
        usedByWorldAML: false,
      },
      {
        id: "romania",
        name: "Romania Sanctions Authority",
        jurisdiction: "Romania",
        description:
          "Romania implements sanctions measures through national authorities aligned with European Union sanctions regulations and financial supervision frameworks.",
        officialUrl: "https://www.mae.ro",
        tag: "Regional",
        usedByWorldAML: false,
      },
    ],
  },
];

export const allSources: SanctionSource[] = sanctionSections.flatMap(
  (s) => s.sources
);

export const sanctionTags: SanctionTag[] = [
  "Sanctions",
  "Terrorism",
  "AML",
  "Export Controls",
  "Debarment",
  "High Risk",
  "Regional",
];
