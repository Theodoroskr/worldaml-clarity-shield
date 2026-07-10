import { useState } from "react";
import { getWebAttribution } from "@/lib/webAttribution";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Send, Clock, Monitor, MessageSquare, ShieldCheck, ExternalLink } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const benefits = [
  {
    icon: Monitor,
    title: "Live Platform Walkthrough",
    description: "See sanctions, PEP, and adverse media screening in action across 1,900+ global watchlists — powered by LexisNexis data.",
  },
  {
    icon: MessageSquare,
    title: "Tailored to Your Use Case",
    description: "Bring your entity types, jurisdictions, and volumes. We'll show exactly how WorldAML fits your workflow.",
  },
  {
    icon: ShieldCheck,
    title: "Audit-Readiness Guidance",
    description: "Practical recommendations to strengthen your compliance posture, documentation, and MLRO reporting.",
  },
  {
    icon: Clock,
    title: "Just 30 Minutes",
    description: "A focused, no-pressure session with a compliance specialist. No slides, no sales pitch — just answers.",
  },
];

const valuePoints = [
  "Live demo of onboarding, screening & monitoring",
  "Coverage across 1,900+ global watchlists",
  "Sanctions, PEP, and adverse media in one view",
  "Powered by LexisNexis data",
  "Book within 1 business day",
  "No commitment required",
];

const countries = [
  "United Kingdom", "United Arab Emirates", "United States", "Cyprus", "Greece",
  "Malta", "Romania", "Ireland", "Canada", "Germany", "France", "Other",
];

const FreeAMLCheck = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    country: "",
    lookingFor: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({ title: "Missing Information", description: "Please enter your first and last name.", variant: "destructive" });
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({ title: "Invalid Email", description: "Please enter a valid work email address.", variant: "destructive" });
      return;
    }
    if (!formData.company.trim()) {
      toast({ title: "Missing Information", description: "Please enter your company name.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-form`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            form_type: "free-aml-check",
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            company: formData.company,
            country: formData.country,
            message: formData.lookingFor,
            metadata: { attribution: getWebAttribution() },
          }),
        }
      );
      if (!response.ok) throw new Error("Submission failed");

      toast({
        title: "Request Received",
        description: "Thank you! Our team will reach out within 1 business day to book your 30-minute walkthrough.",
      });
      setFormData({ firstName: "", lastName: "", email: "", company: "", country: "", lookingFor: "" });
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Free 30-Minute Screening Walkthrough Demo"
        description="Book a free 30-minute walkthrough demo and see how WorldAML screens against 1,900+ sanctions, PEP and adverse media lists. Live session with a compliance specialist — powered by LexisNexis data."
        canonical="/free-aml-check"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Free Walkthrough Demo", url: "/free-aml-check" },
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is the free 30-minute walkthrough demo?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "A focused 30-minute live session with a WorldAML compliance specialist. We walk you through sanctions, PEP and adverse media screening across 1,900+ global watchlists, tailored to your entity types and jurisdictions — powered by LexisNexis data.",
              },
            },
            {
              "@type": "Question",
              name: "How do I book the walkthrough?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Submit your name, work email and company on this page. Our team will reach out within one business day to schedule your 30-minute session at a time that works for you.",
              },
            },
            {
              "@type": "Question",
              name: "Which screening solutions will you demo?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The full WorldAML screening stack: sanctions screening across OFAC, EU, UK OFSI, UN and 1,900+ lists; PEP and adverse media coverage via LexisNexis WorldCompliance; ongoing monitoring; case management; and API access for real-time integrations.",
              },
            },
            {
              "@type": "Question",
              name: "Is the walkthrough really free?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. The 30-minute session is free with no obligation and no sales pitch. Paid plans start when you need ongoing screening, transaction monitoring, case management or API access.",
              },
            },
            {
              "@type": "Question",
              name: "Who is the walkthrough for?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "MLROs, compliance officers and risk managers at banks, fintechs, EMIs, payment institutions, crypto-asset firms, gaming operators, law firms and accountants — anyone subject to AML/CFT obligations evaluating a screening solution.",
              },
            },
          ],
        }}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-navy text-white py-20 md:py-28">
          <div className="container-enterprise text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal/15 border border-teal/30 px-4 py-1.5 text-body-sm text-teal font-medium mb-6">
              <Clock className="w-4 h-4" /> 30-minute live session · Free
            </div>
            <h1 className="text-display mb-4">Free 30-Minute Walkthrough Demo</h1>
            <p className="text-body-lg text-white/80 max-w-2xl mx-auto mb-8">
              Learn about our screening solutions in a focused live session. See sanctions, PEP and adverse media screening in action — across 1,900+ global watchlists, powered by LexisNexis data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="accent" asChild>
                <a href="#lead-form">
                  Book Your Free Walkthrough <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline-light" asChild>
                <Link to="/sanctions-check">
                  Try Our Free Sanctions Tool <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-heading text-navy text-center mb-4">What's in the 30 Minutes</h2>
            <p className="text-body text-text-secondary text-center max-w-2xl mx-auto mb-12">
              A live, tailored walkthrough with a compliance specialist. No slides — just the platform, your questions, and answers grounded in your use case.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((b) => (
                <div key={b.title} className="p-6 rounded-xl border border-divider bg-card hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center mb-4">
                    <b.icon className="w-5 h-5 text-teal" />
                  </div>
                  <h3 className="text-body font-semibold text-navy mb-2">{b.title}</h3>
                  <p className="text-body-sm text-text-secondary">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lead Form */}
        <section id="lead-form" className="section-padding bg-surface-subtle scroll-mt-20">
          <div className="container-enterprise">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Form */}
              <div className="lg:col-span-3">
                <h2 className="text-heading text-navy mb-2">Book Your Free 30-Minute Walkthrough</h2>
                <p className="text-body text-text-secondary mb-8">
                  Fill in your details and we'll reach out within 1 business day to schedule your live session at a time that works for you.
                </p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                      <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" maxLength={100} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                      <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Smith" maxLength={100} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email <span className="text-red-500">*</span></Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="john@company.com" maxLength={255} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company <span className="text-red-500">*</span></Label>
                      <Input id="company" name="company" value={formData.company} onChange={handleInputChange} placeholder="Acme Corporation" maxLength={200} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Select country</option>
                        {countries.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lookingFor">What would you like to cover?</Label>
                    <Textarea
                      id="lookingFor"
                      name="lookingFor"
                      value={formData.lookingFor}
                      onChange={handleInputChange}
                      placeholder="Tell us about your compliance needs — entity types, volumes, jurisdictions, or specific questions you'd like answered..."
                      rows={4}
                      maxLength={1000}
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : (
                      <>Book My Walkthrough <Send className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                  <p className="text-caption text-text-tertiary text-center">
                    By submitting, you agree to our{" "}
                    <Link to="/privacy" className="text-teal hover:underline">Privacy Policy</Link>.
                  </p>
                </form>
              </div>

              {/* Value Points */}
              <div className="lg:col-span-2">
                <div className="sticky top-28 space-y-8">
                  <div className="p-6 rounded-xl border border-divider bg-card">
                    <h3 className="text-body font-semibold text-navy mb-4">What You'll See</h3>
                    <ul className="space-y-3">
                      {valuePoints.map((point) => (
                        <li key={point} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                          <span className="text-body-sm text-text-secondary">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 rounded-xl bg-navy/5 border border-navy/10">
                    <p className="text-body-sm text-navy font-medium mb-2">Trusted by regulated firms</p>
                    <p className="text-caption text-text-secondary">
                      Fintechs, EMIs, banks, and payment institutions across the UK, UAE, and USA rely on WorldAML for audit-ready compliance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-3xl">
            <h2 className="text-heading text-navy mb-2 text-center">Walkthrough Demo — FAQ</h2>
            <p className="text-body text-text-secondary text-center mb-10">
              Everything regulated firms ask before booking a screening walkthrough.
            </p>
            <div className="space-y-6">
              {[
                {
                  q: "What is the free 30-minute walkthrough demo?",
                  a: "A focused 30-minute live session with a WorldAML compliance specialist. We walk you through sanctions, PEP and adverse media screening across 1,900+ global watchlists, tailored to your entity types and jurisdictions — powered by LexisNexis data.",
                },
                {
                  q: "How do I book the walkthrough?",
                  a: "Submit your name, work email and company in the form above. Our team will reach out within one business day to schedule your session at a time that works for you.",
                },
                {
                  q: "Which screening solutions will you demo?",
                  a: "The full WorldAML screening stack: sanctions screening across OFAC, EU, UK OFSI, UN and 1,900+ lists; PEP and adverse media coverage via LexisNexis WorldCompliance; ongoing monitoring; case management; and API access for real-time integrations.",
                },
                {
                  q: "Is the walkthrough really free?",
                  a: "Yes. The 30-minute session is free with no obligation and no sales pitch. Paid plans start when you need ongoing screening, transaction monitoring, case management or API access.",
                },
                {
                  q: "Who is the walkthrough for?",
                  a: "MLROs, compliance officers and risk managers at banks, fintechs, EMIs, payment institutions, crypto-asset firms, gaming operators, law firms and accountants — anyone subject to AML/CFT obligations evaluating a screening solution.",
                },
              ].map((item) => (
                <div key={item.q} className="border-b border-divider pb-6">
                  <h3 className="text-body font-semibold text-navy mb-2">{item.q}</h3>
                  <p className="text-body-sm text-text-secondary">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-heading text-navy text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { step: "1", title: "Submit Your Details", desc: "Fill in the form above with your company information and what you'd like to cover." },
                { step: "2", title: "Pick a Time", desc: "Our team reaches out within 1 business day to schedule your 30-minute session." },
                { step: "3", title: "Join the Walkthrough", desc: "See WorldAML live, ask questions, and leave with a clear picture of the fit." },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-navy text-white flex items-center justify-center text-lg font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-body font-semibold text-navy mb-2">{item.title}</h3>
                  <p className="text-body-sm text-text-secondary">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cross-sell CTA */}
        <section className="bg-navy text-white py-16">
          <div className="container-enterprise text-center">
            <h2 className="text-heading mb-4">Want to Go Deeper?</h2>
            <p className="text-body text-white/70 max-w-xl mx-auto mb-8">
              Explore the full WorldAML compliance platform or speak with our team about enterprise pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="accent" asChild>
                <Link to="/contact-sales">Contact Sales <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline-light" asChild>
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FreeAMLCheck;
