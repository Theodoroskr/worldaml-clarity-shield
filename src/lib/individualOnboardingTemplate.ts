// Full "Individual Onboarding" CDD template (replicates the ACS / ComplianceSuite
// individual onboarding questionnaire: identity, tax, occupation, PEP, economic
// profile, high-risk declarations, entity relationships and document checklist).

export type TemplateFieldType =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "date"
  | "address"
  | "file"
  | "heading";

export interface TemplateField {
  id: string;
  type: TemplateFieldType;
  label: string;
  key: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: string[];
  validation?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

const YES_NO = ["Yes", "No"];

export const COUNTRY_OPTIONS = [
  "Cyprus", "Greece", "United Kingdom", "United States", "Germany", "France", "Italy",
  "Spain", "Netherlands", "Ireland", "Luxembourg", "Malta", "Switzerland", "Russia",
  "Ukraine", "China", "India", "United Arab Emirates", "Saudi Arabia", "Israel",
  "Lebanon", "Turkey", "Egypt", "South Africa", "Nigeria", "Brazil", "Panama",
  "British Virgin Islands", "Cayman Islands", "Seychelles", "Belize", "Hong Kong",
  "Singapore", "Australia", "Canada", "Japan", "Iran", "North Korea (DPRK)",
  "Myanmar", "Other",
];

const OCCUPATIONS = [
  "Accountant / Auditor / Tax Advisor", "Lawyer / Legal Counsel",
  "Consultant / Business Advisor", "Compliance / AML Officer",
  "Banker / Relationship Manager", "Investment Advisor / Asset Manager",
  "Financial Broker / Forex Trader", "Crypto Trader / Exchange Operator",
  "Engineer / Architect / Project Manager", "Contractor / Developer",
  "Doctor / Nurse / Health Professional", "Teacher / Professor / Academic",
  "Real Estate Agent / Broker", "Property Developer / Landlord",
  "Dealer in precious metals / stones / luxury goods", "Influencer / Content Creator",
  "Musician / Actor / Producer", "NGO Director / Fundraiser", "Retailer / Shop Owner",
  "Importer / Exporter / Trader", "Wholesaler / Distributor",
  "Casino Manager / Croupier", "Arms Dealer / Defense Contractor",
  "Private Equity / VC / Family Office", "Driver / Logistics Operator",
  "Government Employee / Public Officer", "Politician / Diplomat",
  "Student / Retired / Unemployed", "Self-Employed / Freelancer", "Other (specify)",
];

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `f_${Math.random().toString(36).slice(2)}`;

const h = (label: string, key: string): TemplateField => ({
  id: uid(), type: "heading", label, key, required: false,
});

const f = (
  type: TemplateFieldType,
  label: string,
  key: string,
  required = true,
  extra: Partial<TemplateField> = {}
): TemplateField => ({ id: uid(), type, label, key, required, ...extra });

const doc = (label: string, key: string, required: boolean, helpText: string): TemplateField =>
  f("file", label, key, required, {
    helpText,
    validation: { allowedFileTypes: ["pdf", "jpg", "jpeg", "png"], maxFileSizeMb: 15 },
  });

export function individualOnboardingTemplate() {
  const fields: TemplateField[] = [
    // ---------- A. Identity & contact ----------
    h("A. Identity & contact", "sec_identity_contact"),
    f("select", "Onboarding as", "onboarding_capacity", true, {
      options: ["Individual client (direct)", "Connected party of a legal entity"],
      helpText: "Answer first — drives the rest of the form (Section G applies to connected parties).",
    }),
    f("text", "First name", "first_name"),
    f("text", "Middle name(s)", "middle_names", false),
    f("text", "Surname", "surname"),
    f("select", "Gender", "gender", true, { options: ["Female", "Male"] }),
    f("date", "Date of birth", "date_of_birth", true, { helpText: "Screening key." }),
    f("select", "Country of birth", "country_of_birth", true, {
      options: COUNTRY_OPTIONS, helpText: "Included in the country-risk MAX.",
    }),
    f("select", "ID type", "id_type", true, { options: ["ID card", "Passport"] }),
    f("text", "ID / passport number", "id_number"),
    f("select", "Issuing country", "id_issuing_country", true, { options: COUNTRY_OPTIONS }),
    f("date", "Document expiry date", "id_expiry_date"),

    h("A.2 Residential address & contact", "sec_address_contact"),
    f("address", "Residential address", "residential_address"),
    f("text", "Postal code", "postal_code"),
    f("text", "Town / city", "town_city"),
    f("select", "Country of residence", "country_of_residence", true, { options: COUNTRY_OPTIONS }),
    f("phone", "Mobile phone", "mobile_phone"),
    f("email", "Email", "email", true, { validation: { format: "email" } }),

    h("A.3 Capacity", "sec_capacity"),
    f("select", "Acting on own behalf or on behalf of a third party?", "acting_capacity", true, {
      options: ["On my own behalf", "On behalf of a third party"],
      helpText: "If acting for a third party, a power of attorney / mandate is required.",
    }),
    f("textarea", "Third-party details (if applicable)", "third_party_details", false),

    // ---------- B. Nationality & tax ----------
    h("B. Nationality & tax", "sec_nationality_tax"),
    f("select", "Nationality", "nationality", true, { options: COUNTRY_OPTIONS }),
    f("select", "More than one citizenship?", "multiple_citizenship", true, { options: YES_NO }),
    f("text", "Additional citizenship(s)", "additional_citizenships", false),
    f("select", "Country of tax residence", "tax_residence_country", true, { options: COUNTRY_OPTIONS }),
    f("text", "Tax Identification Number (TIN)", "tin", false),
    f("select", "Reason TIN not available", "tin_unavailable_reason", false, {
      options: [
        "A – Jurisdiction does not issue TINs",
        "B – Unable to obtain a TIN",
        "C – A TIN is not required",
      ],
      helpText: "Conditional — complete only if no TIN was provided.",
    }),
    f("select", "US person? (US citizen, or US tax resident / green-card holder)", "us_person", true, { options: YES_NO }),
    f("select", "CRS self-certification confirmed?", "crs_self_certification", true, { options: YES_NO }),

    // ---------- C. Occupation ----------
    h("C. Occupation", "sec_occupation"),
    f("select", "Employment status", "employment_status", true, {
      options: ["Employed", "Self-Employed", "Retired", "Unemployed", "Other"],
    }),
    f("select", "Occupation", "occupation", true, { options: OCCUPATIONS }),
    f("text", "Employer / business name", "employer_name", false),
    f("text", "Industry / sector", "industry_sector", false),

    // ---------- D. PEP status ----------
    h("D. PEP status", "sec_pep"),
    f("select", "Do you hold / have you held a prominent public function?", "pep_self", true, { options: YES_NO }),
    f("textarea", "PEP details — role, country, period", "pep_self_details", false),
    f("select", "Family member / close associate of a PEP?", "pep_rca", true, { options: YES_NO }),
    f("textarea", "RCA details — relationship, role, country", "pep_rca_details", false),

    // ---------- E. Economic profile ----------
    h("E. Economic profile", "sec_economic_profile"),
    f("select", "Source of Funds — total size band", "sof_band", true, {
      options: ["≤ €100.000", "€100.001 – €500.000", "€500.001 – €1.000.000", "€1.000.001 – €5.000.000", "> €5.000.000"],
    }),
    f("textarea", "Source of Funds — list each source (type, amount, origin)", "sof_sources", true, {
      helpText: "One source per line, e.g. Salary — €80.000/yr — Bank of Cyprus.",
    }),
    f("select", "Source of Wealth — total size band", "sow_band", true, {
      options: ["≤ €500.000", "€500.001 – €1.000.000", "€1.000.001 – €3.000.000", "> €3.000.000"],
    }),
    f("textarea", "Source of Wealth — narrative (how the wealth was accumulated)", "sow_narrative", true),
    f("select", "Expected annual transaction volume / activity", "expected_activity", true, {
      options: ["≤ €100.000", "€100.001 – €500.000", "€500.001 – €1.000.000", "€1.000.001 – €5.000.000", "> €5.000.000"],
      helpText: "Baseline for ongoing monitoring.",
    }),

    // ---------- F. High-risk declarations ----------
    h("F. High-risk declarations", "sec_high_risk"),
    f("select", "Resident / citizen / beneficial owner of an entity in a high-risk jurisdiction?", "hr_jurisdiction", true, { options: YES_NO }),
    f("select", "Do you or your business operate in a high-risk industry? (gambling, weapons, etc.)", "hr_industry", true, { options: YES_NO }),
    f("select", "Maintain complex corporate structures / offshore entities / multiple ownership layers?", "hr_complex_structures", true, { options: YES_NO }),
    f("select", "Frequently deal in high-value goods, luxury assets or artwork?", "hr_high_value_goods", true, { options: YES_NO }),
    f("select", "Frequently use third-party intermediaries for financial transactions?", "hr_intermediaries", true, { options: YES_NO }),
    f("select", "Subject to regulatory action or investigation (you / related entity)?", "hr_regulatory_action", true, { options: YES_NO }),
    f("select", "Engage in financial services involving anonymity or difficult-to-trace transactions?", "hr_anonymity", true, { options: YES_NO }),
    f("select", "Received a citizenship by investment (CBI)?", "hr_cbi", true, { options: YES_NO }),
    f("select", "Do you regularly handle or transact in significant amounts of cash?", "hr_cash", true, { options: YES_NO }),
    f("select", "Convicted of a financial crime? (fraud, money laundering, tax evasion, corruption)", "hr_conviction", true, { options: YES_NO }),
    f("textarea", "Anything else relevant to your risk profile you wish to declare?", "hr_other_declarations", false),

    // ---------- G. Entity relationships ----------
    h("G. Entity relationships (connected parties)", "sec_entity_relationships"),
    f("text", "Related legal entity name", "related_entity_name", false),
    f("text", "Entity registration number", "related_entity_reg_number", false),
    f("select", "Country of incorporation", "related_entity_country", false, { options: COUNTRY_OPTIONS }),
    f("select", "Role in the entity", "related_entity_role", false, {
      options: ["Ultimate Beneficial Owner", "Shareholder", "Director", "Authorised signatory", "Trustee / Protector", "Settlor", "Beneficiary", "Other"],
    }),
    f("number", "Ownership / voting percentage (%)", "related_entity_ownership_pct", false, {
      validation: { min: 0, max: 100 },
    }),

    // ---------- H. Documents ----------
    h("H. Documents", "sec_documents"),
    doc("Passport / ID", "doc_passport_id", true, "Clear colour copy of the identity document provided above."),
    doc("Additional passport(s)", "doc_additional_passports", false, "Conditional — required if multiple citizenships were declared."),
    doc("Proof of address", "doc_proof_of_address", true, "Utility bill or bank statement issued within the last 3 months."),
    doc("Bank reference letter", "doc_bank_reference", false, "Risk-based — requested for higher-risk profiles."),
    doc("Source of Funds evidence", "doc_sof_evidence", true, "Payslips, contracts, sale agreements or bank statements."),
    doc("Source of Wealth evidence", "doc_sow_evidence", true, "Evidence supporting the wealth narrative."),
    doc("PoA / trust deed / minutes", "doc_poa_trust_deed", false, "Conditional — if acting on behalf of a third party or entity."),
    doc("PEP supporting info", "doc_pep_support", false, "Conditional — if a PEP or RCA relationship was declared."),
    doc("High-risk declaration evidence", "doc_high_risk_evidence", false, "Conditional — supporting evidence for any 'Yes' in Section F."),
    doc("CBI documentation", "doc_cbi", false, "Conditional — citizenship-by-investment documentation."),
    doc("FATCA / CRS self-certification (signed)", "doc_fatca_crs", true, "Signed self-certification form."),
    doc("CV / professional background", "doc_cv", false, "Optional — helps evidence the economic profile."),
    doc("Signed application & consent", "doc_signed_application", true, "Signed application form including data-processing consent."),

    // ---------- Consent ----------
    h("Declaration & consent", "sec_consent"),
    f("checkbox", "I confirm the information provided is true, complete and accurate", "declaration_accuracy", true),
    f("checkbox", "I consent to identity verification, sanctions/PEP screening and ongoing monitoring", "declaration_screening_consent", true),
    f("checkbox", "I agree to the terms of service and privacy policy", "declaration_terms", true),
  ];

  return {
    name: "Individual Onboarding (full CDD)",
    slug: "individual-onboarding",
    description:
      "Full individual customer due-diligence questionnaire: identity & contact, nationality & tax (FATCA/CRS), occupation, PEP status, economic profile (SoF/SoW), high-risk declarations, entity relationships and the supporting document checklist.",
    fields,
    checks: {
      kyc: true,
      kyb: false,
      sof: true,
      documents: [
        "Passport / ID",
        "Proof of address",
        "Source of Funds evidence",
        "Source of Wealth evidence",
        "FATCA / CRS self-certification",
        "Signed application & consent",
      ],
    },
    branding: {
      logo_url: null,
      primary_color: "#7030a0",
      company_name: null,
      support_email: null,
      show_powered_by: true,
    },
    redirectUrl: "",
    isActive: false,
  };
}
