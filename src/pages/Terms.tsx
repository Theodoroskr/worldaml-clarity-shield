import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Terms of Service"
        description="WorldAML terms of service governing use of the website, WorldAML Suite, Academy, API, partner program and screening data services."
        canonical="/terms"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Terms of Service", url: "/terms" },
        ]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <p className="text-label text-slate-light mb-4">Terms of Service</p>
              <h1 className="text-display text-white mb-6">Terms of Use</h1>
              <p className="text-body-lg text-slate-light">
                Navigate The Path Forward With Confidence. WorldAML is a product of InfoCredit Group Ltd.
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="section-padding">
          <div className="container-enterprise">
            <div className="max-w-4xl mx-auto prose prose-slate">
              <div className="bg-surface-subtle border border-divider rounded-lg p-6 mb-8">
                <p className="text-body text-text-secondary font-semibold">
                  PLEASE READ THESE TERMS CAREFULLY BEFORE USING THIS SITE OR ANY WORLDAML SERVICE
                </p>
                <p className="text-body text-text-secondary mt-2">
                  By using this site, creating an account, or subscribing to any WorldAML service, you signify your
                  assent to these terms of use. If you do not agree to these terms of use, please do not use the site
                  or the services.
                </p>
              </div>

              <p className="text-body text-text-secondary">
                <strong>WorldAML</strong> is a product of <strong>InfoCredit Group Ltd</strong> (referred to as
                "InfoCredit," "we," "us," or "our" herein), a company registered in Cyprus with its main office at 5a
                Philippou Chatzigeorgiou Str., Nicosia, Cyprus.
              </p>

              <h2 className="text-headline text-navy">Services Covered by These Terms</h2>
              <p className="text-body text-text-secondary">
                These terms apply to the WorldAML website and to the following services, where you have been granted
                access to them:
              </p>
              <ul className="text-body text-text-secondary space-y-2">
                <li><strong>WorldAML Suite</strong> — the compliance workspace covering customer onboarding, KYC/KYB records, UBO and ownership mapping, AML screening, transaction monitoring and rules, case management, enhanced due diligence, periodic reviews, risk scoring and regulatory reporting.</li>
                <li><strong>Onboarding forms and public onboarding links</strong> — form builder, shareable onboarding URLs and the submissions inbox used to collect data and documents from your own customers.</li>
                <li><strong>Customer portal</strong> — the portal through which your customers can log in, submit and refresh documents.</li>
                <li><strong>WorldAML Academy</strong> — online AML/CFT training courses, assessments and certificates.</li>
                <li><strong>APIs and integrations</strong> — screening, KYC/KYB and reporting APIs, webhooks and data exports.</li>
                <li><strong>Partner Program and Partner Portal</strong> — referral, affiliate and technology partnerships, including referral tracking and commissions.</li>
                <li><strong>Data services</strong> — sanctions, PEP and adverse media screening data, including data licensed from third-party providers.</li>
              </ul>

              <h2 className="text-headline text-navy">Accounts, Registration and Access</h2>
              <p className="text-body text-text-secondary">
                Certain areas of the platform require an account. You must provide accurate registration details, keep
                your credentials confidential, and are responsible for all activity under your account. Access to
                specific modules depends on your subscription, assigned role and, for organisation workspaces, the
                permissions granted to you by your organisation administrator. We may suspend or terminate accounts
                that are shared, misused, or used in breach of these terms.
              </p>
              <p className="text-body text-text-secondary">
                Where you use the platform as part of an organisation, your data is scoped to that organisation's
                workspace and may be visible to other authorised users and administrators of that organisation.
              </p>

              <h2 className="text-headline text-navy">Consent at Registration: Data Protection and Marketing</h2>
              <p className="text-body text-text-secondary">
                By creating a WorldAML account you confirm that you have read and accept these Terms and our Privacy
                Notice, and you consent to the processing of your personal data as described in that notice in
                accordance with the EU General Data Protection Regulation (GDPR) and applicable national data
                protection law. Your acceptance is recorded against your account with a timestamp at the moment of
                registration.
              </p>
              <p className="text-body text-text-secondary">
                Registration also includes your consent to receive marketing and commercial communications from
                WorldAML — product news and releases, WorldAML Academy course updates and offers, event invitations,
                webinars, regulatory insights and related services. These may be sent by email and, where you have
                provided a number, by phone or messaging.
              </p>
              <p className="text-body text-text-secondary">
                You may withdraw your marketing consent at any time, free of charge and without affecting the
                lawfulness of processing carried out before withdrawal. Turn off <em>Marketing communications</em> in
                your dashboard settings (Academy, Business and Partner portals each expose this control), use the
                unsubscribe link in any marketing email, or contact us at{" "}
                <a href="mailto:info@worldaml.com" className="text-teal hover:underline">info@worldaml.com</a>. Opting
                out is recorded on your account and applied across all WorldAML marketing lists. Essential service,
                billing, security and other transactional messages relating to your account are not marketing and will
                continue to be sent for as long as your account remains open.
              </p>



              <h2 className="text-headline text-navy">Subscriptions, Fees and Refunds</h2>
              <p className="text-body text-text-secondary">
                Paid plans, Academy courses and add-ons are billed through our payment processor. Prices are shown at
                the point of purchase and may be presented in different currencies or regional plans. Subscriptions
                renew for successive terms unless cancelled before the renewal date, and usage-based elements (such as
                screening searches or seats) are subject to the limits of your plan. Except where required by
                applicable law, fees already paid are non-refundable once access to the relevant service, course
                content or certificate has been provided.
              </p>
              <p className="text-body text-text-secondary">
                We do not store your full payment card details; card data is handled by our payment processor.
              </p>

              <h2 className="text-headline text-navy">Acceptable Use</h2>
              <p className="text-body text-text-secondary">You agree not to:</p>
              <ul className="text-body text-text-secondary space-y-2">
                <li>Use screening results for any purpose prohibited by applicable law, including unlawful discrimination or credit, employment or insurance decisions where such use is regulated;</li>
                <li>Scrape, bulk-download, resell, sublicense or redistribute screening data, list content or platform outputs except as expressly permitted in your agreement;</li>
                <li>Circumvent plan limits, rate limits, quotas or access controls, or share API keys with third parties;</li>
                <li>Upload malicious code, unlawful content, or personal data you have no lawful basis to process;</li>
                <li>Reverse engineer, probe or attempt to gain unauthorised access to the platform or other tenants' data.</li>
              </ul>

              <h2 className="text-headline text-navy">Your Data and Your Customers' Data</h2>
              <p className="text-body text-text-secondary">
                You retain ownership of the customer records, documents, form submissions and case data you upload to
                the platform. For that content, you act as data controller and we act as data processor, processing it
                on your instructions in order to provide the services. You are responsible for having a lawful basis
                for collecting and submitting that data, for the accuracy of the information you provide, and for
                notifying your own customers as required. Retention periods, deletion requests and data subject
                requests can be managed through the platform's data retention and DSAR tools; see our{" "}
                <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
              </p>

              <h2 className="text-headline text-navy">Screening Results, Reporting and Automated Features</h2>
              <p className="text-body text-text-secondary">
                Screening matches, risk scores, monitoring alerts, rule outcomes, drafted narratives and AI-assisted
                suggestions are decision-support outputs only. They may contain false positives, false negatives or
                incomplete information, and they do not constitute legal, regulatory or compliance advice. You remain
                solely responsible for your compliance programme, for human review of results, and for the content,
                accuracy and timeliness of any report or filing you submit to a regulator or financial intelligence
                unit. Where the platform prepares regulator submissions or export files, submission remains your
                responsibility unless a direct filing integration is expressly agreed in writing.
              </p>

              <h2 className="text-headline text-navy">Academy, Assessments and Certificates</h2>
              <p className="text-body text-text-secondary">
                Academy access is personal to the named learner and may not be shared. Certificates confirm completion
                of the relevant WorldAML course and assessment; they are not a professional qualification, licence or
                accreditation, and they do not certify regulatory compliance. Course access, seats and certificate
                validity are subject to the terms of the plan under which they were purchased.
              </p>

              <h2 className="text-headline text-navy">Partner Program</h2>
              <p className="text-body text-text-secondary">
                Partner applications are subject to approval. Approved partners may receive commissions on qualifying
                referrals in accordance with the tier and terms confirmed in writing. Commissions are payable only on
                amounts actually received and retained by us, and are subject to correct referral attribution.
                Partners must describe WorldAML accurately, must not make claims on our behalf, must not bid on our
                brand terms without written consent, and must comply with applicable marketing and data protection
                law. We may withhold commissions or terminate a partnership for inaccurate attribution, misleading
                marketing or breach of these terms.
              </p>

              <h2 className="text-headline text-navy">Third-Party Data and Services</h2>
              <p className="text-body text-text-secondary">
                Parts of the services rely on third-party data providers and infrastructure, including licensed
                sanctions, PEP and adverse media data, identity verification providers, payment processing, email
                delivery, hosting and CRM. Third-party data is provided subject to the licensor's own terms and
                availability, and we do not warrant the completeness, accuracy or continuous availability of such
                data.
              </p>

              <h2 className="text-headline text-navy">Service Availability and Changes</h2>
              <p className="text-body text-text-secondary">
                We may add, modify, suspend or discontinue features, plans, modules or list coverage at any time. We
                aim to keep the platform available but do not guarantee uninterrupted access, and maintenance or
                third-party outages may affect availability. Any service level commitments apply only where expressly
                agreed in a signed contract.
              </p>

              <h2 className="text-headline text-navy">Restrictions On Use Of Materials</h2>
              <p className="text-body text-text-secondary">
                This site is owned and operated by InfoCredit Group Ltd. No material from the site may be copied,
                reproduced, republished, uploaded, posted, transmitted or distributed in any way, except that you may
                download one copy of the materials on any single computer for your non-commercial use only, provided
                that you keep intact all copyright and other proprietary notices.
              </p>
              <p className="text-body text-text-secondary">
                Modification of the materials or use of the materials for any other purpose is a violation of
                InfoCredit's copyright and other proprietary rights. The use of any such material on any other website
                or networked computer environment is prohibited.
              </p>
              <p className="text-body text-text-secondary">
                All trademarks, service marks and trade names displayed on this site, except for those of other
                companies, are proprietary to InfoCredit Group Ltd and WorldAML.
              </p>

              <h2 className="text-headline text-navy">Software License</h2>
              <p className="text-body text-text-secondary">
                In the event that you download any software, template, export file or document from the site, the
                software, including any files, images incorporated in or generated by the software, and data
                accompanying the software (collectively, the "Software") are non-exclusively licensed to you by
                InfoCredit for use within your own compliance programme. InfoCredit does not transfer title of the
                Software to you and retains full and complete title to the Software and all intellectual property
                rights therein.
              </p>
              <p className="text-body text-text-secondary">
                You may not redistribute, sell, decompile, reverse engineer, disassemble, or otherwise reduce the
                Software to a human-perceivable form.
              </p>

              <h2 className="text-headline text-navy">Disclaimer</h2>
              <p className="text-body text-text-secondary">
                The materials and services are provided "as is" and without warranties of any kind either express or
                implied. To the fullest extent permissible pursuant to applicable law, InfoCredit disclaims all
                warranties, express or implied, including, but not limited to, implied warranties of merchantability
                and fitness for a particular purpose.
              </p>
              <p className="text-body text-text-secondary">
                InfoCredit does not warrant that the functions contained in the materials will be uninterrupted or
                error-free, that defects will be corrected, or that this site or the server that makes it available
                are free of viruses or other harmful components.
              </p>
              <p className="text-body text-text-secondary">
                InfoCredit does not warrant or make any representations regarding the use or the results of the use of
                the materials or services in terms of their correctness, accuracy, reliability, or otherwise.
              </p>

              <h2 className="text-headline text-navy">Limitation Of Liability</h2>
              <p className="text-body text-text-secondary">
                Under no circumstances, including, but not limited to, negligence, shall InfoCredit be liable for any
                special or consequential damages, loss of profits, regulatory penalties or loss of data that result
                from the use of, or the inability to use, the site or the services, even if InfoCredit or an
                InfoCredit authorized representative has been advised of the possibility of such damages.
              </p>
              <p className="text-body text-text-secondary">
                In no event shall InfoCredit have any liability to you for damages, losses and causes of action –
                whether in contract, tort (including, but not limited to, negligence), or otherwise – for accessing
                this site.
              </p>

              <h2 className="text-headline text-navy">Suspension and Termination</h2>
              <p className="text-body text-text-secondary">
                We may suspend or terminate access where fees remain unpaid, where use breaches these terms, or where
                required by law. On termination, access to the workspace ends and data is retained or deleted in line
                with the retention settings and legal obligations described in our{" "}
                <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>. You should export
                any data you need before termination takes effect.
              </p>

              <h2 className="text-headline text-navy">Jurisdiction</h2>
              <p className="text-body text-text-secondary">
                All claims, disputes or disagreements which may arise out of the interpretation, performance or in any
                way relating to your use of this site and any and all other InfoCredit site(s) or services, shall be
                submitted exclusively to the jurisdiction of the courts located in the Republic of Cyprus.
              </p>

              <h2 className="text-headline text-navy">Contact Us</h2>
              <div className="bg-surface-subtle border border-divider rounded-lg p-6">
                <p className="text-body text-text-secondary">
                  <strong>InfoCredit Group Ltd</strong><br />
                  Philippou Hadjigeorgiou 5A, Acropolis<br />
                  Nicosia 2006, Cyprus<br />
                  <strong>Telephone:</strong> +357 22398000<br />
                  <strong>Email:</strong> info@infocreditgroup.com
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

export default Terms;
