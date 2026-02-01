import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Building2, Code } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GetStarted = () => {
  const [accountType, setAccountType] = useState<"business" | "developer">("business");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-xl mx-auto">
              <h1 className="text-display text-navy mb-4 text-center">
                Get Started
              </h1>
              <p className="text-body-lg text-text-secondary text-center mb-12">
                Create your WorldAML account and start screening in minutes.
              </p>

              {/* Account type selector */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => setAccountType("business")}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    accountType === "business"
                      ? "border-navy bg-navy/5"
                      : "border-divider hover:border-slate-muted"
                  }`}
                >
                  <Building2 className={`w-5 h-5 mb-2 ${accountType === "business" ? "text-navy" : "text-text-secondary"}`} />
                  <div className={`text-body font-semibold ${accountType === "business" ? "text-navy" : "text-text-primary"}`}>
                    Business Account
                  </div>
                  <div className="text-body-sm text-text-secondary">
                    For regulated businesses
                  </div>
                </button>
                <button
                  onClick={() => setAccountType("developer")}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    accountType === "developer"
                      ? "border-navy bg-navy/5"
                      : "border-divider hover:border-slate-muted"
                  }`}
                >
                  <Code className={`w-5 h-5 mb-2 ${accountType === "developer" ? "text-navy" : "text-text-secondary"}`} />
                  <div className={`text-body font-semibold ${accountType === "developer" ? "text-navy" : "text-text-primary"}`}>
                    Developer Account
                  </div>
                  <div className="text-body-sm text-text-secondary">
                    For testing & integration
                  </div>
                </button>
              </div>

              {/* Form */}
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Smith" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input id="email" type="email" placeholder="john@company.com" />
                </div>

                {accountType === "business" && (
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input id="company" placeholder="Acme Corporation" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-caption text-text-tertiary text-center">
                  By creating an account, you agree to our{" "}
                  <Link to="/terms" className="text-teal hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-teal hover:underline">Privacy Policy</Link>.
                </p>
              </form>

              {/* Benefits */}
              <div className="mt-12 p-6 rounded-lg bg-surface-subtle border border-divider">
                <h3 className="text-body font-semibold text-navy mb-4">What's included:</h3>
                <ul className="space-y-3">
                  {[
                    "Full API access with sandbox environment",
                    "100 free screening checks to start",
                    "Comprehensive documentation & SDKs",
                    "Email support during evaluation",
                  ].map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-teal/10 flex items-center justify-center">
                        <Check className="w-3 h-3 text-teal" />
                      </div>
                      <span className="text-body-sm text-text-secondary">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Login link */}
              <p className="mt-8 text-center text-body-sm text-text-secondary">
                Already have an account?{" "}
                <Link to="/login" className="text-teal hover:underline font-medium">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default GetStarted;
