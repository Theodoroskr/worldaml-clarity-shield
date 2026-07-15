import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePartner } from "@/hooks/usePartner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Image as ImageIcon, Presentation, Mail, Layers, BookOpen, Video, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Asset = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_path: string | null;
  file_url: string | null;
  thumbnail_url: string | null;
  content_type: string | null;
  file_size_bytes: number | null;
  certification_min: string;
};

const CATEGORY_ICON: Record<string, any> = {
  logo: ImageIcon,
  one_pager: FileText,
  deck: Presentation,
  email_template: Mail,
  banner: ImageIcon,
  case_study: BookOpen,
  contract: FileText,
  brand_guide: Layers,
  video: Video,
};

const CATEGORY_LABEL: Record<string, string> = {
  logo: "Logos",
  one_pager: "One-pagers",
  deck: "Decks",
  email_template: "Email templates",
  banner: "Banners",
  case_study: "Case studies",
  contract: "Contracts",
  brand_guide: "Brand guides",
  video: "Videos",
};

const CATEGORIES = Object.keys(CATEGORY_LABEL);

export default function PartnerAssets() {
  const { partner } = usePartner();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("partner_assets")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      setAssets((data as unknown as Asset[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const download = async (asset: Asset) => {
    setDownloading(asset.id);
    try {
      if (asset.file_url && !asset.file_path) {
        window.open(asset.file_url, "_blank", "noopener");
      } else if (asset.file_path) {
        const { data, error } = await supabase.storage
          .from("partner-assets")
          .createSignedUrl(asset.file_path, 300);
        if (error) throw error;
        window.open(data.signedUrl, "_blank", "noopener");
      }
    } catch (e: any) {
      toast.error(e.message || "Download failed");
    } finally {
      setDownloading(null);
    }
  };

  const visible = filter === "all" ? assets : assets.filter((a) => a.category === filter);

  if (!partner) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Marketing Assets</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Logos, decks, one-pagers, banners and email templates approved for partner co-marketing.
          Files are gated by your certification tier (<span className="capitalize">{partner.certification_level || "bronze"}</span>).
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </FilterChip>
        {CATEGORIES.map((c) => (
          <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)}>
            {CATEGORY_LABEL[c]}
          </FilterChip>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-teal" />
        </div>
      ) : visible.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            No assets available in this category yet. Check back soon.
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((a) => {
            const Icon = CATEGORY_ICON[a.category] ?? FileText;
            return (
              <Card key={a.id} className="flex flex-col overflow-hidden">
                <div className="aspect-video bg-muted/50 flex items-center justify-center overflow-hidden">
                  {a.thumbnail_url ? (
                    <img src={a.thumbnail_url} alt={a.title} className="w-full h-full object-cover" />
                  ) : (
                    <Icon className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm text-foreground">{a.title}</h3>
                    <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                      {a.certification_min}+
                    </Badge>
                  </div>
                  {a.description && (
                    <p className="text-xs text-muted-foreground mt-1 flex-1">{a.description}</p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 self-start"
                    onClick={() => download(a)}
                    disabled={downloading === a.id}
                  >
                    {downloading === a.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    ) : (
                      <Download className="w-3.5 h-3.5 mr-1" />
                    )}
                    Download
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? "bg-teal text-white border-teal"
          : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}
