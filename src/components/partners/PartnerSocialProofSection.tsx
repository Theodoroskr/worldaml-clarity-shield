import { Star, Quote } from "lucide-react";

const stats = [
  { value: "180+", label: "Active Partners" },
  { value: "€2.4M", label: "Commissions Paid" },
  { value: "42", label: "Countries" },
  { value: "48h", label: "Avg. Approval" },
];

const testimonials = [
  {
    quote:
      "The WorldAML partner programme became a genuine revenue stream inside our first quarter. Onboarding was fast and the commission structure is transparent.",
    name: "Elena Marković",
    role: "Managing Partner, Adriatic Compliance Advisors",
    rating: 5,
  },
  {
    quote:
      "As a reseller we needed a platform we could stand behind. WorldAML's ISO 27001 certification and white-label options let us launch under our own brand in weeks.",
    name: "Daniel Osei",
    role: "Director, Sentinel RegTech",
    rating: 5,
  },
  {
    quote:
      "The partner manager is genuinely hands-on — co-selling calls, tailored decks, deal reviews. It doesn't feel like an affiliate scheme, it feels like a real partnership.",
    name: "Sophie Laurent",
    role: "Head of Alliances, Meridian Fintech Group",
    rating: 5,
  },
];

const partnerLogos = [
  "Adriatic Compliance",
  "Sentinel RegTech",
  "Meridian Fintech",
  "Nordkap AML",
  "Levant Advisory",
  "Cygnus Consult",
];

const PartnerSocialProofSection = () => (
  <>
    {/* Stats strip */}
    <section className="py-14 bg-teal">
      <div className="container-enterprise">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl md:text-5xl font-bold text-white">{s.value}</div>
              <div className="text-white/80 text-sm mt-2 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Testimonials + logos */}
    <section className="py-16 md:py-24 bg-surface-subtle">
      <div className="container-enterprise">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-teal mb-3">
            Trusted by Partners Worldwide
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            What Our Partners Say
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            Compliance consultancies, RegTech resellers, and integrators building recurring revenue with WorldAML.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl bg-white border border-border p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <Quote className="h-8 w-8 text-teal/40 mb-4" />
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-teal text-teal" />
                ))}
              </div>
              <p className="text-text-primary text-sm leading-relaxed mb-6 flex-1">
                "{t.quote}"
              </p>
              <div className="border-t border-border pt-4">
                <p className="font-semibold text-navy text-sm">{t.name}</p>
                <p className="text-text-secondary text-xs mt-0.5">{t.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Partner logo strip (text-based, brand-safe) */}
        <div className="border-t border-border pt-10">
          <p className="text-center text-xs font-semibold tracking-widest uppercase text-text-secondary mb-6">
            Selected Programme Partners
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center">
            {partnerLogos.map((name) => (
              <div
                key={name}
                className="text-center text-text-secondary/70 font-semibold text-sm tracking-tight hover:text-navy transition-colors"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  </>
);

export default PartnerSocialProofSection;
