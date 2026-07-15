import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePartner } from "@/hooks/usePartner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Download,
  FileText,
  Image as ImageIcon,
  Presentation,
  Mail,
  Layers,
  BookOpen,
  Video,
  Loader2,
  Eye,
  History,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Asset = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_path: string | null;
  file_url: string | null;
  thumbnail_url: string | null;
  preview_url: string | null;
  content_type: string | null;
  file_size_bytes: number | null;
  certification_min: string;
  current_version: number | null;
  updated_at: string;
};

type Version = {
  id: string;
  asset_id: string;
  version_number: number;
  file_path: string | null;
  file_url: string | null;
  changelog: string | null;
  is_current: boolean;
  content_type: string | null;
  file_size_bytes: number | null;
  created_at: string;
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

function formatBytes(bytes?: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function resolveUrl(path: string | null, url: string | null) {
  if (url && !path) return url;
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from("partner-assets")
    .createSignedUrl(path, 600);
  if (error) throw error;
  return data.signedUrl;
}

export default function PartnerAssets() {
  const { partner } = usePartner();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [historyAsset, setHistoryAsset] = useState<Asset | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);

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

  const download = async (
    asset: Asset,
    override?: { file_path: string | null; file_url: string | null },
  ) => {
    setDownloading(asset.id);
    try {
      const src = override ?? asset;
      const url = await resolveUrl(src.file_path, src.file_url);
      if (!url) throw new Error("No file available");
      const a = document.createElement("a");
      a.href = url;
      a.rel = "noopener";
      a.target = "_blank";
      a.download = asset.title;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: any) {
      toast.error(e.message || "Download failed");
    } finally {
      setDownloading(null);
    }
  };

  const openPreview = async (asset: Asset) => {
    setPreviewAsset(asset);
    setPreviewUrl(null);
    setPreviewLoading(true);
    try {
      if (asset.preview_url) {
        setPreviewUrl(asset.preview_url);
      } else {
        const url = await resolveUrl(asset.file_path, asset.file_url);
        setPreviewUrl(url);
      }
    } catch (e: any) {
      toast.error(e.message || "Preview failed");
    } finally {
      setPreviewLoading(false);
    }
  };

  const openHistory = async (asset: Asset) => {
    setHistoryAsset(asset);
    setVersions([]);
    setVersionsLoading(true);
    const { data, error } = await supabase
      .from("partner_asset_versions")
      .select("*")
      .eq("asset_id", asset.id)
      .order("version_number", { ascending: false });
    setVersionsLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setVersions((data as unknown as Version[]) ?? []);
  };

  const visible = useMemo(
    () => (filter === "all" ? assets : assets.filter((a) => a.category === filter)),
    [assets, filter],
  );

  const previewType = useMemo(() => {
    if (!previewAsset || !previewUrl) return "none";
    const ct = previewAsset.content_type || "";
    if (ct.startsWith("image/")) return "image";
    if (ct.startsWith("video/")) return "video";
    if (ct === "application/pdf" || previewUrl.toLowerCase().includes(".pdf")) return "pdf";
    if (ct.startsWith("audio/")) return "audio";
    return "other";
  }, [previewAsset, previewUrl]);

  if (!partner) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Marketing Assets</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Logos, decks, one-pagers, banners and email templates approved for partner co-marketing.
          Files are gated by your certification tier (
          <span className="capitalize">{partner.certification_level || "bronze"}</span>).
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          All ({assets.length})
        </FilterChip>
        {CATEGORIES.map((c) => {
          const count = assets.filter((a) => a.category === c).length;
          if (!count) return null;
          return (
            <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)}>
              {CATEGORY_LABEL[c]} ({count})
            </FilterChip>
          );
        })}
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
              <Card key={a.id} className="flex flex-col overflow-hidden group">
                <button
                  onClick={() => openPreview(a)}
                  className="aspect-video bg-muted/50 flex items-center justify-center overflow-hidden relative"
                  aria-label={`Preview ${a.title}`}
                >
                  {a.thumbnail_url ? (
                    <img
                      src={a.thumbnail_url}
                      alt={a.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <Icon className="w-10 h-10 text-muted-foreground" />
                  )}
                  <span className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Eye className="w-6 h-6 text-white" />
                  </span>
                </button>
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
                  <div className="flex items-center justify-between mt-3 text-[11px] text-muted-foreground">
                    <span>v{a.current_version ?? 1}</span>
                    <span>Updated {formatDistanceToNow(new Date(a.updated_at))} ago</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
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
                    <Button size="sm" variant="outline" onClick={() => openHistory(a)} title="Version history">
                      <History className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewAsset} onOpenChange={(o) => !o && setPreviewAsset(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewAsset?.title}</DialogTitle>
            {previewAsset?.description && (
              <DialogDescription>{previewAsset.description}</DialogDescription>
            )}
          </DialogHeader>
          <div className="min-h-[300px] bg-muted/40 rounded-md flex items-center justify-center overflow-hidden">
            {previewLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-teal" />
            ) : !previewUrl ? (
              <p className="text-sm text-muted-foreground">No preview available.</p>
            ) : previewType === "image" ? (
              <img src={previewUrl} alt={previewAsset?.title} className="max-h-[70vh] object-contain" />
            ) : previewType === "video" ? (
              <video src={previewUrl} controls className="max-h-[70vh] w-full" />
            ) : previewType === "audio" ? (
              <audio src={previewUrl} controls className="w-full" />
            ) : previewType === "pdf" ? (
              <iframe src={previewUrl} title={previewAsset?.title} className="w-full h-[70vh]" />
            ) : (
              <div className="text-sm text-muted-foreground text-center p-6">
                Preview not supported for this file type. Use Download to open it.
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPreviewAsset(null)}>
              Close
            </Button>
            <Button
              onClick={() => previewAsset && download(previewAsset)}
              disabled={!previewAsset || downloading === previewAsset?.id}
            >
              {downloading === previewAsset?.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Download className="w-4 h-4 mr-1" />
              )}
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={!!historyAsset} onOpenChange={(o) => !o && setHistoryAsset(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version history — {historyAsset?.title}</DialogTitle>
            <DialogDescription>
              Download any prior revision. Current version is marked below.
            </DialogDescription>
          </DialogHeader>
          {versionsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-teal" />
            </div>
          ) : versions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No prior versions recorded — this is the original upload.
            </p>
          ) : (
            <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
              {versions.map((v) => (
                <div key={v.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">v{v.version_number}</span>
                      {v.is_current && (
                        <Badge className="bg-teal text-white text-[10px] px-1.5 py-0">
                          <Check className="w-3 h-3 mr-0.5" /> Current
                        </Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(v.created_at))} ago
                        {v.file_size_bytes ? ` · ${formatBytes(v.file_size_bytes)}` : ""}
                      </span>
                    </div>
                    {v.changelog && (
                      <p className="text-xs text-muted-foreground mt-1">{v.changelog}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      historyAsset &&
                      download(historyAsset, { file_path: v.file_path, file_url: v.file_url })
                    }
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
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
