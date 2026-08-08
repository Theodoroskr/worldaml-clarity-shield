import { useEffect, useState } from "react";
import { Loader2, MailCheck, MailX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Shared marketing communications preference card.
 * Used across Academy, Business and Partner dashboards so every user can
 * unsubscribe from marketing communications at any time (GDPR Art. 21).
 */
export default function MarketingPreferences() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subscribed, setSubscribed] = useState(true);
  const [consentAt, setConsentAt] = useState<string | null>(null);
  const [optOutAt, setOptOutAt] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("profiles")
        .select("marketing_consent, marketing_consent_at, marketing_opt_out_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setSubscribed(!!data.marketing_consent && !data.marketing_opt_out_at);
        setConsentAt(data.marketing_consent_at);
        setOptOutAt(data.marketing_opt_out_at);
      }
      setLoading(false);
    })();
  }, []);

  const toggle = async (next: boolean) => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const now = new Date().toISOString();
    const patch = next
      ? { marketing_consent: true, marketing_consent_at: now, marketing_opt_out_at: null }
      : { marketing_consent: false, marketing_opt_out_at: now };
    const { error } = await supabase.from("profiles").update(patch).eq("user_id", user.id);
    if (error) {
      toast({ title: "Could not save preference", description: error.message, variant: "destructive" });
    } else {
      setSubscribed(next);
      setConsentAt(next ? now : consentAt);
      setOptOutAt(next ? null : now);
      toast({
        title: next ? "Subscribed to marketing communications" : "Unsubscribed from marketing communications",
        description: next
          ? "You will receive product news, offers and Academy updates."
          : "You will still receive essential service and transactional emails.",
      });
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {subscribed ? <MailCheck className="w-4 h-4 text-teal" /> : <MailX className="w-4 h-4 text-muted-foreground" />}
          Marketing communications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="py-6 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Product news, offers and Academy updates
                </p>
                <p className="text-xs text-muted-foreground max-w-xl">
                  When you created your account you accepted our Terms, Privacy Notice and marketing communications.
                  You can withdraw that consent at any time — turn this off to unsubscribe. Essential service,
                  billing and security emails are always sent.
                </p>
              </div>
              <Switch checked={subscribed} disabled={saving} onCheckedChange={toggle} />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="outline" className={subscribed ? "bg-teal/15 text-teal border-teal/30" : ""}>
                {subscribed ? "Subscribed" : "Unsubscribed"}
              </Badge>
              {subscribed && consentAt && (
                <span className="text-xs text-muted-foreground">Consent recorded {new Date(consentAt).toLocaleDateString()}</span>
              )}
              {!subscribed && optOutAt && (
                <span className="text-xs text-muted-foreground">Opted out {new Date(optOutAt).toLocaleDateString()}</span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
