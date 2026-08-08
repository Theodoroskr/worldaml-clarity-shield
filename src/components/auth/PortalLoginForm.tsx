import { useEffect, useState, ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { PortalKey, PORTAL_HOME } from "@/hooks/usePortalAccess";

import { PENDING_PARTNER_KEY } from "@/pages/partner/PartnerSignup";

/** Applies a partner application captured before e-mail confirmation. */
async function flushPendingPartnerApplication(userId: string) {
  const pending = localStorage.getItem(PENDING_PARTNER_KEY);
  if (!pending) return;
  try {
    const application = JSON.parse(pending);
    const { data: existing } = await supabase
      .from("partner_applications").select("id").eq("user_id", userId).maybeSingle();
    if (!existing) {
      await supabase.from("partner_applications").insert({ ...application, user_id: userId });
    }
    localStorage.removeItem(PENDING_PARTNER_KEY);
  } catch { /* ignore */ }
}

async function resolveAccess(portal: PortalKey, userId: string): Promise<boolean> {
  if (portal === "admin") {
    const { data } = await supabase
      .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    return !!data;
  }
  if (portal === "partner") {
    await flushPendingPartnerApplication(userId);
    const { data } = await supabase
      .from("partners").select("is_active").eq("user_id", userId).maybeSingle();
    return !!data?.is_active;
  }
  const { data } = await supabase
    .from("profiles").select("status").eq("user_id", userId).maybeSingle();
  return (data as { status?: string } | null)?.status !== "rejected";
}

/** Partner-specific denial copy based on where the application stands. */
async function partnerDenialCopy(userId: string): Promise<string> {
  const { data } = await supabase
    .from("partner_applications").select("status").eq("user_id", userId)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  const status = (data as { status?: string } | null)?.status;
  if (status === "pending") {
    return "Your partner application is awaiting approval from the WorldAML team. You'll be emailed as soon as your Partner Portal access is activated.";
  }
  if (status === "rejected") {
    return "Your partner application was not approved. Contact partners@worldaml.com if you'd like this reviewed again.";
  }
  return "You don't have a partner profile yet. Apply for the Partner Programme to get access — your Academy or business sign-in stays unchanged.";
}


const NO_ACCESS_COPY: Record<PortalKey, string> = {
  academy: "Your account does not currently have Academy access.",
  partner: "Your account does not currently have access to the WorldAML Partner Portal.",
  admin: "This account is not authorised for internal access.",
};

interface Props {
  portal: PortalKey;
  title: string;
  subtitle: string;
  icon?: ReactNode;
  footer?: ReactNode;
  accent?: string;
}

/**
 * Shared secure sign-in form. One authentication backend, portal-specific UX,
 * portal-specific entitlement check before redirect.
 */
export default function PortalLoginForm({ portal, title, subtitle, icon, footer, accent = "text-teal" }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [denied, setDenied] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Remember portal context for the password-reset round trip.
  useEffect(() => {
    try { localStorage.setItem("worldaml_portal_context", portal); } catch { /* ignore */ }
  }, [portal]);

  const nextParam = searchParams.get("next") || searchParams.get("redirect");
  const safeNext = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setDenied(null);

    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    const uid = authData.user?.id;
    if (!uid) {
      setDenied("We could not verify your session. Please try again.");
      setIsLoading(false);
      return;
    }

    const allowed = await resolveAccess(portal, uid);
    if (!allowed) {
      setDenied(portal === "partner" ? await partnerDenialCopy(uid) : NO_ACCESS_COPY[portal]);
      setIsLoading(false);
      return;
    }

    navigate(safeNext || PORTAL_HOME[portal], { replace: true });
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        {icon && <div className="mx-auto mb-2">{icon}</div>}
        <CardTitle className="text-2xl text-navy">{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        {denied && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {denied}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="you@company.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Link to={`/forgot-password?portal=${portal}`} className={`text-sm hover:underline ${accent}`}>
            Forgot your password?
          </Link>
        </div>
        {footer && <div className="mt-6 border-t border-border pt-4 text-center text-sm text-text-secondary">{footer}</div>}
      </CardContent>
    </Card>
  );
}
