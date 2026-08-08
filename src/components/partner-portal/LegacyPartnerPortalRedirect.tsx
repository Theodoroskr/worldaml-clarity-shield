import { Navigate, useParams } from "react-router-dom";

/** Legacy /partner-portal/:section → /partner/:section */
export default function LegacyPartnerPortalRedirect() {
  const { section } = useParams();
  return <Navigate to={`/partner/${section ?? "dashboard"}`} replace />;
}
