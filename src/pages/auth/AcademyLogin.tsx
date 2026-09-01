import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PortalLoginForm from "@/components/auth/PortalLoginForm";
import { GraduationCap } from "lucide-react";

export default function AcademyLogin() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Sign in to WorldAML Academy" description="Access your WorldAML Academy courses, learning progress and certificates." noindex />
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <PortalLoginForm
          portal="academy"
          title="Sign in to WorldAML Academy"
          subtitle="Access your courses, learning progress and certificates."
          icon={<div className="h-11 w-11 rounded-xl bg-teal/10 text-teal flex items-center justify-center"><GraduationCap className="h-5 w-5" /></div>}
          footer={
            <>
              <div className="font-medium text-navy">New to WorldAML Academy?</div>
              <Link to="/signup" className="mt-2 inline-block text-teal hover:underline font-medium">
                Create Account
              </Link>
              <div className="mt-3 pt-3 border-t border-border text-sm text-muted-foreground">
                Manage company subscriptions instead?{" "}
                <Link to="/business/login" className="text-teal hover:underline">Business sign in</Link>
              </div>
            </>
          }
        />
      </main>
      <Footer />
    </div>
  );
}
