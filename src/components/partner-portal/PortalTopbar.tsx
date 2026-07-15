import { Copy, Check, LogOut, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { PartnerRow } from "@/hooks/usePartner";

const CERT_LABEL: Record<string, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
};

const CERT_CLASS: Record<string, string> = {
  bronze: "bg-amber-100 text-amber-800 border-amber-200",
  silver: "bg-slate-100 text-slate-800 border-slate-200",
  gold: "bg-yellow-100 text-yellow-900 border-yellow-200",
};

export default function PortalTopbar({ partner }: { partner: PartnerRow }) {
  const [copied, setCopied] = useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const referralUrl = `${window.location.origin}?ref=${partner.referral_code}`;

  const copy = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success("Referral link copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const cert = (partner.certification_level || "bronze").toLowerCase();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="text-sm font-semibold text-foreground truncate">
          {partner.display_name || user?.email || "Partner"}
        </div>
        <Badge variant="outline" className={CERT_CLASS[cert] ?? CERT_CLASS.bronze}>
          {CERT_LABEL[cert] ?? "Bronze"} certified
        </Badge>
        <Badge variant="outline" className="capitalize">
          {partner.partner_type} · {Math.round(Number(partner.commission_rate) * 100)}%
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 px-3 h-9 bg-muted/50 border border-border rounded-md text-xs text-muted-foreground max-w-[420px]">
          <span className="truncate">{referralUrl}</span>
          <button
            onClick={copy}
            className="text-teal hover:text-teal/80 shrink-0"
            aria-label="Copy referral link"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          Dashboard <ExternalLink className="ml-1 w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await signOut();
            navigate("/");
          }}
        >
          <LogOut className="w-3.5 h-3.5 mr-1" /> Sign out
        </Button>
      </div>
    </header>
  );
}
