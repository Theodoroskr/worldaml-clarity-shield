import { ReactNode } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <AnnouncementBar />
      {children}
      <ChatbotWidget />
    </>
  );
};

export default Layout;