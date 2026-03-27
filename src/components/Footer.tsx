import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import iso9001Badge from "@/assets/iso-9001-badge.png";
import iso27001Badge from "@/assets/iso-27001-badge.png";
import iso22301Badge from "@/assets/iso-22301-badge.png";
import infocreditLogo from "@/assets/infocredit-logo.png";
import whatsappQR from "@/assets/whatsapp-qr.jpg";

const footerLinks = {
  platform: [
    { href: "/platform", label: "Platform Overview" },
    { href: "/platform/suite", label: "WorldAML Suite" },
    { href: "/platform/kyc-kyb", label: "KYC & KYB" },
    { href: "/platform/aml-screening", label: "AML Screening" },
    { href: "/platform/risk-assessment", label: "Risk Assessment" },
    { href: "/platform/transaction-monitoring", label: "Transaction Monitoring" },
    { href: "/platform/regulatory-reporting", label: "Regulatory Reporting" },
    { href: "/products/worldid", label: "WorldID" },
    { href: "/pricing", label: "Pricing" },
  ],
  dataSources: [
    { href: "/data-sources", label: "Data Sources Overview" },
    { href: "/data-sources/worldcompliance", label: "WorldCompliance®" },
    { href: "/data-sources/bridger-xg", label: "Bridger Insight XG®" },
    { href: "/data-sources/resources", label: "Resources & Data Coverage" },
  ],
  company: [
    { href: "/about", label: "About" },
    { href: "/contact-sales", label: "Contact Sales" },
    { href: "/support", label: "Support" },
    { href: "/faq", label: "FAQ" },
    { href: "/news", label: "News" },
    { href: "/partners", label: "Partner Program" },
  ],
  resources: [
    { href: "https://worldaml.readme.io", label: "API Documentation", external: true },
    { href: "https://suite.worldaml.com", label: "Access Suite", external: true },
    { href: "/blog", label: "Compliance Blog" },
    { href: "/resources/glossary", label: "Compliance Glossary" },
    { href: "/resources/aml-regulations", label: "AML Regulations" },
    { href: "/resources/best-practices", label: "Best Practices" },
    { href: "/resources/sanctions-lists", label: "Sanctions Lists" },
    { href: "/data-coverage", label: "Data Coverage" },
    { href: "/demo", label: "Request Demo" },
  ],
};

const certifications = [
  {
    badge: iso9001Badge,
    standard: "ISO 9001:2015",
    name: "Quality System",
    alt: "ISO 9001:2015 Quality System Certification",
  },
  {
    badge: iso27001Badge,
    standard: "ISO 27001:2022",
    name: "Information Security Management System",
    alt: "ISO 27001:2022 Information Security Management System Certification",
  },
  {
    badge: iso22301Badge,
    standard: "ISO 22301:2019",
    name: "Business Continuity Management System",
    alt: "ISO 22301:2019 Business Continuity Management System Certification",
  },
];

export const Footer = () => {
  return (
    <footer className="border-t border-divider bg-surface-subtle">
      <div className="container-enterprise py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Logo and tagline */}
          <div className="col-span-2">
            <Logo size="md" showTagline />
            <p className="mt-4 text-body-sm text-text-secondary max-w-xs">
              Unified screening platform for regulated organisations worldwide.
            </p>
            
            {/* InfoCredit Group Badge */}
            <div className="mt-6">
              <p className="text-caption text-text-tertiary mb-2">Operated by</p>
              <a 
                href="https://www.infocreditgroup.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block hover:opacity-80 transition-opacity"
              >
                <img 
                  src={infocreditLogo} 
                  alt="InfoCredit Group" 
                  className="h-6 w-auto"
                />
              </a>
            </div>
            <a
              href="https://wa.me/971504780113"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#25D366] transition-colors mt-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-body-sm text-navy mb-4">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-body-sm text-text-secondary hover:text-navy transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Data Sources */}
          <div>
            <h4 className="font-semibold text-body-sm text-navy mb-4">Data Sources</h4>
            <ul className="space-y-3">
              {footerLinks.dataSources.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-body-sm text-text-secondary hover:text-navy transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-body-sm text-navy mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-body-sm text-text-secondary hover:text-navy transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-body-sm text-navy mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-body-sm text-text-secondary hover:text-navy transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-body-sm text-text-secondary hover:text-navy transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ISO Certifications */}
        <div className="mt-12 pt-8 border-t border-divider">
          <h4 className="font-semibold text-body-sm text-navy mb-6 text-center">Certified Management Systems</h4>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {certifications.map((cert) => (
              <div key={cert.standard} className="flex items-center gap-3">
                <img 
                  src={cert.badge} 
                  alt={cert.alt}
                  className="h-12 md:h-14 w-auto"
                />
                <div className="hidden sm:block">
                  <p className="text-caption font-semibold text-navy">{cert.standard}</p>
                  <p className="text-caption text-text-tertiary">{cert.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attribution & Legal */}
        <div className="mt-8 pt-8 border-t border-divider">
          <div className="text-center mb-6">
            <p className="text-caption text-text-tertiary mb-2">
              WorldAML is operated by Infocredit Group, an authorized regional partner of LexisNexis Risk Solutions.
            </p>
            <p className="text-caption text-text-tertiary mb-2">
              LexisNexis and related product names are trademarks of LexisNexis Risk Solutions and are used under authorization.
            </p>
            <p className="text-caption text-text-tertiary">
              Product availability and service scope may vary by jurisdiction.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-caption text-text-tertiary">
              © {new Date().getFullYear()} WorldAML. Operated by{" "}
              <a 
                href="https://www.infocreditgroup.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-text-secondary transition-colors"
              >
                Infocredit Group Ltd
              </a>
              . All rights reserved.
            </p>
            <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">
              <Link to="/privacy" className="text-caption text-text-tertiary hover:text-text-secondary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-caption text-text-tertiary hover:text-text-secondary transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-caption text-text-tertiary hover:text-text-secondary transition-colors">
                Cookie Policy
              </Link>
              <Link to="/access-your-data" className="text-caption text-text-tertiary hover:text-text-secondary transition-colors">
                Access Your Data
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
