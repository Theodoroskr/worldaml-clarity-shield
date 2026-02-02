import big4Logos from "@/assets/clients/big4-logos.png";
import societeGeneraleLogo from "@/assets/clients/societe-generale.png";
import qfcraLogo from "@/assets/clients/qfcra.png";
import maltaBusinessRegistryLogo from "@/assets/clients/malta-business-registry.png";
import nationalBankGreeceLogo from "@/assets/clients/national-bank-greece.png";
import eurobankLogo from "@/assets/clients/eurobank.png";
import jccPaymentSystemsLogo from "@/assets/clients/jcc-payment-systems.png";
import payablLogo from "@/assets/clients/payabl.png";
import finxpLogo from "@/assets/clients/finxp.png";
import kaizenLogo from "@/assets/clients/kaizen.png";
import leverateLogo from "@/assets/clients/leverate.png";
import allwynLogo from "@/assets/clients/allwyn.png";
import eagleGamingLogo from "@/assets/clients/eagle-gaming.png";
import spotOptionLogo from "@/assets/clients/spot-option.png";
import horizonExchangeLogo from "@/assets/clients/horizon-exchange.png";

interface TrustedByLogosProps {
  title?: string;
  description?: string;
  showBig4?: boolean;
}

const financialLogos = [
  { src: societeGeneraleLogo, alt: "Societe Generale" },
  { src: qfcraLogo, alt: "Qatar Financial Centre Regulatory Authority" },
  { src: maltaBusinessRegistryLogo, alt: "Malta Business Registry" },
  { src: nationalBankGreeceLogo, alt: "National Bank of Greece" },
  { src: eurobankLogo, alt: "Eurobank" },
  { src: jccPaymentSystemsLogo, alt: "JCC Payment Systems" },
  { src: payablLogo, alt: "Payabl" },
  { src: finxpLogo, alt: "FinXP" },
  { src: kaizenLogo, alt: "Kaizen" },
  { src: leverateLogo, alt: "Leverate" },
  { src: spotOptionLogo, alt: "Spot Option" },
  { src: horizonExchangeLogo, alt: "Horizon Exchange" },
];

const gamingLogos = [
  { src: allwynLogo, alt: "Allwyn" },
  { src: eagleGamingLogo, alt: "Eagle Gaming" },
];

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

        {/* Rolling Logo Marquee - Financial */}
        <div className="relative mb-10">
          <p className="text-body-sm text-text-tertiary text-center mb-6 uppercase tracking-wider">
            Financial Institutions, Fintechs & Corporates
          </p>
          
          {/* Gradient overlays */}
          <div className="absolute left-0 top-6 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-6 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          {/* Scrolling container */}
          <div className="flex overflow-hidden">
            <div className="flex animate-marquee items-center">
              {/* First set of logos */}
              {financialLogos.map((logo, index) => (
                <div key={`first-${index}`} className="flex-shrink-0 mx-8">
                  <img 
                    src={logo.src} 
                    alt={logo.alt} 
                    className="h-10 w-auto opacity-70"
                  />
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {financialLogos.map((logo, index) => (
                <div key={`second-${index}`} className="flex-shrink-0 mx-8">
                  <img 
                    src={logo.src} 
                    alt={logo.alt} 
                    className="h-10 w-auto opacity-70"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gaming Section */}
        <div>
          <p className="text-body-sm text-text-tertiary text-center mb-6 uppercase tracking-wider">
            Gaming & Entertainment
          </p>
          <div className="flex justify-center items-center gap-12">
            {gamingLogos.map((logo, index) => (
              <img 
                key={index}
                src={logo.src} 
                alt={logo.alt} 
                className="h-10 w-auto opacity-70 hover:opacity-100 transition-opacity"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedByLogos;
