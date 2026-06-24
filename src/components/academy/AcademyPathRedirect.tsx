import { Navigate, useParams, useLocation } from "react-router-dom";

/**
 * Redirect from a legacy /academy/* URL to its clean Academy-subdomain
 * equivalent. Used so existing links inside Academy pages still work
 * when the app is served from academy.worldaml.com.
 */
export const AcademyCourseRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`/${slug ?? ""}`} replace />;
};

export const AcademyCertificateRedirect = () => {
  const { token } = useParams();
  return <Navigate to={`/certificate/${token ?? ""}`} replace />;
};

export const AcademyRootRedirect = () => {
  const { pathname, search, hash } = useLocation();
  const stripped = pathname.replace(/^\/academy/, "") || "/";
  return <Navigate to={`${stripped}${search}${hash}`} replace />;
};
