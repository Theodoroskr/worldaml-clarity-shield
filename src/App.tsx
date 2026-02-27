import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const WorldID = lazy(() => import("./pages/WorldID"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Platform (Lane 1) */}
                <Route path="/platform" element={<Platform />} />
                <Route path="/platform/suite" element={<PlatformSuite />} />
                <Route path="/platform/api" element={<PlatformAPI />} />
                <Route path="/platform/security" element={<PlatformSecurity />} />
                
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
                <Route path="/products/worldid" element={<WorldID />} />
                
                
                {/* Preserved pages */}
                <Route path="/industries" element={<Industries />} />
                <Route path="/support" element={<Support />} />
                <Route path="/about" element={<About />} />
                <Route path="/get-started" element={<GetStarted />} />
                <Route path="/contact-sales" element={<ContactSales />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/news" element={<News />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="/access-your-data" element={<AccessYourData />} />
                
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
