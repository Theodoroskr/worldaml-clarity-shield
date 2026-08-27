import { Link } from "react-router-dom";
import { Loader2, Lock, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SuiteScreeningV2 from "@/pages/suite/SuiteScreeningV2";
import { useScreeningAccess } from "@/hooks/useScreeningAccess";

/**
 * Standalone WorldAML Screening & Monitoring workspace.
 * Requires an active screening subscription — otherwise the buyer is
 * pointed back to the public product page and packages.
 */
export default function ScreeningWorkspace() {
  const { isLoading, hasAccess } = useScreeningAccess();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Screening & Monitoring | WorldAML"
        description="Provider-independent sanctions, PEP, watchlist and adverse media screening workspace with case management and ongoing monitoring."
        noindex
      />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Checking your access…
          </div>
        ) : hasAccess ? (
          <SuiteScreeningV2 />
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-5 w-5 text-teal" /> Screening & Monitoring is not active yet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This workspace is part of WorldAML Screening & Monitoring. Choose a package to activate
                sanctions, PEP and adverse media screening with ongoing monitoring for your organisation.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button asChild variant="accent">
                  <Link to="/platform/aml-screening#packages">
                    View packages <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/contact-sales?product=WorldAML%20Screening%20%26%20Monitoring">Talk to sales</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
