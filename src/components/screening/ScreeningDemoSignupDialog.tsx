import { useState } from "react";
import { Loader2, MailCheck, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { isWorkEmail, WORK_EMAIL_ERROR } from "@/lib/workEmail";

const schema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email address").max(255)
    .refine((v) => isWorkEmail(v), WORK_EMAIL_ERROR),
  company: z.string().trim().min(2, "Please enter your company name").max(160),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Name / company typed into the hero quick check — becomes the first screening. */
  query?: string;
}

/**
 * Registration prompt shown when a visitor uses the hero quick check.
 * Business email + company are required; the activation email verifies the
 * address and drops the user into the screening workspace with 5 free searches.
 */
export function ScreeningDemoSignupDialog({ open, onOpenChange, query }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const reset = () => {
    setErrors({});
    setSent(false);
    setSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ fullName, email, company, country, password });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, value] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (value?.[0]) fieldErrors[key] = value[0];
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    const target = new URL(`${window.location.origin}/screening`);
    target.searchParams.set("demo", "1");
    if (query?.trim()) target.searchParams.set("q", query.trim());

    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: target.toString(),
        data: {
          full_name: parsed.data.fullName,
          company_name: parsed.data.company,
          country: parsed.data.country || null,
          demo_intent: "screening",
          signup_source: "hero_quick_check",
        },
      },
    });

    setSubmitting(false);

    if (error) {
      setErrors({ form: error.message });
      return;
    }

    const { data } = await supabase.auth.getSession();
    // Always confirm on screen; the activation / welcome email is sent either
    // by auth (confirmation link) or by claim-screening-demo (welcome email).
    setActivationUrl(target.toString());
    setSignedIn(Boolean(data.session));
    setSent(true);
  };


  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        {sent ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MailCheck className="h-5 w-5 text-teal" /> Check your email to activate
              </DialogTitle>
              <DialogDescription>
                We sent an activation link to <span className="font-medium">{email}</span>. Open it to
                verify your business email — your account then opens with 5 free screening searches
                {query?.trim() ? <> and “{query.trim()}” ready to screen</> : null}.
              </DialogDescription>
            </DialogHeader>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-teal" /> Register for 5 free screenings
              </DialogTitle>
              <DialogDescription>
                Register with your business email to screen {query?.trim() ? <>“{query.trim()}”</> : "your subject"} against
                1,900+ global sanctions, PEP and watchlist sources. No card required.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="demo-name">Full name</Label>
                <Input id="demo-name" value={fullName} maxLength={120}
                  onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="demo-email">Business email</Label>
                <Input id="demo-email" type="email" value={email} maxLength={255}
                  onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="demo-company">Company</Label>
                <Input id="demo-company" value={company} maxLength={160}
                  onChange={(e) => setCompany(e.target.value)} autoComplete="organization" />
                {errors.company && <p className="text-xs text-destructive">{errors.company}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="demo-country">Country <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="demo-country" value={country} maxLength={80}
                  onChange={(e) => setCountry(e.target.value)} autoComplete="country-name" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="demo-password">Password</Label>
                <Input id="demo-password" type="password" value={password} maxLength={128}
                  onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating your account…</>
                  : "Create account & activate 5 screenings"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Free providers (Gmail, Outlook, Yahoo) are not accepted. One demo per organisation.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ScreeningDemoSignupDialog;
