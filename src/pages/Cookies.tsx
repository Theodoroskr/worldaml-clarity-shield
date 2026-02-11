import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Cookies = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Cookie Policy"
        description="WorldAML cookie policy explaining how we use cookies and similar technologies on our website."
        canonical="/cookies"
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <p className="text-label text-slate-light mb-4">Cookie Policy</p>
              <h1 className="text-display text-white mb-6">
                How We Use Cookies
              </h1>
              <p className="text-body-lg text-slate-light">
                Transparent Information About Our Cookie Usage. WorldAML is a product of InfoCredit Group Ltd.
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
                  <strong>WorldAML</strong> is a product of <strong>InfoCredit Group Ltd</strong>. We use cookies and similar technologies to help provide, protect, and improve our services. This policy explains how and why we use these technologies and the choices you have.
                </p>
              </div>

              <h2 className="text-headline text-navy">What Are Cookies?</h2>
              <p className="text-body text-text-secondary">
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They help websites remember your preferences and understand how you interact with the site.
              </p>

              <h2 className="text-headline text-navy">Types of Cookies We Use</h2>

              <div className="space-y-6 mt-6">
                <div className="border-l-4 border-navy pl-4">
                  <h3 className="text-subheadline text-navy mb-2">Necessary Cookies</h3>
                  <p className="text-body text-text-secondary">
                    These cookies are essential for the basic functionality of our website. They enable core features such as secure login, session management, and consent preferences. These cookies do not store any personally identifiable data and cannot be disabled.
                  </p>
                  <p className="text-caption text-text-tertiary mt-2">Status: Always Active</p>
                </div>

                <div className="border-l-4 border-slate pl-4">
                  <h3 className="text-subheadline text-navy mb-2">Functional Cookies</h3>
                  <p className="text-body text-text-secondary">
                    Functional cookies help perform certain functionalities like sharing content on social media platforms, collecting feedback, and enabling other third-party features. These cookies may be set by us or by third-party providers whose services we have added to our pages.
                  </p>
                </div>

                <div className="border-l-4 border-slate pl-4">
                  <h3 className="text-subheadline text-navy mb-2">Analytics Cookies</h3>
                  <p className="text-body text-text-secondary">
                    Analytical cookies help us understand how visitors interact with our website. These cookies provide information on metrics such as the number of visitors, bounce rate, traffic source, and pages visited. This helps us improve our website and services.
                  </p>
                </div>

                <div className="border-l-4 border-slate pl-4">
                  <h3 className="text-subheadline text-navy mb-2">Performance Cookies</h3>
                  <p className="text-body text-text-secondary">
                    Performance cookies are used to understand and analyse key performance indexes of the website, helping us deliver a better user experience for visitors.
                  </p>
                </div>

                <div className="border-l-4 border-slate pl-4">
                  <h3 className="text-subheadline text-navy mb-2">Advertisement Cookies</h3>
                  <p className="text-body text-text-secondary">
                    Advertisement cookies are used to provide visitors with customised advertisements based on the pages visited previously and to analyse the effectiveness of advertising campaigns.
                  </p>
                </div>
              </div>

              <h2 className="text-headline text-navy mt-12">Managing Your Cookie Preferences</h2>
              <p className="text-body text-text-secondary">
                You can manage your cookie preferences at any time. Most web browsers allow you to control cookies through their settings. You can set your browser to:
              </p>
              <ul className="text-body text-text-secondary space-y-2">
                <li>Block all cookies</li>
                <li>Accept all cookies</li>
                <li>Notify you when a cookie is set</li>
                <li>Delete cookies when you close your browser</li>
              </ul>
              <p className="text-body text-text-secondary mt-4">
                Please note that blocking or deleting cookies may impact your experience on our website and limit certain functionalities.
              </p>

              <h2 className="text-headline text-navy">Third-Party Cookies</h2>
              <p className="text-body text-text-secondary">
                Some cookies on our website are set by third-party services that appear on our pages. We do not control the dissemination of these cookies. Please check the relevant third-party website for more information about these cookies and how to manage them.
              </p>

              <h2 className="text-headline text-navy">Updates to This Policy</h2>
              <p className="text-body text-text-secondary">
                We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. When we make changes, we will revise the "Last updated" date at the bottom of this policy.
              </p>

              <h2 className="text-headline text-navy">Contact Us</h2>
              <div className="bg-surface-subtle border border-divider rounded-lg p-6">
                <p className="text-body text-text-secondary mb-4">
                  If you have any questions about our use of cookies, please contact us:
                </p>
                <p className="text-body text-text-secondary">
                  <strong>InfoCredit Group Ltd</strong><br />
                  Philippou Hadjigeorgiou 5A, Acropolis<br />
                  Nicosia 2006, Cyprus<br />
                  <strong>Email:</strong> dpo@infocreditgroup.com<br />
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

export default Cookies;
