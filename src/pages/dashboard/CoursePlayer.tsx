import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AcademyCourse from "@/pages/AcademyCourse";
import { Button } from "@/components/ui/button";

/**
 * In-portal course player. Reuses the canonical AcademyCourse experience
 * (modules, quiz, certificate) with the marketing header/footer suppressed
 * so it renders inside the learner dashboard shell.
 */
export default function CoursePlayer() {
  const { slug } = useParams();
  return (
    <>
      <Helmet><meta name="robots" content="noindex" /></Helmet>
      <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground">
        <Link to="/dashboard/courses"><ChevronLeft className="h-4 w-4 mr-1" /> Back to courses</Link>
      </Button>
      <div className="-mx-4 sm:-mx-6">
        <AcademyCourse key={slug} embedded />
      </div>
    </>
  );
}
