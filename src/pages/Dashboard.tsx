import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useAcademyOverview } from "@/hooks/useAcademyOverview";
import {
  ContinueLearning, LearningOverview, MyCourses,
  CertificatesSection, RecommendedNext, ResourcesSection,
} from "@/components/dashboard/DashboardSections";
import {
  ComplianceInPractice, ExploreWorldAML, WorldAMLTools,
} from "@/components/dashboard/EcosystemSections";
import { MemberLevelCard, LevelUpMoment } from "@/components/dashboard/RecognitionSections";

export default function Dashboard() {
  const { firstName } = useEntitlements();
  const academy = useAcademyOverview();

  if (academy.isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const otherActive = academy.inProgress.filter((c) => c.course.id !== academy.current?.course.id);

  return (
    <>
      <Helmet><title>My Academy Dashboard | WorldAML</title><meta name="robots" content="noindex" /></Helmet>

      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back, {firstName}</h1>
        <p className="text-sm text-muted-foreground mt-1">Continue building your compliance expertise.</p>
      </div>

      <LevelUpMoment />

      <div className="space-y-6">
        <ContinueLearning current={academy.current} others={otherActive} />

        <LearningOverview data={academy} />

        <MemberLevelCard />

        <div className="grid lg:grid-cols-2 gap-4">
          <MyCourses courses={[...academy.inProgress, ...academy.completed]} />
          <CertificatesSection certificates={academy.certificates} />
        </div>

        <RecommendedNext courses={academy.recommendedList} />

        <ComplianceInPractice data={academy} />

        <ExploreWorldAML />

        <ResourcesSection />

        <WorldAMLTools />
      </div>
    </>
  );
}
