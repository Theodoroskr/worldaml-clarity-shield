import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useAcademyOverview } from "@/hooks/useAcademyOverview";
import {
  QuickActions, ContinueLearning, LearningOverview, MyCourses,
  CertificatesSection, RecommendedNext, ResourcesSection, ExploreWorldAML,
} from "@/components/dashboard/DashboardSections";
import { WorkspaceSection } from "@/components/dashboard/WorkspaceSection";
import { DashboardSanctionsWidget } from "@/components/sanctions/DashboardSanctionsWidget";
import { SearchHistoryPanel } from "@/components/sanctions/SearchHistoryPanel";

export default function Dashboard() {
  const ent = useEntitlements();
  const academy = useAcademyOverview();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  if (academy.isLoading && ent.isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Helmet><title>My WorldAML | Dashboard</title><meta name="robots" content="noindex" /></Helmet>

      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {greeting}, {ent.firstName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here's where you left off across your WorldAML account.
        </p>
      </div>

      <QuickActions current={academy.current} />

      <div className="space-y-6">
        <ContinueLearning current={academy.current} />

        {(ent.hasSuite || ent.hasRcm || ent.hasPartnerPortal) && (
          <WorkspaceSection hasSuite={ent.hasSuite} hasRcm={ent.hasRcm} hasPartner={ent.hasPartnerPortal} />
        )}

        <LearningOverview data={academy} />

        <div className="grid lg:grid-cols-2 gap-4">
          <MyCourses courses={[...academy.inProgress, ...academy.completed]} />
          <CertificatesSection certificates={academy.certificates} />
        </div>

        <RecommendedNext course={academy.recommended} />

        <div id="quick-check" className="grid lg:grid-cols-2 gap-4 scroll-mt-20">
          <DashboardSanctionsWidget />
          <SearchHistoryPanel />
        </div>

        <ResourcesSection />
        <ExploreWorldAML hasSuite={ent.hasSuite} hasRcm={ent.hasRcm} />
      </div>
    </>
  );
}
