import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Handshake, Clock } from "lucide-react";
import { ensureAuthAccount } from "@/lib/portalAccounts";

export const PENDING_PARTNER_KEY = "worldaml_pending_partner_application";

type PartnerType = "referral" | "affiliate" | "reseller" | "technology";

const PARTNER_TYPES: { value: PartnerType; label: string }[] = [
  { value: "referral", label: "Referral Partner" },
  { value: "affiliate", label: "Affiliate Partner" },
  { value: "reseller", label: "Reseller" },
  { value: "technology", label: "Technology Partner" },
];

export default function PartnerSignup() {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [partnerType, setPartnerType] = useState<PartnerType>("referral");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState<null | "pending-review" | "confirm-email">(null);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const prefillEmail = searchParams.get("email");
  if (prefillEmail && !email) setEmail(prefillEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (!companyName.trim() || !email.trim()) {
      toast({ title: "Company name and email are required", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const application = {
      company_name: companyName.trim(),
      contact_name: contactName.trim() || null,
      contact_email: email.trim(),
      contact_phone: phone.trim() || null,
      country: country.trim() || null,
      website: website.trim() || null,
      partner_type: partnerType,
      description: description.trim() || null,
    };

    const result = await ensureAuthAccount(email, password, {
      full_name: contactName.trim() || companyName.trim(),
      company_name: companyName.trim(),
      account_type: "partner",
    });

    if (result.error) {
      setIsLoading(false);
      toast({ title: "Sign-up failed", description: result.error, variant: "destructive" });
      return;
    }

    if (!result.userId) {
      // Confirmation pending — the application is applied at first sign-in.
      localStorage.setItem(PENDING_PARTNER_KEY, JSON.stringify(application));
      setIsLoading(false);
      setSubmitted("confirm-email");
      return;
    }

    const { error } = await supabase
      .from("partner_applications")
      .insert({ ...application, user_id: result.userId });

    setIsLoading(false);

    if (error) {
      toast({ title: "Could not submit application", description: error.message, variant: "destructive" });
      return;
    }

    localStorage.removeItem(PENDING_PARTNER_KEY);
    // Partner access is only granted once an administrator approves the record.
    await supabase.auth.signOut();
    setSubmitted("pending-review");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Partner Sign Up" description="Apply for a WorldAML Partner Portal account. Partner access is activated after review by the WorldAML partner team." noindex />
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16 bg-muted/20">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <div className="mx-auto mb-3 h-11 w-11 rounded-xl bg-navy/10 text-navy flex items-center justify-center">
              <Handshake className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl text-center">Create a partner account</CardTitle>
            <CardDescription className="text-center">
              Anyone can apply. Partner Portal access is unlocked once the WorldAML team approves your application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto h-11 w-11 rounded-full bg-teal/10 text-teal flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {submitted === "pending-review" ? (
                    <>Thanks — your partner application for <strong>{companyName}</strong> is pending approval. We'll email <strong>{email}</strong> as soon as an administrator activates your Partner Portal access.</>
                  ) : (
                    <>Confirm your email <strong>{email}</strong> first. Your partner application is submitted the first time you sign in, and then goes to the WorldAML team for approval.</>
                  )}
                </p>
                <Button asChild variant="outline"><Link to="/partner/login">Go to partner sign-in</Link></Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required />
                  <p className="text-xs text-muted-foreground">
                    Already have a WorldAML Academy or business account? Use the same email and password to add a partner profile.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} maxLength={80} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} maxLength={200} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Partnership type</Label>
                    <Select value={partnerType} onValueChange={(v) => setPartnerType(v as PartnerType)}>
                      <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PARTNER_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Tell us about your business</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={3} />
                </div>
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
                <Button type="submit" className="w-full" variant="accent" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit partner application
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Already approved? <Link to="/partner/login" className="text-teal hover:underline">Partner sign in</Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
