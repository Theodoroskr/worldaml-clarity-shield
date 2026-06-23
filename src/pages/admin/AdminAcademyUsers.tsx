import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search, Send, Download, GraduationCap, Mail, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  subscription_tier: string;
  created_at: string;
}

interface Purchase {
  id: string;
  user_id: string;
  course_slug: string;
  amount_cents: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  paid_at: string | null;
  created_at: string;
  expires_at: string | null;
}

interface AcademyUser {
  profile: Profile;
  purchases: Purchase[];
  paidCount: number;
  totalSpentCents: number;
  currency: string;
  lastActivity: string;
  courses: string[];
}

const EMAIL_RE =
  /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;

const FREE_EMAIL = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "protonmail.com",
  "proton.me",
  "aol.com",
  "live.com",
  "msn.com",
  "yandex.com",
  "mail.com",
  "gmx.com",
  "zoho.com",
]);

const domainOf = (email: string | null | undefined) => {
  if (!email) return "";
  const at = email.lastIndexOf("@");
  return at >= 0 ? email.slice(at + 1).toLowerCase() : "";
};

export default function AdminAcademyUsers() {
  const [users, setUsers] = useState<AcademyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [segment, setSegment] = useState<"all" | "paid" | "pending" | "corporate" | "personal">(
    "all"
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkTemplate, setBulkTemplate] =
    useState<"suite-upsell" | "screening-upsell">("suite-upsell");
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: purchases, error: pErr }, { data: profiles, error: prErr }] =
      await Promise.all([
        supabase
          .from("academy_course_purchases")
          .select("id, user_id, course_slug, amount_cents, currency, status, paid_at, created_at, expires_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("id, user_id, email, full_name, company_name, subscription_tier, created_at"),
      ]);

    if (pErr || prErr) {
      toast.error((pErr || prErr)?.message || "Failed to load academy data");
      setLoading(false);
      return;
    }

    const profileMap = new Map<string, Profile>();
    (profiles || []).forEach((p: any) => profileMap.set(p.user_id, p as Profile));

    const byUser = new Map<string, Purchase[]>();
    (purchases || []).forEach((row: any) => {
      const list = byUser.get(row.user_id) || [];
      list.push(row as Purchase);
      byUser.set(row.user_id, list);
    });

    // Also include profiles whose tier === "academy" with no purchase rows
    (profiles || []).forEach((p: any) => {
      if (p.subscription_tier === "academy" && !byUser.has(p.user_id)) {
        byUser.set(p.user_id, []);
      }
    });

    const grouped: AcademyUser[] = [];
    byUser.forEach((purchaseList, userId) => {
      const profile = profileMap.get(userId);
      if (!profile) return;
      const paid = purchaseList.filter((r) => r.status === "paid");
      const totalSpentCents = paid.reduce((s, r) => s + (r.amount_cents || 0), 0);
      const currency = paid[0]?.currency || purchaseList[0]?.currency || "eur";
      const lastActivity =
        purchaseList
          .map((r) => r.paid_at || r.created_at)
          .filter(Boolean)
          .sort()
          .reverse()[0] || profile.created_at;
      const courses = Array.from(new Set(purchaseList.map((r) => r.course_slug))).filter(Boolean);
      grouped.push({
        profile,
        purchases: purchaseList,
        paidCount: paid.length,
        totalSpentCents,
        currency,
        lastActivity,
        courses,
      });
    });

    grouped.sort(
      (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
    setUsers(grouped);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const allCourses = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => u.courses.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [users]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const dom = domainOf(u.profile.email);
      const isCorporate = !!dom && !FREE_EMAIL.has(dom);
      if (segment === "corporate" && !isCorporate) return false;
      if (segment === "personal" && isCorporate) return false;
      if (segment === "paid" && u.paidCount === 0) return false;
      if (segment === "pending" && u.paidCount > 0) return false;
      if (courseFilter !== "all" && !u.courses.includes(courseFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay =
          (u.profile.full_name || "") +
          " " +
          (u.profile.email || "") +
          " " +
          (u.profile.company_name || "") +
          " " +
          dom +
          " " +
          u.courses.join(" ");
        if (!hay.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [users, search, courseFilter, segment]);

  const stats = useMemo(() => {
    const total = users.length;
    const paid = users.filter((u) => u.paidCount > 0).length;
    const pending = total - paid;
    const corporate = users.filter((u) => {
      const d = domainOf(u.profile.email);
      return d && !FREE_EMAIL.has(d);
    }).length;
    const revenueCents = users.reduce((s, u) => s + u.totalSpentCents, 0);
    return { total, paid, pending, corporate, revenueCents };
  }, [users]);

  const toggleSelect = (userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((u) => u.profile.user_id)));
    }
  };

  const exportCsv = () => {
    const rows = [
      [
        "email",
        "full_name",
        "company",
        "domain",
        "is_corporate",
        "courses",
        "paid_count",
        "total_spent",
        "currency",
        "last_activity",
        "registered_at",
      ],
      ...filtered.map((u) => {
        const dom = domainOf(u.profile.email);
        const isCorporate = !!dom && !FREE_EMAIL.has(dom);
        return [
          u.profile.email || "",
          u.profile.full_name || "",
          u.profile.company_name || "",
          dom,
          isCorporate ? "yes" : "no",
          u.courses.join("|"),
          String(u.paidCount),
          (u.totalSpentCents / 100).toFixed(2),
          u.currency.toUpperCase(),
          u.lastActivity,
          u.profile.created_at,
        ];
      }),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `academy-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendBulk = async () => {
    const targets = users.filter(
      (u) => selected.has(u.profile.user_id) && u.profile.email
    );
    if (targets.length === 0) {
      toast.error("No selected users with a valid email");
      return;
    }
    setSending(true);
    let ok = 0;
    let fail = 0;
    for (const u of targets) {
      const email = (u.profile.email || "").trim().toLowerCase();
      if (!EMAIL_RE.test(email)) {
        fail++;
        continue;
      }
      try {
        const { data, error } = await supabase.functions.invoke("send-upsell-email", {
          body: {
            recipientEmail: email,
            recipientName: u.profile.full_name || "",
            templateId: bulkTemplate,
          },
        });
        if (error || data?.error) {
          fail++;
        } else {
          ok++;
        }
      } catch {
        fail++;
      }
    }
    setSending(false);
    toast.success(`Sent ${ok} email(s)${fail ? `, ${fail} failed` : ""}`);
    setBulkOpen(false);
    setSelected(new Set());
  };

  const fmtMoney = (cents: number, currency: string) =>
    `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Academy Signups
          </h1>
          <p className="text-xs text-muted-foreground">
            Dedicated marketing view for Academy learners — separated from Suite & Platform users.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!filtered.length}>
            <Download className="w-3.5 h-3.5 mr-1" />
            Export CSV
          </Button>
          <Button
            size="sm"
            onClick={() => setBulkOpen(true)}
            disabled={selected.size === 0}
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            Send Upsell ({selected.size})
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Academy users" value={stats.total} />
        <StatCard label="Paid learners" value={stats.paid} accent="emerald" />
        <StatCard label="Signed up (no purchase)" value={stats.pending} accent="amber" />
        <StatCard label="Corporate emails" value={stats.corporate} accent="blue" />
        <StatCard
          label="Total revenue"
          value={`€${(stats.revenueCents / 100).toFixed(0)}`}
          accent="violet"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, company, domain…"
            className="pl-8"
          />
        </div>
        <Select value={segment} onValueChange={(v) => setSegment(v as any)}>
          <SelectTrigger className="w-44 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All segments</SelectItem>
            <SelectItem value="paid">Paid learners</SelectItem>
            <SelectItem value="pending">Signed up — no purchase</SelectItem>
            <SelectItem value="corporate">Corporate email</SelectItem>
            <SelectItem value="personal">Personal email</SelectItem>
          </SelectContent>
        </Select>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-52 text-sm">
            <SelectValue placeholder="All courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {allCourses.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs uppercase text-muted-foreground">
                  <th className="px-3 py-2 w-8">
                    <Checkbox
                      checked={
                        filtered.length > 0 && selected.size === filtered.length
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-3 py-2 text-left">Learner</th>
                  <th className="px-3 py-2 text-left">Company / Domain</th>
                  <th className="px-3 py-2 text-left">Courses</th>
                  <th className="px-3 py-2 text-left">Paid</th>
                  <th className="px-3 py-2 text-left">Spend</th>
                  <th className="px-3 py-2 text-left">Last activity</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u) => {
                  const dom = domainOf(u.profile.email);
                  const isCorporate = !!dom && !FREE_EMAIL.has(dom);
                  return (
                    <tr
                      key={u.profile.user_id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-3 py-3">
                        <Checkbox
                          checked={selected.has(u.profile.user_id)}
                          onCheckedChange={() => toggleSelect(u.profile.user_id)}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-foreground">
                          {u.profile.full_name || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {u.profile.email}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-xs text-foreground">
                          {u.profile.company_name || "—"}
                        </div>
                        {dom && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] mt-0.5 ${
                              isCorporate
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {dom}
                          </Badge>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.courses.length === 0 && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                          {u.courses.map((c) => (
                            <Badge
                              key={c}
                              variant="outline"
                              className="text-[10px] bg-cyan-50 text-cyan-700 border-cyan-200"
                            >
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {u.paidCount > 0 ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            {u.paidCount} paid
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200"
                          >
                            None
                          </Badge>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs tabular-nums">
                        {u.totalSpentCents > 0
                          ? fmtMoney(u.totalSpentCents, u.currency)
                          : "—"}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        {new Date(u.lastActivity).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-3">
                        {u.profile.email && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-teal-600"
                            onClick={async () => {
                              try {
                                const { data, error } = await supabase.functions.invoke(
                                  "send-upsell-email",
                                  {
                                    body: {
                                      recipientEmail: u.profile.email!.toLowerCase(),
                                      recipientName: u.profile.full_name || "",
                                      templateId: "suite-upsell",
                                    },
                                  }
                                );
                                if (error || data?.error)
                                  throw new Error(error?.message || data?.error);
                                toast.success(`Upsell sent to ${u.profile.email}`);
                              } catch (err: any) {
                                toast.error(err.message || "Failed to send");
                              }
                            }}
                          >
                            <Mail className="w-3.5 h-3.5 mr-1" />
                            Suite upsell
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No academy users match the current filter.
              </div>
            )}
          </div>
          <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">
            Showing {filtered.length} of {users.length} academy users
          </div>
        </Card>
      )}

      {/* Bulk upsell dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send marketing email to {selected.size} learners</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                Template
              </label>
              <Select
                value={bulkTemplate}
                onValueChange={(v) => setBulkTemplate(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suite-upsell">
                    Suite Upsell — invite to WorldAML Suite
                  </SelectItem>
                  <SelectItem value="screening-upsell">
                    Screening Upsell — WorldCompliance data
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Emails go via the existing <code>send-upsell-email</code> function. Invalid
              addresses will be skipped.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={sendBulk} disabled={sending}>
              {sending && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
              Send {selected.size}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: "amber" | "emerald" | "rose" | "blue" | "violet";
}) {
  const color =
    accent === "amber"
      ? "text-amber-500"
      : accent === "emerald"
      ? "text-emerald-500"
      : accent === "rose"
      ? "text-rose-500"
      : accent === "blue"
      ? "text-blue-500"
      : accent === "violet"
      ? "text-violet-500"
      : "text-foreground";
  return (
    <Card className="p-3">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className={`text-lg font-semibold ${color}`}>{value}</div>
    </Card>
  );
}
