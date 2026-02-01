import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import iso9001Badge from "@/assets/iso-9001-badge.png";
import iso27001Badge from "@/assets/iso-27001-badge.png";
import iso22301Badge from "@/assets/iso-22301-badge.png";

const footerLinks = {
  product: [
    { href: "/api", label: "WorldAML API" },
    { href: "/pricing", label: "Pricing" },
    { href: "/documentation", label: "Documentation" },
    { href: "/changelog", label: "Changelog" },
  ],
  solutions: [
    { href: "/industries/banking", label: "Banking" },
    { href: "/industries/fintech", label: "Fintech" },
    { href: "/industries/crypto", label: "Crypto & Gaming" },
    { href: "/industries/legal", label: "Legal & Fiduciary" },
  ],
  company: [
    { href: "/about", label: "About" },
    { href: "/careers", label: "Careers" },
    { href: "/contact", label: "Contact" },
    { href: "/press", label: "Press" },
  ],
  resources: [
    { href: "/support", label: "Support" },
    { href: "/faq", label: "FAQ" },
    { href: "/news", label: "News & Updates" },
    { href: "/blog", label: "Blog" },
    { href: "/status", label: "System Status" },
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
            <Logo size="md" />
            <p className="mt-4 text-body-sm text-text-secondary max-w-xs">
              API-first compliance platform for KYC, KYB, AML screening, ongoing monitoring and risk assessment.
            </p>
            
            {/* InfoCredit Group Badge */}
            <a 
              href="https://www.infocreditgroup.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 px-3 py-2 bg-white border border-divider rounded-md hover:border-slate transition-colors group"
            >
              <span className="text-caption text-text-tertiary">A product of</span>
              <span className="font-semibold text-sm text-navy group-hover:text-accent transition-colors">
                InfoCredit Group
              </span>
            </a>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-body-sm text-navy mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
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

          {/* Solutions */}
          <div>
            <h4 className="font-semibold text-body-sm text-navy mb-4">Solutions</h4>
            <ul className="space-y-3">
              {footerLinks.solutions.map((link) => (
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

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-divider flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-caption text-text-tertiary">
            © {new Date().getFullYear()} WorldAML. A product of{" "}
            <a 
              href="https://www.infocreditgroup.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-text-secondary transition-colors"
            >
              InfoCredit Group Ltd
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
    </footer>
  );
};

export default Footer;
