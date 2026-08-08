import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, GraduationCap } from "lucide-react";
import { getAttribution, clearAttribution } from "@/lib/signupAttribution";
import { ensureAuthAccount } from "@/lib/portalAccounts";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const redirectParam = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure both password fields are identical.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const attribution = getAttribution();
    const result = await ensureAuthAccount(email, password, {
      full_name: fullName,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      signup_source: attribution.signup_source,
      signup_landing_path: attribution.signup_landing_path,
      signup_referrer: attribution.signup_referrer,
      signup_utm: attribution.signup_utm || {},
    });
    const error = result.error ? { message: result.error } : null;

    if (error) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Admin notification (non-blocking) — all users are auto-approved
      try {
        await supabase.functions.invoke("notify-new-signup", {
          body: {
            full_name: fullName,
            email,
            signed_up_at: new Date().toISOString(),
            auto_approved: true,
          },
        });
      } catch (notifyErr) {
        console.warn("Admin notification failed (non-blocking):", notifyErr);
      }

      clearAttribution();

      // If email confirmation is disabled the session is live already —
      // go straight into the Academy dashboard. Otherwise send them to
      // the Academy sign-in with the dashboard as the return path.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        toast({ title: "Welcome to WorldAML Academy", description: "Your account is ready." });
        navigate(redirectParam);
      } else {
        toast({
          title: "Account created",
          description: "Please verify your email, then sign in to enter your Academy dashboard.",
        });
        navigate(`/academy/login?redirect=${encodeURIComponent(redirectParam)}`);
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Create your WorldAML account"
        description="Join WorldAML Academy and start building your compliance expertise with expert-led AML, KYC and KYB courses."
        noindex
      />
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 h-11 w-11 rounded-lg bg-teal/10 text-teal flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl text-navy">Create your WorldAML account</CardTitle>
            <CardDescription>
              Join WorldAML Academy and start building your compliance expertise.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Smith"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
              <p className="text-xs text-text-secondary text-center">
                By creating an account you accept our <Link to="/terms" className="underline">Terms &amp; Conditions</Link> and{" "}
                <Link to="/privacy" className="underline">Privacy Notice</Link> (GDPR), and consent to receive marketing
                and product communications. You can unsubscribe any time in Dashboard → Security &amp; privacy.
              </p>
              <p className="text-xs text-text-secondary text-center">
                You can add your company, job title and country later in Dashboard → Profile.
              </p>

            </form>
            <div className="mt-6 text-center text-sm text-text-secondary">
              Already have an account?{" "}
              <Link
                to={`/academy/login?redirect=${encodeURIComponent(redirectParam)}`}
                className="text-teal hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
