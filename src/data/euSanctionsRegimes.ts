export interface EUSanctionsRegime {
  country: string;
  slug: string;
  regimes: {
    title: string;
    adoptedBy: string;
    measures: string[];
  }[];
  region: "europe" | "africa" | "middle-east" | "asia" | "americas" | "thematic";
  description: string;
}

export const euSanctionsRegimes: EUSanctionsRegime[] = [
  {
    country: "Afghanistan",
    slug: "afghanistan",
    region: "asia",
    description: "EU restrictive measures against the Taliban regime in Afghanistan, including arms embargoes, asset freezes, and travel bans aligned with UN Security Council resolutions.",
    regimes: [
      {
        title: "Restrictive measures imposed with respect to the Taliban",
        adoptedBy: "UN",
        measures: ["Arms export", "Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
    ],
  },
  {
    country: "Belarus",
    slug: "belarus",
    region: "europe",
    description: "Comprehensive EU sanctions against Belarus covering arms, dual-use goods, financial measures, and transport restrictions in response to the political situation and involvement in Russia's aggression against Ukraine.",
    regimes: [
      {
        title: "Restrictive measures in view of the situation in Belarus and the involvement of Belarus in the Russian aggression against Ukraine",
        adoptedBy: "EU",
        measures: [
          "Arms export", "Asset freeze and prohibition to make funds available", "Embargo on dual-use goods",
          "Financial measures", "Flights, airports, aircrafts", "Road transport", "Restrictions on admission",
          "Restrictions on equipment used for internal repression", "Restrictions on goods", "Restrictions on services",
        ],
      },
    ],
  },
  {
    country: "Bosnia & Herzegovina",
    slug: "bosnia-herzegovina",
    region: "europe",
    description: "EU restrictive measures targeting individuals and entities undermining stability in Bosnia and Herzegovina.",
    regimes: [
      {
        title: "Restrictive measures in view of the situation in Bosnia and Herzegovina",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
    ],
  },
  {
    country: "Burundi",
    slug: "burundi",
    region: "africa",
    description: "EU sanctions on Burundi including asset freezes and travel bans in response to the political and security situation.",
    regimes: [
      {
        title: "Restrictive measures in view of the situation in Burundi",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available", "Prohibition to satisfy claims", "Restrictions on admission"],
      },
    ],
  },
  {
    country: "Central African Republic",
    slug: "central-african-republic",
    region: "africa",
    description: "UN-mandated sanctions on the Central African Republic including arms embargoes, asset freezes, and travel restrictions.",
    regimes: [
      {
        title: "Restrictive measures in view of the situation in the Central African Republic",
        adoptedBy: "UN",
        measures: ["Arms export", "Asset freeze and prohibition to make funds available", "Prohibition to satisfy claims", "Restrictions on admission"],
      },
    ],
  },
  {
    country: "China",
    slug: "china",
    region: "asia",
    description: "EU arms embargo on China imposed following the Tiananmen Square events of 1989.",
    regimes: [
      {
        title: "Specific restrictive measures in relation to the events at the Tiananmen Square protests of 1989",
        adoptedBy: "EU",
        measures: ["Arms embargo"],
      },
    ],
  },
  {
    country: "Democratic People's Republic of Korea (DPRK)",
    slug: "north-korea",
    region: "asia",
    description: "Among the most comprehensive sanctions regimes globally, targeting North Korea's WMD and nuclear weapons programmes with extensive trade, financial, transport, and individual restrictions.",
    regimes: [
      {
        title: "Restrictive measures in relation to the non-proliferation of weapons of mass destruction (WMD)",
        adoptedBy: "UN and EU",
        measures: [
          "Arms export", "Arms procurement", "Asset freeze and prohibition to make funds available",
          "Dual-use goods export", "Financial measures", "Flights, airports, aircrafts",
          "Inspections", "Investments", "Ports and vessels", "Restrictions on admission",
          "Restrictions on goods", "Restrictions on services", "Training and education", "Vigilance",
        ],
      },
    ],
  },
  {
    country: "Democratic Republic of the Congo",
    slug: "democratic-republic-congo",
    region: "africa",
    description: "Combined UN and EU sanctions targeting the ongoing conflict in the DRC, including arms embargoes and individual restrictions.",
    regimes: [
      {
        title: "Restrictive measures in view of the situation in the Democratic Republic of the Congo",
        adoptedBy: "UN and EU",
        measures: ["Arms export", "Asset freeze and prohibition to make funds available", "Prohibition to satisfy claims", "Restrictions on admission"],
      },
    ],
  },
  {
    country: "Guatemala",
    slug: "guatemala",
    region: "americas",
    description: "EU restrictive measures addressing the situation in Guatemala with targeted asset freezes and travel bans.",
    regimes: [
      {
        title: "Restrictive measures in view of the situation in Guatemala",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
    ],
  },
  {
    country: "Guinea",
    slug: "guinea",
    region: "africa",
    description: "EU sanctions on Guinea including asset freezes and travel restrictions in response to political instability.",
    regimes: [
      {
        title: "Restrictive measures in view of the situation in Guinea",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
    ],
  },
  {
    country: "Guinea-Bissau",
    slug: "guinea-bissau",
    region: "africa",
    description: "Combined UN and EU sanctions on Guinea-Bissau targeting individuals undermining stability.",
    regimes: [
      {
        title: "Restrictive measures in view of the situation in Guinea-Bissau",
        adoptedBy: "UN and EU",
        measures: ["Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
    ],
  },
  {
    country: "Haiti",
    slug: "haiti",
    region: "americas",
    description: "Multiple sanctions regimes on Haiti addressing security threats and preventing misuse of Haitian state resources.",
    regimes: [
      {
        title: "Restrictive measures in view of the situation in Haiti",
        adoptedBy: "UN and EU",
        measures: ["Arms export", "Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
      {
        title: "Prohibiting the satisfying of certain claims by the Haitian authorities",
        adoptedBy: "EU",
        measures: ["Prohibition to satisfy claims"],
      },
    ],
  },
  {
    country: "Iran",
    slug: "iran",
    region: "middle-east",
    description: "One of the most extensive EU sanctions regimes, targeting Iran across human rights violations, WMD non-proliferation, and military support to Russia's war. Includes arms, trade, financial, and individual restrictions.",
    regimes: [
      {
        title: "Restrictive measures in relation to serious human rights violations in Iran (HR)",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available", "Restrictions on admission", "Restrictions on equipment used for internal repression", "Telecommunications equipment"],
      },
      {
        title: "Restrictive measures in relation to the non-proliferation of weapons of mass destruction (WMD)",
        adoptedBy: "UN and EU",
        measures: ["Arms export", "Arms procurement", "Asset freeze and prohibition to make funds available", "Embargo on dual-use goods", "Inspections", "Prohibition to satisfy claims", "Restrictions on admission", "Restrictions on goods"],
      },
      {
        title: "Restrictive measures in view of Iran's military support to Russia's war of aggression against Ukraine and to armed groups and entities in the Middle East and the Red Sea region (UAV)",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available", "Ports and vessels", "Restrictions on admission"],
      },
    ],
  },
  {
    country: "Iraq",
    slug: "iraq",
    region: "middle-east",
    description: "UN-mandated sanctions on Iraq including arms embargo, asset freezes, and cultural property protections.",
    regimes: [
      {
        title: "Restrictive measures on Iraq",
        adoptedBy: "UN",
        measures: ["Arms embargo", "Asset freeze and prohibition to make funds available", "Cultural property"],
      },
    ],
  },
  {
    country: "Lebanon",
    slug: "lebanon",
    region: "middle-east",
    description: "Multiple sanctions regimes on Lebanon covering UNSCR 1701 implementation, the 2005 Beirut bombing investigation, and the broader political situation.",
    regimes: [
      {
        title: "Restrictive measures in relation to the UN Security Council Resolution 1701 (2006) on Lebanon",
        adoptedBy: "UN",
        measures: ["Arms export"],
      },
      {
        title: "Restrictive measures in relation to the 14 February 2005 terrorist bombing in Beirut, Lebanon",
        adoptedBy: "UN",
        measures: ["Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
      {
        title: "Restrictive measures in view of the situation in Lebanon",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
    ],
  },
  {
    country: "Libya",
    slug: "libya",
    region: "africa",
    description: "Extensive UN and EU sanctions on Libya including arms embargoes, asset freezes, maritime restrictions, and individual travel bans.",
    regimes: [
      {
        title: "Prohibiting the satisfying of certain claims in relation to transactions prohibited by UNSCR 883 (1993)",
        adoptedBy: "EU",
        measures: ["Prohibition to satisfy claims"],
      },
      {
        title: "Restrictive measures in view of the situation in Libya",
        adoptedBy: "UN and EU",
        measures: ["Arms export", "Arms procurement", "Asset freeze and prohibition to make funds available", "Flights, airports, aircrafts", "Inspections", "Ports and vessels", "Prohibition to satisfy claims", "Restrictions on admission", "Restrictions on equipment used for internal repression", "Vigilance"],
      },
    ],
  },
  {
    country: "Mali",
    slug: "mali",
    region: "africa",
    description: "EU sanctions targeting individuals and entities undermining stability in Mali.",
    regimes: [
      {
        title: "Restrictive measures in view of the situation in Mali",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
    ],
  },
  {
    country: "Moldova",
    slug: "moldova",
    region: "europe",
    description: "EU sanctions addressing destabilisation activities and the campaign against Latin-script schools in Transnistria.",
    regimes: [
      {
        title: "Restrictive measures in view of actions destabilising the Republic of Moldova (Destabilisation)",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
      {
        title: "Restrictive measures in relation to the campaign against Latin-script schools in the Transnistrian region (Transnistria)",
        adoptedBy: "EU",
        measures: ["Restrictions on admission"],
      },
    ],
  },
  {
    country: "Montenegro",
    slug: "montenegro",
    region: "europe",
    description: "Legacy UN/EU sanctions related to UNSCR 757(1992) prohibiting the satisfaction of certain claims.",
    regimes: [
      {
        title: "Prohibiting the satisfying of certain claims in relation to UNSCR 757(1992)",
        adoptedBy: "UN and EU",
        measures: ["Prohibition to satisfy claims"],
      },
    ],
  },
  {
    country: "Myanmar (Burma)",
    slug: "myanmar",
    region: "asia",
    description: "EU sanctions on Myanmar covering arms, dual-use goods, repression equipment, telecommunications, and military cooperation restrictions following the military coup.",
    regimes: [
      {
        title: "Restrictive measures in view of the situation in Myanmar/Burma",
        adoptedBy: "EU",
        measures: ["Arms export", "Asset freeze and prohibition to make funds available", "Dual-use goods export", "Restrictions on admission", "Restrictions on equipment used for internal repression", "Telecommunications equipment", "Restrictions on military training and military cooperation"],
      },
    ],
  },
  {
    country: "Nicaragua",
    slug: "nicaragua",
    region: "americas",
    description: "EU sanctions targeting individuals and entities responsible for human rights violations and repression in Nicaragua.",
    regimes: [
      {
        title: "Restrictive measures in view of the situation in Nicaragua",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
    ],
  },
  {
    country: "Niger",
    slug: "niger",
    region: "africa",
    description: "EU sanctions in response to the political situation in Niger following the 2023 military coup.",
    regimes: [
      {
        title: "Restrictive measures in view of the situation in Niger",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
    ],
  },
  {
    country: "Russia",
    slug: "russia",
    region: "europe",
    description: "The most extensive EU sanctions regime ever adopted, targeting Russia across multiple dimensions including human rights, hybrid threats, and comprehensive economic/sectoral measures in response to the war in Ukraine.",
    regimes: [
      {
        title: "Restrictive measures in view of the situation in Russia (HR)",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available", "Restrictions on admission", "Restrictions on equipment used for internal repression", "Telecommunications equipment"],
      },
      {
        title: "Restrictive measures in view of Russia's destabilising activities (Hybrid)",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
      {
        title: "Restrictive measures — sectoral restrictive measures (Economic)",
        adoptedBy: "EU",
        measures: [
          "Arms export", "Arms import", "Dual-use goods export", "Financial measures",
          "Flights, airports, aircrafts", "Intellectual Property Rights", "Liquified Natural Gas",
          "Critical infrastructure", "Media ban", "Road transport", "Storage capacity",
          "Ports and vessels", "Prohibition to satisfy claims", "Restrictions on admission",
          "Restrictions on goods", "Crude oil", "Cultural property", "Diamonds",
          "Gold", "Iron and steel", "Luxury goods", "Maritime navigation",
          "Oil refining", "Restrictions on services",
        ],
      },
    ],
  },
  {
    country: "Serbia",
    slug: "serbia",
    region: "europe",
    description: "Legacy UN/EU sanctions related to UNSCR 757(1992) prohibiting the satisfaction of certain claims.",
    regimes: [
      {
        title: "Prohibiting the satisfying of certain claims in relation to UNSCR 757(1992)",
        adoptedBy: "UN and EU",
        measures: ["Prohibition to satisfy claims"],
      },
    ],
  },
  {
    country: "Somalia",
    slug: "somalia",
    region: "africa",
    description: "UN-mandated sanctions on Somalia including arms embargo, asset freezes, inspections, and individual restrictions.",
    regimes: [
      {
        title: "Restrictive measures in view of the situation in Somalia",
        adoptedBy: "UN",
        measures: ["Arms export", "Asset freeze and prohibition to make funds available", "Inspections", "Restrictions on admission", "Vigilance"],
      },
    ],
  },
  {
    country: "South Sudan",
    slug: "south-sudan",
    region: "africa",
    description: "Combined UN and EU arms embargo, asset freezes, and travel bans targeting individuals fuelling the conflict in South Sudan.",
    regimes: [
      {
        title: "Restrictive measures in view of the situation in South Sudan",
        adoptedBy: "UN and EU",
        measures: ["Arms export", "Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
    ],
  },
  {
    country: "Sudan",
    slug: "sudan",
    region: "africa",
    description: "Multiple sanctions regimes on Sudan addressing the security situation and activities undermining the political transition.",
    regimes: [
      {
        title: "Restrictive measures in view of the situation in Sudan",
        adoptedBy: "UN and EU",
        measures: ["Arms export", "Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
      {
        title: "Restrictive measures in view of activities undermining the stability and the political transition of Sudan",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
    ],
  },
  {
    country: "Syria",
    slug: "syria",
    region: "middle-east",
    description: "Comprehensive EU sanctions on Syria including arms, financial, trade, energy, and investment restrictions, alongside UN measures related to the Beirut bombing investigation.",
    regimes: [
      {
        title: "Restrictive measures against Syria",
        adoptedBy: "EU",
        measures: [
          "Arms import", "Asset freeze and prohibition to make funds available", "Financial measures",
          "Flights, airports, aircrafts", "Inspections", "Investments", "Prohibition to satisfy claims",
          "Restrictions on admission", "Restrictions on equipment used for internal repression",
          "Restrictions on goods", "Luxury goods", "Petrol products",
        ],
      },
      {
        title: "Restrictive measures in relation to the 14 February 2005 terrorist bombing in Beirut, Lebanon",
        adoptedBy: "UN",
        measures: ["Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
    ],
  },
  {
    country: "Tunisia",
    slug: "tunisia",
    region: "africa",
    description: "EU sanctions targeting misappropriation of Tunisian state funds.",
    regimes: [
      {
        title: "Misappropriation of state funds of Tunisia (MSF)",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available"],
      },
    ],
  },
  {
    country: "Türkiye",
    slug: "turkiye",
    region: "europe",
    description: "Targeted EU sanctions related to Türkiye's unauthorised drilling activities in the Eastern Mediterranean.",
    regimes: [
      {
        title: "Restrictive measures in view of Türkiye's unauthorised drilling activities in the Eastern Mediterranean",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
    ],
  },
  {
    country: "Ukraine",
    slug: "ukraine",
    region: "europe",
    description: "Multiple EU sanctions frameworks addressing the illegal annexation of Crimea, occupation of Ukrainian territories, and misappropriation of state funds.",
    regimes: [
      {
        title: "Restrictive measures in response to the illegal recognition, occupation or annexation of certain non-government controlled areas of Ukraine (Oblasts)",
        adoptedBy: "EU",
        measures: ["Financial measures", "Investments", "Restrictions on goods", "Restrictions on services"],
      },
      {
        title: "Misappropriation of state funds of Ukraine (MSF)",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available"],
      },
      {
        title: "Restrictive measures in respect of actions undermining or threatening the territorial integrity, sovereignty and independence of Ukraine (Territorial integrity)",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
      {
        title: "Restrictive measures in response to the illegal annexation of Crimea and Sevastopol (Crimea)",
        adoptedBy: "EU",
        measures: ["Financial measures", "Investments", "Restrictions on goods", "Restrictions on services"],
      },
    ],
  },
  {
    country: "United States",
    slug: "united-states",
    region: "americas",
    description: "EU blocking regulation protecting against the extraterritorial application of US legislation on European entities.",
    regimes: [
      {
        title: "Measures protecting against the effects of the extra-territorial application of certain legislation adopted by the US",
        adoptedBy: "EU",
        measures: ["Protection against the effects of the extra-territorial application of third-country's legislation"],
      },
    ],
  },
  {
    country: "Venezuela",
    slug: "venezuela",
    region: "americas",
    description: "EU sanctions on Venezuela covering arms, repression equipment, telecommunications, and individual restrictions in response to the political and humanitarian crisis.",
    regimes: [
      {
        title: "Restrictive measures in view of the situation in Venezuela",
        adoptedBy: "EU",
        measures: ["Arms export", "Asset freeze and prohibition to make funds available", "Restrictions on admission", "Restrictions on equipment used for internal repression", "Telecommunications equipment"],
      },
    ],
  },
  {
    country: "Yemen",
    slug: "yemen",
    region: "middle-east",
    description: "UN-mandated sanctions on Yemen including arms embargo, asset freezes, inspections, and travel bans addressing the ongoing conflict.",
    regimes: [
      {
        title: "Restrictive measures in view of the situation in Yemen",
        adoptedBy: "UN",
        measures: ["Arms export", "Asset freeze and prohibition to make funds available", "Inspections", "Restrictions on admission"],
      },
    ],
  },
  {
    country: "Zimbabwe",
    slug: "zimbabwe",
    region: "africa",
    description: "EU arms embargo and restrictions on repression equipment in view of the situation in Zimbabwe.",
    regimes: [
      {
        title: "Restrictive measures concerning an arms embargo in view of the situation in Zimbabwe",
        adoptedBy: "EU",
        measures: ["Arms export", "Restrictions on equipment used for internal repression"],
      },
    ],
  },
];

// Thematic (non-country) regimes
export const euThematicRegimes: EUSanctionsRegime[] = [
  {
    country: "Chemical Weapons",
    slug: "chemical-weapons",
    region: "thematic",
    description: "EU autonomous sanctions targeting the proliferation and use of chemical weapons worldwide.",
    regimes: [
      {
        title: "Restrictive measures against the proliferation and use of chemical weapons",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
    ],
  },
  {
    country: "Cyber-attacks",
    slug: "cyber-attacks",
    region: "thematic",
    description: "EU framework for imposing sanctions in response to cyber-attacks threatening the Union or its Member States.",
    regimes: [
      {
        title: "Restrictive measures against cyber-attacks threatening the Union or its Member States",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
    ],
  },
  {
    country: "Human Rights",
    slug: "human-rights",
    region: "thematic",
    description: "The EU Global Human Rights Sanctions Regime (EU Magnitsky Act) targeting serious human rights violations and abuses worldwide.",
    regimes: [
      {
        title: "Restrictive measures against serious human rights violations and abuses",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
    ],
  },
  {
    country: "Terrorism",
    slug: "terrorism",
    region: "thematic",
    description: "Multiple EU sanctions frameworks targeting terrorism, including ISIL/Da'esh, Al-Qaida, Hamas, and Palestinian Islamic Jihad.",
    regimes: [
      {
        title: "Specific measures to combat terrorism",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available"],
      },
      {
        title: "Restrictive measures against those who support, facilitate or enable violent actions by Hamas and the Palestinian Islamic Jihad",
        adoptedBy: "EU",
        measures: ["Asset freeze and prohibition to make funds available", "Restrictions on admission"],
      },
      {
        title: "Restrictive measures with respect to ISIL (Da'esh) and Al-Qaida",
        adoptedBy: "UN and EU",
        measures: ["Arms export", "Asset freeze and prohibition to make funds available", "Prohibition to satisfy claims", "Restrictions on admission"],
      },
    ],
  },
];

export const allEUSanctionsRegimes = [...euSanctionsRegimes, ...euThematicRegimes];

export const regionLabels: Record<string, string> = {
  europe: "Europe",
  africa: "Africa",
  "middle-east": "Middle East",
  asia: "Asia",
  americas: "Americas",
  thematic: "Thematic",
};
