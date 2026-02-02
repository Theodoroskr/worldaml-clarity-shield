import { Link } from "react-router-dom";
import { ArrowRight, Zap, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FinalCTASection = () => {
  return (
    <section className="section-padding bg-gradient-to-br from-navy via-navy to-navy-dark relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <circle cx="300" cy="100" r="150" stroke="currentColor" strokeWidth="1" fill="none" className="text-teal" />
          <circle cx="350" cy="200" r="100" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-teal" />
        </svg>
      </div>
      
      <div className="container-enterprise relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
              Ready to Transform Your<br />
              <span className="text-teal-light">Compliance Operations?</span>
            </h2>
            
            <p className="text-lg text-slate-light mb-8">
              Whether you're building a new compliance workflow or upgrading legacy systems, 
              WorldAML provides the infrastructure you need to scale with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="accent" asChild>
                <Link to="/get-started">
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline-light" asChild>
                <Link to="/platform">
                  Explore Platform
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
              <Zap className="w-8 h-8 text-teal-light mb-3" />
              <div className="text-3xl font-bold text-white mb-1">99.9%</div>
              <div className="text-sm text-slate-light">API Uptime SLA</div>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
              <Users className="w-8 h-8 text-teal-light mb-3" />
              <div className="text-3xl font-bold text-white mb-1">200+</div>
              <div className="text-sm text-slate-light">Enterprise Clients</div>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
              <Globe className="w-8 h-8 text-teal-light mb-3" />
              <div className="text-3xl font-bold text-white mb-1">240+</div>
              <div className="text-sm text-slate-light">Countries Covered</div>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
              <div className="w-8 h-8 text-teal-light mb-3 text-2xl font-bold">&lt;1s</div>
              <div className="text-3xl font-bold text-white mb-1">Avg</div>
              <div className="text-sm text-slate-light">Response Time</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
