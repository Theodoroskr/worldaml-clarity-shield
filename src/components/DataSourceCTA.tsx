import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DataSourceCTAProps {
  productName?: string;
  variant?: "worldcompliance" | "bridger";
}

export const DataSourceCTA = ({ 
  productName = "WorldCompliance",
  variant = "worldcompliance"
}: DataSourceCTAProps) => {
  // Determine the demo link based on variant
  const demoLink = variant === "worldcompliance" 
    ? "/data-sources/worldcompliance/demo" 
    : "/demo";

  return (
    <section className="section-padding bg-navy">
      <div className="container-enterprise">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-white mb-4">
            Get Started with {productName}®
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Choose how you'd like to proceed. Our team is ready to help you find 
            the right solution for your compliance needs.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Request Demo */}
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-teal/20 text-teal mb-4">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Start Free Trial</h3>
              <p className="text-sm text-white/60 mb-6">
                Try the full platform free for 7 days — no credit card required.
              </p>
              <Button variant="accent" className="w-full" asChild>
                <Link to={demoLink}>
                  Start 7-Day Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          {/* Contact Sales */}
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-teal/20 text-teal mb-4">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Talk to Sales</h3>
              <p className="text-sm text-white/60 mb-6">
                Discuss your requirements and get a custom quote tailored to your needs.
              </p>
              <Button variant="outline-light" className="w-full" asChild>
                <Link to="/get-started">
                  Contact Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          {/* Documentation */}
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-teal/20 text-teal mb-4">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">View Resources</h3>
              <p className="text-sm text-white/60 mb-6">
                Explore documentation, integration guides, and technical specifications.
              </p>
              <Button variant="outline-light" className="w-full" asChild>
                <Link to="/platform/api">
                  View Docs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Trust line */}
        <p className="text-center text-sm text-white/50 mt-10">
          Powered by LexisNexis Risk Solutions • Delivered by Infocredit Group
        </p>
      </div>
    </section>
  );
};

export default DataSourceCTA;
