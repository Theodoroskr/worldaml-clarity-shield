import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Cross-portal 360° view for a single person. Every figure is read live from
 * the real records through the `admin_user_360` function — no admin-only copy.
 */
export default function User360Panel({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-user-360", userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_user_360" as any, { _user_id: userId });
      if (error) throw error;
      return data as any;
    },
    staleTime: 30_000,
  });

  if (isLoading) return <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  if (error) return <p className="text-sm text-destructive">Could not load the 360° view.</p>;
  if (!data) return null;

  const eur = (cents: number) => `€${((cents ?? 0) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  const acq = data.acquisition ?? {};
  const com = data.commercial ?? {};
  const timeline: any[] = data.timeline ?? [];

  const stats = [
    { label: "Academy gross", value: eur(com.academy_gross_cents) },
    { label: "Refunded", value: eur(com.academy_refunded_cents) },
    { label: "Net", value: eur((com.academy_gross_cents ?? 0) - (com.academy_refunded_cents ?? 0)) },
    { label: "Paid orders", value: String(com.paid_orders ?? 0) },
    { label: "Certificates", value: String((data.academy?.certificates ?? []).length) },
    { label: "Suite screenings", value: String(data.suite?.screenings ?? 0) },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-3">
              <div className="text-[11px] text-muted-foreground">{s.label}</div>
              <div className="text-base font-semibold text-foreground">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 space-y-1 text-sm">
            <div className="font-semibold text-foreground mb-1">Acquisition (first touch)</div>
            <Row label="Source" value={acq.signup_source} />
            <Row label="UTM" value={acq.signup_utm ? JSON.stringify(acq.signup_utm) : null} />
            <Row label="Landing page" value={acq.signup_landing_path} />
            <Row label="Referrer" value={acq.signup_referrer} />
            <Row label="Signed up" value={acq.signup_date ? format(new Date(acq.signup_date), "d MMM yyyy") : null} />
            <Row label="Last activity" value={acq.last_activity_at ? format(new Date(acq.last_activity_at), "d MMM yyyy HH:mm") : null} />
            <Row label="Last sign-in" value={data.auth?.last_sign_in_at ? format(new Date(data.auth.last_sign_in_at), "d MMM yyyy HH:mm") : null} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2 text-sm">
            <div className="font-semibold text-foreground mb-1">Portal relationships</div>
            <div className="flex flex-wrap gap-1">
              {(data.business?.accounts ?? []).map((b: any) => (
                <Badge key={b.id} variant="outline">Business · {b.company_name}</Badge>
              ))}
              {data.partner?.partner?.id && (
                <Badge variant="outline">Partner · {data.partner.partner.display_name ?? data.partner.partner.partner_type}</Badge>
              )}
              {(data.suite?.memberships ?? []).map((m: any) => (
                <Badge key={m.organisation_id} variant="outline">Suite · {m.role}</Badge>
              ))}
              {(data.roles ?? []).map((r: string) => <Badge key={r}>{r}</Badge>)}
              {!(data.business?.accounts ?? []).length && !data.partner?.partner?.id && !(data.suite?.memberships ?? []).length && (
                <span className="text-muted-foreground">Academy only</span>
              )}
            </div>
            {data.partner?.partner?.id && (
              <div className="pt-2 space-y-1">
                <Row label="Deals" value={String((data.partner.deals ?? []).length)} />
                <Row label="Referrals" value={String(data.partner.referrals ?? 0)} />
                <Row label="Commission" value={eur(data.partner.commission_cents)} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="font-semibold text-sm text-foreground mb-2">Activity timeline</div>
        {timeline.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recorded ecosystem activity yet. Events are captured from now on.</p>
        ) : (
          <ol className="space-y-2">
            {timeline.map((e, i) => (
              <li key={i} className="flex items-start gap-3 text-sm border-l-2 border-border pl-3">
                <span className="text-xs text-muted-foreground w-32 shrink-0">
                  {format(new Date(e.occurred_at), "d MMM HH:mm")}
                </span>
                <span className="font-medium text-foreground">{e.event_type}</span>
                <Badge variant="outline" className="text-[10px]">{e.portal}</Badge>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground text-right break-all">{value || "—"}</span>
    </div>
  );
}
