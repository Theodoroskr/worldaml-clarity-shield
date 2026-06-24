import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import AnnouncementBar from "@/components/AnnouncementBar";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import StickyBottomCTA from "@/components/StickyBottomCTA";
import { isAcademyHost } from "@/lib/academyHost";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { pathname } = useLocation();
  const academyHost = isAcademyHost();
  // Academy subdomain renders an Academy-only experience — suppress
  // the marketing announcement bar and sticky CTA, keep the chatbot.
  const isAppShell = pathname.startsWith("/rcm") || pathname.startsWith("/suite");
  return (
    <>
      {!isAppShell && !academyHost && <AnnouncementBar />}
      {children}
      {!isAppShell && !academyHost && <StickyBottomCTA />}
      {!isAppShell && <ChatbotWidget />}
    </>
  );
};

export default Layout;
