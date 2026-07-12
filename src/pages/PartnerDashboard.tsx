import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PartnerStatsCards from "@/components/partners/PartnerStatsCards";
import ReferralTable from "@/components/partners/ReferralTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, CheckCircle, KeyRound, ShieldCheck, GraduationCap, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";

const CERT_STYLES: Record<string, string> = {
  bronze: "bg-gradient-to-br from-amber-700 to-amber-500 text-white",
  silver: "bg-gradient-to-br from-slate-400 to-slate-200 text-navy",
  gold: "bg-gradient-to-br from-yellow-500 to-yellow-300 text-navy",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-blue-100 text-blue-800 border-blue-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  won: "bg-green-100 text-green-800 border-green-200",
  lost: "bg-slate-100 text-slate-800 border-slate-200",
  expired: "bg-slate-100 text-slate-800 border-slate-200",
};

const PartnerDashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [dealForm, setDealForm] = useState({
    prospect_company: "",
    prospect_contact_name: "",
    prospect_email: "",
    prospect_country: "",
    estimated_arr_eur: "",
    notes: "",
  });
  const [submittingDeal, setSubmittingDeal] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [user, isLoading, navigate]);

  const load = async (userId: string) => {
    const { data: p } = await supabase.from("partners").select("*").eq("user_id", userId).maybeSingle();
    if (!p) { setLoading(false); return; }
    setPartner(p);
    const [{ data: r }, { data: d }] = await Promise.all([
      supabase.from("referrals").select("*").eq("partner_id", (p as any).id).order("created_at", { ascending: false }),
      supabase.from("deal_registrations").select("*").eq("partner_id", (p as any).id).order("created_at", { ascending: false }),
    ]);
    setReferrals((r as any[]) || []);
    setDeals((d as any[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    load(user.id);
  }, [user]);

  const referralLink = partner ? `${window.location.origin}?ref=${(partner as any).referral_code}` : "";

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const submitDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner || !user) return;
    if (!dealForm.prospect_company.trim()) { toast.error("Prospect company is required"); return; }
    setSubmittingDeal(true);
    const { error } = await supabase.from("deal_registrations").insert({
      partner_id: partner.id,
      submitted_by: user.id,
      prospect_company: dealForm.prospect_company.trim(),
      prospect_contact_name: dealForm.prospect_contact_name.trim() || null,
      prospect_email: dealForm.prospect_email.trim() || null,
      prospect_country: dealForm.prospect_country.trim() || null,
      estimated_arr_eur: dealForm.estimated_arr_eur ? Number(dealForm.estimated_arr_eur) : null,
      notes: dealForm.notes.trim() || null,
    } as any);
    if (error) { toast.error("Failed to register deal"); console.error(error); }
    else {
      toast.success("Deal registered — 90-day protection active.");
      setDealForm({ prospect_company: "", prospect_contact_name: "", prospect_email: "", prospect_country: "", estimated_arr_eur: "", notes: "" });
      load(user.id);
    }
    setSubmittingDeal(false);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-16 flex items-center justify-center">
          <Card className="max-w-md border-divider">
            <CardContent className="pt-8 pb-8 text-center">
              <p className="text-text-secondary mb-4">You don't have an active partner account yet.</p>
              <Button onClick={() => navigate("/partners/apply")}>Apply Now</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const conversions = referrals.filter((r) => r.status === "converted");
  const pendingCommission = referrals.filter((r) => r.status === "signed_up").reduce((s, r: any) => s + (r.commission_earned || 0), 0);
  const totalEarned = conversions.reduce((s, r: any) => s + (r.commission_earned || 0), 0);
  const cert = partner.certification_level as string;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Partner Dashboard"
        description="Track your referrals, conversions, and commissions."
        noindex
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Partner Program", url: "/partners" },
          { name: "Dashboard", url: "/partners/dashboard" },
        ]}
      />
      <Header />
      <main className="flex-1 py-12 bg-surface-subtle">
        <div className="container-enterprise space-y-6">
          {/* Header row */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-navy mb-1">Partner Dashboard</h1>
              <p className="text-text-secondary">Referrals, deals, sandbox access & certification.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 capitalize">
                {partner.partner_type} · {(partner.commission_rate * 100).toFixed(0)}%
              </Badge>
              {cert && cert !== "none" && (
                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${CERT_STYLES[cert]}`}>
                  <ShieldCheck className="h-3 w-3" />
                  {cert} Certified
                </div>
              )}
            </div>
          </div>

          <PartnerStatsCards
            totalReferrals={referrals.length}
            conversions={conversions.length}
            pendingCommission={pendingCommission}
            totalEarned={totalEarned}
          />

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Referral Link */}
            <Card className="border-divider">
              <CardHeader>
                <CardTitle className="text-navy text-lg">Your Referral Link</CardTitle>
                <CardDescription>{partner.commission_lifetime_months}-month recurring commission per signup.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input value={referralLink} readOnly className="font-mono text-xs" />
                  <Button variant="outline" onClick={() => copy(referralLink, "Link")} className="shrink-0">
                    {copied === "Link" ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sandbox API Key */}
            <Card className="border-divider">
              <CardHeader>
                <CardTitle className="text-navy text-lg flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-teal" /> Sandbox API Key
                </CardTitle>
                <CardDescription>Test AML, KYC & KYB APIs without a paid subscription.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={showKey ? partner.sandbox_key ?? "" : "•".repeat(32)}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button variant="outline" onClick={() => setShowKey(!showKey)} className="shrink-0">
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" onClick={() => copy(partner.sandbox_key ?? "", "Key")} className="shrink-0">
                    {copied === "Key" ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <a
                  href="https://worldaml.readme.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal text-xs mt-2 inline-block hover:underline"
                >
                  → View API documentation
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Academy seats */}
          <Card className="border-divider">
            <CardHeader>
              <CardTitle className="text-navy text-lg flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-teal" /> Free Academy Seats
              </CardTitle>
              <CardDescription>
                You have <strong>{partner.academy_seats_granted}</strong> complimentary CPD-certified Academy seats to allocate to your team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <a href="/academy">Browse Academy Courses</a>
              </Button>
              <p className="text-text-secondary text-xs mt-2">
                Contact your partner manager to grant seats to specific team members.
              </p>
            </CardContent>
          </Card>

          {/* Deal Registration */}
          <Card className="border-divider">
            <CardHeader>
              <CardTitle className="text-navy text-lg">Register a Deal</CardTitle>
              <CardDescription>
                Submit a prospect to lock in <strong>90-day channel protection</strong>. Our sales team won't approach the account independently.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitDeal} className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prospect_company">Prospect Company *</Label>
                  <Input id="prospect_company" value={dealForm.prospect_company} onChange={(e) => setDealForm({ ...dealForm, prospect_company: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="prospect_contact_name">Contact Name</Label>
                  <Input id="prospect_contact_name" value={dealForm.prospect_contact_name} onChange={(e) => setDealForm({ ...dealForm, prospect_contact_name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="prospect_email">Contact Email</Label>
                  <Input id="prospect_email" type="email" value={dealForm.prospect_email} onChange={(e) => setDealForm({ ...dealForm, prospect_email: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="prospect_country">Country</Label>
                  <Input id="prospect_country" value={dealForm.prospect_country} onChange={(e) => setDealForm({ ...dealForm, prospect_country: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="estimated_arr_eur">Estimated ARR (EUR)</Label>
                  <Input id="estimated_arr_eur" type="number" min="0" value={dealForm.estimated_arr_eur} onChange={(e) => setDealForm({ ...dealForm, estimated_arr_eur: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" rows={3} value={dealForm.notes} onChange={(e) => setDealForm({ ...dealForm, notes: e.target.value })} maxLength={2000} />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={submittingDeal}>
                    {submittingDeal ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Register Deal
                  </Button>
                </div>
              </form>

              {deals.length > 0 && (
                <div className="mt-8 overflow-x-auto">
                  <h4 className="text-sm font-semibold text-navy mb-3">Your Registered Deals</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-divider text-left text-text-secondary">
                        <th className="pb-2 pr-3 font-medium">Company</th>
                        <th className="pb-2 pr-3 font-medium">ARR</th>
                        <th className="pb-2 pr-3 font-medium">Status</th>
                        <th className="pb-2 pr-3 font-medium">Protected Until</th>
                        <th className="pb-2 font-medium">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deals.map((d: any) => (
                        <tr key={d.id} className="border-b border-divider/50">
                          <td className="py-2 pr-3 font-medium text-navy">{d.prospect_company}</td>
                          <td className="py-2 pr-3 text-text-secondary">{d.estimated_arr_eur ? `€${d.estimated_arr_eur.toLocaleString()}` : "—"}</td>
                          <td className="py-2 pr-3"><Badge className={STATUS_STYLES[d.status]}>{d.status}</Badge></td>
                          <td className="py-2 pr-3 text-text-secondary">{new Date(d.protection_expires_at).toLocaleDateString("en-GB")}</td>
                          <td className="py-2 text-text-secondary">{new Date(d.created_at).toLocaleDateString("en-GB")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referral History */}
          <Card className="border-divider">
            <CardHeader>
              <CardTitle className="text-navy text-lg">Referral History</CardTitle>
            </CardHeader>
            <CardContent>
              <ReferralTable referrals={referrals} />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PartnerDashboard;
