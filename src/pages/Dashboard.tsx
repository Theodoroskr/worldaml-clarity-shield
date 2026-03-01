import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Building2, LogOut, CreditCard, ShieldAlert, Search } from "lucide-react";
import { CrossSellCard } from "@/components/CrossSellCard";
import { DashboardSanctionsWidget } from "@/components/sanctions/DashboardSanctionsWidget";
import { SearchHistoryPanel, SearchHistoryHandle } from "@/components/sanctions/SearchHistoryPanel";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, profile, isLoading, isApproved, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const historyRef = useRef<SearchHistoryHandle>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    } else if (!isLoading && user && !isApproved) {
      navigate("/pending-approval");
    }
  }, [user, isLoading, isApproved, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleManageSubscription = async () => {
    setIsManagingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Unable to open subscription management. You may not have an active subscription.');
    } finally {
      setIsManagingSubscription(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Dashboard" description="Manage your WorldAML account and subscriptions." noindex />
      <Header />
      <main className="flex-1 py-12">
        <div className="container-enterprise">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-navy">Dashboard</h1>
              <p className="text-text-secondary">Welcome back, {profile?.full_name || user.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {isAdmin && (
            <div className="mb-6 p-4 rounded-lg border border-navy/20 bg-navy/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-navy" />
                <div>
                  <p className="font-semibold text-navy text-sm">Admin Access</p>
                  <p className="text-text-secondary text-xs">Manage user approvals and accounts</p>
                </div>
              </div>
              <Button size="sm" onClick={() => navigate("/admin")}>Go to Admin Panel</Button>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/10 text-teal mb-2">
                  <User className="h-5 w-5" />
                </div>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm"><strong>Email:</strong> {user.email}</p>
                {profile?.full_name && (
                  <p className="text-sm"><strong>Name:</strong> {profile.full_name}</p>
                )}
                {profile?.company_name && (
                  <p className="text-sm"><strong>Company:</strong> {profile.company_name}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-navy/10 text-navy mb-2">
                  <Building2 className="h-5 w-5" />
                </div>
                <CardTitle>Subscriptions</CardTitle>
                <CardDescription>Your active plans</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">No active subscriptions</p>
                <div className="mt-4 space-y-2">
                  <Button className="w-full" variant="outline" onClick={() => navigate("/pricing")}>
                    View Plans
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="secondary" 
                    onClick={handleManageSubscription}
                    disabled={isManagingSubscription}
                  >
                    {isManagingSubscription ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    Manage Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Tools */}
          <div className="mt-10 space-y-6">
            <h2 className="text-xl font-semibold text-navy">Quick Tools</h2>
            <DashboardSanctionsWidget onSearchComplete={() => historyRef.current?.refresh()} />
            <SearchHistoryPanel ref={historyRef} />
          </div>

          {/* Cross-sell: add analyst seats */}
          <div className="mt-8">
            <CrossSellCard
              variant="compact"
              domain="worldkycsearch.com"
              destPath="/team"
              utmSource="worldaml.com"
              utmMedium="dashboard-apikeys"
              utmCampaign="add-analyst-seats"
              accentColor="hsl(222 47% 40%)"
              icon={<Search className="w-4 h-4" />}
              eyebrow="WorldKYC Search"
              headline="Add analyst seats — let your team screen without touching the API"
              body="Give compliance analysts a no-code interface on worldkycsearch.com. Same underlying data, zero engineering overhead."
              ctaLabel="Add analyst seats"
              context={{ companyName: profile?.company_name ?? undefined }}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
