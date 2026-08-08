import { Link } from "react-router-dom";
import { GraduationCap, BookOpen, Sparkles, CreditCard, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: BookOpen,
    title: "Browse Courses",
    description: "Explore the full WorldAML Academy catalogue by topic and level.",
    href: "/dashboard/courses",
    cta: "Browse Courses",
    primary: true,
  },
  {
    icon: Sparkles,
    title: "Explore Free Courses",
    description: "Start learning right away with our complimentary modules.",
    href: "/dashboard/courses?price=free",
    cta: "Start Free",
    primary: false,
  },
  {
    icon: CreditCard,
    title: "View Plans & Access",
    description: "Compare access options and unlock the full curriculum.",
    href: "/dashboard/plans",
    cta: "View Plans",
    primary: false,
  },
];

export default function NewLearnerWelcome() {
  return (
    <Card className="border-border overflow-hidden">
      <div className="h-1 bg-accent" />
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Welcome to WorldAML Academy</h2>
            <p className="text-sm text-muted-foreground mt-1">
              You are all set up. Here are three ways to begin building your compliance expertise.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mt-5">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-lg border border-border bg-muted/30 p-4 flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-muted-foreground">{i + 1}</span>
                <s.icon className="h-4 w-4 text-accent" />
                <span className="text-sm font-semibold text-foreground">{s.title}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex-1">{s.description}</p>
              <Button
                asChild
                size="sm"
                variant={s.primary ? "default" : "outline"}
                className="mt-3 w-full"
              >
                <Link to={s.href}>
                  {s.cta}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
