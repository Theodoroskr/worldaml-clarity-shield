import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import AnnouncementBar from "@/components/AnnouncementBar";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import StickyBottomCTA from "@/components/StickyBottomCTA";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { pathname } = useLocation();
  const isAppShell = pathname.startsWith("/rcm") || pathname.startsWith("/suite");
  return (
    <>
      {!isAppShell && <AnnouncementBar />}
      {children}
      {!isAppShell && <StickyBottomCTA />}
      {!isAppShell && <ChatbotWidget />}
    </>
  );
};

export default Layout;
