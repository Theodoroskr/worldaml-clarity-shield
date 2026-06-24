import { Link } from "react-router-dom";
import AcademyLogo from "@/components/AcademyLogo";

/**
 * Slim footer rendered on the academy.* subdomain.
 * Keeps legal links and an explicit pointer back to the main
 * WorldAML site, without bloating the learner experience.
 */
export const AcademyFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-divider bg-background mt-16">
      <div className="container-enterprise py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="space-y-3">
            <AcademyLogo size="md" />
            <p className="text-body-sm text-text-secondary max-w-sm">
              Practical AML, KYC and compliance training for individual learners.
              Earn certificates recognised across regulated industries.
            </p>
          </div>

          <div>
            <h3 className="text-caption font-semibold text-text-tertiary uppercase tracking-wider mb-3">
              Learn
            </h3>
            <ul className="space-y-2 text-body-sm">
              <li><Link to="/" className="text-text-secondary hover:text-navy">All Courses</Link></li>
              <li><Link to="/?tab=annual" className="text-text-secondary hover:text-navy">Annual Pass</Link></li>
              <li><Link to="/templates" className="text-text-secondary hover:text-navy">Templates</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-caption font-semibold text-text-tertiary uppercase tracking-wider mb-3">
              Company
            </h3>
            <ul className="space-y-2 text-body-sm">
              <li>
                <a href="https://worldaml.com" className="text-text-secondary hover:text-navy">
                  WorldAML Platform
                </a>
              </li>
              <li>
                <a href="https://worldaml.com/about" className="text-text-secondary hover:text-navy">
                  About
                </a>
              </li>
              <li>
                <a href="https://worldaml.com/contact-sales" className="text-text-secondary hover:text-navy">
                  Contact
                </a>
              </li>
              <li>
                <a href="https://worldaml.com/privacy" className="text-text-secondary hover:text-navy">
                  Privacy
                </a>
              </li>
              <li>
                <a href="https://worldaml.com/terms" className="text-text-secondary hover:text-navy">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-divider flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-caption text-text-tertiary">
          <span>© {year} WorldAML Academy. All rights reserved.</span>
          <span>
            Part of the{" "}
            <a href="https://worldaml.com" className="underline hover:text-navy">
              WorldAML
            </a>{" "}
            compliance suite.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default AcademyFooter;
