import { 
  Zap, 
  TrendingUp, 
  Settings, 
  Scale, 
  FileCheck,
  Clock,
  Target,
  Users,
  Database,
  Shield,
  Cloud,
  Workflow,
  Brain,
  Filter
} from "lucide-react";

export const productStats = {
  profiles: "7 million+",
  falsePositiveReduction: "50-70%",
  timeReduction: "70%",
  manualReviewReduction: "97%",
  customers: "3,000+",
  topUSBanks: "16 of top 25",
};

export const keyBenefits = [
  {
    icon: Clock,
    title: "Save Money and Time",
    description: "Reduce delays and resource demands with a powerful screening engine featuring 50-70% false positive reduction capabilities.",
    stat: "50-70%",
    statLabel: "False positive reduction",
  },
  {
    icon: TrendingUp,
    title: "Accelerate Revenue Growth",
    description: "Get real-time global insights tailored to your risk appetite with integrated access to over 7 million WorldCompliance™ profiles.",
    stat: "7M+",
    statLabel: "Risk profiles",
  },
  {
    icon: Settings,
    title: "Configure for Your Business",
    description: "Meet specific speed, security, and geographic requirements with a fully configurable interface and flexible hosting options.",
  },
  {
    icon: Scale,
    title: "Scale to Meet Opportunity",
    description: "Stay agile and quickly expand with scalable batch processing capabilities and seamless workflow automation.",
  },
  {
    icon: FileCheck,
    title: "Regulator-Ready Compliance",
    description: "Document and defend decisions with transparent audit trails, robust case management, and intuitive compliance reporting.",
    stat: "16/25",
    statLabel: "Top US banks trust us",
  },
];

export const performanceMetrics = [
  {
    value: "70%",
    label: "Reduction in screening time",
    description: "Time required to screen against list updates",
  },
  {
    value: "60-80%",
    label: "False positive reduction",
    description: "Fewer false positive alerts to review",
  },
  {
    value: "97%",
    label: "Manual review reduction",
    description: "With Intelligent Match Decision Solution",
  },
  {
    value: "<1 week",
    label: "Quick-start installation",
    description: "Up and running with plug-and-play functionality",
  },
];

export const enterpriseFeatures = [
  {
    icon: Brain,
    title: "Intelligent Match Decision Solution",
    description: "Rules-based module using machine learning to automatically remediate up to 97% of matches from PEP, Adverse Media, and Sanctions screening.",
  },
  {
    icon: Filter,
    title: "Firco™ Entity Resolution Filter",
    description: "Model-based feature that reduces false positives and can reduce manual review rates to under 1% using proprietary Strength Index scoring.",
  },
  {
    icon: Database,
    title: "Batch Processing",
    description: "Scalable batch processing capabilities for high-volume screening requirements with seamless workflow automation.",
  },
  {
    icon: Workflow,
    title: "Workflow Automation",
    description: "Automate account and payment screening with real-time insights into global sanctions, PEPs, and high-risk entities.",
  },
  {
    icon: Cloud,
    title: "Flexible Deployment",
    description: "Cloud and hosted delivery options to fit business-specific speed, geographic, and security requirements.",
  },
  {
    icon: Shield,
    title: "Audit & Case Management",
    description: "Transparent audit trails with robust case management and intuitive compliance reporting.",
  },
];

export const screeningCapabilities = [
  {
    icon: Shield,
    title: "AML Screening",
    description: "Anti-money laundering screening against global sanctions and watchlists.",
  },
  {
    icon: Users,
    title: "PEP Screening",
    description: "Politically Exposed Persons screening with relationship mapping.",
  },
  {
    icon: Target,
    title: "ABC Compliance",
    description: "Anti-bribery and corruption screening for due diligence.",
  },
  {
    icon: Zap,
    title: "CFT Screening",
    description: "Counter-financing of terrorism screening and monitoring.",
  },
];

export const trustedBy = [
  "16 of the top 25 US financial institutions",
  "Leading fintechs and investment firms",
  "Global retailers and ecommerce companies",
  "Technology, insurance, and travel companies",
  "3,000+ customers worldwide",
];

export const complianceUseCases = [
  "Account screening",
  "Payment screening", 
  "Customer onboarding",
  "Ongoing monitoring",
  "Transaction screening",
  "Correspondent banking",
];
