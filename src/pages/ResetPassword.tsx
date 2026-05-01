import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertTriangle, Mail, ArrowLeft } from "lucide-react";

type PageState = "checking" | "ready" | "invalid" | "success" | "resent";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pageState, setPageState] = useState<PageState>("checking");
  const [isLoading, setIsLoading] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const validateRecoveryLink = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setPageState("invalid");
          return;
        }
        window.history.replaceState({}, document.title, "/reset-password");
      } else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          setPageState("invalid");
          return;
        }
        window.history.replaceState({}, document.title, "/reset-password");
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setPageState("invalid");
        return;
      }

      setPageState("ready");
    };

    validateRecoveryLink().catch(() => {
      setPageState("invalid");
    });
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setPageState("ready");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please make sure both passwords are the same.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters long.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setPageState("success");
      toast({ title: "Password updated", description: "Your password has been successfully reset." });
      setTimeout(() => navigate("/dashboard"), 2000);
    }
    setIsLoading(false);
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResending(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resendEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setPageState("resent");
      toast({ title: "Email sent", description: "Check your inbox for a new reset link." });
    }
    setIsResending(false);
  };

  const renderContent = () => {
    switch (pageState) {
      case "checking":
        return (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying reset link…
          </div>
        );

      case "invalid":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <p className="text-sm text-muted-foreground">
                This reset link is invalid or has expired. Enter your email below
                and we'll send you a fresh one.
              </p>
            </div>
            <form onSubmit={handleResend} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resend-email">Email</Label>
                <Input
                  id="resend-email"
                  type="email"
                  placeholder="you@company.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isResending}>
                {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send New Reset Link
              </Button>
            </form>
          </div>
        );

      case "resent":
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-teal" />
            </div>
            <p className="text-sm text-muted-foreground">
              We've sent a new password reset link to <strong>{resendEmail}</strong>.
              Please check your inbox and spam folder.
            </p>
            <Button variant="outline" className="w-full" onClick={() => { setResendEmail(""); setPageState("invalid"); }}>
              Try a different email
            </Button>
          </div>
        );

      case "success":
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm text-text-secondary">Redirecting you to the dashboard…</p>
          </div>
        );

      case "ready":
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        );
    }
  };

  const cardTitle = pageState === "invalid" ? "Link Expired" : pageState === "resent" ? "Check Your Email" : pageState === "success" ? "Password Updated" : "Set New Password";
  const cardDesc = pageState === "invalid" ? "Request a new password reset link" : pageState === "resent" ? "A new link is on its way" : pageState === "success" ? "Your password has been updated" : "Enter your new password below";

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Reset Password" description="Set a new password for your WorldAML account." noindex />
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-navy">{cardTitle}</CardTitle>
            <CardDescription>{cardDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
            {(pageState === "invalid" || pageState === "resent") && (
              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-teal hover:underline font-medium inline-flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
