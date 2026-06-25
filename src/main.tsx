import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { captureAttribution } from "./lib/signupAttribution";

// Redirect academy.worldaml.com → worldaml.com/academy (canonical path-based URL)
if (typeof window !== "undefined" && window.location.hostname.toLowerCase() === "academy.worldaml.com") {
  const { pathname, search, hash } = window.location;
  const subPath = pathname === "/" ? "" : pathname.replace(/^\/academy(?=\/|$)/, "");
  window.location.replace(`https://worldaml.com/academy${subPath}${search}${hash}`);
}

captureAttribution();


createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
