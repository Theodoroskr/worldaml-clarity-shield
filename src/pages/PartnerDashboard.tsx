import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PartnerStatsCards from "@/components/partners/PartnerStatsCards";
import ReferralTable from "@/components/partners/ReferralTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const PartnerDashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: p } = await supabase.from("partners").select("*").eq("user_id", user.id).maybeSingle();
      if (!p) { setLoading(false); return; }
      setPartner(p);
      const { data: r } = await supabase.from("referrals").select("*").eq("partner_id", (p as any).id).order("created_at", { ascending: false });
      setReferrals((r as any[]) || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const referralLink = partner ? `${window.location.origin}?ref=${(partner as any).referral_code}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
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
  const pendingCommission = referrals
    .filter((r) => r.status === "signed_up")
    .reduce((sum: number, r: any) => sum + (r.commission_earned || 0), 0);
  const totalEarned = conversions.reduce((sum: number, r: any) => sum + (r.commission_earned || 0), 0);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Partner Dashboard — WorldAML" description="Track your referrals, conversions, and commissions." noindex />
      <Header />
      <main className="flex-1 py-12">
        <div className="container-enterprise">
          <h1 className="text-3xl font-bold text-navy mb-2">Partner Dashboard</h1>
          <p className="text-text-secondary mb-8">Track your referrals and commissions</p>

          <PartnerStatsCards
            totalReferrals={referrals.length}
            conversions={conversions.length}
            pendingCommission={pendingCommission}
            totalEarned={totalEarned}
          />

          {/* Referral Link */}
          <Card className="mt-8 border-divider">
            <CardHeader>
              <CardTitle className="text-navy text-lg">Your Referral Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input value={referralLink} readOnly className="font-mono text-sm" />
                <Button variant="outline" onClick={copyLink} className="shrink-0">
                  {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-text-secondary text-xs mt-2">Share this link. When someone signs up, it's tracked as your referral.</p>
            </CardContent>
          </Card>

          {/* Referral History */}
          <Card className="mt-8 border-divider">
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
