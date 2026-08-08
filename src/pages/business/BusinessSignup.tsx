import { useEffect, useMemo, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2, Check } from "lucide-react";
import { ensureAuthAccount, isWorkEmail } from "@/lib/portalAccounts";
import { useBusinessAccount } from "@/hooks/useBusinessAccount";

export const PENDING_BUSINESS_KEY = "worldaml_pending_business_account";

const INDUSTRIES = [
  "Banking", "Payments / Fintech", "Crypto / VASP", "iGaming", "Insurance",
  "Corporate Services / TCSP", "Legal", "Accounting / Audit", "Real Estate", "Other",
];

export default function BusinessSignup() {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [industry, setIndustry] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const { account, isLoading: accountLoading, refetch } = useBusinessAccount();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const next = searchParams.get("next") || "/business/dashboard";

  /**
   * Someone who is already signed in (Academy/Partner identity, or a buyer whose
   * company record never got created) only needs the company details — not a new
   * password. We show a short "activate" form instead of bouncing them around.
   */
  const activateMode = !authLoading && !!user && !accountLoading && !account;

  // Prefill from the signed-in identity.
  useEffect(() => {
    if (!user) return;
    setEmail((v) => v || user.email || "");
    const meta = (user.user_metadata || {}) as Record<string, string>;
    setContactName((v) => v || meta.full_name || "");
    setCompanyName((v) => v || meta.company_name || "");
  }, [user]);

  // Already has a workspace — never show a sign-up form to them.
  useEffect(() => {
    if (account) navigate(next, { replace: true });
  }, [account, navigate, next]);

  const pendingRestore = useMemo(() => {
    try {
      const raw = localStorage.getItem(PENDING_BUSINESS_KEY);
      return raw ? (JSON.parse(raw) as Record<string, string | null>) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!pendingRestore) return;
    setCompanyName((v) => v || pendingRestore.company_name || "");
    setContactName((v) => v || pendingRestore.contact_name || "");
    setCountry((v) => v || pendingRestore.country || "");
    setPhone((v) => v || pendingRestore.phone || "");
    setIndustry((v) => v || pendingRestore.industry || "");
  }, [pendingRestore]);

  /** Create the company record for an identity that is already authenticated. */
  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!companyName.trim()) {
      toast({ title: "Company name is required", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.from("business_accounts").insert({
      user_id: user.id,
      company_name: companyName.trim(),
      work_email: (email || user.email || "").trim(),
      contact_name: contactName.trim() || null,
      country: country.trim() || null,
      industry: industry || null,
      phone: phone.trim() || null,
    });
    if (error) {
      setIsLoading(false);
      toast({ title: "Could not create your business workspace", description: error.message, variant: "destructive" });
      return;
    }
    try {
      await supabase.functions.invoke("send-business-welcome", {
        body: { company_name: companyName.trim(), contact_name: contactName.trim() || null },
      });
    } catch (mailErr) {
      console.warn("Welcome email failed (non-blocking):", mailErr);
    }
    localStorage.removeItem(PENDING_BUSINESS_KEY);
    await refetch();
    setIsLoading(false);
    toast({ title: "Business workspace ready", description: "Welcome to WorldAML Business." });
    navigate(next, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (!companyName.trim() || !email.trim()) {
      toast({ title: "Company name and work email are required", variant: "destructive" });
      return;
    }
    if (!isWorkEmail(email)) {
      toast({
        title: "Use a company email address",
        description: "Business accounts require a work email — free or disposable providers aren't accepted.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const payload = {
      company_name: companyName.trim(),
      work_email: email.trim(),
      contact_name: contactName.trim() || null,
      country: country.trim() || null,
      industry: industry || null,
      phone: phone.trim() || null,
    };

    const result = await ensureAuthAccount(email, password, {
      full_name: contactName.trim() || companyName.trim(),
      company_name: companyName.trim(),
      account_type: "business",
    });

    if (result.error) {
      setIsLoading(false);
      toast({ title: "Sign-up failed", description: result.error, variant: "destructive" });
      return;
    }

    const uid = result.userId;

    if (uid) {
      const { data: existing } = await supabase
        .from("business_accounts").select("id").eq("user_id", uid).maybeSingle();
      let created = false;
      if (!existing) {
        const { error: insertError } = await supabase
          .from("business_accounts")
          .insert({ ...payload, user_id: uid });
        if (insertError) {
          setIsLoading(false);
          toast({ title: "Could not save company details", description: insertError.message, variant: "destructive" });
          return;
        }
        created = true;
      }
      if (created) {
        try {
          await supabase.functions.invoke("send-business-welcome", {
            body: { company_name: payload.company_name, contact_name: payload.contact_name },
          });
        } catch (mailErr) {
          console.warn("Welcome email failed (non-blocking):", mailErr);
        }
      }
      setIsLoading(false);
      localStorage.removeItem(PENDING_BUSINESS_KEY);
      toast({
        title: result.existingIdentity ? "Business profile added" : "Business account created",
        description: result.existingIdentity
          ? "Your existing WorldAML sign-in now also opens the business portal."
          : "Welcome to WorldAML.",
      });
      navigate(next);
      return;
    }


    // Email confirmation pending — finish account creation on first sign-in.
    localStorage.setItem(PENDING_BUSINESS_KEY, JSON.stringify(payload));
    setIsLoading(false);
    setEmailSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Create a Business Account" description="Create a WorldAML business account to buy WorldAML API, WorldID and LexisNexis screening data." noindex />
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16 bg-muted/20">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <div className="mx-auto mb-3 h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl text-center">
              {activateMode ? "Set up your business workspace" : "Create a business account"}
            </CardTitle>
            <CardDescription className="text-center">
              {activateMode
                ? "You're signed in — just confirm your company details to open the business portal."
                : "For companies and individuals buying WorldAML products. Academy learners and partners have their own portals."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto h-11 w-11 rounded-full bg-teal/10 text-teal flex items-center justify-center">
                  <Check className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Check your inbox to confirm <strong>{email}</strong>. Your company details will be applied when you sign in.
                </p>
                <Button asChild variant="outline"><Link to="/business/login">Go to business sign-in</Link></Button>
              </div>
            ) : (
              <form onSubmit={activateMode ? handleActivate : handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company name *</Label>
                    <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} maxLength={120} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Your name</Label>
                    <Input id="contact" value={contactName} onChange={(e) => setContactName(e.target.value)} maxLength={120} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Work email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={255}
                    required
                    disabled={activateMode}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} maxLength={80} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger id="industry"><SelectValue placeholder="Select industry" /></SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} />
                </div>
                {!activateMode && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm password *</Label>
                    <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} required />
                  </div>
                </div>
                )}
                <Button type="submit" className="w-full" variant="accent" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {activateMode ? "Open my business portal" : "Create business account"}
                </Button>
                {!activateMode && (
                  <p className="text-center text-sm text-muted-foreground">
                    Already have one? <Link to="/business/login" className="text-teal hover:underline">Sign in</Link>
                  </p>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
