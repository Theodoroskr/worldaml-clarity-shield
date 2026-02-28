import { AlertTriangle } from "lucide-react";

export const SanctionsDisclaimerBanner = () => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 flex items-start gap-3">
    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
    <p className="text-body-sm text-yellow-900">
      <strong>Open-source coverage only</strong> — Data sourced from publicly available OFAC, EU, UN, and HMT lists. 
      Coverage may be delayed up to 48 hours. Results are not legal advice and should not be the sole basis for compliance decisions.
    </p>
  </div>
);
