import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  partnerId: string;
  partnerName: string;
  partnerLogoUrl?: string | null;
  asset: { id: string; title: string } | null;
  onSubmitted?: () => void;
};

export default function CobrandRequestDialog({
  open,
  onOpenChange,
  partnerId,
  partnerName,
  partnerLogoUrl,
  asset,
  onSubmitted,
}: Props) {
  const [market, setMarket] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [details, setDetails] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!asset) return;
    if (!market || !contactName || !contactEmail) {
      toast.error("Market and contact details are required");
      return;
    }
    setSaving(true);
    try {
      let logoPath: string | null = null;
      if (file) {
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `cobrand/${partnerId}/${Date.now()}_${safe}`;
        const up = await supabase.storage
          .from("partner-assets")
          .upload(path, file, { contentType: file.type });
        if (up.error) throw up.error;
        logoPath = path;
      }
      const { error } = await supabase.from("partner_cobrand_requests").insert({
        partner_id: partnerId,
        asset_id: asset.id,
        title: `Co-branded: ${asset.title}`,
        request_type: "cobrand",
        market,
        contact_name: contactName,
        contact_email: contactEmail,
        details: details || null,
        logo_path: logoPath,
      } as never);
      if (error) throw error;
      toast.success("Request submitted — the WorldAML team will review it");
      onOpenChange(false);
      setMarket("");
      setContactName("");
      setContactEmail("");
      setDetails("");
      setFile(null);
      onSubmitted?.();
    } catch (e: any) {
      toast.error(e.message || "Could not submit request");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request co-branded version</DialogTitle>
          <DialogDescription>
            {asset?.title} — WorldAML produces the co-branded version. Master assets cannot be
            edited directly.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Partner company</Label>
            <Input value={partnerName} disabled className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Partner logo</Label>
            {partnerLogoUrl && (
              <p className="text-[11px] text-muted-foreground mt-1">
                Approved logo on file will be used unless you upload a replacement.
              </p>
            )}
            <Input
              type="file"
              accept="image/*,.pdf,.svg"
              className="mt-1"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Market / country</Label>
              <Input value={market} onChange={(e) => setMarket(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Contact name</Label>
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Contact email</Label>
            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Additional notes</Label>
            <Textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="mt-1"
              placeholder="Preferred CTA, language, event or campaign this is for…"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Submit request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
