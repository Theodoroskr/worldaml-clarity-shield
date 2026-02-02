import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Building2, LogOut } from "lucide-react";

const Dashboard = () => {
  const { user, profile, isLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
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
                <Button className="mt-4 w-full" variant="outline" onClick={() => navigate("/pricing")}>
                  View Plans
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
