import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import DataFreshness from "@/components/admin/DataFreshness";

interface Group {
  key: string;
  title: string;
  description: string;
  path?: string;
  columns: { key: string; label: string }[];
}

const GROUPS: Group[] = [
  {
    key: "stale_pending_payments",
    title: "Checkouts stuck in pending",
    description: "Started more than 2 hours ago and never confirmed as paid.",
    path: "/admin/reconcile-purchases",
    columns: [
      { key: "course_slug", label: "Course" },
      { key: "amount_cents", label: "Amount (cents)" },
      { key: "created_at", label: "Started" },
    ],
  },
  {
    key: "purchases_without_user",
    title: "Purchases with no matching profile",
    description: "Orders whose buyer profile cannot be found.",
    path: "/admin/purchase-status",
    columns: [
      { key: "course_slug", label: "Course" },
      { key: "created_at", label: "Created" },
    ],
  },
  {
    key: "approved_apps_without_partner",
    title: "Approved applications without a partner record",
    description: "Approved applicants who were never activated in the Partner Programme.",
    path: "/admin/partners",
    columns: [
      { key: "company_name", label: "Company" },
      { key: "contact_email", label: "Contact" },
    ],
  },
  {
    key: "portal_access_without_partner_record",
    title: "Portal access on inactive partners",
    description: "Partners with portal access enabled while marked inactive.",
    path: "/admin/partners",
    columns: [{ key: "display_name", label: "Partner" }],
  },
  {
    key: "orphaned_business_members",
    title: "Business members without an account",
    description: "Memberships pointing at a business account that no longer exists.",
    path: "/admin/business",
    columns: [{ key: "user_id", label: "User" }],
  },
  {
    key: "duplicate_identities",
    title: "Duplicate identities",
    description: "The same email address appears on more than one profile.",
    path: "/admin/users",
    columns: [
      { key: "email", label: "Email" },
      { key: "profiles", label: "Profiles" },
    ],
  },
];

export default function AdminDataQuality() {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, refetch, dataUpdatedAt, error } = useQuery({
    queryKey: ["admin-data-quality"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_data_quality" as any);
      if (error) throw error;
      return data as Record<string, any>;
    },
    staleTime: 60_000,
  });

  const total = data
    ? GROUPS.reduce((sum, g) => sum + ((data[g.key] as any[])?.length ?? 0), 0)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data quality</h1>
          <p className="text-sm text-muted-foreground">
            Inconsistencies detected directly against the live ecosystem records.
          </p>
        </div>
        <DataFreshness updatedAt={dataUpdatedAt} refreshing={isFetching} onRefresh={() => refetch()} />
      </div>

      {error && <p className="text-sm text-destructive">Could not run the data quality checks.</p>}

      {isLoading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 w-full" />)}</div>
      ) : (
        <>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Badge variant={total ? "destructive" : "secondary"}>{total}</Badge>
              <span className="text-sm text-muted-foreground">
                {total ? "records need attention" : "No inconsistencies found"}
              </span>
              {data?.generated_at && (
                <span className="ml-auto text-xs text-muted-foreground">
                  Checked {format(new Date(data.generated_at), "d MMM yyyy HH:mm")}
                </span>
              )}
            </CardContent>
          </Card>

          {GROUPS.map((g) => {
            const rows: any[] = data?.[g.key] ?? [];
            return (
              <Card key={g.key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    {g.title}
                    <Badge variant={rows.length ? "destructive" : "secondary"}>{rows.length}</Badge>
                    {g.path && rows.length > 0 && (
                      <Button variant="ghost" size="sm" className="ml-auto" onClick={() => navigate(g.path!)}>
                        Resolve
                      </Button>
                    )}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{g.description}</p>
                </CardHeader>
                <CardContent>
                  {rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Clean.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-muted-foreground border-b border-border">
                            {g.columns.map((c) => <th key={c.key} className="py-2 pr-4">{c.label}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r, i) => (
                            <tr key={i} className="border-b border-border/50">
                              {g.columns.map((c) => (
                                <td key={c.key} className="py-2 pr-4 text-foreground">
                                  {c.key.endsWith("_at") && r[c.key]
                                    ? format(new Date(r[c.key]), "d MMM yyyy HH:mm")
                                    : String(r[c.key] ?? "—")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
}
