import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Mail } from "lucide-react";

export default function AdminEnquiryDialog() {
  const [params, setParams] = useSearchParams();
  const id = params.get("enquiry");
  const { data: enquiry, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-enquiry", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("form_submissions")
        .select("id, first_name, last_name, email, company, job_title, country, industry, region, products, form_type, message, lead_status, created_at")
        .eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const close = () => {
    const next = new URLSearchParams(params);
    next.delete("enquiry");
    setParams(next);
  };

  return (
    <Dialog open={!!id} onOpenChange={(open) => { if (!open) close(); }}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enquiry details</DialogTitle>
          <DialogDescription>{enquiry ? `${enquiry.first_name} ${enquiry.last_name}${enquiry.company ? ` — ${enquiry.company}` : ""}` : "Enquiry awaiting review"}</DialogDescription>
        </DialogHeader>
        {isLoading ? <div role="status" className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /><span className="sr-only">Loading enquiry</span></div> : error ? (
          <div className="space-y-3"><p className="text-sm text-destructive">Could not load this enquiry.</p><Button variant="outline" onClick={() => refetch()}>Try again</Button></div>
        ) : !enquiry ? <p className="text-sm text-muted-foreground">This enquiry is no longer available.</p> : (
          <div className="space-y-5">
            <dl className="grid grid-cols-[100px_minmax(0,1fr)] gap-x-4 gap-y-3 text-sm">
              {[
                ["Name", `${enquiry.first_name} ${enquiry.last_name}`],
                ["Company", enquiry.company], ["Email", enquiry.email],
                ["Job title", enquiry.job_title], ["Country", enquiry.country],
                ["Industry", enquiry.industry], ["Region", enquiry.region],
                ["Products", enquiry.products?.join(", ")],
                ["Form", enquiry.form_type], ["Status", enquiry.lead_status],
                ["Received", new Date(enquiry.created_at).toLocaleString()],
              ].map(([label, value]) => <div key={label} className="contents"><dt className="text-muted-foreground">{label}</dt><dd className="break-words text-foreground">{value || "—"}</dd></div>)}
            </dl>
            <section className="border-t border-border pt-4"><h3 className="text-sm font-semibold mb-2">Message</h3><p className="text-sm whitespace-pre-wrap break-words text-foreground">{enquiry.message || "No message provided."}</p></section>
            {enquiry.email && <Button asChild><a href={`mailto:${enquiry.email}`}><Mail className="mr-2 h-4 w-4" />Email enquirer</a></Button>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}