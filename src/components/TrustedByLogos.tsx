import bankOfCyprusLogo from "@/assets/clients/bank-of-cyprus.png";
import argusFxLogo from "@/assets/clients/argus-fx.png";
import big4Logos from "@/assets/clients/big4-logos.png";
import allLogos from "@/assets/clients/client-logos-all.png";

interface TrustedByLogosProps {
  title?: string;
  description?: string;
  showBig4?: boolean;
}

export const TrustedByLogos = ({ 
  title = "Trusted by Industry Leaders",
  description = "Trusted by leading financial institutions, fintechs, and compliance teams worldwide.",
  showBig4 = true
}: TrustedByLogosProps) => {
  return (
    <section className="section-padding bg-background overflow-hidden">
      <div className="container-enterprise">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl text-navy mb-4">{title}</h2>
          <p className="text-text-secondary">{description}</p>
        </div>

        {/* Big 4 Advisory Firms */}
        {showBig4 && (
          <div className="mb-10">
            <p className="text-body-sm text-text-tertiary text-center mb-6 uppercase tracking-wider">
              Advisory & Audit Firms
            </p>
            <div className="flex justify-center">
              <img 
                src={big4Logos} 
                alt="KPMG, EY, PWC, Grant Thornton, RSM" 
                className="max-h-10 w-auto opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        )}

        {/* Rolling Logo Marquee */}
        <div className="relative">
          <p className="text-body-sm text-text-tertiary text-center mb-6 uppercase tracking-wider">
            Financial Institutions, Fintechs & Corporates
          </p>
          
          {/* Gradient overlays */}
          <div className="absolute left-0 top-6 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-6 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          {/* Scrolling container */}
          <div className="flex overflow-hidden">
            <div className="flex animate-marquee gap-16 items-center">
              <img 
                src={allLogos} 
                alt="Client logos" 
                className="h-24 w-auto opacity-80"
              />
              <img 
                src={allLogos} 
                alt="Client logos" 
                className="h-24 w-auto opacity-80"
              />
            </div>
          </div>
        </div>

        {/* Featured logos for clarity */}
        <div className="mt-10 pt-8 border-t border-divider">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <img 
              src={bankOfCyprusLogo} 
              alt="Bank of Cyprus" 
              className="h-10 w-auto opacity-70 hover:opacity-100 transition-opacity"
            />
            <img 
              src={argusFxLogo} 
              alt="Argus FX" 
              className="h-7 w-auto opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedByLogos;
