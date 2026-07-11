import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "Who is the Partner Program for?",
    a: "Compliance consultancies, MLROs, RegTech resellers, law firms with a regulated-client base, and technology integrators who work with financial institutions, crypto businesses, iGaming operators, payments firms, or any obliged entity under AML rules.",
  },
  {
    q: "How does commission work?",
    a: "You earn recurring commission on every paying client you refer for as long as they remain subscribed. Referral partners earn 5%, affiliate partners 10%, and reseller partners 15% of net subscription revenue. Payouts are processed monthly by bank transfer once the €100 minimum threshold is reached.",
  },
  {
    q: "How long does approval take?",
    a: "Most applications are reviewed and approved within 48 business hours. We may reach out for a short intro call to understand your client base and pick the right partner tier for you.",
  },
  {
    q: "Do I need technical skills to become a partner?",
    a: "No. Referral and affiliate partners only need to share their unique link. Reseller partners get white-label branding, custom pricing, and optional API access — but no engineering work is required to start earning.",
  },
  {
    q: "Is there a cost to join?",
    a: "No. The Partner Program is free to join for approved partners. There are no monthly fees, listing fees, or minimum sales quotas.",
  },
  {
    q: "Can I upgrade my partner tier later?",
    a: "Yes. You can request an upgrade at any time from your partner dashboard. Upgrades are typically approved once you meet the volume and engagement criteria of the next tier.",
  },
  {
    q: "What marketing materials do you provide?",
    a: "Affiliate and reseller partners get co-branded one-pagers, product decks, demo videos, landing page templates, email sequences, and case studies. All assets are localised for major compliance markets.",
  },
  {
    q: "How do you track referrals?",
    a: "Every partner gets a unique referral link and optional UTM tracking codes. Attribution is cookie-based with a 90-day window and reconciled server-side against paid subscriptions. You see every click, sign-up, and conversion in your dashboard.",
  },
];

const PartnerFAQSection = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container-enterprise">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-teal mb-3">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Everything You Need to Know
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            The answers to the questions we hear most from new partners.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={faq.q}
                className={`rounded-xl border transition-all ${
                  isOpen ? "border-teal bg-white shadow-sm" : "border-border bg-white hover:border-teal/50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
                >
                  <span className="font-semibold text-navy text-base">{faq.q}</span>
                  <span className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${isOpen ? "bg-teal text-white" : "bg-teal/10 text-teal"}`}>
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 -mt-1">
                    <p className="text-text-secondary text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PartnerFAQSection;
