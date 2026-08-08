import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Check, ArrowRight, Loader2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useBusinessWorkspace } from "@/hooks/useBusinessWorkspace";
import { usePortalAccess } from "@/hooks/usePortalAccess";

const OFFERS = [
  {
    title: "Individual courses for team members",
    price: "From €29",
    body: "Buy specific AML, sanctions or financial crime courses for named employees.",
    features: ["Per-course purchase", "Certificate on completion", "CPD hours recorded"],
    cta: { label: "Browse courses", to: "/academy" },
  },
  {
    title: "Annual Academy access",
    price: null,
    body: "Full course library access for a learner for 12 months.",
    features: ["Complete course library", "All certificates included", "Renews annually"],
    cta: null,
  },
  {
    title: "Team access",
    price: null,
    body: "Multiple seats for your organisation, priced on the volume you need.",
    features: ["Seats assigned to employees", "Central invoicing", "Per-learner progress"],
    cta: null,
  },
];

export default function BusinessTraining() {
  const { account, track } = useBusinessWorkspace();
  const { academyAccess } = usePortalAccess();
  const { user } = useAuth();
  const { toast } = useToast();
  const [seats, setSeats] = useState("10");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => { track("academy_business_viewed"); }, [track]);

  const submit = async () => {
    if (!user || !account) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("business_quote_requests").insert({
        business_account_id: account.id,
        user_id: user.id,
        product: "WorldAML Academy for Business",
        plan: "Team access",
        seats: Number(seats) || null,
        message,
      });
      if (error) throw error;
      track("academy_business_enquiry", "academy", { seats });
      setSent(true);
      toast({ title: "Request sent", description: "Our team will come back to you with team pricing." });
    } catch (e) {
      toast({ title: "Could not send request", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="rounded-xl bg-navy text-primary-foreground px-6 py-7">
        <div className="flex items-start gap-3">
          <GraduationCap className="w-6 h-6 text-teal mt-1 shrink-0" />
          <div>
            <p className="text-xs uppercase tracking-wider text-teal">WorldAML Academy for Business</p>
            <h1 className="mt-1 text-2xl font-bold">Strengthen your team's compliance knowledge</h1>
            <p className="mt-1.5 text-sm text-primary-foreground/75 max-w-2xl">
              Give your team access to practical AML and financial crime compliance training through WorldAML Academy.
            </p>
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        {OFFERS.map((o) => (
          <Card key={o.title} className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{o.title}</CardTitle>
              <p className="text-sm">
                {o.price
                  ? <span className="text-lg font-bold text-foreground">{o.price}</span>
                  : <span className="text-muted-foreground">Pricing on request</span>}
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">{o.body}</p>
              <ul className="space-y-1.5">
                {o.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-teal shrink-0 mt-1" />{f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-2">
                {o.cta ? (
                  <Button asChild variant="accent" className="w-full"><Link to={o.cta.to}>{o.cta.label}</Link></Button>
                ) : (
                  <Button asChild variant="outline" className="w-full">
                    <a href="#team-access">Request team access</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">What your team gets</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-2">
          {["Structured employee training", "Professional development and CPD hours", "Compliance awareness across teams",
            "Course access on demand", "Verifiable certificates per learner", "Individual learner progress tracking"].map((b) => (
              <p key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="w-3.5 h-3.5 text-teal shrink-0 mt-1" />{b}
              </p>
            ))}
        </CardContent>
      </Card>

      {academyAccess && (
        <Card className="border-teal/30 bg-teal/[0.04]">
          <CardContent className="py-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground">Academy access</p>
              <p className="text-sm text-muted-foreground">Your personal learning lives in the Academy learner dashboard.</p>
            </div>
            <Button asChild variant="accent"><Link to="/dashboard">Go to My Learning <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </CardContent>
        </Card>
      )}

      <Card id="team-access" className="scroll-mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4 text-teal" /> Request team access</CardTitle>
          <p className="text-sm text-muted-foreground">
            Seat-based self-service checkout is not yet available. Tell us how many seats you need and we'll price it for you.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 max-w-xl">
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-muted-foreground">Company</p><p className="text-foreground">{account?.company_name}</p></div>
            <div><p className="text-xs text-muted-foreground">Contact</p><p className="text-foreground">{account?.contact_name || account?.work_email}</p></div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="seats">Academy seats required</Label>
            <Input id="seats" type="number" min={1} value={seats} onChange={(e) => setSeats(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="msg">Training requirements</Label>
            <Textarea id="msg" rows={4} placeholder="Roles to train, jurisdictions, timelines…"
              value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <Button onClick={submit} disabled={saving || sent} variant="accent">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {sent ? "Request sent" : "Request Team Access"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
