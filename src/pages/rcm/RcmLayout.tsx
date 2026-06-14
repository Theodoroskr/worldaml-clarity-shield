import { Outlet, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RcmSidebar } from "@/components/rcm/RcmSidebar";
import { LanguageSwitcher } from "@/components/rcm/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useRcmOrg } from "@/hooks/useRcmOrg";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import "@/i18n";

export default function RcmLayout() {
  const { t, i18n } = useTranslation();
  const { membership } = useRcmOrg();
  const { user, isAdmin, isLoading } = useAuth();
  const dir = i18n.dir();
  const isRtl = dir === "rtl";

  // RCM is in beta — restrict to platform admins only.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <SidebarProvider>
      <div dir={dir} className="min-h-screen flex w-full bg-background">
        <RcmSidebar side={isRtl ? "right" : "left"} />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b flex items-center justify-between px-3 gap-3">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="text-start">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{t("rcm.brand")}</div>
                <div className="text-sm font-semibold">{t("rcm.title")}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {membership ? (
                <Badge variant="outline">{membership.orgName} · {membership.role}</Badge>
              ) : null}
              <LanguageSwitcher />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto"><Outlet /></main>
        </div>
      </div>
    </SidebarProvider>
  );
}
