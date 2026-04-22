// Course cover images (preview cards + course header)
import amlFundamentals from "./covers/aml-fundamentals.jpg";
import kycCdd from "./covers/kyc-customer-due-diligence.jpg";
import sanctionsScreeningEss from "./covers/sanctions-screening-essentials.jpg";
import cryptoAmlEssentials from "./covers/crypto-aml-essentials.jpg";
import pepEdd from "./covers/pep-screening-edd.jpg";
import adverseMedia from "./covers/adverse-media-intelligence.jpg";
import amlEurope from "./covers/aml-europe.jpg";
import amlGcc from "./covers/aml-gcc-mena.jpg";
import amlApac from "./covers/aml-asia-pacific.jpg";
import amlAmericas from "./covers/aml-americas.jpg";
import amlAfrica from "./covers/aml-africa.jpg";
import amlCis from "./covers/aml-cis.jpg";
import beneficialOwnership from "./covers/beneficial-ownership.jpg";
import beneficialOwnershipUbo from "./covers/beneficial-ownership-ubo-transparency.jpg";
import txMonitoring from "./covers/transaction-monitoring-sar.jpg";
import cryptoAml from "./covers/crypto-aml.jpg";
import riskBased from "./covers/risk-based-approach.jpg";
import intlSanctions from "./covers/international-sanctions-compliance.jpg";

// In-lesson hero diagrams (rendered above lesson 1 content)
import dAmlFundamentals from "./diagrams/aml-fundamentals-cycle.jpg";
import dKyc from "./diagrams/kyc-cdd-flow.jpg";
import dSanctions from "./diagrams/sanctions-screening-flow.jpg";
import dPep from "./diagrams/pep-categories-pyramid.jpg";
import dAdverseMedia from "./diagrams/adverse-media-funnel.jpg";
import dEurope from "./diagrams/aml-europe-amld.jpg";
import dGcc from "./diagrams/aml-gcc-typologies.jpg";
import dApac from "./diagrams/aml-apac-corridors.jpg";
import dAmericas from "./diagrams/aml-americas-frameworks.jpg";
import dAfrica from "./diagrams/aml-africa-risk.jpg";
import dCis from "./diagrams/aml-cis-sanctions.jpg";
import dUboTree from "./diagrams/ubo-tree.jpg";
import dUboLayers from "./diagrams/ubo-transparency-layers.jpg";
import dTxMonitoring from "./diagrams/transaction-monitoring-alert.jpg";
import dRiskMatrix from "./diagrams/risk-matrix.jpg";
import dIntlSanctions from "./diagrams/international-sanctions-globe.jpg";
import dCryptoAml from "./diagrams/crypto-aml-flow.jpg";

export const COURSE_COVERS: Record<string, string> = {
  "aml-fundamentals": amlFundamentals,
  "kyc-customer-due-diligence": kycCdd,
  "sanctions-screening-essentials": sanctionsScreeningEss,
  "crypto-aml-essentials": cryptoAmlEssentials,
  "pep-screening-edd": pepEdd,
  "adverse-media-intelligence": adverseMedia,
  "aml-europe": amlEurope,
  "aml-gcc-mena": amlGcc,
  "aml-asia-pacific": amlApac,
  "aml-americas": amlAmericas,
  "aml-africa": amlAfrica,
  "aml-cis": amlCis,
  "beneficial-ownership": beneficialOwnership,
  "beneficial-ownership-ubo-transparency": beneficialOwnershipUbo,
  "transaction-monitoring-sar": txMonitoring,
  "crypto-aml": cryptoAml,
  "risk-based-approach": riskBased,
  "international-sanctions-compliance": intlSanctions,
};

export const COURSE_DIAGRAMS: Record<string, string> = {
  "aml-fundamentals": dAmlFundamentals,
  "kyc-customer-due-diligence": dKyc,
  "sanctions-screening-essentials": dSanctions,
  "pep-screening-edd": dPep,
  "adverse-media-intelligence": dAdverseMedia,
  "aml-europe": dEurope,
  "aml-gcc-mena": dGcc,
  "aml-asia-pacific": dApac,
  "aml-americas": dAmericas,
  "aml-africa": dAfrica,
  "aml-cis": dCis,
  "beneficial-ownership": dUboTree,
  "beneficial-ownership-ubo-transparency": dUboLayers,
  "transaction-monitoring-sar": dTxMonitoring,
  "risk-based-approach": dRiskMatrix,
  "international-sanctions-compliance": dIntlSanctions,
  "crypto-aml": dCryptoAml,
};

export const getCourseCover = (slug?: string | null) =>
  slug ? COURSE_COVERS[slug] : undefined;

export const getCourseDiagram = (slug?: string | null) =>
  slug ? COURSE_DIAGRAMS[slug] : undefined;
