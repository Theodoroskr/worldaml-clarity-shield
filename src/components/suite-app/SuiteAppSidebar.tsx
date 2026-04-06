import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Users, Shield, CreditCard, AlertTriangle,
  FileText, BarChart3, Settings, ChevronRight, Activity,
  UserCheck, Fingerprint, ClipboardList, Menu, Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  children?: { label: string; path: string }[];
}

const navGroups: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/suite" },
    ],
  },
  {
    title: "Onboarding",
    items: [
      {
        icon: Users, label: "Customers",
        children: [
          { label: "Onboarding", path: "/suite/onboarding" },
          { label: "IDV & Liveness", path: "/suite/idv" },
        ],
      },
    ],
  },
  {
    title: "Compliance",
    items: [
      { icon: Shield, label: "AML Screening", path: "/suite/screening" },
      {
        icon: CreditCard, label: "Transactions",
        children: [
          { label: "Live Monitor", path: "/suite/transactions" },
        ],
      },
      { icon: AlertTriangle, label: "Alerts", path: "/suite/alerts" },
      { icon: Scale, label: "Alert Rules", path: "/suite/alerts/rules" },
      { icon: BarChart3, label: "Risk Assessment", path: "/suite/risk" },
    ],
  },
  {
    title: "Investigations",
    items: [
      { icon: ClipboardList, label: "Cases & SAR", path: "/suite/cases" },
      { icon: FileText, label: "Audit Trail", path: "/suite/audit" },
    ],
  },
  {
    title: "System",
    items: [
      { icon: Settings, label: "Settings", path: "/suite/settings" },
    ],
  },
];

export default function SuiteAppSidebar() {
  const [expandedItems, setExpandedItems] = useState<string[]>(["Customers", "Transactions"]);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (path?: string) => path ? location.pathname === path : false;

  if (collapsed) {
    return (
      <aside className="flex flex-col h-screen w-14 shrink-0 items-center py-3 gap-2 bg-sidebar border-r border-sidebar-border">
        <button
          onClick={() => setCollapsed(false)}
          className="w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:bg-sidebar-accent text-sidebar-foreground/60"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center mt-1">
          <Shield className="w-3.5 h-3.5 text-accent-foreground" />
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col h-screen w-60 shrink-0 bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Shield className="w-4 h-4 text-accent-foreground" />
          </div>
          <div>
            <div className="text-sm font-bold text-sidebar-foreground leading-none">WorldAML Suite</div>
            <div className="text-xs mt-0.5 text-sidebar-foreground/50">Enterprise</div>
          </div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-sidebar-accent transition-colors text-sidebar-foreground/60"
        >
          <Menu className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-3">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.title && (
              <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {group.title}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isExpanded = expandedItems.includes(item.label);
                const hasChildren = !!item.children;
                const itemActive = isActive(item.path) || (hasChildren && item.children?.some(c => isActive(c.path)));

                return (
                  <div key={item.label}>
                    <button
                      onClick={() => hasChildren ? toggleExpand(item.label) : item.path && navigate(item.path)}
                      className={cn(
                        "flex items-center gap-2 w-full text-left px-2.5 py-2 rounded-lg text-sm font-medium transition-colors",
                        itemActive && !hasChildren
                          ? "bg-sidebar-accent text-sidebar-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0 opacity-70" />
                      <span className="flex-1">{item.label}</span>
                      {hasChildren && (
                        <ChevronRight className={cn("w-3.5 h-3.5 transition-transform opacity-50", isExpanded && "rotate-90")} />
                      )}
                    </button>
                    {hasChildren && isExpanded && (
                      <div className="ml-3 mt-0.5 space-y-0.5 border-l pl-2 border-sidebar-border">
                        {item.children!.map((child) => (
                          <button
                            key={child.path}
                            onClick={() => navigate(child.path)}
                            className={cn(
                              "flex items-center gap-2 w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-colors",
                              isActive(child.path)
                                ? "bg-accent text-accent-foreground"
                                : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                            )}
                          >
                            {child.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs text-sidebar-foreground/70">Active</span>
        </div>
        <span className="text-[10px] font-mono text-sidebar-foreground/40">v1.0.0</span>
      </div>
    </aside>
  );
}
