import { useNavigate } from "react-router-dom";
import { Search, Bell, Globe, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import WorkspaceSwitcher from "@/components/auth/WorkspaceSwitcher";

interface SuiteAppTopbarProps {
  title?: string;
}

export default function SuiteAppTopbar({ title }: SuiteAppTopbarProps) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const currentProfile = profile?.user_id === user?.id ? profile : null;
  const initials = currentProfile?.full_name
    ? currentProfile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="h-14 shrink-0 bg-card border-b border-border flex items-center px-6 gap-4">
      <div className="flex-1">
        {title && <h2 className="font-semibold text-foreground text-sm">{title}</h2>}
      </div>

      <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 w-72">
        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <input
          className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
          placeholder="Find customers, transactions..."
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-sm font-medium px-2 py-1.5 rounded-lg hover:bg-muted cursor-pointer">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">EN</span>
        </div>

        <div className="relative">
          <Bell className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 cursor-pointer rounded-lg px-1.5 py-1 hover:bg-muted transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                {initials}
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="truncate">
              <span className="block text-sm">{currentProfile?.full_name || user?.email}</span>
              {currentProfile?.full_name && <span className="block text-xs font-normal text-muted-foreground truncate">{user?.email}</span>}
            </DropdownMenuLabel>
            <WorkspaceSwitcher current="suite" />
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={async () => { await signOut(); navigate("/login"); }} className="text-destructive">
              <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
