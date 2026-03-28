

# Add EU Sanctions Map Links to Navigation

## Problem
The `/eu-sanctions-map` page exists but has zero inbound navigation links — users can only reach it via direct URL.

## Changes

### 1. Header — Resources dropdown (`src/components/Header.tsx`)
- Add "EU Sanctions Map" link to the Resources dropdown menu, alongside existing items like "Free AML Check" and "Compliance Glossary"

### 2. Footer (`src/components/Footer.tsx`)
- Add "EU Sanctions Map" link under the Resources column

### 3. Dashboard (`src/pages/Dashboard.tsx`)
- Add an "EU Sanctions Map" card in the dashboard grid with a Globe icon, short description, and "Explore Map" button linking to `/eu-sanctions-map`

### Files to modify
- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/pages/Dashboard.tsx`

