import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const bundles = [
  {
    name: "Onboarding Pack",
    includes: ["WorldID", "Sanctions", "PEPs"],
    api: true,
    platform: true,
    slug: "onboarding",
  },
  {
    name: "Regulated Pack",
    includes: ["WorldID", "Sanctions", "PEPs", "Adverse Media"],
    api: true,
    platform: true,
    slug: "regulated",
  },
  {
    name: "Full Compliance Pack",
    includes: ["WorldID", "Full Screening", "Ongoing Monitoring"],
    api: true,
    platform: true,
    slug: "full-compliance",
  },
];

const features = ["WorldID", "Sanctions", "PEPs", "Adverse Media", "Full Screening", "Ongoing Monitoring"];

const WorldIDBundleSection = () => {
  return (
    <section className="section-padding bg-secondary">
      <div className="container-enterprise">
        <div className="text-center mb-12">
          <h2 className="text-navy mb-4">End-to-end compliant onboarding</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Combine identity verification with AML screening for a complete compliance workflow.
            All bundles are available via API and Platform.
          </p>
        </div>
        
        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto bg-background rounded-lg border border-divider overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-navy/5">
                <TableHead className="text-navy font-semibold w-[180px]">Feature</TableHead>
                {bundles.map((bundle) => (
                  <TableHead key={bundle.slug} className="text-center text-navy font-semibold">
                    {bundle.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map((feature) => (
                <TableRow key={feature}>
                  <TableCell className="font-medium text-navy">{feature}</TableCell>
                  {bundles.map((bundle) => (
                    <TableCell key={`${bundle.slug}-${feature}`} className="text-center">
                      {bundle.includes.includes(feature) ? (
                        <Check className="w-5 h-5 text-teal mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              
              {/* Availability Section */}
              <TableRow className="bg-navy/5">
                <TableCell colSpan={4} className="text-navy font-semibold text-sm py-2">
                  Availability
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-navy">API Access</TableCell>
                {bundles.map((bundle) => (
                  <TableCell key={`${bundle.slug}-api`} className="text-center">
                    {bundle.api ? (
                      <Check className="w-5 h-5 text-teal mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground mx-auto" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-navy">Platform (Suite)</TableCell>
                {bundles.map((bundle) => (
                  <TableCell key={`${bundle.slug}-platform`} className="text-center">
                    {bundle.platform ? (
                      <Check className="w-5 h-5 text-teal mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground mx-auto" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
              
              {/* CTA Row */}
              <TableRow>
                <TableCell></TableCell>
                {bundles.map((bundle) => (
                  <TableCell key={`${bundle.slug}-cta`} className="text-center py-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/contact-sales?product=worldid&bundle=${bundle.slug}`}>
                        Get pricing
                      </Link>
                    </Button>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
};

export default WorldIDBundleSection;
