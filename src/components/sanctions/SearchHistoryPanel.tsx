import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { History, CheckCircle2, XCircle, Globe, Tag, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SearchRecord {
  id: string;
  query_name: string;
  query_country: string | null;
  query_type: string | null;
  results_count: number | null;
  created_at: string;
}

export interface SearchHistoryHandle {
  refresh: () => void;
}

export const SearchHistoryPanel = forwardRef<SearchHistoryHandle>((_, ref) => {
  const [searches, setSearches] = useState<SearchRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("sanctions_searches")
      .select("id, query_name, query_country, query_type, results_count, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    setSearches(data ?? []);
    setLoading(false);
  };

  useImperativeHandle(ref, () => ({ refresh: fetchHistory }));

  useEffect(() => { fetchHistory(); }, []);

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-navy/10 text-navy">
            <History className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Recent Searches</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">Your last 5 sanctions checks</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-border">
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : searches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No searches yet. Run your first check above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {searches.map((s) => {
              const hits = s.results_count ?? 0;
              const hasHits = hits > 0;
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg border transition-colors ${
                    hasHits
                      ? "border-destructive/20 bg-destructive/[0.02]"
                      : "border-border bg-muted/20"
                  }`}
                >
                  {/* Status icon */}
                  <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${
                    hasHits ? "bg-destructive/10" : "bg-green-50"
                  }`}>
                    {hasHits
                      ? <XCircle className="w-4 h-4 text-destructive" />
                      : <CheckCircle2 className="w-4 h-4 text-green-600" />
                    }
                  </div>

                  {/* Query details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{s.query_name}</p>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                      {s.query_type && s.query_type !== "all" && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Tag className="w-3 h-3" />
                          {s.query_type === "individual" ? "Individual" : "Company"}
                        </span>
                      )}
                      {s.query_country && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Globe className="w-3 h-3" />
                          {s.query_country}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Result badge */}
                  <div className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    hasHits
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-green-50 text-green-700 border-green-200"
                  }`}>
                  {hasHits ? `${hits} match${hits !== 1 ? "es" : ""}` : "Clear"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CardContent>
  </Card>
  );
});

SearchHistoryPanel.displayName = "SearchHistoryPanel";
