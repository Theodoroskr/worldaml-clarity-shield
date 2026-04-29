import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, BookOpen, ListChecks, ShieldCheck, ClipboardCheck,
  Bell, FolderArchive, FileBarChart, Languages, Settings, History, ArrowLeft, LifeBuoy,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";

export function RcmSidebar({ side = "left" }: { side?: "left" | "right" }) {
  const { t } = useTranslation();
  const items = [
    { to: "/rcm", end: true, icon: LayoutDashboard, label: t("rcm.nav.dashboard") },
    { to: "/rcm/library", icon: BookOpen, label: t("rcm.nav.library") },
    { to: "/rcm/obligations", icon: ListChecks, label: t("rcm.nav.obligations") },
    { to: "/rcm/controls", icon: ShieldCheck, label: t("rcm.nav.controls") },
    { to: "/rcm/assessments", icon: ClipboardCheck, label: t("rcm.nav.assessments") },
    { to: "/rcm/tasks", icon: Bell, label: t("rcm.nav.tasks") },
    { to: "/rcm/evidence", icon: FolderArchive, label: t("rcm.nav.evidence") },
    { to: "/rcm/reports", icon: FileBarChart, label: t("rcm.nav.reports") },
    { to: "/rcm/translations", icon: Languages, label: t("rcm.nav.translations") },
    { to: "/rcm/audit", icon: History, label: t("rcm.nav.audit") },
    { to: "/rcm/settings", icon: Settings, label: t("rcm.nav.settings") },
    { to: "/rcm/help", icon: LifeBuoy, label: "Help & Process" },
  ];
  return (
    <Sidebar collapsible="icon" side={side}>
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to WorldAML Suite">
              <NavLink to="/suite" className="flex items-center gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span className="text-start font-medium">Back to Suite</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("rcm.brand")} · RCM</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(it => (
                <SidebarMenuItem key={it.to}>
                  <SidebarMenuButton asChild tooltip={it.label}>
                    <NavLink to={it.to} end={it.end} className={({ isActive }) =>
                      `flex items-center gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""
                      }`}>
                      <it.icon className="h-4 w-4 shrink-0" />
                      <span className="text-start">{it.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="px-2 py-1 text-xs text-sidebar-foreground/60">RCM v1.0</div>
      </SidebarFooter>
    </Sidebar>
  );
}
