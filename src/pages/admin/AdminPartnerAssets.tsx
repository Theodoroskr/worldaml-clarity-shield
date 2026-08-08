import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, Upload, History } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

import { ADMIN_CATEGORIES, ASSET_STATUSES, LANGUAGES, INDUSTRIES } from "@/lib/partnerAssetTaxonomy";

const CATEGORIES = ADMIN_CATEGORIES;
const CERT = ["bronze", "silver", "gold"];

type Asset = any;

const EMPTY: any = {
  title: "",
  description: "",
  category: "one_pager",
  certification_min: "bronze",
  file_url: "",
  file_path: "",
  thumbnail_url: "",
  preview_url: "",
  is_active: true,
  sort_order: 0,
  asset_type: "Brochure",
  product: "",
  language: "English",
  industry: "All industries",
  is_cobrandable: false,
  status: "draft",
  version_label: "",
  cta_url: "",
};

export default function AdminPartnerAssets() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("partner_assets")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setAssets(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };
  const startEdit = (a: Asset) => {
    setEditing(a);
    setForm({
      title: a.title,
      description: a.description ?? "",
      category: a.category,
      certification_min: a.certification_min,
      file_url: a.file_url ?? "",
      file_path: a.file_path ?? "",
      thumbnail_url: a.thumbnail_url ?? "",
      preview_url: a.preview_url ?? "",
      is_active: a.is_active,
      sort_order: a.sort_order ?? 0,
      asset_type: a.asset_type ?? "Brochure",
      product: a.product ?? "",
      language: a.language ?? "English",
      industry: a.industry ?? "All industries",
      is_cobrandable: !!a.is_cobrandable,
      status: a.status ?? "draft",
      version_label: a.version_label ?? "",
      cta_url: a.cta_url ?? "",
    });
    setOpen(true);
  };

  // Version history state
  const [versionOpen, setVersionOpen] = useState(false);
  const [versionAsset, setVersionAsset] = useState<Asset | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [newVersionChangelog, setNewVersionChangelog] = useState("");
  const [publishing, setPublishing] = useState(false);

  const openVersions = async (a: Asset) => {
    setVersionAsset(a);
    setVersionOpen(true);
    setNewVersionFile(null);
    setNewVersionChangelog("");
    setVersionsLoading(true);
    const { data, error } = await supabase
      .from("partner_asset_versions")
      .select("*")
      .eq("asset_id", a.id)
      .order("version_number", { ascending: false });
    setVersionsLoading(false);
    if (error) return toast.error(error.message);
    setVersions(data ?? []);
  };

  const publishVersion = async () => {
    if (!versionAsset || !newVersionFile || !user) return;
    setPublishing(true);
    try {
      const safe = newVersionFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `assets/${versionAsset.id}/v${Date.now()}_${safe}`;
      const up = await supabase.storage
        .from("partner-assets")
        .upload(path, newVersionFile, { upsert: false, contentType: newVersionFile.type });
      if (up.error) throw up.error;

      const nextVersion = (versionAsset.current_version ?? 1) + (versions.length ? 1 : 0) || 1;
      // Ensure baseline: if no versions exist, insert the current file as v1 first
      if (versions.length === 0) {
        await supabase.from("partner_asset_versions").insert({
          asset_id: versionAsset.id,
          version_number: versionAsset.current_version ?? 1,
          file_path: versionAsset.file_path,
          file_url: versionAsset.file_url,
          content_type: versionAsset.content_type,
          file_size_bytes: versionAsset.file_size_bytes,
          changelog: "Initial version",
          is_current: false,
          created_by: user.id,
        });
      } else {
        await supabase
          .from("partner_asset_versions")
          .update({ is_current: false })
          .eq("asset_id", versionAsset.id);
      }

      const newNum = (versionAsset.current_version ?? 1) + 1;
      const ins = await supabase.from("partner_asset_versions").insert({
        asset_id: versionAsset.id,
        version_number: newNum,
        file_path: path,
        file_url: null,
        content_type: newVersionFile.type,
        file_size_bytes: newVersionFile.size,
        changelog: newVersionChangelog || null,
        is_current: true,
        created_by: user.id,
      });
      if (ins.error) throw ins.error;

      const upd = await supabase
        .from("partner_assets")
        .update({
          file_path: path,
          file_url: null,
          content_type: newVersionFile.type,
          file_size_bytes: newVersionFile.size,
          current_version: newNum,
        })
        .eq("id", versionAsset.id);
      if (upd.error) throw upd.error;

      toast.success(`Published v${newNum}`);
      await load();
      await openVersions({ ...versionAsset, current_version: newNum, file_path: path });
    } catch (e: any) {
      toast.error(e.message || "Publish failed");
    } finally {
      setPublishing(false);
    }
  };


  const upload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `assets/${Date.now()}_${safe}`;
      const { error } = await supabase.storage
        .from("partner-assets")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      setForm((f: any) => ({ ...f, file_path: path, file_url: "" }));
      toast.success("File uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.title) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    const payload: any = {
      title: form.title,
      description: form.description || null,
      category: form.category,
      certification_min: form.certification_min,
      file_url: form.file_url || null,
      file_path: form.file_path || null,
      thumbnail_url: form.thumbnail_url || null,
      preview_url: form.preview_url || null,
      is_active: !!form.is_active,
      sort_order: Number(form.sort_order) || 0,
      asset_type: form.asset_type || "Brochure",
      product: form.product || null,
      language: form.language || "English",
      industry: form.industry || null,
      is_cobrandable: !!form.is_cobrandable,
      status: form.status || "draft",
      version_label: form.version_label || null,
      cta_url: form.cta_url || null,
      published_at: form.status === "approved" ? new Date().toISOString() : null,
    };
    let error;
    if (editing) {
      ({ error } = await supabase.from("partner_assets").update(payload).eq("id", editing.id));
    } else {
      payload.created_by = user?.id;
      ({ error } = await supabase.from("partner_assets").insert(payload));
    }
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing ? "Asset updated" : "Asset created");
    setOpen(false);
    await load();
  };

  const remove = async (a: Asset) => {
    if (!confirm(`Delete "${a.title}"?`)) return;
    const { error } = await supabase.from("partner_assets").delete().eq("id", a.id);
    if (error) return toast.error(error.message);
    if (a.file_path) {
      await supabase.storage.from("partner-assets").remove([a.file_path]);
    }
    toast.success("Asset deleted");
    await load();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Partner marketing assets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage co-marketing assets available to channel partners.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={startNew}>
              <Plus className="w-4 h-4 mr-1" /> New asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit asset" : "New asset"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Field label="Title">
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </Field>
              <Field label="Description">
                <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Min certification">
                  <select
                    value={form.certification_min}
                    onChange={(e) => setForm({ ...form, certification_min: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
                  >
                    {CERT.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Upload file (stored in partner-assets bucket)">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    onChange={(e) => e.target.files && upload(e.target.files[0])}
                    disabled={uploading}
                  />
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
                {form.file_path && (
                  <p className="text-[11px] text-muted-foreground mt-1 font-mono truncate">
                    {form.file_path}
                  </p>
                )}
              </Field>
              <Field label="…or external file URL">
                <Input value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} placeholder="https://..." />
              </Field>
              <Field label="Thumbnail URL (optional)">
                <Input value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} placeholder="https://..." />
              </Field>
              <Field label="Preview URL (optional — image, PDF or video shown in the portal preview)">
                <Input value={form.preview_url} onChange={(e) => setForm({ ...form, preview_url: e.target.value })} placeholder="https://... (defaults to the file itself)" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Product">
                  <Input value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} placeholder="e.g. AML Screening & Monitoring" />
                </Field>
                <Field label="Asset type">
                  <Input value={form.asset_type} onChange={(e) => setForm({ ...form, asset_type: e.target.value })} placeholder="Brochure / One-Pager / Kit" />
                </Field>
                <Field label="Language">
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Industry">
                  <select
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
                  >
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
                  >
                    {ASSET_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Version label">
                  <Input value={form.version_label} onChange={(e) => setForm({ ...form, version_label: e.target.value })} placeholder="v1.0" />
                </Field>
                <Field label="Approved destination URL">
                  <Input value={form.cta_url} onChange={(e) => setForm({ ...form, cta_url: e.target.value })} placeholder="https://worldaml.com/contact-sales" />
                </Field>
                <Field label="Co-brandable">
                  <div className="flex items-center gap-2 h-10">
                    <Switch checked={!!form.is_cobrandable} onCheckedChange={(v) => setForm({ ...form, is_cobrandable: v })} />
                    <span className="text-sm text-muted-foreground">{form.is_cobrandable ? "Partners can request" : "Master only"}</span>
                  </div>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Sort order">
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
                </Field>
                <Field label="Active">
                  <div className="flex items-center gap-2 h-10">
                    <Switch
                      checked={!!form.is_active}
                      onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {form.is_active ? "Visible to partners" : "Hidden"}
                    </span>
                  </div>
                </Field>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assets ({assets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : assets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No assets yet. Add a logo, one-pager or deck.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground border-b border-border">
                  <tr>
                    <th className="pb-2 font-medium">Title</th>
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 font-medium">Min cert</th>
                    <th className="pb-2 font-medium">Active</th>
                    <th className="pb-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {assets.map((a: any) => (
                    <tr key={a.id}>
                      <td className="py-2.5 font-medium">{a.title}</td>
                      <td className="py-2.5 text-muted-foreground capitalize">{a.category.replace(/_/g, " ")}</td>
                      <td className="py-2.5 capitalize">{a.certification_min}</td>
                      <td className="py-2.5">
                        <Badge variant="outline" className={a.is_active ? "bg-green-100 text-green-800 border-green-200" : ""}>
                          {a.is_active ? "Active" : "Hidden"}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right space-x-1">
                        <Button size="icon" variant="ghost" title="Version history" onClick={() => openVersions(a)}>
                          <History className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => startEdit(a)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(a)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Version history dialog */}
      <Dialog open={versionOpen} onOpenChange={setVersionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Versions — {versionAsset?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border border-border rounded-md p-3 space-y-2">
              <p className="text-sm font-medium">Publish a new version</p>
              <Input
                type="file"
                onChange={(e) => setNewVersionFile(e.target.files?.[0] ?? null)}
                disabled={publishing}
              />
              <Textarea
                rows={2}
                placeholder="Changelog (what changed?)"
                value={newVersionChangelog}
                onChange={(e) => setNewVersionChangelog(e.target.value)}
                disabled={publishing}
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={publishVersion} disabled={!newVersionFile || publishing}>
                  {publishing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
                  Publish version
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">History</p>
              {versionsLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin" /></div>
              ) : versions.length === 0 ? (
                <p className="text-xs text-muted-foreground py-3">No prior versions — the current file is the original upload.</p>
              ) : (
                <div className="divide-y divide-border max-h-[45vh] overflow-y-auto">
                  {versions.map((v) => (
                    <div key={v.id} className="py-2.5 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">v{v.version_number}</span>
                          {v.is_current && (
                            <Badge className="bg-teal text-white text-[10px] px-1.5 py-0">Current</Badge>
                          )}
                          <span className="text-[11px] text-muted-foreground">
                            {formatDistanceToNow(new Date(v.created_at))} ago
                          </span>
                        </div>
                        {v.changelog && (
                          <p className="text-xs text-muted-foreground mt-0.5">{v.changelog}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
