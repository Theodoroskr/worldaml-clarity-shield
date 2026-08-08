import { Link } from "react-router-dom";
import {
  Newspaper, BookOpenCheck, ListChecks, FileText, BookA,
  Scale, Globe2, Map, HelpCircle, ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const BUSINESS_RESOURCES = [
  { label: "News", path: "/news", icon: Newspaper, desc: "Regulatory and industry news curated by the WorldAML team." },
  { label: "Best Practices", path: "/resources/best-practices", icon: BookOpenCheck, desc: "Practical AML/CFT guidance and operating standards." },
  { label: "Sanctions Lists", path: "/resources/sanctions-lists", icon: ListChecks, desc: "Global sanctions and watchlist sources we screen against." },
  { label: "Blog", path: "/blog", icon: FileText, desc: "Analysis, product updates and compliance commentary." },
  { label: "Compliance Glossary", path: "/resources/glossary", icon: BookA, desc: "Plain-English definitions of AML and KYC terminology." },
  { label: "AML Regulations", path: "/resources/aml-regulations", icon: Scale, desc: "Key regulatory frameworks by jurisdiction." },
  { label: "Data Coverage", path: "/data-coverage", icon: Globe2, desc: "Country-by-country data and list coverage." },
  { label: "EU Sanctions Map", path: "/eu-sanctions-map", icon: Map, desc: "Interactive view of EU sanctions regimes." },
  { label: "FAQ", path: "/faq", icon: HelpCircle, desc: "Answers to the questions buyers ask most." },
] as const;

export default function BusinessResources() {
  return (
    <div className="space-y-6 max-w-5xl">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Resources</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Reference material, regulatory context and coverage data to support your compliance programme.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BUSINESS_RESOURCES.map((r) => (
          <Card key={r.path} className="border-border/70 hover:border-teal/50 transition-colors">
            <CardContent className="p-5 flex flex-col h-full gap-3">
              <span className="w-9 h-9 rounded-lg bg-navy/5 flex items-center justify-center">
                <r.icon className="w-4.5 h-4.5 text-teal" />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{r.label}</p>
                <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
              </div>
              <Link
                to={r.path}
                className="inline-flex items-center text-sm font-medium text-teal hover:underline"
              >
                Open <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
