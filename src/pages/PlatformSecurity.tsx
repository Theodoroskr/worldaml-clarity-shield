import { Link } from "react-router-dom";
import { Shield, Lock, Eye, FileCheck, Server, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaneBadge } from "@/components/LaneBadge";

const securityFeatures = [
  {
    icon: Shield,
    title: "SOC 2 Type II Compliance",
    description: "Independent audits verify our security controls meet rigorous standards for data protection and operational integrity.",
  },
  {
    icon: Lock,
    title: "Data Encryption",
    description: "All data is encrypted at rest and in transit using industry-standard AES-256 and TLS 1.3 protocols.",
  },
  {
    icon: Eye,
    title: "Access Controls",
    description: "Role-based access controls (RBAC) ensure users only access data and functions required for their responsibilities.",
  },
  {
    icon: FileCheck,
    title: "Audit Trails",
    description: "Comprehensive logging of all system activities supports compliance reporting and forensic analysis.",
  },
  {
    icon: Server,
    title: "Infrastructure Security",
    description: "Hosted on enterprise-grade cloud infrastructure with redundancy, DDoS protection, and continuous monitoring.",
  },
  {
    icon: Users,
    title: "Vendor Due Diligence",
    description: "All integrated data sources undergo rigorous security assessments and ongoing compliance monitoring.",
  },
];

const PlatformSecurity = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <LaneBadge lane="platform" className="mb-6" />
              <h1 className="text-navy mb-6">Platform Security</h1>
              <p className="text-body-lg text-text-secondary mb-8">
                WorldAML is built on a security-first architecture designed to meet the 
                requirements of regulated financial institutions and their supervisory bodies.
              </p>
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-8">Security Architecture</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityFeatures.map((feature) => (
                <Card key={feature.title} className="border-divider">
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-navy/5 text-navy mb-4">
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Data Protection */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <h2 className="text-2xl text-navy mb-6">Data Protection</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  WorldAML operates as an orchestration layer and does not store screening 
                  data beyond what is required for workflow management and audit purposes.
                </p>
                <p>
                  Screening results from integrated data sources are processed in accordance 
                  with applicable data protection regulations and the terms established by 
                  each data provider.
                </p>
                <p>
                  Data residency requirements are addressed through regional deployment 
                  options and contractual commitments with regulated institutions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance Certifications */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-6">Compliance & Certifications</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
              <Card className="border-divider">
                <CardHeader>
                  <CardTitle className="text-lg">Regulatory Alignment</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Platform architecture supports compliance with GDPR, regional data 
                    protection laws, and financial services regulatory requirements.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="border-divider">
                <CardHeader>
                  <CardTitle className="text-lg">Industry Standards</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Security controls aligned with ISO 27001, NIST Cybersecurity Framework, 
                    and financial services industry best practices.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="bg-white border border-divider rounded-lg p-6 max-w-3xl">
              <p className="text-body-sm text-text-tertiary">
                <strong>Important:</strong> Security certifications and compliance status 
                apply to the WorldAML platform. Integrated data sources maintain their own 
                security certifications and compliance programs. Specific security documentation 
                is available upon request subject to appropriate confidentiality agreements.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise text-center">
            <h2 className="text-2xl text-white mb-4">Security Documentation</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Request detailed security documentation, penetration test summaries, or 
              arrange a security assessment call with our team.
            </p>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/get-started">Request Security Pack</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PlatformSecurity;
