import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RegionProvider } from "@/contexts/RegionContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Platform from "./pages/Platform";
import PlatformSuite from "./pages/PlatformSuite";
import PlatformAPI from "./pages/PlatformAPI";
import PlatformSecurity from "./pages/PlatformSecurity";
import DataSources from "./pages/DataSources";
import WorldCompliance from "./pages/WorldCompliance";
import WorldComplianceDemo from "./pages/WorldComplianceDemo";
import WorldCompliancePricing from "./pages/WorldCompliancePricing";
import WorldComplianceEUME from "./pages/WorldComplianceEUME";
import WorldComplianceUKIE from "./pages/WorldComplianceUKIE";
import WorldComplianceNA from "./pages/WorldComplianceNA";
import ResourcesDataCoverage from "./pages/ResourcesDataCoverage";
import BridgerXG from "./pages/BridgerXG";
import BridgerXGEUME from "./pages/BridgerXGEUME";
import BridgerXGUKIE from "./pages/BridgerXGUKIE";
import BridgerXGNA from "./pages/BridgerXGNA";
import Industries from "./pages/Industries";
import Support from "./pages/Support";
import About from "./pages/About";
import GetStarted from "./pages/GetStarted";
import ContactSales from "./pages/ContactSales";
import FAQ from "./pages/FAQ";
import News from "./pages/News";
import Demo from "./pages/Demo";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import AccessYourData from "./pages/AccessYourData";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RegionProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
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
            </Layout>
          </BrowserRouter>
        </AuthProvider>
      </RegionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
