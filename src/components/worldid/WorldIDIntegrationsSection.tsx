import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Users, Code } from "lucide-react";

const WorldIDIntegrationsSection = () => {
  return (
    <section className="section-padding bg-secondary">
      <div className="container-enterprise">
        <div className="text-center mb-12">
          <h2 className="text-navy mb-4">Integrations & API</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Built for both product teams and developers.
          </p>
        </div>
        
        <Tabs defaultValue="product" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="product" className="gap-2">
              <Users className="w-4 h-4" />
              For product & compliance teams
            </TabsTrigger>
            <TabsTrigger value="developers" className="gap-2">
              <Code className="w-4 h-4" />
              For developers
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="product" className="bg-white p-6 rounded-lg border border-divider">
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
                <span className="text-text-secondary">Hosted verification links</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
                <span className="text-text-secondary">Branding and language configuration</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
                <span className="text-text-secondary">Redirect URLs after verification</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
                <span className="text-text-secondary">Audit-ready reports</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
                <span className="text-text-secondary">Clear verification outcomes</span>
              </li>
            </ul>
          </TabsContent>
          
          <TabsContent value="developers" className="bg-white p-6 rounded-lg border border-divider">
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
                <span className="text-text-secondary">REST API with session-based flow</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
                <span className="text-text-secondary">Secure authentication (API keys, optional HMAC)</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
                <span className="text-text-secondary">Webhooks for result notifications</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
                <span className="text-text-secondary">Sandbox & production environments</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
                <span className="text-text-secondary">Full reference documentation</span>
              </li>
            </ul>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 p-4 bg-navy/5 rounded-lg border border-divider max-w-4xl mx-auto">
          <p className="text-sm text-navy font-mono text-center">
            Create session → Redirect user → Receive webhook → Fetch result → Act
          </p>
        </div>
        
        <div className="text-center mt-8">
          <Button variant="default" className="gap-2" asChild>
            <a href="https://worldaml.readme.io/reference/worldid" target="_blank" rel="noopener noreferrer">
              View WorldID API documentation
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WorldIDIntegrationsSection;
