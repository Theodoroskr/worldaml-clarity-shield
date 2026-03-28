import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RegionProvider } from "@/contexts/RegionContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import ScrollToTop from "@/components/ScrollToTop";
import { lazy, Suspense } from "react";

const Index = lazy(() => import("./pages/Index"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Platform = lazy(() => import("./pages/Platform"));
const PlatformSuite = lazy(() => import("./pages/PlatformSuite"));
const PlatformAPI = lazy(() => import("./pages/PlatformAPI"));
const PlatformSecurity = lazy(() => import("./pages/PlatformSecurity"));
const PlatformTransactionMonitoring = lazy(() => import("./pages/PlatformTransactionMonitoring"));
const PlatformRegulatoryReporting = lazy(() => import("./pages/PlatformRegulatoryReporting"));
const PlatformKYCKYB = lazy(() => import("./pages/PlatformKYCKYB"));
const PlatformAMLScreening = lazy(() => import("./pages/PlatformAMLScreening"));
const PlatformRiskAssessment = lazy(() => import("./pages/PlatformRiskAssessment"));
const DataSources = lazy(() => import("./pages/DataSources"));
const WorldCompliance = lazy(() => import("./pages/WorldCompliance"));
const WorldComplianceDemo = lazy(() => import("./pages/WorldComplianceDemo"));
const WorldCompliancePricing = lazy(() => import("./pages/WorldCompliancePricing"));
const WorldComplianceEUME = lazy(() => import("./pages/WorldComplianceEUME"));
const WorldComplianceUKIE = lazy(() => import("./pages/WorldComplianceUKIE"));
const WorldComplianceNA = lazy(() => import("./pages/WorldComplianceNA"));
const ResourcesDataCoverage = lazy(() => import("./pages/ResourcesDataCoverage"));
const BridgerXG = lazy(() => import("./pages/BridgerXG"));
const BridgerXGEUME = lazy(() => import("./pages/BridgerXGEUME"));
const BridgerXGUKIE = lazy(() => import("./pages/BridgerXGUKIE"));
const BridgerXGNA = lazy(() => import("./pages/BridgerXGNA"));
const Industries = lazy(() => import("./pages/Industries"));
const IndustryBanking = lazy(() => import("./pages/IndustryBanking"));
const IndustryFintech = lazy(() => import("./pages/IndustryFintech"));
const IndustryCrypto = lazy(() => import("./pages/IndustryCrypto"));
const IndustryGaming = lazy(() => import("./pages/IndustryGaming"));
const IndustryLegal = lazy(() => import("./pages/IndustryLegal"));
const IndustryPayments = lazy(() => import("./pages/IndustryPayments"));
const Support = lazy(() => import("./pages/Support"));
const About = lazy(() => import("./pages/About"));
const GetStarted = lazy(() => import("./pages/GetStarted"));
const ContactSales = lazy(() => import("./pages/ContactSales"));
const FAQ = lazy(() => import("./pages/FAQ"));
const News = lazy(() => import("./pages/News"));
const Demo = lazy(() => import("./pages/Demo"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));
const AccessYourData = lazy(() => import("./pages/AccessYourData"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PendingApproval = lazy(() => import("./pages/PendingApproval"));
const Admin = lazy(() => import("./pages/Admin"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const WorldID = lazy(() => import("./pages/WorldID"));
const BestPractices = lazy(() => import("./pages/BestPractices"));
const SanctionsCheck = lazy(() => import("./pages/SanctionsCheck"));
const SanctionsLists = lazy(() => import("./pages/SanctionsLists"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SuiteLayout = lazy(() => import("./pages/SuiteLayout"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Glossary = lazy(() => import("./pages/Glossary"));
const AMLRegulations = lazy(() => import("./pages/AMLRegulations"));
const MarketPage = lazy(() => import("./pages/MarketPage"));
const FreeAMLCheck = lazy(() => import("./pages/FreeAMLCheck"));
const Partners = lazy(() => import("./pages/Partners"));
const PartnerApply = lazy(() => import("./pages/PartnerApply"));
const PartnerDashboard = lazy(() => import("./pages/PartnerDashboard"));
const DataCoverageIndex = lazy(() => import("./pages/DataCoverageIndex"));
const DataCoverageCountry = lazy(() => import("./pages/DataCoverageCountry"));
const Academy = lazy(() => import("./pages/Academy"));
const AcademyCourse = lazy(() => import("./pages/AcademyCourse"));
const AcademyCertificate = lazy(() => import("./pages/AcademyCertificate"));
const AMLApi = lazy(() => import("./pages/AMLApi"));
const SanctionsScreeningApi = lazy(() => import("./pages/SanctionsScreeningApi"));
const KYCKYBApi = lazy(() => import("./pages/KYCKYBApi"));
const WhyWorldAML = lazy(() => import("./pages/WhyWorldAML"));
const EUSanctionsMap = lazy(() => import("./pages/EUSanctionsMap"));
const EUSanctionsCountry = lazy(() => import("./pages/EUSanctionsCountry"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RegionProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Layout>
              <Suspense fallback={<div className="min-h-screen" />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/pricing" element={<Pricing />} />
                
{/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/pending-approval" element={<PendingApproval />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Platform (Lane 1) */}
                <Route path="/platform" element={<Platform />} />
                <Route path="/platform/suite" element={<PlatformSuite />} />
                <Route path="/platform/api" element={<PlatformAPI />} />
                <Route path="/platform/security" element={<PlatformSecurity />} />
                <Route path="/platform/transaction-monitoring" element={<PlatformTransactionMonitoring />} />
                <Route path="/platform/regulatory-reporting" element={<PlatformRegulatoryReporting />} />
                <Route path="/platform/kyc-kyb" element={<PlatformKYCKYB />} />
                <Route path="/platform/aml-screening" element={<PlatformAMLScreening />} />
                <Route path="/platform/risk-assessment" element={<PlatformRiskAssessment />} />
                
                {/* Data Sources (Lane 2) */}
                <Route path="/data-sources" element={<DataSources />} />
                <Route path="/data-sources/resources" element={<ResourcesDataCoverage />} />
                <Route path="/data-sources/worldcompliance" element={<WorldCompliance />} />
                <Route path="/data-sources/worldcompliance/demo" element={<WorldComplianceDemo />} />
                <Route path="/data-sources/worldcompliance/pricing" element={<WorldCompliancePricing />} />
                <Route path="/data-sources/worldcompliance/eu-me" element={<WorldComplianceEUME />} />
                <Route path="/data-sources/worldcompliance/uk-ie" element={<WorldComplianceUKIE />} />
                <Route path="/data-sources/worldcompliance/na" element={<WorldComplianceNA />} />
                <Route path="/data-sources/bridger-xg" element={<BridgerXG />} />
                <Route path="/data-sources/bridger-xg/eu-me" element={<BridgerXGEUME />} />
                <Route path="/data-sources/bridger-xg/uk-ie" element={<BridgerXGUKIE />} />
                <Route path="/data-sources/bridger-xg/na" element={<BridgerXGNA />} />
                
                {/* Products */}
                <Route path="/products" element={<Navigate to="/products/worldid" replace />} />
                <Route path="/products/worldid" element={<WorldID />} />
                
                
                {/* Preserved pages */}
                <Route path="/industries" element={<Industries />} />
                <Route path="/industries/banking" element={<IndustryBanking />} />
                <Route path="/industries/fintech" element={<IndustryFintech />} />
                <Route path="/industries/crypto" element={<IndustryCrypto />} />
                <Route path="/industries/gaming" element={<IndustryGaming />} />
                <Route path="/industries/legal" element={<IndustryLegal />} />
                <Route path="/industries/payments" element={<IndustryPayments />} />
                <Route path="/support" element={<Support />} />
                <Route path="/about" element={<About />} />
                <Route path="/about-us/why-worldaml" element={<WhyWorldAML />} />
                <Route path="/get-started" element={<GetStarted />} />
                <Route path="/contact-sales" element={<ContactSales />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/news" element={<News />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="/access-your-data" element={<AccessYourData />} />
                
                <Route path="/resources/best-practices" element={<BestPractices />} />
                <Route path="/resources/sanctions-lists" element={<SanctionsLists />} />
                <Route path="/resources/glossary" element={<Glossary />} />
                <Route path="/resources/aml-regulations" element={<AMLRegulations />} />
                <Route path="/sanctions-check" element={<SanctionsCheck />} />
                <Route path="/free-aml-check" element={<FreeAMLCheck />} />
                <Route path="/data-coverage" element={<DataCoverageIndex />} />
                <Route path="/data-coverage/:country" element={<DataCoverageCountry />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                
                {/* Partners */}
                <Route path="/partners" element={<Partners />} />
                <Route path="/partners/apply" element={<PartnerApply />} />
                <Route path="/partners/dashboard" element={<PartnerDashboard />} />

                {/* Academy */}
                <Route path="/academy" element={<Academy />} />
                <Route path="/academy/certificate/:token" element={<AcademyCertificate />} />
                <Route path="/academy/:slug" element={<AcademyCourse />} />

                {/* Markets */}
                <Route path="/markets/:market" element={<MarketPage />} />
                
                {/* API Product Pages */}
                <Route path="/aml-api" element={<AMLApi />} />
                <Route path="/sanctions-screening-api" element={<SanctionsScreeningApi />} />
                <Route path="/kyc-kyb-api" element={<KYCKYBApi />} />

                {/* EU Sanctions */}
                <Route path="/eu-sanctions-map" element={<EUSanctionsMap />} />
                <Route path="/eu-sanctions/:slug" element={<EUSanctionsCountry />} />

                <Route path="/suite-layout-preview" element={<SuiteLayout />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </Layout>
          </BrowserRouter>
        </AuthProvider>
      </RegionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
