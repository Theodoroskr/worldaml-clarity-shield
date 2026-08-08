import { Helmet } from "react-helmet-async";
import { Loader2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppPageHeader } from "@/components/app-shell/AppShellLayout";
import { useAcademyOverview } from "@/hooks/useAcademyOverview";
import { CourseRow, LearningOverview } from "@/components/dashboard/DashboardSections";
import { academyHref } from "@/lib/academyHost";

export default function MyLearning() {
  const academy = useAcademyOverview();

  if (academy.isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <>
      <Helmet><title>My Learning | WorldAML</title><meta name="robots" content="noindex" /></Helmet>
      <AppPageHeader
        title="My Learning"
        description="Every course you've started, with progress and next steps."
        actions={<Button asChild variant="outline" size="sm"><a href={academyHref("/academy")}>Browse Courses</a></Button>}
      />

      <div className="space-y-6">
        <LearningOverview data={academy} />

        {academy.all.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-12 text-center space-y-3">
              <GraduationCap className="h-8 w-8 mx-auto text-accent" />
              <p className="text-sm text-muted-foreground">You haven't started a course yet.</p>
              <Button asChild size="sm"><a href={academyHref("/academy")}>Browse Courses</a></Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {academy.inProgress.length > 0 && (
              <Card className="border-border">
                <CardHeader className="pb-3"><CardTitle className="text-base">In Progress</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {academy.inProgress.map((c) => <CourseRow key={c.course.id} c={c} />)}
                </CardContent>
              </Card>
            )}
            {academy.completed.length > 0 && (
              <Card className="border-border">
                <CardHeader className="pb-3"><CardTitle className="text-base">Completed</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {academy.completed.map((c) => <CourseRow key={c.course.id} c={c} />)}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}
