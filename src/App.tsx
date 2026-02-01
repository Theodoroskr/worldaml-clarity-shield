import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import API from "./pages/API";
import Suite from "./pages/Suite";
import Industries from "./pages/Industries";
import Support from "./pages/Support";
import About from "./pages/About";
import GetStarted from "./pages/GetStarted";
import FAQ from "./pages/FAQ";
import News from "./pages/News";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import AccessYourData from "./pages/AccessYourData";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/api" element={<API />} />
          <Route path="/suite" element={<Suite />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/support" element={<Support />} />
          <Route path="/about" element={<About />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/news" element={<News />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/access-your-data" element={<AccessYourData />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
