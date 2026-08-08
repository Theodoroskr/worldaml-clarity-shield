import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePartner } from "@/hooks/usePartner";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Loader2,
  Eye,
  History,
  Search,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import AssetContentReader, { type AssetContent } from "@/components/partner/AssetContentReader";
import CobrandRequestDialog from "@/components/partner/CobrandRequestDialog";
import {
  ASSET_TABS,
  CATEGORY_ICON,
  CATEGORY_LABEL,
  SORTS,
  isNew,
  isUpdated,
} from "@/lib/partnerAssetTaxonomy";

type Asset = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  asset_type: string | null;
  product: string | null;
  language: string | null;
  industry: string | null;
  is_cobrandable: boolean | null;
  status: string;
  version_label: string | null;
  cta_url: string | null;
  content: AssetContent | null;
  file_path: string | null;
  file_url: string | null;
  thumbnail_url: string | null;
  preview_url: string | null;
  content_type: string | null;
  file_size_bytes: number | null;
  certification_min: string;
  current_version: number | null;
  created_at: string;
  updated_at: string;
};

type Version = {
  id: string;
  version_number: number;
  changelog: string | null;
  is_current: boolean;
  created_at: string;
  file_path: string | null;
  file_url: string | null;
};

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
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [product, setProduct] = useState("all");
  const [language, setLanguage] = useState("all");
  const [industry, setIndustry] = useState("all");
  const [sort, setSort] = useState("newest");
  const [downloading, setDownloading] = useState<string | null>(null);

  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [historyAsset, setHistoryAsset] = useState<Asset | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);

  const [cobrandAsset, setCobrandAsset] = useState<Asset | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("partner_assets")
        .select("*")
        .eq("is_active", true)
        .in("status", ["approved", "draft"])
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      setAssets((data as unknown as Asset[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const track = async (asset: Asset, eventType: "view" | "download") => {
    if (!partner) return;
    await supabase.from("partner_asset_events").insert({
      partner_id: partner.id,
      asset_id: asset.id,
      user_id: user?.id ?? null,
      event_type: eventType,
      asset_title: asset.title,
      product: asset.product,
    } as never);
  };

  const download = async (asset: Asset) => {
    setDownloading(asset.id);
    try {
      const url = await resolveUrl(asset.file_path, asset.file_url);
      if (!url) throw new Error("No file available yet");
      void track(asset, "download");
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
    setCopied(false);
    void track(asset, "view");
    if (!asset.file_path && !asset.file_url && !asset.preview_url) return;
    setPreviewLoading(true);
    try {
      setPreviewUrl(asset.preview_url ?? (await resolveUrl(asset.file_path, asset.file_url)));
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
    if (error) return toast.error(error.message);
    setVersions((data as unknown as Version[]) ?? []);
  };

  const products = useMemo(
    () => Array.from(new Set(assets.map((a) => a.product).filter(Boolean))) as string[],
    [assets],
  );
  const languages = useMemo(
    () => Array.from(new Set(assets.map((a) => a.language).filter(Boolean))) as string[],
    [assets],
  );
  const industries = useMemo(
    () => Array.from(new Set(assets.map((a) => a.industry).filter(Boolean))) as string[],
    [assets],
  );

  const inTab = (a: Asset, tabId: string) => {
    if (tabId === "all") return true;
    if (tabId === "cobrandable") return !!a.is_cobrandable;
    const t = ASSET_TABS.find((x) => x.id === tabId);
    return !!t?.categories?.includes(a.category);
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = assets.filter(
      (a) =>
        inTab(a, tab) &&
        (product === "all" || a.product === product) &&
        (language === "all" || a.language === language) &&
        (industry === "all" || a.industry === industry) &&
        (!q ||
          a.title.toLowerCase().includes(q) ||
          (a.description ?? "").toLowerCase().includes(q) ||
          (a.product ?? "").toLowerCase().includes(q)),
    );
    list = [...list].sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title);
      if (sort === "updated")
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [assets, tab, search, product, language, industry, sort]);

  const available = visible.filter((a) => a.status === "approved" && (a.file_path || a.file_url));
  const drafts = visible.filter((a) => !(a.status === "approved" && (a.file_path || a.file_url)));

  const previewType = useMemo(() => {
    if (!previewAsset || !previewUrl) return "none";
    const ct = previewAsset.content_type || "";
    if (ct.startsWith("image/")) return "image";
    if (ct.startsWith("video/")) return "video";
    if (ct === "application/pdf" || previewUrl.toLowerCase().includes(".pdf")) return "pdf";
    return "other";
  }, [previewAsset, previewUrl]);

  if (!partner) return null;

  const renderCard = (a: Asset) => {
    const Icon = CATEGORY_ICON[a.category] ?? FileText;
    const downloadable = a.status === "approved" && (a.file_path || a.file_url);
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
              loading="lazy"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <Icon className="w-10 h-10 text-muted-foreground" />
          )}
          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Eye className="w-6 h-6 text-primary-foreground" />
          </span>
        </button>
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <Badge variant="outline" className="text-[10px]">
              {CATEGORY_LABEL[a.category] ?? a.category}
            </Badge>
            {a.status === "approved" ? (
              <Badge className="text-[10px] bg-teal/15 text-teal border-teal/30">Approved</Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">
                Draft – internal approval required
              </Badge>
            )}
            {a.is_cobrandable && (
              <Badge variant="outline" className="text-[10px] border-teal/40 text-teal">
                Co-brandable
              </Badge>
            )}
            {isNew(a.created_at) && <Badge className="text-[10px]">New</Badge>}
            {isUpdated(a.created_at, a.updated_at) && (
              <Badge variant="secondary" className="text-[10px]">
                Updated
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-sm text-foreground">{a.title}</h3>
          {a.description && (
            <p className="text-xs text-muted-foreground mt-1 flex-1">{a.description}</p>
          )}
          <dl className="mt-3 grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
            {a.product && (
              <div className="col-span-2 truncate">
                <span className="text-foreground/70">Product:</span> {a.product}
              </div>
            )}
            <div>{a.language}</div>
            {a.industry && <div className="truncate text-right">{a.industry}</div>}
            <div>{a.version_label ?? `v${a.current_version ?? 1}`}</div>
            <div className="text-right">
              Updated {formatDistanceToNow(new Date(a.updated_at))} ago
            </div>
          </dl>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => openPreview(a)}>
              <Eye className="w-3.5 h-3.5 mr-1" /> Preview
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => download(a)}
              disabled={!downloadable || downloading === a.id}
            >
              {downloading === a.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
              ) : (
                <Download className="w-3.5 h-3.5 mr-1" />
              )}
              {downloadable ? "Download" : "File pending"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => openHistory(a)} aria-label="Versions">
              <History className="w-3.5 h-3.5" />
            </Button>
          </div>
          {a.is_cobrandable && (
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 text-teal hover:text-teal"
              onClick={() => setCobrandAsset(a)}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Request co-branded version
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Marketing Assets</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Approved WorldAML materials to help you promote, present and sell our solutions.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Availability follows your certification tier (
          <span className="capitalize">{partner.certification_level || "bronze"}</span>). Assets are
          for partner use only and must not be published publicly without WorldAML approval.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {ASSET_TABS.map((t) => {
          const count = assets.filter((a) => inTab(a, t.id)).length;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                tab === t.id
                  ? "bg-teal/15 border-teal/40 text-teal"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search marketing assets..."
              className="pl-9"
            />
          </div>
          <Select value={product} onChange={setProduct} options={products} label="Product" />
          <Select value={language} onChange={setLanguage} options={languages} label="Language" />
          <Select value={industry} onChange={setIndustry} options={industries} label="Industry" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 px-3 rounded-md border border-border bg-background text-sm"
            aria-label="Sort"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-teal" />
        </div>
      ) : visible.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            No assets match your filters.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">
              Available assets ({available.length})
            </h2>
            {available.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  No downloadable files published in this view yet. Draft content below is being
                  prepared and is awaiting internal approval.
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {available.map(renderCard)}
              </div>
            )}
          </section>

          {drafts.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground mb-1">
                Draft assets ({drafts.length})
              </h2>
              <p className="text-xs text-muted-foreground mb-3">
                Content prepared and awaiting internal WorldAML approval. Preview the copy and
                structure now — files become downloadable once approved.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{drafts.map(renderCard)}</div>
            </section>
          )}
        </div>
      )}

      {/* Preview */}
      <Dialog open={!!previewAsset} onOpenChange={(o) => !o && setPreviewAsset(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewAsset?.title}</DialogTitle>
            <DialogDescription>
              {previewAsset?.status === "approved"
                ? "Approved WorldAML asset."
                : "Draft – internal approval required. Do not distribute externally."}
            </DialogDescription>
          </DialogHeader>

          {previewLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-teal" />
            </div>
          ) : previewUrl && previewType === "image" ? (
            <img src={previewUrl} alt={previewAsset?.title ?? ""} className="w-full rounded-md" />
          ) : previewUrl && previewType === "pdf" ? (
            <iframe src={previewUrl} title="Preview" className="w-full h-[60vh] rounded-md" />
          ) : previewUrl && previewType === "video" ? (
            <video src={previewUrl} controls className="w-full rounded-md" />
          ) : null}

          {previewAsset?.content && <AssetContentReader content={previewAsset.content} />}

          <div className="flex flex-wrap gap-2 pt-2">
            {previewAsset?.content && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(previewAsset.content, null, 2));
                  setCopied(true);
                  toast.success("Content copied");
                }}
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 mr-1" />
                ) : (
                  <Copy className="w-3.5 h-3.5 mr-1" />
                )}
                Copy content
              </Button>
            )}
            {previewAsset?.cta_url && (
              <Button asChild size="sm" variant="outline">
                <a href={previewAsset.cta_url} target="_blank" rel="noopener noreferrer">
                  Approved destination URL
                </a>
              </Button>
            )}
            {previewAsset && previewAsset.is_cobrandable && (
              <Button
                size="sm"
                onClick={() => {
                  setCobrandAsset(previewAsset);
                  setPreviewAsset(null);
                }}
              >
                Request co-branded version
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Version history */}
      <Dialog open={!!historyAsset} onOpenChange={(o) => !o && setHistoryAsset(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Version history</DialogTitle>
            <DialogDescription>{historyAsset?.title}</DialogDescription>
          </DialogHeader>
          {versionsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : versions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Current version:{" "}
              {historyAsset?.version_label ?? `v${historyAsset?.current_version ?? 1}`} — no earlier
              versions recorded.
            </p>
          ) : (
            <ul className="space-y-2">
              {versions.map((v) => (
                <li
                  key={v.id}
                  className="flex items-start justify-between gap-3 border border-border rounded-md p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      v{v.version_number}{" "}
                      {v.is_current && (
                        <Badge className="ml-1 text-[10px] bg-teal/15 text-teal border-teal/30">
                          Current
                        </Badge>
                      )}
                    </p>
                    {v.changelog && (
                      <p className="text-xs text-muted-foreground mt-0.5">{v.changelog}</p>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {format(new Date(v.created_at), "d MMM yyyy")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      <CobrandRequestDialog
        open={!!cobrandAsset}
        onOpenChange={(o) => !o && setCobrandAsset(null)}
        partnerId={partner.id}
        partnerName={partner.display_name ?? "Your company"}
        partnerLogoUrl={partner.logo_url}
        asset={cobrandAsset}
      />
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
}) {
  if (options.length === 0) return null;
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="h-10 px-3 rounded-md border border-border bg-background text-sm"
    >
      <option value="all">{label}: all</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
