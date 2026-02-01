import { Link } from "react-router-dom";
import { Logo } from "./Logo";

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

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-divider flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-caption text-text-tertiary">
            © {new Date().getFullYear()} WorldAML. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-caption text-text-tertiary hover:text-text-secondary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-caption text-text-tertiary hover:text-text-secondary transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-caption text-text-tertiary hover:text-text-secondary transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
