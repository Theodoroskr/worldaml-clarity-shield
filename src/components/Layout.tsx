import { ReactNode } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <AnnouncementBar />
      {children}
    </>
  );
};

export default Layout;