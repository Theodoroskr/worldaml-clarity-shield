

## Plan: Convert WorldCompliance Demo to 7-Day Free Trial

Update copy, metadata, and CTA across 3 files to reposition the demo page as a free trial signup.

### Changes

**1. `src/pages/WorldComplianceDemo.tsx`**
- SEO title/description: target "WorldCompliance free trial" keywords
- Heading: "Request a WorldCompliance® Demo" → "Try WorldCompliance® Free for 7 Days"
- Subtitle: "Get hands-on access to the industry-leading sanctions and PEP screening platform — no commitment, no credit card."
- Add a highlighted trial badge above the feature list (teal background pill: "7-Day Free Trial")
- Feature list header: "What you'll see in the demo:" → "What's included in your 7-day trial:"
- Add 3 trial-specific features: "Full platform access for 7 days", "No credit card required", "Dedicated onboarding support"
- Update disclaimer text to reference the free trial instead of demo scheduling

**2. `src/components/forms/WorldComplianceDemoForm.tsx`**
- Form header: "Request a WorldCompliance® Demo" → "Start Your 7-Day Free Trial"
- Description text: reference trial instead of demo scheduling
- Submit button: "Request Demo" → "Start Free Trial"
- Submission payload: `form_type: "free-trial"`, add `trial_days: 7` to metadata
- Success message: update to confirm trial activation timeline ("We'll activate your trial within 24 hours")
- Consent text: reference free trial
- Footer note: reference trial eligibility instead of demo scheduling

**3. `src/components/DataSourceCTA.tsx`** (worldcompliance variant only)
- Card title: "Request a Demo" → "Start Free Trial"
- Card description: reference 7-day trial
- Button: "Schedule Demo" → "Start 7-Day Trial"

### Scope
- 3 files, copy and metadata changes only

