import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, Globe } from "lucide-react";
import { toast } from "sonner";

export default function AdminTrustedDomains() {
  const [domains, setDomains] = useState<{ id: string; domain: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("auto_approve_domains").select("*").order("created_at", { ascending: false });
    if (error) { toast.error("Failed to load trusted domains"); console.error(error); }
    else setDomains((data as any[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDomains(); }, [fetchDomains]);

  const addDomain = async () => {
    const domain = newDomain.trim().toLowerCase();
    if (!domain || !domain.includes(".")) { toast.error("Enter a valid domain"); return; }
    setAdding(true);
    const { error } = await supabase.from("auto_approve_domains").insert({ domain } as any);
    if (error) {
      if (error.code === "23505") toast.error("Domain already exists");
      else toast.error("Failed to add domain");
    } else {
      toast.success(`${domain} added`);
      setNewDomain("");
      fetchDomains();
    }
    setAdding(false);
  };

  const removeDomain = async (id: string) => {
    setDeleting(id);
    const { error } = await supabase.from("auto_approve_domains").delete().eq("id", id);
    if (error) toast.error("Failed to remove domain");
    else { toast.success("Domain removed"); setDomains((prev) => prev.filter((d) => d.id !== id)); }
    setDeleting(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Trusted Domains</h1>
        <p className="text-sm text-muted-foreground mt-1">Users from these domains are auto-approved on signup</p>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" /> Auto-Approve Domains
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Input placeholder="e.g. company.com" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addDomain()} className="max-w-xs" />
            <Button onClick={addDomain} disabled={adding} size="sm">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />} Add Domain
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : domains.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No trusted domains configured.</p>
          ) : (
            <div className="space-y-2">
              {domains.map((d) => (
                <div key={d.id} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-md">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="font-mono text-sm text-foreground">@{d.domain}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0" disabled={deleting === d.id} onClick={() => removeDomain(d.id)}>
                    {deleting === d.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
