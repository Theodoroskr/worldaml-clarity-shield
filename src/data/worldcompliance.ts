import { 
  Search, 
  Globe, 
  AlertTriangle, 
  Users, 
  Building2, 
  Ship,
  Shield,
  Scale,
  Clock,
  BarChart3,
  Settings,
  Languages,
  GitBranch,
  Fingerprint,
  Filter
} from "lucide-react";

export const databaseStats = {
  profiles: "2.5 million+",
  riskCategories: "50+",
  regulatoryLaws: "100+",
};

export const pricingModel = {
  type: "Subscription-based",
  perUser: true,
  unlimitedSearches: true,
  description: "Per-user subscription with unlimited searches",
};

export const productOverview = {
  tagline: "One-stop Sanctions, PEPs and Adverse Media solution",
  description: "WorldCompliance™ Online Search Tool enables you to manually screen prospective clients and perform enhanced due diligence.",
  useCase: "The Online Search Tool allows users to perform initial due diligence by screening potential clients, agents and business partners through the industry-leading WorldCompliance™ database.",
};

export const riskCategories = [
  {
    icon: Shield,
    title: "Sanctions",
    description: "Global sanctions lists including OFAC, EU, UN, HMT, and regional watchlists.",
  },
  {
    icon: Users,
    title: "Foreign Officials (PEPs)",
    description: "Politically Exposed Persons across multiple jurisdictions, including family and close associates.",
  },
  {
    icon: Building2,
    title: "State Owned Enterprises",
    description: "Government-controlled entities and organizations with state ownership.",
  },
  {
    icon: AlertTriangle,
    title: "Adverse Media",
    description: "Negative news and high-risk media coverage from global sources.",
  },
  {
    icon: Ship,
    title: "Vessels & Transportation",
    description: "Sanctioned vessels and transportation entities linked to illicit activities.",
  },
  {
    icon: Globe,
    title: "Enforcement Actions",
    description: "Regulatory enforcement actions and legal proceedings globally.",
  },
];

export const benefits = [
  {
    icon: Scale,
    title: "Regulatory Compliance",
    description: "Conform to 100+ anti-terrorism and money laundering laws, including the USA PATRIOT ACT, E.U. Anti-Money Laundering Directive, and FATF guidelines.",
  },
  {
    icon: Clock,
    title: "Time & Cost Efficiency",
    description: "Save time and resources with an intuitive, easy-to-use interface designed for compliance professionals.",
  },
  {
    icon: BarChart3,
    title: "Instant Dashboards & Reports",
    description: "Access pre-designed dashboards and reports instantly with no software installations required.",
  },
  {
    icon: Settings,
    title: "Customizable Parameters",
    description: "Tailor investigative parameters to your organization's specific requirements and output meaningful, actionable results.",
  },
];

export const searchFeatures = [
  {
    icon: Search,
    title: "Multi-Match Technology",
    description: "Performs exact, proximal, phonetic, and cultural match with every search for comprehensive coverage.",
  },
  {
    icon: GitBranch,
    title: "Relationship Trees",
    description: "Maintains relationship trees for each profile showing family members, contacts, and business associates.",
  },
  {
    icon: Languages,
    title: "Translation & Transliteration",
    description: "Instant translation capability with support for transliteration spelling differences and common spelling variations.",
  },
  {
    icon: Fingerprint,
    title: "Passport Validation",
    description: "Built-in passport validation to verify document authenticity during screening.",
  },
  {
    icon: Filter,
    title: "Advanced Drill-Down",
    description: "Navigation pane permits precise drill-down by risk category, country, type of organization, and more.",
  },
  {
    icon: BarChart3,
    title: "Relevance Ranking",
    description: "All results ranked based on relevance and accuracy for efficient review and decisioning.",
  },
];

export const complianceStandards = [
  "USA PATRIOT ACT",
  "E.U. Anti-Money Laundering Directive",
  "FATF Guidelines",
  "UK Money Laundering Regulations",
  "OFAC Sanctions Programs",
  "UN Security Council Resolutions",
];
