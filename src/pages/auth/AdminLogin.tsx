import SEO from "@/components/SEO";
import PortalLoginForm from "@/components/auth/PortalLoginForm";
import { Shield } from "lucide-react";

export default function AdminLogin() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <SEO title="Internal Sign In" description="WorldAML internal access." noindex />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <PortalLoginForm
            portal="admin"
            title="WorldAML Internal"
            subtitle="Authorised WorldAML staff only."
            icon={<div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Shield className="h-5 w-5" /></div>}
            accent="text-primary"
          />
          <p className="mt-4 text-center text-xs text-muted-foreground">
            All access is logged and monitored.
          </p>
        </div>
      </main>
    </div>
  );
}
