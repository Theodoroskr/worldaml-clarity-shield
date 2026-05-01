import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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
          toast({
            title: "Invalid or expired link",
            description: "Please request a new password reset link.",
            variant: "destructive",
          });
          navigate("/forgot-password", { replace: true });
          return;
        }
        window.history.replaceState({}, document.title, "/reset-password");
      } else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          toast({
            title: "Invalid or expired link",
            description: "Please request a new password reset link.",
            variant: "destructive",
          });
          navigate("/forgot-password", { replace: true });
          return;
        }
        window.history.replaceState({}, document.title, "/reset-password");
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Invalid or expired link",
          description: "Please request a new password reset link.",
          variant: "destructive",
        });
        navigate("/forgot-password", { replace: true });
        return;
      }

      setIsCheckingLink(false);
    };

    validateRecoveryLink().catch(() => {
      toast({
        title: "Invalid or expired link",
        description: "Please request a new password reset link.",
        variant: "destructive",
      });
      navigate("/forgot-password", { replace: true });
    });
  }, [navigate, toast]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsCheckingLink(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setIsSuccess(true);
      toast({
        title: "Password updated",
        description: "Your password has been successfully reset.",
      });
      // Redirect to dashboard after 2 seconds
      setTimeout(() => navigate("/dashboard"), 2000);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Reset Password" description="Set a new password for your WorldAML account." noindex />
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-navy">Set New Password</CardTitle>
            <CardDescription>
              {isSuccess ? "Your password has been updated" : "Enter your new password below"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isCheckingLink ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying reset link...
              </div>
            ) : isSuccess ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-text-secondary">
                  Redirecting you to the dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
