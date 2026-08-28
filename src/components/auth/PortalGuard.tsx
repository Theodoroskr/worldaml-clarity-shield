import { ReactNode } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { Loader2, Lock } from "lucide-react";
import { usePortalAccess, PortalKey, PORTAL_LOGIN } from "@/hooks/usePortalAccess";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SEO from "@/components/SEO";

const COPY: Record<PortalKey, { title: string; body: string; primary?: { label: string; to: string }; secondary: { label: string; to: string } }> = {
  academy: {
    title: "No Academy access",
    body: "Your account does not currently have access to WorldAML Academy.",
    primary: { label: "Explore the Academy", to: "/academy" },
    secondary: { label: "Return to WorldAML", to: "/" },
  },
  partner: {
    title: "No Partner Portal access",
    body: "You don't currently have access to the WorldAML Partner Portal.",
    primary: { label: "Learn About Our Partner Programme", to: "/partners" },
    secondary: { label: "Return to Academy", to: "/dashboard" },
  },
  business: {
    title: "No Business account",
    body: "You don't currently have a WorldAML business account.",
    primary: { label: "Create a business account", to: "/business/signup" },
    secondary: { label: "Return to WorldAML", to: "/" },
  },
  suite: {
    title: "No Suite access",
    body: "Your account does not currently have access to the WorldAML Compliance Suite.",
    primary: { label: "View Suite plans", to: "/pricing" },
    secondary: { label: "Return to WorldAML", to: "/" },
  },
  screening: {
    title: "No Screening access",
    body: "Your account does not currently have access to WorldAML Screening & Monitoring.",
    primary: { label: "View Screening packages", to: "/screening-monitoring/pricing" },
    secondary: { label: "Return to WorldAML", to: "/" },
  },
  admin: {
    title: "Access denied",
    body: "This area is restricted to authorised WorldAML staff.",
    secondary: { label: "Return to WorldAML", to: "/" },
  },
};


/**
 * Route-level authorisation. Never renders portal content (or its chrome)
 * unless the signed-in identity holds the entitlement for that portal.
 */
export default function PortalGuard({ portal, children }: { portal: PortalKey; children: ReactNode }) {
  const access = usePortalAccess();
  const location = useLocation();

  if (access.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!access.signedIn) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${PORTAL_LOGIN[portal]}?next=${next}`} replace />;
  }

  if (!access.has(portal)) {
    const copy = COPY[portal];
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-muted/20">
        <SEO title="Access restricted" description="Access restricted." noindex />
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-2 h-11 w-11 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl">{copy.title}</CardTitle>
            <CardDescription>{copy.body}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {copy.primary && (
              <Button asChild><Link to={copy.primary.to}>{copy.primary.label}</Link></Button>
            )}
            <Button variant="outline" asChild><Link to={copy.secondary.to}>{copy.secondary.label}</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
