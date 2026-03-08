import { Link } from "react-router-dom";
import { Shield, Lock, Eye, FileCheck, Server, Users } from "lucide-react";
import SEO from "@/components/SEO";
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

const softwareData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "WorldAML Platform Security",
  applicationCategory: "FinancialApplication",
  description:
    "WorldAML security architecture including ISO 27001-aligned controls, AES-256 encryption, TLS 1.3, role-based access controls, immutable audit trails, and GDPR-compliant data handling for regulated financial institutions.",
  operatingSystem: "Web",
  url: "https://www.worldaml.com/platform/security",
  offers: {
    "@type": "Offer",
    category: "SaaS",
    url: "https://www.worldaml.com/pricing",
  },
  provider: {
    "@type": "Organization",
    name: "WorldAML",
    url: "https://www.worldaml.com",
  },
};

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is ISO 27001 certification and why does it matter for compliance software?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ISO 27001 is the international standard for information security management systems (ISMS). It provides a systematic framework for managing sensitive company and customer information — covering risk assessment, access controls, physical security, incident management, and business continuity. For regulated financial institutions, using compliance software hosted on ISO 27001-certified infrastructure provides assurance that the vendor meets independently audited security standards, supporting their own regulatory obligations around third-party and outsourcing risk management.",
      },
    },
    {
      "@type": "Question",
      name: "How does WorldAML protect customer screening data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "WorldAML operates as an orchestration layer. Screening results are processed in memory and stored only for the duration required for workflow management and audit purposes. All data is encrypted at rest using AES-256 and in transit using TLS 1.3. Access to customer data is governed by role-based access controls (RBAC), and all data access events are logged in an immutable audit trail. Data residency requirements are addressed through regional deployment options and contractual commitments.",
      },
    },
    {
      "@type": "Question",
      name: "Is WorldAML GDPR compliant?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. WorldAML's platform architecture is designed to support GDPR compliance obligations for regulated institutions acting as data controllers. This includes data minimisation by design, purpose limitation controls, data subject rights workflows (access, erasure, portability), retention period enforcement, and documented data processing agreements (DPAs) with all sub-processors. Specific data protection documentation is available upon request under a non-disclosure agreement.",
      },
    },
    {
      "@type": "Question",
      name: "What is role-based access control (RBAC) in compliance software?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Role-based access control (RBAC) restricts system access based on a user's defined role within the organisation. In a compliance platform, RBAC ensures that a junior analyst can view and action alerts but cannot modify screening rules or export bulk data, while a compliance manager has broader access appropriate to their responsibilities. RBAC reduces the risk of insider threats, data leakage, and accidental configuration changes — and is a core requirement under most financial services regulatory frameworks.",
      },
    },
    {
      "@type": "Question",
      name: "How does WorldAML support third-party and outsourcing risk management?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "WorldAML provides regulated institutions with the contractual and technical documentation required for third-party ICT risk management under frameworks including DORA (EU), SS2/21 (PRA/FCA), and the EBA Guidelines on Outsourcing. This includes service level agreements (SLAs), audit rights provisions, sub-processor disclosure, business continuity and disaster recovery documentation, and penetration test summaries. Security documentation is available on request subject to appropriate confidentiality agreements.",
      },
    },
    {
      "@type": "Question",
      name: "What uptime SLA does WorldAML provide?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "WorldAML targets 99.9% platform availability on an annual basis, backed by a contractual SLA for enterprise customers. The infrastructure is hosted across redundant availability zones with automatic failover, DDoS mitigation, and continuous health monitoring. Planned maintenance windows are communicated in advance and are scheduled outside peak compliance operation hours wherever possible.",
      },
    },
    {
      "@type": "Question",
      name: "What is an audit trail in a compliance platform and why is it required?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An audit trail is a chronological, immutable log of every action taken within the platform — screening runs, risk decisions, case notes, document uploads, user logins, and configuration changes — each timestamped and attributed to a specific user. A complete audit trail is required under virtually all AML frameworks (EU AMLD, UK MLRs, FinCEN) as evidence that compliance controls were applied correctly. During regulatory examinations, auditors routinely request audit trail extracts to verify that screening occurred, decisions were documented, and records are complete.",
      },
    },
    {
      "@type": "Question",
      name: "How does WorldAML handle data residency requirements?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "WorldAML supports data residency requirements through regional deployment configurations. Institutions with EU data residency obligations can have their data processed and stored within the EU. GCC and APAC regional options are available for institutions subject to local data localisation laws. Data residency configuration is established contractually and verified through the standard security documentation pack provided to enterprise customers.",
      },
    },
  ],
};

const structuredData = [softwareData, faqData];

const PlatformSecurity = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Platform Security | ISO 27001 GDPR DORA Compliance | WorldAML"
        description="WorldAML security architecture: ISO 27001-aligned controls, AES-256 encryption, TLS 1.3, RBAC, immutable audit trails, and GDPR-compliant data handling for regulated financial institutions."
        canonical="/platform/security"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Platform", url: "/platform" },
          { name: "Security", url: "/platform/security" },
        ]}
        structuredData={structuredData}
      />
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

        {/* FAQ Section */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-3xl">
            <h2 className="text-2xl text-navy mb-8">Security & Compliance FAQs</h2>
            <div className="space-y-5">
              {faqData.mainEntity.map((faq) => (
                <div key={faq.name} className="rounded-xl border border-divider bg-background p-6">
                  <h3 className="font-semibold text-navy mb-3">{faq.name}</h3>
                  <p className="text-body-sm text-text-secondary leading-relaxed">{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="bg-surface-subtle border border-divider rounded-lg p-6 max-w-3xl">
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
            <Button variant="accent" size="lg" asChild>
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
