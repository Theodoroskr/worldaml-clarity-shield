import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface LevelRow {
  id: string; key: string; name: string; rank: number; description: string | null;
  min_courses: number; min_advanced_courses: number; min_categories: number;
  min_certificates: number; is_active: boolean;
}
interface BadgeRow {
  id: string; key: string; name: string; description: string | null;
  course_slugs: string[]; category: string | null; required_count: number;
  sort_order: number; is_active: boolean;
}

const num = (v: string) => Math.max(0, Number(v) || 0);

export default function AdminRecognition() {
  const { toast } = useToast();
  const [levels, setLevels] = useState<LevelRow[]>([]);
  const [badges, setBadges] = useState<BadgeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: l }, { data: b }] = await Promise.all([
      (supabase as any).from("academy_recognition_levels").select("*").order("rank"),
      (supabase as any).from("academy_badges").select("*").order("sort_order"),
    ]);
    setLevels((l ?? []) as LevelRow[]);
    setBadges((b ?? []) as BadgeRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveAll = async () => {
    setSaving(true);
    const errs: string[] = [];
    for (const l of levels) {
      const { error } = await (supabase as any).from("academy_recognition_levels").update({
        name: l.name, description: l.description, min_courses: l.min_courses,
        min_advanced_courses: l.min_advanced_courses, min_categories: l.min_categories,
        min_certificates: l.min_certificates, is_active: l.is_active,
      }).eq("id", l.id);
      if (error) errs.push(`${l.key}: ${error.message}`);
    }
    for (const b of badges) {
      const { error } = await (supabase as any).from("academy_badges").update({
        name: b.name, description: b.description, required_count: b.required_count,
        course_slugs: b.course_slugs, sort_order: b.sort_order, is_active: b.is_active,
      }).eq("id", b.id);
      if (error) errs.push(`${b.key}: ${error.message}`);
    }
    setSaving(false);
    if (errs.length) {
      toast({ title: "Some changes could not be saved", description: errs[0], variant: "destructive" });
      return;
    }
    toast({ title: "Recognition settings saved" });
    load();
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <>
      <Helmet><title>Academy Recognition | Admin</title><meta name="robots" content="noindex" /></Helmet>

      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Academy Recognition</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure member level thresholds and specialisation badge criteria. Levels are recalculated
            from real course completions and certificates.
          </p>
        </div>
        <Button onClick={saveAll} disabled={saving} size="sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save changes
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="border-border">
          <CardHeader className="pb-3"><CardTitle className="text-base">Member levels</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3">Level</th>
                  <th className="py-2 pr-3 w-24">Courses</th>
                  <th className="py-2 pr-3 w-24">Advanced</th>
                  <th className="py-2 pr-3 w-24">Categories</th>
                  <th className="py-2 pr-3 w-24">Certificates</th>
                  <th className="py-2 w-20">Active</th>
                </tr>
              </thead>
              <tbody>
                {levels.map((l, i) => (
                  <tr key={l.id} className="border-b border-border/60">
                    <td className="py-2 pr-3">
                      <Input
                        value={l.name}
                        onChange={(e) => setLevels((s) => s.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                        className="h-8"
                      />
                      <span className="text-[11px] text-muted-foreground">rank {l.rank} · {l.key}</span>
                    </td>
                    {(["min_courses", "min_advanced_courses", "min_categories", "min_certificates"] as const).map((f) => (
                      <td key={f} className="py-2 pr-3">
                        <Input
                          type="number" min={0} className="h-8" value={l[f]}
                          onChange={(e) => setLevels((s) => s.map((x, j) => j === i ? { ...x, [f]: num(e.target.value) } : x))}
                        />
                      </td>
                    ))}
                    <td className="py-2">
                      <Switch
                        checked={l.is_active}
                        onCheckedChange={(v) => setLevels((s) => s.map((x, j) => j === i ? { ...x, is_active: v } : x))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3"><CardTitle className="text-base">Specialisation badges</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {badges.map((b, i) => (
              <div key={b.id} className="border border-border rounded-md p-3 space-y-3">
                <div className="grid gap-3 sm:grid-cols-[1fr,120px,120px,auto] items-end">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Badge name ({b.key})</Label>
                    <Input
                      className="h-8" value={b.name}
                      onChange={(e) => setBadges((s) => s.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Required courses</Label>
                    <Input
                      type="number" min={1} className="h-8" value={b.required_count}
                      onChange={(e) => setBadges((s) => s.map((x, j) => j === i ? { ...x, required_count: num(e.target.value) } : x))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Sort order</Label>
                    <Input
                      type="number" min={0} className="h-8" value={b.sort_order}
                      onChange={(e) => setBadges((s) => s.map((x, j) => j === i ? { ...x, sort_order: num(e.target.value) } : x))}
                    />
                  </div>
                  <div className="flex items-center gap-2 pb-1">
                    <Switch
                      checked={b.is_active}
                      onCheckedChange={(v) => setBadges((s) => s.map((x, j) => j === i ? { ...x, is_active: v } : x))}
                    />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Qualifying course slugs (comma separated)</Label>
                  <Input
                    className="h-8" value={b.course_slugs.join(", ")}
                    onChange={(e) => setBadges((s) => s.map((x, j) => j === i
                      ? { ...x, course_slugs: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) }
                      : x))}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {b.category ? `Also matches courses in category: ${b.category}` : "Matched by course slug only."}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
