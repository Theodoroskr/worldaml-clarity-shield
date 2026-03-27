import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Award, Globe, Shield } from "lucide-react";

const featuredCourses = [
  {
    title: "AML Fundamentals",
    category: "Foundational",
    cpdHours: 4,
    icon: Shield,
  },
  {
    title: "GCC AML Regulations",
    category: "Regional",
    cpdHours: 3,
    icon: Globe,
  },
  {
    title: "Transaction Monitoring",
    category: "Specialisation",
    cpdHours: 5,
    icon: BookOpen,
  },
];

const categoryColors: Record<string, string> = {
  Foundational: "bg-teal/10 text-teal border-teal/20",
  Regional: "bg-accent/10 text-accent border-accent/20",
  Specialisation: "bg-navy/10 text-navy border-navy/20",
};

const AcademyPromoSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column */}
          <div>
            <Badge className="mb-4 bg-teal/10 text-teal border-teal/20 hover:bg-teal/15">
              <Award className="w-3 h-3 mr-1" />
              CPD Accredited
            </Badge>
            <h2 className="text-headline text-navy mb-4">
              Build Compliance Expertise
            </h2>
            <p className="text-body-lg text-text-secondary mb-6 max-w-lg">
              Free, CPD-accredited courses designed for compliance professionals.
              Learn AML fundamentals, regional regulations, and advanced screening
              techniques — then earn a shareable certificate.
            </p>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-sm font-semibold text-navy bg-secondary px-3 py-1.5 rounded-full">
                15+ Courses
              </span>
              <span className="text-sm font-semibold text-navy bg-secondary px-3 py-1.5 rounded-full">
                Shareable Certificates
              </span>
            </div>
            <Button asChild variant="accent" size="lg">
              <Link to="/academy">Explore Academy →</Link>
            </Button>
          </div>

          {/* Right column — mini course cards */}
          <div className="space-y-4">
            {featuredCourses.map((course) => (
              <div
                key={course.title}
                className="flex items-center gap-4 bg-card rounded-lg border border-divider p-4 hover:shadow-sm transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center shrink-0">
                  <course.icon className="w-5 h-5 text-navy" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy truncate">
                    {course.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[course.category]}`}
                    >
                      {course.category}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {course.cpdHours} CPD Hrs
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AcademyPromoSection;
