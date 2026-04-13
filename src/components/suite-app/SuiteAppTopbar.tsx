import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Globe, LogOut, ArrowLeft, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface SuiteAppTopbarProps {
  title?: string;
}

export default function SuiteAppTopbar({ title }: SuiteAppTopbarProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
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

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-1.5 cursor-pointer rounded-lg px-1.5 py-1 hover:bg-muted transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              {initials}
            </div>
            <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform", menuOpen && "rotate-180")} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-popover border border-border rounded-lg shadow-lg py-1">
                {profile?.full_name && (
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground truncate">{profile.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                  </div>
                )}
                <button
                  onClick={() => { setMenuOpen(false); navigate("/dashboard"); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Exit Suite
                </button>
                <button
                  onClick={() => { setMenuOpen(false); signOut(); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
