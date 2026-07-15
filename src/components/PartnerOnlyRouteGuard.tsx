import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAccess } from "@/hooks/useAccess";
import { usePartner } from "@/hooks/usePartner";

/**
 * Enforces partner-only access:
 * A signed-in user who has an active partner record, is NOT an admin, and does NOT
 * have Suite/Enterprise access is redirected to /partner-portal whenever they try
 * to access authenticated app areas that aren't part of their portal.
 *
 * Admin routes (/admin/*) remain accessible only to admins — this guard just
 * prevents partner-only users from landing on /admin, /suite, /rcm or /dashboard.
 */
const RESTRICTED_PREFIXES = ["/admin", "/suite", "/rcm", "/dashboard"];

export default function PartnerOnlyRouteGuard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const { hasSuiteAccess } = useAccess();
  const { partner, isLoading: partnerLoading } = usePartner();

  useEffect(() => {
    if (authLoading || partnerLoading) return;
    if (!user) return;
    if (isAdmin) return;
    if (hasSuiteAccess) return;
    if (!partner?.is_active) return;

    const path = location.pathname;
    const isRestricted = RESTRICTED_PREFIXES.some(
      (p) => path === p || path.startsWith(`${p}/`)
    );
    if (isRestricted) {
      navigate("/partner-portal", { replace: true });
    }
  }, [
    authLoading,
    partnerLoading,
    user,
    isAdmin,
    hasSuiteAccess,
    partner?.is_active,
    location.pathname,
    navigate,
  ]);

  return null;
}
