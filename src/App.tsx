import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RegionProvider } from "@/contexts/RegionContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Layout from "@/components/Layout";
import ScrollToTop from "@/components/ScrollToTop";
import PartnerOnlyRouteGuard from "@/components/PartnerOnlyRouteGuard";
import AuthQueryInvalidator from "@/components/AuthQueryInvalidator";
import PortalGuard from "@/components/auth/PortalGuard";

import { Suspense } from "react";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { isAcademyHost } from "@/lib/academyHost";
import {
  AcademyRootRedirect,
  AcademyCourseRedirect,
  AcademyCertificateRedirect,
} from "@/components/academy/AcademyPathRedirect";


const Index = lazyWithRetry(() => import("./pages/Index"));
const Pricing = lazyWithRetry(() => import("./pages/Pricing"));
const Platform = lazyWithRetry(() => import("./pages/Platform"));
const PlatformSuite = lazyWithRetry(() => import("./pages/PlatformSuite"));
const PlatformAPI = lazyWithRetry(() => import("./pages/PlatformAPI"));
const PlatformSecurity = lazyWithRetry(() => import("./pages/PlatformSecurity"));
const PlatformTransactionMonitoring = lazyWithRetry(() => import("./pages/PlatformTransactionMonitoring"));
const PlatformRegulatoryReporting = lazyWithRetry(() => import("./pages/PlatformRegulatoryReporting"));
const PlatformKYCKYB = lazyWithRetry(() => import("./pages/PlatformKYCKYB"));
const ScreeningMonitoring = lazyWithRetry(() => import("./pages/ScreeningMonitoring"));
const ScreeningPricing = lazyWithRetry(() => import("./pages/ScreeningPricing"));
const PlatformRiskAssessment = lazyWithRetry(() => import("./pages/PlatformRiskAssessment"));
const WhatIsSanctionsScreening = lazyWithRetry(() => import("./pages/WhatIsSanctionsScreening"));
const UAEAMLComplianceGuide = lazyWithRetry(() => import("./pages/UAEAMLComplianceGuide"));
const AMLComplianceChecklist = lazyWithRetry(() => import("./pages/AMLComplianceChecklist"));
const FATFTravelRuleGuide = lazyWithRetry(() => import("./pages/FATFTravelRuleGuide"));
const Industries = lazyWithRetry(() => import("./pages/Industries"));
const IndustryBanking = lazyWithRetry(() => import("./pages/IndustryBanking"));
const IndustryFintech = lazyWithRetry(() => import("./pages/IndustryFintech"));
const IndustryCrypto = lazyWithRetry(() => import("./pages/IndustryCrypto"));
const IndustryGaming = lazyWithRetry(() => import("./pages/IndustryGaming"));
const IndustryLegal = lazyWithRetry(() => import("./pages/IndustryLegal"));
const IndustryPayments = lazyWithRetry(() => import("./pages/IndustryPayments"));
const Support = lazyWithRetry(() => import("./pages/Support"));
const About = lazyWithRetry(() => import("./pages/About"));

const ContactSales = lazyWithRetry(() => import("./pages/ContactSales"));
const BookDemo = lazyWithRetry(() => import("./pages/BookDemo"));
const FAQ = lazyWithRetry(() => import("./pages/FAQ"));
const News = lazyWithRetry(() => import("./pages/News"));
const Demo = lazyWithRetry(() => import("./pages/Demo"));
const Privacy = lazyWithRetry(() => import("./pages/Privacy"));
const Terms = lazyWithRetry(() => import("./pages/Terms"));
const Cookies = lazyWithRetry(() => import("./pages/Cookies"));
const AccessYourData = lazyWithRetry(() => import("./pages/AccessYourData"));
const Login = lazyWithRetry(() => import("./pages/Login"));
const Signup = lazyWithRetry(() => import("./pages/Signup"));
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"));
const AppShellLayout = lazyWithRetry(() => import("./components/app-shell/AppShellLayout"));
const MyLearning = lazyWithRetry(() => import("./pages/dashboard/MyLearning"));
const MyCertificates = lazyWithRetry(() => import("./pages/dashboard/MyCertificates"));
const Recognition = lazyWithRetry(() => import("./pages/dashboard/Recognition"));
const AccountProfile = lazyWithRetry(() => import("./pages/dashboard/AccountProfile"));
const AccountBilling = lazyWithRetry(() => import("./pages/dashboard/AccountBilling"));
const AccountSecurity = lazyWithRetry(() => import("./pages/dashboard/AccountSecurity"));
const AllCourses = lazyWithRetry(() => import("./pages/dashboard/AllCourses"));
const CoursePlayer = lazyWithRetry(() => import("./pages/dashboard/CoursePlayer"));
const CartPage = lazyWithRetry(() => import("./pages/dashboard/CartPage"));
const Plans = lazyWithRetry(() => import("./pages/dashboard/Plans"));
const PendingApproval = lazyWithRetry(() => import("./pages/PendingApproval"));
const ForgotPassword = lazyWithRetry(() => import("./pages/ForgotPassword"));
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword"));
const WorldID = lazyWithRetry(() => import("./pages/WorldID"));
const BestPractices = lazyWithRetry(() => import("./pages/BestPractices"));
const SanctionsLists = lazyWithRetry(() => import("./pages/SanctionsLists"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const RcmLayout = lazyWithRetry(() => import("./pages/rcm/RcmLayout"));
const RcmDashboard = lazyWithRetry(() => import("./pages/rcm/RcmDashboard"));
const RcmPlaceholder = lazyWithRetry(() => import("./pages/rcm/RcmPlaceholder"));
const RcmObligations = lazyWithRetry(() => import("./pages/rcm/RcmObligations"));
const RcmHelp = lazyWithRetry(() => import("./pages/rcm/RcmHelp"));
const SuiteLayout = lazyWithRetry(() => import("./pages/SuiteLayout"));
const Blog = lazyWithRetry(() => import("./pages/Blog"));
const BlogPost = lazyWithRetry(() => import("./pages/BlogPost"));
const RssPage = lazyWithRetry(() => import("./pages/Rss"));
const Glossary = lazyWithRetry(() => import("./pages/Glossary"));
const AMLRegulations = lazyWithRetry(() => import("./pages/AMLRegulations"));
const MarketPage = lazyWithRetry(() => import("./pages/MarketPage"));
const Partners = lazyWithRetry(() => import("./pages/Partners"));
const PartnerApply = lazyWithRetry(() => import("./pages/PartnerApply"));
const OnboardPublic = lazyWithRetry(() => import("./pages/OnboardPublic"));

const PartnersDirectory = lazyWithRetry(() => import("./pages/PartnersDirectory"));
const Academy = lazyWithRetry(() => import("./pages/Academy"));
const AcademyCourse = lazyWithRetry(() => import("./pages/AcademyCourse"));
const AcademyCertificate = lazyWithRetry(() => import("./pages/AcademyCertificate"));
const AcademyTemplates = lazyWithRetry(() => import("./pages/AcademyTemplates"));
const AcademyAnnualSuccess = lazyWithRetry(() => import("./pages/AcademyAnnualSuccess"));
const AMLApi = lazyWithRetry(() => import("./pages/AMLApi"));
const SanctionsScreeningApi = lazyWithRetry(() => import("./pages/SanctionsScreeningApi"));
const KYCKYBApi = lazyWithRetry(() => import("./pages/KYCKYBApi"));
const WhyWorldAML = lazyWithRetry(() => import("./pages/WhyWorldAML"));
const EUSanctionsMap = lazyWithRetry(() => import("./pages/EUSanctionsMap"));
const EUSanctionsCountry = lazyWithRetry(() => import("./pages/EUSanctionsCountry"));
const AMLScreeningEU = lazyWithRetry(() => import("./pages/AMLScreeningEU"));
const AMLScreeningUK = lazyWithRetry(() => import("./pages/AMLScreeningUK"));
const ComplianceSoftwareUS = lazyWithRetry(() => import("./pages/ComplianceSoftwareUS"));
const CasinoAMLComplianceUS = lazyWithRetry(() => import("./pages/CasinoAMLComplianceUS"));
const BankAMLComplianceUS = lazyWithRetry(() => import("./pages/BankAMLComplianceUS"));
const FintechAMLComplianceUS = lazyWithRetry(() => import("./pages/FintechAMLComplianceUS"));
const CryptoAMLComplianceUS = lazyWithRetry(() => import("./pages/CryptoAMLComplianceUS"));
const LegalAMLComplianceUS = lazyWithRetry(() => import("./pages/LegalAMLComplianceUS"));
const ComplianceSoftwareUK = lazyWithRetry(() => import("./pages/ComplianceSoftwareUK"));
const ComplianceSoftwareNL = lazyWithRetry(() => import("./pages/ComplianceSoftwareNL"));
const ComplianceSoftwareCH = lazyWithRetry(() => import("./pages/ComplianceSoftwareCH"));
const ComplianceSoftwareIT = lazyWithRetry(() => import("./pages/ComplianceSoftwareIT"));
const SanctionsScreeningSoftware = lazyWithRetry(() => import("./pages/SanctionsScreeningSoftware"));
const USAMLKYCComplianceGuide = lazyWithRetry(() => import("./pages/USAMLKYCComplianceGuide"));
const WorldCheckAlternative = lazyWithRetry(() => import("./pages/WorldCheckAlternative"));
const AlternativesIndex = lazyWithRetry(() => import("./pages/alternatives/AlternativesIndex"));
const ComplyAdvantageAlternative = lazyWithRetry(() => import("./pages/alternatives/ComplyAdvantageAlternative"));
const DowJonesAlternative = lazyWithRetry(() => import("./pages/alternatives/DowJonesAlternative"));
const NapierAlternative = lazyWithRetry(() => import("./pages/alternatives/NapierAlternative"));
const SanctionScannerAlternative = lazyWithRetry(() => import("./pages/alternatives/SanctionScannerAlternative"));
const Advisory = lazyWithRetry(() => import("./pages/Advisory"));
const AdvisoryEwra = lazyWithRetry(() => import("./pages/AdvisoryEwra"));

const AdminLayout = lazyWithRetry(() => import("./pages/admin/AdminLayout"));
const AdminNotificationCentre = lazyWithRetry(() => import("./pages/admin/AdminNotificationCentre"));
const AdminNotificationSettings = lazyWithRetry(() => import("./pages/admin/AdminNotificationSettings"));
const AdminUsers = lazyWithRetry(() => import("./pages/admin/AdminUsers"));
const AdminAlertRules = lazyWithRetry(() => import("./pages/admin/AdminAlertRules"));
const AdminForms = lazyWithRetry(() => import("./pages/admin/AdminForms"));
const AdminWorkflows = lazyWithRetry(() => import("./pages/admin/AdminWorkflows"));
const AdminPricing = lazyWithRetry(() => import("./pages/admin/AdminPricing"));
const AdminOrganizations = lazyWithRetry(() => import("./pages/admin/AdminOrganizations"));
const AdminDashboard = lazyWithRetry(() => import("./pages/admin/AdminDashboard"));
const AdminAnalytics = lazyWithRetry(() => import("./pages/admin/AdminAnalytics"));
const AdminReports = lazyWithRetry(() => import("./pages/admin/AdminReports"));
const AdminAuditLog = lazyWithRetry(() => import("./pages/admin/AdminAuditLog"));
const AdminRegulatoryHub = lazyWithRetry(() => import("./pages/admin/AdminRegulatoryHub"));
const AdminClientAccess = lazyWithRetry(() => import("./pages/admin/AdminClientAccess"));
const AdminScreeningProfileAudit = lazyWithRetry(() => import("./pages/admin/AdminScreeningProfileAudit"));
const AdminScreeningProduct = lazyWithRetry(() => import("./pages/admin/AdminScreeningProduct"));
const AdminSecurityAudit = lazyWithRetry(() => import("./pages/admin/AdminSecurityAudit"));
const AdminDataQuality = lazyWithRetry(() => import("./pages/admin/AdminDataQuality"));

const AdminReconcilePurchases = lazyWithRetry(() => import("./pages/admin/AdminReconcilePurchases"));
const AdminPurchaseStatus = lazyWithRetry(() => import("./pages/admin/AdminPurchaseStatus"));
const AdminPartners = lazyWithRetry(() => import("./pages/admin/AdminPartners"));
const AdminDomains = lazyWithRetry(() => import("./pages/admin/AdminDomains"));
const AdminAcademyUsers = lazyWithRetry(() => import("./pages/admin/AdminAcademyUsers"));
const AdminAcademyFunnel = lazyWithRetry(() => import("./pages/admin/AdminAcademyFunnel"));
const AdminOutreachQueue = lazyWithRetry(() => import("./pages/admin/AdminOutreachQueue"));
const AdminPartnerAssets = lazyWithRetry(() => import("./pages/admin/AdminPartnerAssets"));
const AdminBusiness = lazyWithRetry(() => import("./pages/admin/AdminBusiness"));
const AdminIdentities = lazyWithRetry(() => import("./pages/admin/AdminIdentities"));
const AdminInternalAccess = lazyWithRetry(() => import("./pages/admin/AdminInternalAccess"));
const PartnerSignup = lazyWithRetry(() => import("./pages/partner/PartnerSignup"));
const BusinessSignup = lazyWithRetry(() => import("./pages/business/BusinessSignup"));
const BusinessLogin = lazyWithRetry(() => import("./pages/business/BusinessLogin"));
const BusinessLayout = lazyWithRetry(() => import("./pages/business/BusinessLayout"));
const BusinessDashboard = lazyWithRetry(() => import("./pages/business/BusinessDashboard"));
const BusinessSolutions = lazyWithRetry(() => import("./pages/business/BusinessSolutions"));
const BusinessSolutionDetail = lazyWithRetry(() => import("./pages/business/BusinessSolutionDetail"));
const BusinessProducts = lazyWithRetry(() => import("./pages/business/BusinessProducts"));
const BusinessTraining = lazyWithRetry(() => import("./pages/business/BusinessTraining"));
const BusinessTeam = lazyWithRetry(() => import("./pages/business/BusinessTeam"));
const BusinessCompany = lazyWithRetry(() => import("./pages/business/BusinessCompany"));
const BusinessSupport = lazyWithRetry(() => import("./pages/business/BusinessSupport"));
const BusinessProfile = lazyWithRetry(() => import("./pages/business/BusinessProfile"));
const BusinessSecurity = lazyWithRetry(() => import("./pages/business/BusinessSecurity"));
const BusinessBilling = lazyWithRetry(() => import("./pages/business/BusinessBilling"));
const BusinessScreeningDemo = lazyWithRetry(() => import("./pages/business/BusinessScreeningDemo"));
const BusinessQuotes = lazyWithRetry(() => import("./pages/business/BusinessQuotes"));
const BusinessResources = lazyWithRetry(() => import("./pages/business/BusinessResources"));
const AdminRecognition = lazyWithRetry(() => import("./pages/admin/AdminRecognition"));

const AcademyLogin = lazyWithRetry(() => import("./pages/auth/AcademyLogin"));
const PartnerLogin = lazyWithRetry(() => import("./pages/auth/PartnerLogin"));
const AdminLogin = lazyWithRetry(() => import("./pages/auth/AdminLogin"));
const PartnerOnboardingPage = lazyWithRetry(() => import("./pages/partner-portal/Onboarding"));
const LegacyPartnerPortalRedirect = lazyWithRetry(() => import("./components/partner-portal/LegacyPartnerPortalRedirect"));


const PartnerPortalLayout = lazyWithRetry(() => import("./pages/partner-portal/PartnerPortalLayout"));

const PartnerOverview = lazyWithRetry(() => import("./pages/partner-portal/Overview"));
const PartnerReferralsPage = lazyWithRetry(() => import("./pages/partner-portal/Referrals"));
const PartnerDealsPage = lazyWithRetry(() => import("./pages/partner-portal/Deals"));
const PartnerCommissionsPage = lazyWithRetry(() => import("./pages/partner-portal/Commissions"));
const PartnerCertificationPage = lazyWithRetry(() => import("./pages/partner-portal/Certification"));

const PartnerAssetsPage = lazyWithRetry(() => import("./pages/partner-portal/Assets"));
const PartnerProfilePage = lazyWithRetry(() => import("./pages/partner-portal/Profile"));
const PartnerSettingsPage = lazyWithRetry(() => import("./pages/partner-portal/Settings"));
const PartnerContactsPage = lazyWithRetry(() => import("./pages/partner-portal/Contacts"));
const PartnerWelcomePage = lazyWithRetry(() => import("./pages/partner-portal/Welcome"));
const PartnerRegisterDealPage = lazyWithRetry(() => import("./pages/partner-portal/RegisterDeal"));
const PartnerPayoutsPage = lazyWithRetry(() => import("./pages/partner-portal/Payouts"));
const PartnerProductsPage = lazyWithRetry(() => import("./pages/partner-portal/Products"));
const PartnerManagerPage = lazyWithRetry(() => import("./pages/partner-portal/Manager"));

const SuiteAppLayout = lazyWithRetry(() => import("./pages/suite/SuiteAppLayout"));
const SuiteDashboard = lazyWithRetry(() => import("./pages/suite/SuiteDashboard"));
const SuiteOnboarding = lazyWithRetry(() => import("./pages/suite/SuiteOnboarding"));
const SuiteOnboardingForms = lazyWithRetry(() => import("./pages/suite/SuiteOnboardingForms"));
const SuiteOnboardingSubmissions = lazyWithRetry(() => import("./pages/suite/SuiteOnboardingSubmissions"));
const SuiteIDV = lazyWithRetry(() => import("./pages/suite/SuiteIDV"));
const SuiteScreening = lazyWithRetry(() => import("./pages/suite/SuiteScreening"));
const SuiteScreeningV2 = lazyWithRetry(() => import("./pages/suite/SuiteScreeningV2"));
const ScreeningWorkspace = lazyWithRetry(() => import("./pages/screening/ScreeningWorkspace"));
const ScreeningActivate = lazyWithRetry(() => import("./pages/screening/ScreeningActivate"));
const ScreeningModules = lazyWithRetry(() => import("./pages/screening/ScreeningModules"));
const ScreeningTeam = lazyWithRetry(() => import("./pages/screening/ScreeningTeam"));
const ScreeningMonitored = lazyWithRetry(() => import("./pages/screening/ScreeningMonitored"));
const ScreeningRiskAlerts = lazyWithRetry(() => import("./pages/screening/ScreeningRiskAlerts"));



const SuiteTransactions = lazyWithRetry(() => import("./pages/suite/SuiteTransactions"));
const SuiteMonitoring = lazyWithRetry(() => import("./pages/suite/SuiteMonitoring"));
const SuiteAlerts = lazyWithRetry(() => import("./pages/suite/SuiteAlerts"));
const SuiteAlertRules = lazyWithRetry(() => import("./pages/suite/SuiteAlertRules"));
const SuiteRisk = lazyWithRetry(() => import("./pages/suite/SuiteRisk"));
const SuiteCases = lazyWithRetry(() => import("./pages/suite/SuiteCases"));
const SuiteCaseQueue = lazyWithRetry(() => import("./pages/suite/SuiteCaseQueue"));
const SuiteAudit = lazyWithRetry(() => import("./pages/suite/SuiteAudit"));
const SuiteSettings = lazyWithRetry(() => import("./pages/suite/SuiteSettings"));
const SuiteHelp = lazyWithRetry(() => import("./pages/suite/SuiteHelp"));
const SuiteRegulatory = lazyWithRetry(() => import("./pages/suite/SuiteRegulatory"));
const SuiteRegulatorSubmissions = lazyWithRetry(() => import("./pages/suite/SuiteRegulatorSubmissions"));
const SuiteDsar = lazyWithRetry(() => import("./pages/suite/SuiteDsar"));
const SuiteRiskHeatmap = lazyWithRetry(() => import("./pages/suite/SuiteRiskHeatmap"));


const SuiteSourceOfFunds = lazyWithRetry(() => import("./pages/suite/SuiteSourceOfFunds"));
const SuiteAmlAr = lazyWithRetry(() => import("./pages/suite/SuiteAmlAr"));
const SuiteRss = lazyWithRetry(() => import("./pages/suite/SuiteRss"));
const SuiteUBO = lazyWithRetry(() => import("./pages/suite/SuiteUBO"));
const SuitePeriodicReviews = lazyWithRetry(() => import("./pages/suite/SuitePeriodicReviews"));
const SuiteCustomerDocuments = lazyWithRetry(() => import("./pages/suite/SuiteCustomerDocuments"));
const SuiteEDD = lazyWithRetry(() => import("./pages/suite/SuiteEDD"));
const SuiteSetup = lazyWithRetry(() => import("./pages/suite/SuiteSetup"));

const CustomerPortalGuard = lazyWithRetry(() => import("./components/portal/CustomerPortalGuard"));
const CustomerPortalLayout = lazyWithRetry(() => import("./pages/portal/CustomerPortalLayout"));
const PortalLogin = lazyWithRetry(() => import("./pages/portal/PortalLogin"));
const PortalOverview = lazyWithRetry(() => import("./pages/portal/PortalOverview"));
const PortalDocuments = lazyWithRetry(() => import("./pages/portal/PortalDocuments"));
const PortalActivity = lazyWithRetry(() => import("./pages/portal/PortalActivity"));




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
          <AuthQueryInvalidator />
          <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <PartnerOnlyRouteGuard />
            <Layout>
              <Suspense fallback={<div className="min-h-screen" />}>
              {isAcademyHost() ? (
                /* Academy subdomain (academy.worldaml.com) — Academy-only routes */
                <Routes>
                  <Route path="/" element={<Academy />} />
                  <Route path="/templates" element={<AcademyTemplates />} />
                  <Route path="/annual-pass-active" element={<AcademyAnnualSuccess />} />
                  <Route path="/certificate/:token" element={<AcademyCertificate />} />

                  {/* Auth (reused) */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/pending-approval" element={<PendingApproval />} />

                  {/* Portal-specific sign-in */}
                  <Route path="/academy/login" element={<AcademyLogin />} />

                  {/* Legacy /academy/* links → clean subdomain URLs */}
                  <Route path="/academy" element={<AcademyRootRedirect />} />

                  <Route path="/academy/templates" element={<AcademyRootRedirect />} />
                  <Route path="/academy/annual-pass-active" element={<AcademyRootRedirect />} />
                  <Route path="/academy/certificate/:token" element={<AcademyCertificateRedirect />} />
                  <Route path="/academy/:slug" element={<AcademyCourseRedirect />} />

                  {/* Course detail by slug (must be last among dynamic) */}
                  <Route path="/:slug" element={<AcademyCourse />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              ) : (
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/pricing" element={<Pricing />} />

                
{/* Auth Routes — one backend, three distinct portal experiences */}
                <Route path="/login" element={<Login />} />
                <Route path="/academy/login" element={<AcademyLogin />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/partner/signup" element={<PartnerSignup />} />
                <Route path="/business/signup" element={<BusinessSignup />} />
                <Route path="/business/login" element={<BusinessLogin />} />
                <Route path="/business" element={<PortalGuard portal="business"><BusinessLayout /></PortalGuard>}>
                  <Route index element={<Navigate to="/business/dashboard" replace />} />
                  <Route path="dashboard" element={<BusinessDashboard />} />
                  <Route path="solutions" element={<BusinessSolutions />} />
                  <Route path="solutions/:key" element={<BusinessSolutionDetail />} />
                  <Route path="products" element={<BusinessProducts />} />
                  <Route path="training" element={<BusinessTraining />} />
                  <Route path="team" element={<BusinessTeam />} />
                  <Route path="company" element={<BusinessCompany />} />
                  <Route path="support" element={<BusinessSupport />} />
                  <Route path="profile" element={<BusinessProfile />} />
                  <Route path="security" element={<BusinessSecurity />} />
                  <Route path="billing" element={<BusinessBilling />} />
                  <Route path="demo" element={<BusinessScreeningDemo />} />
                  <Route path="quotes" element={<BusinessQuotes />} />
                  <Route path="resources" element={<BusinessResources />} />
                </Route>
                {/* WorldAML Academy — authenticated learner shell */}
                <Route element={<PortalGuard portal="academy"><AppShellLayout /></PortalGuard>}>

                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/my-learning" element={<MyLearning />} />
                  <Route path="/dashboard/my-courses" element={<MyLearning />} />
                  <Route path="/dashboard/courses" element={<AllCourses />} />
                  <Route path="/dashboard/courses/:slug" element={<CoursePlayer />} />
                  <Route path="/dashboard/cart" element={<CartPage />} />
                  <Route path="/dashboard/plans" element={<Plans />} />
                  <Route path="/dashboard/certificates" element={<MyCertificates />} />
                  <Route path="/dashboard/recognition" element={<Recognition />} />
                  <Route path="/certificates" element={<MyCertificates />} />
                  <Route path="/account" element={<Navigate to="/account/profile" replace />} />
                  <Route path="/account/profile" element={<AccountProfile />} />
                  <Route path="/account/billing" element={<AccountBilling />} />
                  <Route path="/account/security" element={<AccountSecurity />} />

                </Route>
                <Route path="/pending-approval" element={<PendingApproval />} />
                <Route path="/admin" element={<PortalGuard portal="admin"><AdminLayout /></PortalGuard>}>

                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="users" element={<AdminUsers />} />

                  <Route path="organizations" element={<AdminOrganizations />} />
                  <Route path="alert-rules" element={<AdminAlertRules />} />
                  <Route path="forms" element={<AdminForms />} />
                  <Route path="workflows" element={<AdminWorkflows />} />
                  <Route path="pricing" element={<AdminPricing />} />
                  <Route path="audit-log" element={<AdminAuditLog />} />
                  <Route path="screening-profile-audit" element={<AdminScreeningProfileAudit />} />
                  <Route path="screening-product" element={<AdminScreeningProduct />} />
                  <Route path="clients-access" element={<AdminClientAccess />} />
                  <Route path="regulatory" element={<AdminRegulatoryHub />} />
                  <Route path="security" element={<AdminSecurityAudit />} />
                  <Route path="data-quality" element={<AdminDataQuality />} />

                  <Route path="reconcile-purchases" element={<AdminReconcilePurchases />} />
                  <Route path="purchase-status" element={<AdminPurchaseStatus />} />
                  <Route path="partners" element={<AdminPartners />} />
                  <Route path="partner-assets" element={<AdminPartnerAssets />} />
                  <Route path="business" element={<AdminBusiness />} />
                  <Route path="identities" element={<AdminIdentities />} />
                  <Route path="internal-access" element={<AdminInternalAccess />} />
                  <Route path="domains" element={<AdminDomains />} />
                  <Route path="academy-users" element={<AdminAcademyUsers />} />
                  <Route path="academy-funnel" element={<AdminAcademyFunnel />} />
                  <Route path="outreach-queue" element={<AdminOutreachQueue />} />
                  <Route path="recognition" element={<AdminRecognition />} />
                  <Route path="notifications" element={<AdminNotificationCentre />} />
                  <Route path="notification-settings" element={<AdminNotificationSettings />} />
                </Route>
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Screening & Monitoring (standalone product) */}
                <Route path="/screening-monitoring" element={<ScreeningMonitoring />} />
                <Route path="/screening-monitoring/pricing" element={<ScreeningPricing />} />

                {/* Platform (Lane 1) */}
                <Route path="/platform" element={<Platform />} />
                <Route path="/platform/suite" element={<PlatformSuite />} />
                <Route path="/platform/api" element={<PlatformAPI />} />
                <Route path="/platform/security" element={<PlatformSecurity />} />
                <Route path="/platform/transaction-monitoring" element={<PlatformTransactionMonitoring />} />
                <Route path="/platform/regulatory-reporting" element={<PlatformRegulatoryReporting />} />
                <Route path="/platform/kyc-kyb" element={<PlatformKYCKYB />} />
                <Route path="/platform/aml-screening" element={<Navigate to="/screening-monitoring" replace />} />
                <Route path="/platform/risk-assessment" element={<PlatformRiskAssessment />} />
                
                {/* Retired data-source lane — redirect to WORLDAML Screening & Monitoring */}
                <Route path="/data-sources/worldcompliance/pricing" element={<Navigate to="/pricing" replace />} />
                <Route path="/data-sources/*" element={<Navigate to="/screening-monitoring" replace />} />
                <Route path="/data-sources" element={<Navigate to="/screening-monitoring" replace />} />

                
                {/* Products */}
                <Route path="/products" element={<Navigate to="/products/worldid" replace />} />
                <Route path="/products/worldid" element={<WorldID />} />

                {/* Public tenant onboarding form */}
                <Route path="/onboard/:token" element={<OnboardPublic />} />
                
                
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
                <Route path="/about-us" element={<Navigate to="/about" replace />} />
                <Route path="/about-us/why-worldaml" element={<WhyWorldAML />} />
                <Route path="/get-started" element={<Navigate to="/contact-sales" replace />} />
                <Route path="/contact-sales" element={<ContactSales />} />
                <Route path="/book-demo" element={<BookDemo />} />
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
                <Route path="/resources/what-is-sanctions-screening" element={<WhatIsSanctionsScreening />} />
                <Route path="/resources/uae-aml-compliance-guide" element={<UAEAMLComplianceGuide />} />
                <Route path="/resources/aml-compliance-checklist" element={<AMLComplianceChecklist />} />
                <Route path="/resources/fatf-travel-rule-compliance-guide" element={<FATFTravelRuleGuide />} />
                <Route path="/resources/comparison/world-check-vs-worldcompliance-vs-dow-jones" element={<Navigate to="/alternatives" replace />} />
                <Route path="/sanctions-check" element={<Navigate to="/?demo=1" replace />} />
                <Route path="/free-aml-check" element={<Navigate to="/?demo=1" replace />} />
                <Route path="/data-coverage" element={<Navigate to="/screening-monitoring" replace />} />
                <Route path="/data-coverage/:country" element={<Navigate to="/screening-monitoring" replace />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/rss" element={<RssPage />} />

                
                {/* Partners */}
                <Route path="/partners" element={<Partners />} />
                <Route path="/partners/directory" element={<PartnersDirectory />} />
                <Route path="/partners/apply" element={<PartnerApply />} />
                <Route path="/partners/dashboard" element={<Navigate to="/partner/dashboard" replace />} />

                {/* Partner Portal — approved partners only */}
                <Route path="/partner/login" element={<PartnerLogin />} />
                <Route path="/partner/apply" element={<Navigate to="/partners/apply" replace />} />
                <Route path="/partner/onboarding" element={<PartnerOnboardingPage />} />
                <Route path="/partner" element={<PortalGuard portal="partner"><PartnerPortalLayout /></PortalGuard>}>
                  <Route index element={<Navigate to="/partner/dashboard" replace />} />
                  <Route path="dashboard" element={<PartnerOverview />} />
                  <Route path="welcome" element={<PartnerWelcomePage />} />
                  <Route path="referrals" element={<PartnerReferralsPage />} />
                  <Route path="deals" element={<PartnerDealsPage />} />
                  <Route path="deals/new" element={<PartnerRegisterDealPage />} />
                  <Route path="commissions" element={<PartnerCommissionsPage />} />
                  <Route path="certification" element={<PartnerCertificationPage />} />

                  <Route path="payouts" element={<PartnerPayoutsPage />} />
                  <Route path="products" element={<PartnerProductsPage />} />
                  <Route path="manager" element={<PartnerManagerPage />} />
                  <Route path="assets" element={<PartnerAssetsPage />} />
                  <Route path="contacts" element={<PartnerContactsPage />} />
                  <Route path="profile" element={<PartnerProfilePage />} />
                  <Route path="settings" element={<PartnerSettingsPage />} />
                </Route>

                {/* Legacy partner portal URLs */}
                <Route path="/partner-portal" element={<Navigate to="/partner/dashboard" replace />} />
                <Route path="/partner-portal/:section" element={<LegacyPartnerPortalRedirect />} />


                {/* Academy */}
                <Route path="/academy" element={<Academy />} />
                <Route path="/academy/templates" element={<AcademyTemplates />} />
                <Route path="/academy/annual-pass-active" element={<AcademyAnnualSuccess />} />
                <Route path="/academy/certificate/:token" element={<AcademyCertificate />} />
                <Route path="/academy/:slug" element={<AcademyCourse />} />

                {/* Markets */}
                <Route path="/markets/:market" element={<MarketPage />} />
                <Route
                  path="/ro"
                  element={
                    <MarketPage
                      marketSlug="romania"
                      localeOverride={{
                        lang: "ro-RO",
                        ogLocale: "ro_RO",
                        title: "Software AML și Conformitate ANSPDCP pentru România | WorldAML",
                        description: "Platformă AML și de protecție a datelor pentru bănci, fintech-uri și instituții de plată din România. Aliniată cu Legea 129/2019, ONPCSB, BNR, ASF și ANSPDCP (GDPR). KYC/KYB, screening sancțiuni, monitorizare tranzacții și raportare STR.",
                        canonical: "/ro",
                      }}
                    />
                  }
                />
                <Route path="/market/romania" element={<Navigate to="/ro" replace />} />
                
                {/* API Product Pages */}
                <Route path="/aml-api" element={<AMLApi />} />
                <Route path="/sanctions-screening-api" element={<SanctionsScreeningApi />} />
                <Route path="/kyc-kyb-api" element={<KYCKYBApi />} />

                {/* EU Sanctions */}
                <Route path="/eu-sanctions-map" element={<EUSanctionsMap />} />
                <Route path="/eu-sanctions/:slug" element={<EUSanctionsCountry />} />

                {/* Regional AML landing pages */}
                <Route path="/aml-screening/eu" element={<AMLScreeningEU />} />
                <Route path="/aml-screening/uk" element={<AMLScreeningUK />} />
                <Route path="/compliance-software/us" element={<ComplianceSoftwareUS />} />
                <Route path="/compliance-software/us/casinos" element={<CasinoAMLComplianceUS />} />
                <Route path="/compliance-software/us/banks" element={<BankAMLComplianceUS />} />
                <Route path="/compliance-software/us/fintechs" element={<FintechAMLComplianceUS />} />
                <Route path="/compliance-software/us/crypto" element={<CryptoAMLComplianceUS />} />
                <Route path="/compliance-software/us/legal" element={<LegalAMLComplianceUS />} />
                <Route path="/compliance-software/uk" element={<ComplianceSoftwareUK />} />
                <Route path="/compliance-software/nl" element={<ComplianceSoftwareNL />} />
                <Route path="/compliance-software/ch" element={<ComplianceSoftwareCH />} />
                <Route path="/compliance-software/it" element={<ComplianceSoftwareIT />} />
                <Route path="/compliance-software" element={<Navigate to="/compliance-software/us" replace />} />
                <Route path="/resources/us-aml-kyc-compliance-guide" element={<USAMLKYCComplianceGuide />} />
                <Route path="/sanctions-screening-software" element={<SanctionsScreeningSoftware />} />

                {/* Comparison landing pages */}
                <Route path="/world-check-alternative" element={<WorldCheckAlternative />} />
                <Route path="/alternatives" element={<AlternativesIndex />} />
                <Route path="/alternatives/comply-advantage" element={<ComplyAdvantageAlternative />} />
                <Route path="/alternatives/dow-jones-risk-center" element={<DowJonesAlternative />} />
                <Route path="/alternatives/napier" element={<NapierAlternative />} />
                <Route path="/alternatives/sanction-scanner" element={<SanctionScannerAlternative />} />

                {/* Advisory */}
                <Route path="/advisory" element={<Advisory />} />
                <Route path="/advisory/ewra" element={<AdvisoryEwra />} />


                <Route path="/suite-layout-preview" element={<SuiteLayout />} />

                {/* WorldAML Screening & Monitoring — standalone product workspace (separate from Suite) */}
                <Route path="/screening" element={<ScreeningWorkspace />} />
                <Route path="/screening/team" element={<ScreeningTeam />} />
                <Route path="/screening/monitored" element={<ScreeningMonitored />} />
                <Route path="/screening/risk-alerts" element={<ScreeningRiskAlerts />} />

                <Route path="/screening/activate" element={<ScreeningActivate />} />
                <Route path="/screening/modules" element={<ScreeningModules />} />



                {/* Suite App (functional dashboard) */}
                <Route path="/suite" element={<PortalGuard portal="suite"><SuiteAppLayout /></PortalGuard>}>
                  <Route index element={<SuiteDashboard />} />
                  <Route path="setup" element={<SuiteSetup />} />

                  <Route path="onboarding" element={<SuiteOnboarding />} />
                  <Route path="onboarding-forms" element={<SuiteOnboardingForms />} />
                  <Route path="onboarding-forms/:id" element={<SuiteOnboardingForms />} />
                  <Route path="onboarding-submissions" element={<SuiteOnboardingSubmissions />} />
                  <Route path="idv" element={<SuiteIDV />} />
                  <Route path="screening" element={<SuiteScreening />} />
                  <Route path="screening-v2" element={<Navigate to="/screening" replace />} />

                  <Route path="transactions" element={<SuiteTransactions />} />
                  <Route path="monitoring" element={<SuiteMonitoring />} />
                  <Route path="alerts" element={<SuiteAlerts />} />
                  <Route path="alerts/rules" element={<SuiteAlertRules />} />
                  <Route path="risk" element={<SuiteRisk />} />
                  <Route path="ubo" element={<SuiteUBO />} />
                  <Route path="ubo/:customerId" element={<SuiteUBO />} />
                  <Route path="periodic-reviews" element={<SuitePeriodicReviews />} />
                  <Route path="customer-documents" element={<SuiteCustomerDocuments />} />
                  <Route path="customer-documents/:customerId" element={<SuiteCustomerDocuments />} />
                  <Route path="edd" element={<SuiteEDD />} />
                  <Route path="source-of-funds" element={<SuiteSourceOfFunds />} />
                  <Route path="aml-ar" element={<SuiteAmlAr />} />
                  <Route path="cases" element={<SuiteCases />} />
                  <Route path="case-queue" element={<SuiteCaseQueue />} />
                  <Route path="audit" element={<SuiteAudit />} />
                  <Route path="settings" element={<SuiteSettings />} />
                  <Route path="help" element={<SuiteHelp />} />
                  <Route path="regulatory" element={<SuiteRegulatory />} />
                  <Route path="regulator-submissions" element={<SuiteRegulatorSubmissions />} />
                  <Route path="dsar" element={<SuiteDsar />} />
                  <Route path="risk-heatmap" element={<SuiteRiskHeatmap />} />


                  <Route path="rss" element={<SuiteRss />} />
                </Route>

                {/* RCM Module */}
                <Route path="/rcm" element={<RcmLayout />}>
                  <Route index element={<RcmDashboard />} />
                  <Route path="library" element={<RcmPlaceholder titleKey="rcm.nav.library" />} />
                  <Route path="obligations" element={<RcmObligations />} />
                  <Route path="controls" element={<RcmPlaceholder titleKey="rcm.nav.controls" />} />
                  <Route path="assessments" element={<RcmPlaceholder titleKey="rcm.nav.assessments" />} />
                  <Route path="tasks" element={<RcmPlaceholder titleKey="rcm.nav.tasks" />} />
                  <Route path="evidence" element={<RcmPlaceholder titleKey="rcm.nav.evidence" />} />
                  <Route path="reports" element={<RcmPlaceholder titleKey="rcm.nav.reports" />} />
                  <Route path="translations" element={<RcmPlaceholder titleKey="rcm.nav.translations" />} />
                  <Route path="audit" element={<RcmPlaceholder titleKey="rcm.nav.audit" />} />
                  <Route path="settings" element={<RcmPlaceholder titleKey="rcm.nav.settings" />} />
                  <Route path="help" element={<RcmHelp />} />
                </Route>

                {/* Customer Portal (self-serve for tenants' customers) */}
                <Route path="/portal/login" element={<PortalLogin />} />
                <Route element={<CustomerPortalGuard />}>
                  <Route path="/portal" element={<CustomerPortalLayout />}>
                    <Route index element={<PortalOverview />} />
                    <Route path="documents" element={<PortalDocuments />} />
                    <Route path="activity" element={<PortalActivity />} />
                  </Route>
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />

              </Routes>
              )}
              </Suspense>

            </Layout>
          </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </RegionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
