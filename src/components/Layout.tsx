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
  const isAppShell =
    pathname.startsWith("/rcm") ||
    pathname.startsWith("/suite") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/my-learning") ||
    pathname.startsWith("/certificates") ||
    pathname.startsWith("/account");
  const isOnboard = pathname.startsWith("/onboard/");
  return (
    <>
      {!isAppShell && !academyHost && !isOnboard && <AnnouncementBar />}
      {children}
      {!isAppShell && !academyHost && !isOnboard && <StickyBottomCTA />}
      {!isAppShell && !isOnboard && <ChatbotWidget />}
    </>
  );
};

export default Layout;
