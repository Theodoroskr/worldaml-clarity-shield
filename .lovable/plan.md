
# Plan: Restore Animated Globe to Homepage Hero

## Problem Identified
The homepage switched from `HeroSection.tsx` (which contained the animated `NetworkGlobeVisual` SVG) to `NewHeroSection.tsx` (which does not). The animated globe is now missing from the homepage.

## Solution
Add the animated globe as a subtle background visual in the hero section while keeping the current two-lane product split layout. The globe will be positioned as a decorative element on desktop viewports.

---

## Implementation Steps

### 1. Update NewHeroSection.tsx

Import and integrate the `NetworkGlobeVisual` component from `HeroSection.tsx` (or inline it) as a background/side element:

```text
Layout structure:
┌─────────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           [Animated Globe - absolute positioned]          │  │
│  │              (subtle opacity, right side)                 │  │
│  │                                                           │  │
│  │    WorldAML — Financial Crime Screening Infrastructure    │  │
│  │                                                           │  │
│  │    Subtitle text...                                       │  │
│  │    Attribution line...                                    │  │
│  │                                                           │  │
│  │    ┌────────────────┐  ┌────────────────┐                 │  │
│  │    │  WorldAML      │  │  LexisNexis    │                 │  │
│  │    │  Platform      │  │  Data Sources  │                 │  │
│  │    └────────────────┘  └────────────────┘                 │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Globe Styling
- Position: `absolute`, top-right corner of the hero section
- Size: Large (400x400px viewport) but subtle
- Opacity: 10-15% so it doesn't compete with content
- Visibility: Desktop only (`hidden lg:block`)
- Animation: Preserve the existing CSS keyframe animations (pulse-glow, connection-flow, node-pulse)

### 3. CSS Animations (already exist in HeroSection.tsx)
The globe includes these animations:
- `pulse-glow`: Center node pulses (3s cycle)
- `pulse-ring`: Ring expands outward (3s cycle)
- `connection-flow`: Network lines fade in/out (4s cycle)
- `node-pulse`: Secondary nodes pulse (4s cycle with staggered delays)

---

## Technical Details

### File Changes
1. **src/components/home/NewHeroSection.tsx**
   - Add `NetworkGlobeVisual` SVG component (copy from HeroSection.tsx)
   - Add container with absolute positioning for the globe
   - Ensure `overflow-hidden` on section wrapper
   - Apply opacity and positioning classes

### Animation Keyframes (to be included inline in SVG)
```css
@keyframes pulse-glow {
  0%, 100% { opacity: 1; r: 5; }
  50% { opacity: 0.7; r: 8; }
}
@keyframes pulse-ring {
  0% { opacity: 0.4; r: 8; }
  100% { opacity: 0; r: 24; }
}
@keyframes connection-flow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
@keyframes node-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

### Positioning Classes
```
- Container: absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-[0.12] pointer-events-none
- Wrapper: hidden lg:block (desktop only)
```

---

## Visual Result
- The homepage hero will display the animated network globe as a subtle background element on the right side
- The globe animates continuously with pulsing nodes and fading connections
- Content remains fully readable with the low opacity
- Mobile users see just the clean card layout without the globe
- Maintains the two-lane architecture visual hierarchy

