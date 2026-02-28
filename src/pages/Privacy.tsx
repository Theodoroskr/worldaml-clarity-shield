import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Privacy Policy"
        description="WorldAML privacy policy. How we collect, use, and protect your personal data in compliance with GDPR and applicable data protection laws."
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
              <h1 className="text-display text-white mb-6">
                Your Privacy Matters
              </h1>
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
                  <strong>WorldAML</strong> is a product of <strong>InfoCredit Group Ltd</strong> (hereinafter referred to as "the Company," "InfoCredit," "we," "us," or "our"), a company engaged in the collection, archiving and re-use of data related to individuals or enterprises with the aim to provide business intelligence and compliance solutions worldwide, having its main office at 5a Philippou Chatzigeorgiou Str., Nicosia, Cyprus.
                </p>
              </div>

              <h2 className="text-headline text-navy">Who This Notice Applies To</h2>
              <p className="text-body text-text-secondary">
                This Notice is addressed to natural persons who are:
              </p>
              <ul className="text-body text-text-secondary space-y-2">
                <li>Current or potential customers of the Company or its clients</li>
                <li>Officers or beneficiaries of legal entities</li>
                <li>Subjects of compliance screening or monitoring procedures</li>
                <li>Users of WorldAML products and services</li>
              </ul>

              <h2 className="text-headline text-navy">Our Commitment to Your Privacy</h2>
              <p className="text-body text-text-secondary">
                This text aims to provide you with intelligible, transparent and direct information about the processing of your personal data – how we collect and process your personal data in the context of fulfilling our business activities, explaining the procedures we have in place to safeguard your privacy according to the rules and provisions ascribed by the General Data Protection Regulation ("GDPR").
              </p>

              <h2 className="text-headline text-navy">Information We Collect</h2>
              <p className="text-body text-text-secondary">
                Through WorldAML's regulatory compliance services, we may collect and process the following categories of information:
              </p>

              <h3 className="text-subheadline text-navy">KYC/KYB Verification</h3>
              <ul className="text-body text-text-secondary space-y-2">
                <li>Registration details (Registered Name, Address, Registration Number)</li>
                <li>Director, Secretary and Shareholder information</li>
                <li>Identity verification documents</li>
                <li>Business operational information</li>
              </ul>

              <h3 className="text-subheadline text-navy">AML Screening</h3>
              <ul className="text-body text-text-secondary space-y-2">
                <li>PEP (Politically Exposed Persons) status</li>
                <li>Sanctions list screening results</li>
                <li>Adverse media mentions</li>
                <li>Regulatory compliance information</li>
              </ul>

              <h2 className="text-headline text-navy">Data Sources</h2>
              <p className="text-body text-text-secondary">
                Our data originates from public and other legitimate sources:
              </p>
              <ul className="text-body text-text-secondary space-y-2">
                <li>Public sector information (e.g., Company Registrars)</li>
                <li>Governmental and administrative public records</li>
                <li>Regulatory bodies and law enforcement agencies</li>
                <li>Media sources and publications</li>
                <li>Organizations providing information directly to us</li>
                <li>Data provided directly by the Data Subject</li>
              </ul>

              <h2 className="text-headline text-navy">Data We Do Not Collect</h2>
              <p className="text-body text-text-secondary">
                InfoCredit does not seek to collect any information in relation to a European resident's race or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, health, sex life or sexual orientation, genetic or biometric data.
              </p>

              <h2 className="text-headline text-navy">Your Rights</h2>
              <p className="text-body text-text-secondary">
                Under the GDPR, you have enhanced rights regarding your personal data. Please see our <a href="/access-your-data" className="text-accent hover:underline">Access Your Data</a> page for detailed information on how to exercise these rights.
              </p>

              <h2 className="text-headline text-navy">Contact Our Data Protection Officer</h2>
              <div className="bg-surface-subtle border border-divider rounded-lg p-6">
                <p className="text-body text-text-secondary mb-4">
                  For any questions regarding your personal data or this privacy notice, please contact our Data Protection Officer:
                </p>
                <p className="text-body text-text-secondary">
                  <strong>Email:</strong> dpo@infocreditgroup.com<br />
                  <strong>Address:</strong> Philippou Hadjigeorgiou 5A, Acropolis, Nicosia 2006, Cyprus<br />
                  <strong>Telephone:</strong> +357 22398000
                </p>
              </div>

              <p className="text-caption text-text-tertiary mt-8">
                Last updated: February 2025
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
