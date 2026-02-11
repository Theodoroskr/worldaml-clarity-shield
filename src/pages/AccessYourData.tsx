import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const AccessYourData = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Access Your Data"
        description="Exercise your data access rights under GDPR. Request access to, correction, or deletion of your personal data held by WorldAML."
        canonical="/access-your-data"
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <p className="text-label text-slate-light mb-4">Data Access</p>
              <h1 className="text-display text-white mb-6">
                Access Your Data
              </h1>
              <p className="text-body-lg text-slate-light">
                Gain Easy Access To Your Data Today. WorldAML is a product of InfoCredit Group Ltd.
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
                  <strong>WorldAML</strong> is a product of <strong>InfoCredit Group Ltd</strong>. As per Chapter III of the GDPR, as a natural person you have the right to request from us confirmation of whether we are processing your personal data, and if so, access to that information. If any of your personal data is inaccurate you have a right to request rectification.
                </p>
              </div>

              <p className="text-body text-text-secondary">
                We are committed to ensuring the data we hold is accurate and up to date. You have the right to object to our processing and/or request it is deleted or restricted. In considering our response we undertake to ensure your interests, fundamental rights and freedoms are properly balanced against our legitimate interests.
              </p>

              <p className="text-body text-text-secondary">
                Before we are able to provide you with any information or correct any inaccuracies, we will ask you to verify your identity and to provide other details to help us identify you and respond to your request.
              </p>

              <h2 className="text-headline text-navy">Your Reinforced Rights Under GDPR</h2>
              <p className="text-body text-text-secondary">
                The General Data Protection Regulation defines your rights regarding your personal data. Our Company has developed a mechanism for the satisfaction of requests concerning your personal data:
              </p>

              <div className="space-y-6 mt-6">
                <div className="border-l-4 border-accent pl-4">
                  <h3 className="text-subheadline text-navy mb-2">1. Right to Access</h3>
                  <p className="text-body text-text-secondary">
                    You have a right to access your data maintained by us and you may at any time obtain a copy thereof provided we possess them in electronic form.
                  </p>
                </div>

                <div className="border-l-4 border-accent pl-4">
                  <h3 className="text-subheadline text-navy mb-2">2. Right to Rectification</h3>
                  <p className="text-body text-text-secondary">
                    You have a right to access and rectify your personal details. You may at any stage of our relationship check and update your personal data, always presenting the necessary documentation and requesting the rectification or completion of inaccurate information.
                  </p>
                </div>

                <div className="border-l-4 border-accent pl-4">
                  <h3 className="text-subheadline text-navy mb-2">3. Right to Be Forgotten</h3>
                  <p className="text-body text-text-secondary">
                    You have the right to ask for the erasure of the whole or part of the data that concern you that are no longer necessary in relation to the purposes for which they are controlled or otherwise processed. Note: In cases where we retain and process personal data in accordance with Article 6(1)(c) of the GDPR, we may object to such a request to comply with legal obligations.
                  </p>
                </div>

                <div className="border-l-4 border-accent pl-4">
                  <h3 className="text-subheadline text-navy mb-2">4. Right to Restriction</h3>
                  <p className="text-body text-text-secondary">
                    You have the right to restrict processing where the accuracy of the personal data is contested, the processing is unlawful, or there is pending verification as to whether our legitimate grounds override your rights.
                  </p>
                </div>

                <div className="border-l-4 border-accent pl-4">
                  <h3 className="text-subheadline text-navy mb-2">5. Right to Object</h3>
                  <p className="text-body text-text-secondary">
                    You may at any time raise objections about the processing of your personal data. In case you make use of this right, the processing shall immediately cease, unless the Company can prove the existence of legal interest or the need to use the data in support of a legal/judicial case.
                  </p>
                </div>

                <div className="border-l-4 border-accent pl-4">
                  <h3 className="text-subheadline text-navy mb-2">6. Right to Data Portability</h3>
                  <p className="text-body text-text-secondary">
                    You have the right to portability, that is, to transfer your personal data to another organization in a legible and commonly used form.
                  </p>
                </div>

                <div className="border-l-4 border-accent pl-4">
                  <h3 className="text-subheadline text-navy mb-2">7. Right to Recall Consent</h3>
                  <p className="text-body text-text-secondary">
                    You have the right at any time to withdraw your consent to the processing of your personal data, without affecting the legality on which our policy was based prior to your withdrawal. Note that the recall of your consent may lead to termination of relevant services.
                  </p>
                </div>

                <div className="border-l-4 border-accent pl-4">
                  <h3 className="text-subheadline text-navy mb-2">8. Right to Launch Complaint</h3>
                  <p className="text-body text-text-secondary">
                    You have the right to launch a complaint with the Commissioner for the Protection of Personal Data regarding the processing of your personal data.
                  </p>
                </div>
              </div>

              <h2 className="text-headline text-navy mt-12">Submit a Data Access Request</h2>
              <p className="text-body text-text-secondary">
                To exercise any of your rights, please download and complete the appropriate form:
              </p>

              <div className="bg-surface-subtle border border-divider rounded-lg p-6 mt-4">
                <h3 className="text-subheadline text-navy mb-4">Application Form for Natural Persons</h3>
                <Button variant="outline" asChild>
                  <a 
                    href="https://www.infocreditgroup.com/wp-content/uploads/2024/01/Data-subject-right-form-ENG.docx" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Download Form
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>

              <h2 className="text-headline text-navy mt-12">Legal Persons</h2>
              <p className="text-body text-text-secondary">
                We provide the right of access and correction to data contained in our database for legal entities as well. The applicant should be the legal representative of the company as stated in the official Certificate of Directors and Secretary issued by the Registrar of Companies and Official Receiver or in a duly issued mandate.
              </p>

              <h2 className="text-headline text-navy">Contact Us</h2>
              <div className="bg-surface-subtle border border-divider rounded-lg p-6">
                <p className="text-body text-text-secondary mb-4">
                  <strong>Data Protection Officer</strong><br />
                  InfoCredit Group Ltd
                </p>
                <p className="text-body text-text-secondary">
                  <strong>Address:</strong> Philippou Hadjigeorgiou 5A, Acropolis, Nicosia 2006, Cyprus<br />
                  <strong>Telephone:</strong> +357 22398000<br />
                  <strong>Email:</strong> dpo@infocreditgroup.com
                </p>
                <p className="text-body text-text-secondary mt-4">
                  <strong>Working Hours:</strong><br />
                  Monday – Thursday: 08:30-17:30<br />
                  Friday: 08:30-14:30
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

export default AccessYourData;
