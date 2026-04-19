import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import BookDemoForm from "@/components/book-demo/BookDemoForm";
import { CheckCircle2, ShieldCheck, Globe2, Zap } from "lucide-react";

const BENEFITS = [
  "See WorldAML Suite screen a customer in 90 seconds",
  "Walk through KYC/KYB, AML, monitoring & reporting",
  "Get a tailored quote based on your volume & regulator",
  "Live Q&A with a compliance specialist",
];

const TRUST = [
  { icon: Globe2, label: "1,900+ global lists" },
  { icon: ShieldCheck, label: "Used by regulated institutions" },
  { icon: Zap, label: "API-first, deploy in days" },
];

const BookDemo = () => {
  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <SEO
        title="Book a WorldAML Suite Demo | AML, KYC & Transaction Monitoring"
        description="See WorldAML Suite live in 30 minutes. AML screening, KYC/KYB, transaction monitoring & regulatory reporting tailored to your regulator."
        canonical="https://worldaml.com/book-demo"
      />
      <Header />

      <main className="flex-1 section-padding">
        <div className="container-enterprise">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Left: pitch */}
            <div className="lg:sticky lg:top-24">
              <span className="inline-block bg-teal/10 text-teal text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full">
                Book a demo
              </span>
              <h1 className="mt-4 text-h1 font-bold text-navy">
                See WorldAML Suite screen a customer in <span className="text-teal">90 seconds</span>
              </h1>
              <p className="mt-4 text-body-lg text-text-secondary">
                A focused 30-minute walkthrough of the modules that matter to your team — built around your regulator and customer volume.
              </p>

              <ul className="mt-6 space-y-3">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-teal flex-shrink-0 mt-0.5" />
                    <span className="text-navy">{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TRUST.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 rounded-lg border border-divider bg-white p-3">
                    <Icon className="h-5 w-5 text-teal flex-shrink-0" />
                    <span className="text-sm font-medium text-navy">{label}</span>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-sm text-text-secondary">
                Trusted by compliance teams in banking, fintech, crypto and iGaming across EU, UK & North America.
              </p>
            </div>

            {/* Right: form */}
            <div>
              <BookDemoForm />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookDemo;
