import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { FileText, Upload, Download } from "lucide-react";
import { usePortalSession } from "@/hooks/usePortalSession";
import { cn } from "@/lib/utils";

interface Doc {
  id: string;
  document_type: string;
  document_label: string | null;
  file_path: string;
  file_name: string;
  issued_on: string | null;
  expires_on: string | null;
  status: string;
  rerequest_message: string | null;
  rerequest_due: string | null;
  organisation_id: string;
  customer_id: string;
}

const badge = (s: string) => {
  switch (s) {
    case "valid": return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
    case "expiring_soon": return "bg-amber-500/15 text-amber-500 border-amber-500/30";
    case "expired": return "bg-red-500/15 text-red-500 border-red-500/30";
    case "rerequested": return "bg-blue-500/15 text-blue-500 border-blue-500/30";
    case "pending_review": return "bg-purple-500/15 text-purple-400 border-purple-500/30";
    case "replaced": case "archived": return "bg-slate-500/15 text-slate-400 border-slate-500/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const label = (s: string) => s === "pending_review" ? "awaiting review" : s.replace("_", " ");

export default function PortalDocuments() {
  const s = usePortalSession();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [replaceDoc, setReplaceDoc] = useState<Doc | null>(null);

  const load = useCallback(async () => {
    if (!s.customerId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("suite_customer_documents")
      .select("id, document_type, document_label, file_path, file_name, issued_on, expires_on, status, rerequest_message, rerequest_due, organisation_id, customer_id")
      .eq("customer_id", s.customerId)
      .neq("status", "archived")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    setDocs((data as Doc[]) ?? []);
    setLoading(false);
  }, [s.customerId]);

  useEffect(() => { load(); }, [load]);

  async function download(d: Doc) {
    const { data, error } = await supabase.storage.from("customer-documents").createSignedUrl(d.file_path, 60);
    if (error || !data?.signedUrl) return toast({ title: "Download failed", variant: "destructive" });
    window.open(data.signedUrl, "_blank");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-accent" />
        <h1 className="text-xl font-semibold">Your documents</h1>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : docs.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No documents on file yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Document</th>
                  <th className="text-left p-3">Expires</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-right p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => {
                  const canReplace = ["expired", "expiring_soon", "rerequested"].includes(d.status);
                  return (
                    <tr key={d.id} className="border-t border-border/50">
                      <td className="p-3">
                        <div className="font-medium">{d.document_label || d.document_type}</div>
                        <div className="text-xs text-muted-foreground">{d.file_name}</div>
                        {d.rerequest_message && d.status === "rerequested" && (
                          <div className="mt-1 text-xs bg-blue-500/5 border border-blue-500/20 rounded p-2 whitespace-pre-wrap max-w-md">
                            {d.rerequest_message}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-xs">
                        {d.expires_on ?? "—"}
                        {d.rerequest_due && <div className="text-[11px] text-muted-foreground">due {d.rerequest_due}</div>}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className={cn("border", badge(d.status))}>{label(d.status)}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => download(d)}>
                            <Download className="w-4 h-4" />
                          </Button>
                          {canReplace && (
                            <Button size="sm" onClick={() => setReplaceDoc(d)}>
                              <Upload className="w-4 h-4 mr-1" /> Upload replacement
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {replaceDoc && (
        <ReplaceDialog
          doc={replaceDoc}
          onClose={() => setReplaceDoc(null)}
          onDone={() => { setReplaceDoc(null); load(); }}
        />
      )}
    </div>
  );
}

function ReplaceDialog({ doc, onClose, onDone }: { doc: Doc; onClose: () => void; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [issuedOn, setIssuedOn] = useState("");
  const [expiresOn, setExpiresOn] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!file) return toast({ title: "Select a file", variant: "destructive" });
    if (file.size > 20 * 1024 * 1024) return toast({ title: "File too large (max 20 MB)", variant: "destructive" });
    setSaving(true);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `customers/${doc.organisation_id}/${doc.customer_id}/portal/${Date.now()}-${Math.random().toString(16).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("customer-documents")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      const { error } = await supabase.rpc("portal_submit_document" as never, {
        _replaces_id: doc.id,
        _file_path: path,
        _file_name: file.name,
        _mime_type: file.type,
        _size_bytes: file.size,
        _issued_on: issuedOn || null,
        _expires_on: expiresOn || null,
        _notes: notes || null,
      } as never);
      if (error) throw error;

      toast({ title: "Uploaded", description: "The compliance team will review your document shortly." });
      onDone();
    } catch (e) {
      toast({ title: "Upload failed", description: (e as Error).message, variant: "destructive" });
    } finally { setSaving(false); }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload replacement</DialogTitle>
          <DialogDescription>{doc.document_label || doc.document_type}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>File</Label>
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <p className="text-xs text-muted-foreground mt-1">PDF, image or Office file, up to 20 MB.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Issued on</Label>
              <Input type="date" value={issuedOn} onChange={(e) => setIssuedOn(e.target.value)} />
            </div>
            <div>
              <Label>Expires on</Label>
              <Input type="date" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Uploading…" : "Submit for review"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
