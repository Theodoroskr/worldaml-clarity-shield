import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Building2, LogOut, CreditCard, ShieldAlert, Search, GraduationCap, Award, Share2, ExternalLink, Copy, Globe } from "lucide-react";
import { CrossSellCard } from "@/components/CrossSellCard";
import { DashboardSanctionsWidget } from "@/components/sanctions/DashboardSanctionsWidget";
import { SearchHistoryPanel, SearchHistoryHandle } from "@/components/sanctions/SearchHistoryPanel";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, profile, isLoading, isApproved, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const historyRef = useRef<SearchHistoryHandle>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [certsLoading, setCertsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      supabase
        .from("academy_certificates")
        .select("*, academy_courses(title, slug)")
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false })
        .then(({ data }) => {
          setCertificates(data ?? []);
          setCertsLoading(false);
        });
    }
  }, [user]);

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

            {/* Academy Card */}
            <Card className="border-teal/20 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/academy")}>
              <CardHeader>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/10 text-teal mb-2">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <CardTitle>WorldAML Academy</CardTitle>
                <CardDescription>Courses, quizzes & certificates</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary mb-4">
                  Build your compliance expertise and earn shareable certificates.
                </p>
                <div className="flex gap-2">
                  <Button className="flex-1" size="sm" onClick={(e) => { e.stopPropagation(); navigate("/academy"); }}>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Browse Courses
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-10 space-y-6">
            <h2 className="text-xl font-semibold text-navy">Quick Tools</h2>

            {/* EU Sanctions Map Card */}
            <Card className="border-navy/20 hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="h-5 w-5 text-navy" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy">EU Sanctions Map</p>
                  <p className="text-xs text-text-secondary">Interactive map of EU restrictive measures by country</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate("/eu-sanctions-map")}>
                  Explore Map
                </Button>
              </CardContent>
            </Card>
            <DashboardSanctionsWidget onSearchComplete={() => historyRef.current?.refresh()} />
            <SearchHistoryPanel ref={historyRef} />
          </div>

          {/* My Certificates */}
          <div className="mt-10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-navy flex items-center gap-2">
                <Award className="h-5 w-5 text-teal" />
                My Certificates
              </h2>
              {certificates.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => navigate("/academy")}>
                  Earn more →
                </Button>
              )}
            </div>
            {certsLoading ? (
              <div className="flex items-center gap-2 text-sm text-text-secondary py-4">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading certificates…
              </div>
            ) : certificates.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-navy mb-1">No certificates yet</p>
                  <p className="text-xs text-text-secondary mb-4">Complete a course quiz with 80%+ to earn your first certificate.</p>
                  <Button size="sm" onClick={() => navigate("/academy")}>Start Learning</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {certificates.map((cert) => {
                  const certUrl = `${window.location.origin}/academy/certificate/${cert.share_token}`;
                  return (
                    <Card key={cert.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="flex items-center gap-4 py-4">
                        <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
                          <Award className="h-5 w-5 text-teal" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-navy truncate">
                            {cert.academy_courses?.title ?? "Course"}
                          </p>
                          <p className="text-xs text-text-secondary">
                            Score: {cert.score}% · {new Date(cert.issued_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Copy share link"
                            onClick={() => {
                              navigator.clipboard.writeText(certUrl);
                              toast.success("Certificate link copied!");
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="View certificate"
                            onClick={() => navigate(`/academy/certificate/${cert.share_token}`)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Share on LinkedIn"
                            onClick={() => {
                              window.open(
                                `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certUrl)}`,
                                "_blank"
                              );
                            }}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
