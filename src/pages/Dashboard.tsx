import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Loader2, GraduationCap, Award, ShoppingCart, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useAcademyOverview } from "@/hooks/useAcademyOverview";
import { useCart } from "@/contexts/CartContext";
import {
  ContinueLearning, LearningOverview, MyCourses,
  CertificatesSection, RecommendedNext, ResourcesSection,
} from "@/components/dashboard/DashboardSections";
import {
  ComplianceInPractice, ExploreWorldAML, WorldAMLTools,
} from "@/components/dashboard/EcosystemSections";
import { MemberLevelCard, LevelUpMoment } from "@/components/dashboard/RecognitionSections";
import NewLearnerWelcome from "@/components/dashboard/NewLearnerWelcome";
import SuggestedForYou from "@/components/dashboard/SuggestedForYou";

export default function Dashboard() {
  const { firstName } = useEntitlements();
  const academy = useAcademyOverview();
  const cart = useCart();

  if (academy.isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const otherActive = academy.inProgress.filter((c) => c.course.id !== academy.current?.course.id);
  const isNewLearner = academy.all.length === 0;

  return (
    <>
      <Helmet><title>My Academy Dashboard | WorldAML</title><meta name="robots" content="noindex" /></Helmet>

      {/* Welcome banner — premium, restrained, action-led */}
      <section className="relative mb-6 overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/10 via-card to-accent/5">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--accent)/0.14),transparent_70%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
              <Sparkles className="h-3.5 w-3.5" /> WorldAML Academy
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {isNewLearner ? `Welcome, ${firstName}` : `Welcome back, ${firstName}`}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isNewLearner
                ? "Your account is ready — choose your first CPD-accredited course."
                : "Continue building your compliance expertise, certificate by certificate."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm">
              <Link to="/dashboard/courses">
                <GraduationCap className="h-4 w-4 mr-1.5" /> Browse courses
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/dashboard/certificates">
                <Award className="h-4 w-4 mr-1.5" /> My certificates
              </Link>
            </Button>
            {cart.count > 0 && (
              <Button asChild size="sm" variant="outline" className="border-accent/40 text-accent hover:text-accent">
                <Link to="/dashboard/cart">
                  <ShoppingCart className="h-4 w-4 mr-1.5" /> Basket ({cart.count})
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <LevelUpMoment />

      <div className="space-y-8">
        {isNewLearner ? <NewLearnerWelcome /> : <ContinueLearning current={academy.current} others={otherActive} />}

        {!isNewLearner && <LearningOverview data={academy} />}

        {!isNewLearner && <MemberLevelCard />}

        {!isNewLearner && (
          <div className="grid lg:grid-cols-2 gap-4">
            <MyCourses courses={[...academy.inProgress, ...academy.completed]} />
            <CertificatesSection certificates={academy.certificates} />
          </div>
        )}

        <SuggestedForYou />

        <RecommendedNext courses={academy.recommendedList} />

        <ComplianceInPractice data={academy} />

        <ExploreWorldAML />

        <ResourcesSection />

        <WorldAMLTools />
      </div>
    </>
  );
}
