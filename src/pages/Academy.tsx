import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, GraduationCap, Clock, BarChart3, Award, Shield, BookOpen } from "lucide-react";

const difficultyColor: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-rose-100 text-rose-700",
};

const Academy = () => {
  const { data: courses, isLoading } = useQuery({
    queryKey: ["academy-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_courses")
        .select("*")
        .eq("is_published", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Compliance Academy — Free AML & KYC Training | WorldAML"
        description="Earn free compliance certificates with WorldAML Academy. Learn AML fundamentals, KYC best practices, and sanctions screening through interactive courses and quizzes."
        canonical="/academy"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Academy", url: "/academy" },
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: "WorldAML Compliance Academy",
          description: "Free compliance training courses with certificates covering AML, KYC, and sanctions screening.",
          url: "https://www.worldaml.com/academy",
        }}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-navy overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="container-enterprise section-padding relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-teal-light text-body-sm font-medium mb-6">
                <GraduationCap className="h-4 w-4" />
                Free Compliance Training
              </div>
              <h1 className="text-display text-primary-foreground mb-4">
                WorldAML Academy
              </h1>
              <p className="text-body-lg text-slate-light mb-8 max-w-2xl mx-auto">
                Build your compliance expertise with interactive courses. Pass the quiz, 
                earn a certificate, and share it on LinkedIn — completely free.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-body-sm text-slate-light">
                <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-teal-light" /> Interactive Courses</span>
                <span className="flex items-center gap-2"><Award className="h-4 w-4 text-teal-light" /> Shareable Certificates</span>
                <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-teal-light" /> Industry-Recognised</span>
              </div>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="text-center mb-12">
              <h2 className="text-headline text-foreground mb-3">Available Courses</h2>
              <p className="text-body-lg text-muted-foreground max-w-xl mx-auto">
                Choose a course, work through the material, then take the quiz to earn your certificate.
              </p>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-6 animate-pulse">
                    <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                    <div className="h-5 bg-muted rounded w-2/3 mb-3" />
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-4/5" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {courses?.map((course) => (
                  <Link
                    key={course.id}
                    to={`/academy/${course.slug}`}
                    className="group rounded-xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={difficultyColor[course.difficulty] || ""}>
                        {course.difficulty}
                      </Badge>
                      <span className="text-caption text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {course.duration_minutes} min
                      </span>
                    </div>
                    <h3 className="text-subtitle font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-body-sm text-muted-foreground mb-4 line-clamp-3">
                      {course.description}
                    </p>
                    <span className="text-body-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                      Start Course <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* How it works */}
        <section className="section-padding bg-secondary/30">
          <div className="container-enterprise">
            <h2 className="text-headline text-foreground text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { step: "1", title: "Choose a Course", desc: "Pick from our library of compliance courses" },
                { step: "2", title: "Learn the Material", desc: "Work through concise, expert-written modules" },
                { step: "3", title: "Pass the Quiz", desc: "Score 80% or higher to earn your certificate" },
                { step: "4", title: "Share & Showcase", desc: "Download your certificate or share on LinkedIn" },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-subtitle font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-body font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-body-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise text-center">
            <h2 className="text-headline text-primary-foreground mb-4">Ready to Get Certified?</h2>
            <p className="text-body-lg text-slate-light mb-8">
              Create a free account to track your progress and earn certificates.
            </p>
            <Button size="lg" variant="accent" asChild>
              <Link to="/signup">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Academy;
