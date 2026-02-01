

## Add Billing Toggle to API Pricing Section

### Overview
Add an interactive toggle switch above the pricing cards that allows users to switch between viewing monthly and annual pricing. The toggle will default to annual (the recommended option) and dynamically update the displayed prices on all plan cards.

### Visual Design

```text
                    Monthly  [●═══○]  Annual
                              ↑
                         Save up to 17%
```

The toggle will be centered below the section header, with "Monthly" and "Annual" labels on either side and a savings badge when annual is selected.

### Implementation Details

**File to modify:** `src/components/api/APICompanyPricingSection.tsx`

**Changes:**

1. **Add React state** to track billing period (`useState` with `'annual'` as default)

2. **Add toggle UI** between the shared features section and pricing cards:
   - Use the existing `Switch` component from `@/components/ui/switch`
   - "Monthly" label on the left, "Annual" on the right
   - Show "Save up to 17%" badge next to Annual when selected

3. **Update pricing card display logic:**
   - When **Annual** is selected: Show `annualPrice` as main price with "billed annually" note
   - When **Monthly** is selected: Show `monthlyPrice` as main price with "billed monthly" note
   - Hide the "Save €X/mo vs monthly" badge when monthly is selected (no longer relevant)
   - Hide the "Or €X/month billed monthly" line when monthly is selected

4. **Enterprise card** remains unchanged (always shows "Custom pricing")

### User Experience
- Default to annual billing (better value, aligned with business goals)
- Smooth visual transition when toggling
- Clear indication of which billing period is active
- Savings messaging only appears when it's relevant (annual view)

