
# Plan: Embed WorldCompliance Pricing Calculator in LexisNexis Tab

## Overview
Replace the current link-based WorldCompliance card in the LexisNexis tab with the full interactive pricing calculator from the dedicated pricing page. This eliminates the need for users to navigate away to see actual prices and complete checkout.

## Current State
- **Pricing page** (`/pricing`): LexisNexis tab shows a summary card with "View Regional Pricing" link
- **Dedicated page** (`/data-sources/worldcompliance/pricing`): Contains full calculator with region tabs, user count selector, price breakdown, and Stripe checkout

## Implementation Approach

### Step 1: Create a Reusable WorldCompliance Pricing Component
Extract the calculator logic from `WorldCompliancePricing.tsx` into a new component:

**New file**: `src/components/pricing/WorldCompliancePricingCalculator.tsx`

This component will include:
- Region tabs (Europe & Middle East, UK & Ireland, North America)
- Currency selector for UK-IE region
- User count selector (+/- buttons, 1-10 users)
- Per-user pricing breakdown with progressive discounts
- Total calculation display
- Checkout button with authentication check
- Regional disclaimers

### Step 2: Update the LexisNexis Tab in Pricing Page
Replace the current WorldCompliance summary card with the embedded calculator component.

**Modified file**: `src/pages/Pricing.tsx`

Changes:
- Import the new calculator component
- Replace the WorldCompliance card in the LexisNexis tab with the full calculator
- Keep the Bridger Insight XG card as-is (enterprise only, contact sales)

### Step 3: Simplify the Dedicated Pricing Page (Optional)
The dedicated `/data-sources/worldcompliance/pricing` page can either:
- Redirect to `/pricing?tab=lexisnexis`
- Or use the same component for consistency

## Visual Layout

```text
LexisNexis Tab
├── Data Source Badge + LexisNexis Attribution
├── WorldCompliance® Section
│   ├── Region Tabs: [EU & ME] [UK & IE] [North America]
│   ├── Currency Selector (UK-IE only)
│   ├── Two-Column Layout:
│   │   ├── Left: Per-User Pricing Table
│   │   │   ├── 1st user: €3,000
│   │   │   ├── 2nd user: €2,700 (10% off)
│   │   │   └── 3rd user: €2,430 (10% off)
│   │   └── Right: Calculator
│   │       ├── User Count: [−] 3 [+]
│   │       ├── Breakdown: User 1/2/3 prices
│   │       ├── Total: €8,130/year
│   │       └── [Buy WorldCompliance Online] CTA
│   └── Disclaimer text
└── Bridger Insight XG® Card (unchanged)
    └── [Contact Sales] CTA
```

## Technical Details

### Pricing Logic (preserved from existing implementation)
```typescript
const calculateUserPrice = (basePrice: number, userNumber: number): number => {
  if (userNumber === 1) return basePrice;
  let price = basePrice;
  for (let i = 2; i <= userNumber; i++) {
    price = price * 0.9; // 10% progressive discount
  }
  return Math.round(price);
};
```

### Regional Base Prices
| Region | Currency | Base Price |
|--------|----------|------------|
| EU & Middle East | EUR | €3,000 |
| UK & Ireland | GBP | £2,700 |
| UK & Ireland | EUR | €3,200 |
| North America | USD | $4,900 |

### Dependencies
- Uses existing edge function: `create-worldcompliance-checkout`
- Uses existing hooks: `useRegion`, `useAuth`
- Uses existing Supabase client

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/pricing/WorldCompliancePricingCalculator.tsx` | Create |
| `src/pages/Pricing.tsx` | Modify |

## Edge Cases Handled
- Unauthenticated users: Toast notification with sign-in prompt
- Region detection: Auto-selects detected region with badge indicator
- Currency switching: UK-IE region supports both GBP and EUR
- Loading states: Checkout button shows spinner during processing
- User count limits: Enforced 1-10 range
