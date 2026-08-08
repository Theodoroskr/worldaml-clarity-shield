import { Helmet } from "react-helmet-async";
import { Loader2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppPageHeader } from "@/components/app-shell/AppShellLayout";
import { useAcademyOverview } from "@/hooks/useAcademyOverview";
import { CertificateRowItem } from "@/components/dashboard/DashboardSections";
import { academyHref } from "@/lib/academyHost";

export default function MyCertificates() {
  const { certificates, cpdHours, isLoading } = useAcademyOverview();

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <>
      <Helmet><title>My Certificates | WorldAML</title><meta name="robots" content="noindex" /></Helmet>
      <AppPageHeader
        title="My Certificates"
        description={cpdHours > 0 ? `${certificates.length} certificate(s) · ${cpdHours} CPD hours` : "Certificates earned from completed WorldAML Academy courses."}
      />

      {certificates.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center space-y-3">
            <Award className="h-8 w-8 mx-auto text-accent" />
            <p className="text-sm text-muted-foreground">Complete a course and pass the final quiz to earn a certificate.</p>
            <Button asChild size="sm"><Link to="/dashboard/courses">Browse Courses</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {certificates.map((c) => <CertificateRowItem key={c.id} cert={c} />)}
        </div>
      )}
    </>
  );
}
