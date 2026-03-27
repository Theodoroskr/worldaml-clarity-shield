import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Send, FileSearch, MessageSquare, BarChart3, ShieldCheck, ExternalLink } from "lucide-react";
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
    icon: FileSearch,
    title: "Sample Screening Report",
    description: "Receive a real screening output showing how entities are matched against global watchlists.",
  },
  {
    icon: MessageSquare,
    title: "Quick Consultation",
    description: "A brief call with our compliance team to discuss your specific requirements.",
  },
  {
    icon: BarChart3,
    title: "Platform Walkthrough",
    description: "See the full WorldAML Suite in action — onboarding, screening, monitoring, and reporting.",
  },
  {
    icon: ShieldCheck,
    title: "Audit-Readiness Tips",
    description: "Practical recommendations to strengthen your compliance posture and documentation.",
  },
];

const valuePoints = [
  "Screen against 1,900+ global watchlists",
  "Sanctions, PEP, and adverse media coverage",
  "Powered by LexisNexis data",
  "Results delivered within 1 business day",
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
          }),
        }
      );
      if (!response.ok) throw new Error("Submission failed");

      toast({
        title: "Request Submitted",
        description: "Thank you! Our team will send your free AML check results within 1 business day.",
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
        title="Free AML Check | WorldAML"
        description="Run a free AML check and see how a modern compliance workflow can improve onboarding, screening, and audit readiness for your regulated business."
        canonical="/free-aml-check"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Free AML Check", url: "/free-aml-check" },
        ]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-navy text-white py-20 md:py-28">
          <div className="container-enterprise text-center">
            <h1 className="text-display mb-4">Run a Free AML Check</h1>
            <p className="text-body-lg text-white/80 max-w-2xl mx-auto mb-8">
              See how a modern compliance workflow can improve onboarding, screening, and audit readiness — powered by LexisNexis data across 1,900+ global watchlists.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="accent" asChild>
                <a href="#lead-form">
                  Request Your Free Check <ArrowRight className="ml-2 h-4 w-4" />
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
            <h2 className="text-heading text-navy text-center mb-4">What You'll Receive</h2>
            <p className="text-body text-text-secondary text-center max-w-2xl mx-auto mb-12">
              Submit your details and our compliance team will provide a personalised assessment of your screening needs.
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
                <h2 className="text-heading text-navy mb-2">Request Your Free AML Check</h2>
                <p className="text-body text-text-secondary mb-8">
                  Fill in your details and we'll get back to you within 1 business day with a sample screening report.
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
                    <Label htmlFor="lookingFor">What are you looking for?</Label>
                    <Textarea
                      id="lookingFor"
                      name="lookingFor"
                      value={formData.lookingFor}
                      onChange={handleInputChange}
                      placeholder="Tell us about your compliance needs — entity types, volumes, jurisdictions..."
                      rows={4}
                      maxLength={1000}
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : (
                      <>Submit Request <Send className="ml-2 h-4 w-4" /></>
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
                    <h3 className="text-body font-semibold text-navy mb-4">Why WorldAML?</h3>
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

        {/* How It Works */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-heading text-navy text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { step: "1", title: "Submit Your Details", desc: "Fill in the form above with your company information and compliance needs." },
                { step: "2", title: "Receive Your Report", desc: "Our team sends a sample screening report within 1 business day." },
                { step: "3", title: "Book a Full Demo", desc: "See the complete WorldAML platform in action with a personalised walkthrough." },
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
                <Link to="/contact-sales">Book a Demo <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
