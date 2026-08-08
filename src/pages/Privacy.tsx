import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Privacy Policy"
        description="WorldAML privacy policy: how we collect, use, share and protect personal data across the website, WorldAML Suite, Academy and partner program under the GDPR."
        canonical="/privacy"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Privacy Policy", url: "/privacy" },
        ]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <p className="text-label text-slate-light mb-4">Privacy Policy</p>
              <h1 className="text-display text-white mb-6">Your Privacy Matters</h1>
              <p className="text-body-lg text-slate-light">
                Your Data, Our Commitment. WorldAML is a product of InfoCredit Group Ltd.
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="section-padding">
          <div className="container-enterprise">
            <div className="max-w-4xl mx-auto prose prose-slate">
              <div className="bg-surface-subtle border border-divider rounded-lg p-6 mb-8">
                <p className="text-body text-text-secondary">
                  <strong>WorldAML</strong> is a product of <strong>InfoCredit Group Ltd</strong> (hereinafter
                  referred to as "the Company," "InfoCredit," "we," "us," or "our"), a company engaged in the
                  collection, archiving and re-use of data related to individuals or enterprises with the aim to
                  provide business intelligence and compliance solutions worldwide, having its main office at 5a
                  Philippou Chatzigeorgiou Str., Nicosia, Cyprus.
                </p>
              </div>

              <h2 className="text-headline text-navy">Who This Notice Applies To</h2>
              <p className="text-body text-text-secondary">This Notice is addressed to natural persons who are:</p>
              <ul className="text-body text-text-secondary space-y-2">
                <li>Visitors to our website and people who submit a demo, contact, partner or lead form</li>
                <li>Registered users of WorldAML products, including WorldAML Suite, the Academy and the Partner Portal</li>
                <li>Customers of our clients who complete an onboarding form or use the customer portal</li>
                <li>Officers, shareholders or beneficial owners of legal entities</li>
                <li>Subjects of compliance screening or monitoring procedures</li>
              </ul>

              <h2 className="text-headline text-navy">Our Commitment to Your Privacy</h2>
              <p className="text-body text-text-secondary">
                This text aims to provide you with intelligible, transparent and direct information about the
                processing of your personal data – how we collect and process your personal data in the context of
                fulfilling our business activities, explaining the procedures we have in place to safeguard your
                privacy according to the rules and provisions ascribed by the General Data Protection Regulation
                ("GDPR").
              </p>

              <h2 className="text-headline text-navy">Controller or Processor?</h2>
              <p className="text-body text-text-secondary">
                We act as <strong>data controller</strong> for our own website visitors, enquiries, marketing,
                accounts, Academy learners and partners. We act as <strong>data processor</strong> for the customer
                records, documents, onboarding submissions, screening results and case data that our clients upload to
                or generate within WorldAML Suite — in those cases our client is the controller and we process the
                data on their documented instructions. If you are the customer of one of our clients, please contact
                that organisation first regarding your data.
              </p>

              <h2 className="text-headline text-navy">Information We Collect</h2>

              <h3 className="text-subheadline text-navy">Website, enquiries and marketing</h3>
              <ul className="text-body text-text-secondary space-y-2">
                <li>Contact and company details you submit through demo requests, contact, partner and other lead forms (name, work email, phone, company, job title, country, message)</li>
                <li>Your consent records — acceptance of the Terms &amp; Conditions and Privacy Policy, and any optional marketing consent, with the date and time given</li>
                <li>Marketing attribution and website engagement data such as UTM parameters, referring URL, the page from which you clicked through, landing and first pages visited, number and dates of visits, approximate time on site and chatbot interactions</li>
                <li>Cookie and analytics data as described in our <Link to="/cookies" className="text-accent hover:underline">Cookie Policy</Link></li>
              </ul>

              <h3 className="text-subheadline text-navy">Accounts, Suite and Academy</h3>
              <ul className="text-body text-text-secondary space-y-2">
                <li>Account credentials, profile details, organisation membership and role assignments</li>
                <li>Subscription, plan, seat and billing status (card details are handled by our payment processor, not stored by us)</li>
                <li>Academy course progress, assessment results, certificates and verification records</li>
                <li>Security and audit logs, including sign-ins, approvals, edits, comments, mentions and administrative actions</li>
              </ul>

              <h3 className="text-subheadline text-navy">KYC/KYB verification</h3>
              <ul className="text-body text-text-secondary space-y-2">
                <li>Registration details (Registered Name, Address, Registration Number)</li>
                <li>Director, secretary, shareholder and ultimate beneficial owner information, including ownership percentages and control chains</li>
                <li>Identity verification documents and identity verification session results provided by our IDV partner</li>
                <li>Onboarding form responses, uploaded documents and their expiry dates</li>
                <li>Business operational information, source of funds and source of wealth declarations</li>
              </ul>

              <h3 className="text-subheadline text-navy">AML screening and monitoring</h3>
              <ul className="text-body text-text-secondary space-y-2">
                <li>PEP (Politically Exposed Persons) status</li>
                <li>Sanctions and watchlist screening results, including match decisions and whitelisted false positives</li>
                <li>Adverse media mentions</li>
                <li>Transaction data submitted for monitoring, rule outcomes, alerts, risk scores and case records</li>
                <li>Enhanced due diligence questionnaires, evidence and sign-off records, and regulatory report content</li>
              </ul>

              <h3 className="text-subheadline text-navy">Partner Program</h3>
              <ul className="text-body text-text-secondary space-y-2">
                <li>Partner application details, company and contact information and partner tier</li>
                <li>Referral attribution, registered deals, commission records and partner contact notification preferences</li>
              </ul>

              <h2 className="text-headline text-navy">Why We Process Your Data and On What Basis</h2>
              <ul className="text-body text-text-secondary space-y-2">
                <li><strong>Contract</strong> — to create and administer accounts, provide the Suite, Academy, portals and APIs, process payments and provide support</li>
                <li><strong>Legal obligation</strong> — to meet our own AML/CFT, accounting, tax and record-keeping duties</li>
                <li><strong>Legitimate interests</strong> — to secure the platform, prevent fraud and abuse, improve our products, understand how our site is used, and to respond to business enquiries you send us</li>
                <li><strong>Consent</strong> — for optional marketing communications and for non-essential cookies; you may withdraw consent at any time</li>
                <li><strong>Substantial public interest / legal claims</strong> — for the provision of compliance screening data, including PEP, sanctions and adverse media information, used by regulated entities to meet their own legal obligations</li>
              </ul>

              <h2 className="text-headline text-navy">Data Sources</h2>
              <p className="text-body text-text-secondary">Our data originates from public and other legitimate sources:</p>
              <ul className="text-body text-text-secondary space-y-2">
                <li>Public sector information (e.g., Company Registrars)</li>
                <li>Governmental and administrative public records</li>
                <li>Regulatory bodies, sanctions authorities and law enforcement agencies</li>
                <li>Licensed third-party data providers</li>
                <li>Media sources and publications</li>
                <li>Organizations providing information directly to us, including our clients who upload their customers' data</li>
                <li>Data provided directly by the Data Subject</li>
              </ul>

              <h2 className="text-headline text-navy">Who We Share Data With</h2>
              <p className="text-body text-text-secondary">
                We share personal data only where necessary, under contract and with appropriate safeguards, with the
                following categories of recipients:
              </p>
              <ul className="text-body text-text-secondary space-y-2">
                <li>Cloud hosting, database and storage providers that run the platform</li>
                <li>Payment processing providers for subscriptions and Academy purchases</li>
                <li>Transactional email delivery providers</li>
                <li>Our customer relationship management system, used to manage enquiries, demo requests and partner applications</li>
                <li>Identity verification and compliance data providers used to deliver screening and KYC results</li>
                <li>Website analytics providers, subject to your cookie choices</li>
                <li>Professional advisers, auditors, and competent authorities where required by law</li>
              </ul>
              <p className="text-body text-text-secondary">
                Where personal data is transferred outside the EEA, we rely on adequacy decisions or Standard
                Contractual Clauses together with appropriate supplementary measures. We do not sell personal data.
              </p>

              <h2 className="text-headline text-navy">Automated Processing</h2>
              <p className="text-body text-text-secondary">
                The platform applies automated screening, matching, risk scoring, monitoring rules and AI-assisted
                drafting to support compliance decisions. These outputs are decision-support only and are reviewed by
                human compliance staff of the responsible organisation; WorldAML does not itself take decisions that
                produce legal effects concerning you. If a decision has been taken about you by one of our clients,
                please address it to that organisation.
              </p>

              <h2 className="text-headline text-navy">Retention and Erasure</h2>
              <p className="text-body text-text-secondary">
                We retain personal data only as long as needed for the purposes described above or as required by law.
                Enquiry and marketing records are kept for a limited period unless you object earlier; account,
                Academy and billing records are kept for the life of the relationship and applicable statutory
                periods. For data processed within WorldAML Suite, retention is configured by the client organisation
                through the platform's retention policy tools, and automated retention sweeps delete or anonymise
                records once their retention period has expired, subject to legal holds.
              </p>

              <h2 className="text-headline text-navy">Data We Do Not Collect</h2>
              <p className="text-body text-text-secondary">
                InfoCredit does not seek to collect any information in relation to a European resident's race or
                ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, health,
                sex life or sexual orientation, or genetic data. Biometric processing may occur only where an identity
                verification provider is used for document and liveness checks at the instruction of the responsible
                organisation.
              </p>

              <h2 className="text-headline text-navy">Security</h2>
              <p className="text-body text-text-secondary">
                We apply technical and organisational measures including encryption in transit, role-based access
                control, tenant-level data isolation, audit logging of administrative actions and least-privilege
                access to production systems. No system can be guaranteed to be completely secure, and you are
                responsible for keeping your credentials confidential.
              </p>

              <h2 className="text-headline text-navy">Your Rights</h2>
              <p className="text-body text-text-secondary">
                Under the GDPR you have the right to access, rectification, erasure, restriction, portability, and to
                object to processing based on legitimate interests, as well as to withdraw consent to marketing at any
                time (including via the unsubscribe link in our emails). Please see our{" "}
                <Link to="/access-your-data" className="text-accent hover:underline">Access Your Data</Link> page for
                detailed information on how to exercise these rights, and see our{" "}
                <Link to="/cookies" className="text-accent hover:underline">Cookie Policy</Link> for cookie choices.
                You also have the right to lodge a complaint with the Office of the Commissioner for Personal Data
                Protection in Cyprus or with your local supervisory authority.
              </p>

              <h2 className="text-headline text-navy">Contact Our Data Protection Officer</h2>
              <div className="bg-surface-subtle border border-divider rounded-lg p-6">
                <p className="text-body text-text-secondary mb-4">
                  For any questions regarding your personal data or this privacy notice, please contact our Data
                  Protection Officer:
                </p>
                <p className="text-body text-text-secondary">
                  <strong>Email:</strong> dpo@infocreditgroup.com<br />
                  <strong>Address:</strong> Philippou Hadjigeorgiou 5A, Acropolis, Nicosia 2006, Cyprus<br />
                  <strong>Telephone:</strong> +357 22398000
                </p>
              </div>

              <p className="text-caption text-text-tertiary mt-8">
                Last updated: August 2026
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
