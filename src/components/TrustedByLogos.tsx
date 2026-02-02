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

interface TrustedByLogosProps {
  title?: string;
  description?: string;
}

const clientLogos = [
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
];

export const TrustedByLogos = ({ 
  title = "Trusted by Industry Leaders",
  description = "Trusted by leading financial institutions, fintechs, and compliance teams worldwide.",
}: TrustedByLogosProps) => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl text-navy mb-4">{title}</h2>
          <p className="text-text-secondary">{description}</p>
        </div>

        {/* Static Logo Grid */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16">
          {clientLogos.map((logo, index) => (
            <div 
              key={index}
              className="flex items-center justify-center h-12"
            >
              <img 
                src={logo.src} 
                alt={logo.alt} 
                className="max-h-10 w-auto opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedByLogos;
