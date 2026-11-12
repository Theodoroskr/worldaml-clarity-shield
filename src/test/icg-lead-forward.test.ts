import { describe, it, expect } from "vitest";
import { buildIcgLeadPayload, ICG_LEADS_URL } from "../../supabase/functions/_shared/icgLeadForward";

const base = {
  form_type: "partner-contact",
  first_name: "Ana",
  last_name: "Ruiz",
  email: "ana@acme.io",
  phone: "+357 22 000000",
  company: "Acme",
  country: "Cyprus",
  message: "We'd like to resell.",
  product: "Partner Program",
  metadata: {
    partner_type: "Reseller",
    website: "https://acme.io",
    marketing_consent: true,
    attribution: {
      utm_source: "linkedin",
      utm_medium: "social",
      utm_campaign: "nov",
      utm_content: "post1",
      landing_page: "https://worldaml.com/partners?utm_source=linkedin",
      cta_referrer: "https://worldaml.com/pricing",
    },
  },
};

describe("Infocredit Group lead forwarding", () => {
  it("posts to the group CRM lead endpoint", () => {
    expect(ICG_LEADS_URL).toBe("https://infocredit-group-connect.lovable.app/api/public/leads");
  });

  it("sends site, name, contact, product, service, topic, message, UTM and page details", () => {
    const p = buildIcgLeadPayload(base);
    expect(p).toMatchObject({
      site: "worldaml.com",
      name: "Ana Ruiz",
      email: "ana@acme.io",
      company: "Acme",
      phone: "+357 22 000000",
      country: "Cyprus",
      product: "Partner Program",
      service: "Reseller",
      topic: "Partner enquiry",
      utm_source: "linkedin",
      utm_medium: "social",
      utm_campaign: "nov",
      utm_content: "post1",
      page_url: "https://worldaml.com/partners?utm_source=linkedin",
      referrer: "https://worldaml.com/pricing",
      consent_marketing: true,
    });
    expect(p.message).toContain("We'd like to resell.");
  });

  it("never sends the honeypot field, so real leads are not discarded as bots", () => {
    const p = buildIcgLeadPayload(base);
    expect(p).not.toHaveProperty("website");
    expect(p.message).toContain("Company website: https://acme.io");
  });

  it("keeps fields within the receiver's length limits", () => {
    const p = buildIcgLeadPayload({ ...base, phone: "1".repeat(60), message: "x".repeat(5000) });
    expect(String(p.phone).length).toBe(40);
    expect(String(p.message).length).toBe(3000);
  });
});
