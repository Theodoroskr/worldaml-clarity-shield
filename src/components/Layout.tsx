import { ReactNode } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import StickyBottomCTA from "@/components/StickyBottomCTA";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <AnnouncementBar />
      {children}
      <StickyBottomCTA />
      <ChatbotWidget />
    </>
  );
};

export default Layout;