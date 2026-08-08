import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { recordVisit } from "@/lib/webAttribution";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Record the page view so attribution keeps an accurate CTA trail
    // (the page the visitor was on before opening a form).
    recordVisit();
  }, [pathname]);

  return null;
};

export default ScrollToTop;
