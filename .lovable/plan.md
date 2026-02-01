

## Dashboard Demo Page

### Overview
Create a `/demo` page showcasing the WorldAML platform dashboard UI as a marketing showcase. This page will display static mockup components that demonstrate the platform's capabilities to prospective customers—compliance officers, risk teams, and procurement evaluators.

### Purpose
This is **not** a functional dashboard, but a visual demonstration of what users will experience. Similar to how Sumsub and ComplyAdvantage showcase their platform on marketing pages.

---

### Page Structure

```text
┌─────────────────────────────────────────────────────────┐
│  Header                                                 │
├─────────────────────────────────────────────────────────┤
│  Hero: "See the Platform in Action"                    │
│  Subtitle explaining this is a demo preview            │
├─────────────────────────────────────────────────────────┤
│  Section 1: Screening Overview Dashboard               │
│  - Summary stats cards (screenings today, alerts, etc.)│
│  - Recent activity table                               │
├─────────────────────────────────────────────────────────┤
│  Section 2: Entity Profile Card                        │
│  - Individual profile with risk badge                  │
│  - Sanctions/PEP/Media breakdown panel                 │
│  - Match confidence indicator                          │
├─────────────────────────────────────────────────────────┤
│  Section 3: Company Screening Result                   │
│  - Company profile card                                │
│  - UBO/Director screening results                      │
│  - Source transparency panel                           │
├─────────────────────────────────────────────────────────┤
│  Section 4: Audit Trail & Explainability              │
│  - Timestamped screening history                       │
│  - Decision rationale panel                            │
├─────────────────────────────────────────────────────────┤
│  CTA: "Request Access" / "Book a Demo"                 │
├─────────────────────────────────────────────────────────┤
│  Footer                                                 │
└─────────────────────────────────────────────────────────┘
```

---

### Visual Design Principles

**UI Style**
- Light background (#FFFFFF)
- Card-based layout with subtle borders (no heavy shadows)
- Deep navy headings, neutral grey data
- Single teal accent for confidence indicators and alerts

**Typography**
- Clear hierarchy using existing design tokens
- Tables and structured panels for data
- Readable at a glance

**Icons**
- Line icons only (from lucide-react)
- No avatars, faces, or illustrations

---

### Component Details

#### 1. Dashboard Overview Section
**Stats Cards Row:**
- Total Screenings Today: 1,247
- Pending Review: 23
- Alerts (High Confidence): 8
- Clear: 1,216

**Recent Activity Table:**
| Entity | Type | Status | Confidence | Timestamp |
|--------|------|--------|------------|-----------|
| John Smith | Individual | Review Required | 94% | 2 min ago |
| Acme Holdings Ltd | Company | Clear | — | 5 min ago |
| Maria González | Individual | Match Confirmed | 98% | 12 min ago |

#### 2. Individual Profile Card
- Name, DOB, Nationality fields
- Risk badge: "High Risk" / "Medium Risk" / "Clear"
- Screening breakdown:
  - Sanctions: No match
  - PEP: Match (Tier 2 - Family Member)
  - Adverse Media: 3 articles found
- Match confidence: 94% with visual indicator

#### 3. Company Profile Card
- Company name, jurisdiction, registration number
- UBO screening status (2/3 screened)
- Director screening results table
- Source transparency: List of data sources checked

#### 4. Audit Trail Panel
- Timestamped entries showing:
  - Initial screening performed
  - Manual review assigned
  - Decision: Approved with conditions
  - Next scheduled review date

---

### Technical Implementation

**Files to Create:**
1. `src/pages/Demo.tsx` - Main page component
2. `src/components/demo/DemoHeroSection.tsx` - Page introduction
3. `src/components/demo/DashboardOverview.tsx` - Stats and activity table
4. `src/components/demo/EntityProfileCard.tsx` - Individual screening result
5. `src/components/demo/CompanyProfileCard.tsx` - Company screening result
6. `src/components/demo/AuditTrailPanel.tsx` - Compliance audit trail
7. `src/components/demo/DemoCTASection.tsx` - Call to action

**Files to Modify:**
1. `src/App.tsx` - Add `/demo` route

**Dependencies:**
- Uses existing UI components (Card, Table, Badge)
- Uses existing design tokens (colors, typography)
- Uses lucide-react for line icons

---

### Sample Data

**Individual Entity:**
```text
Name: John Michael Smith
DOB: 15 March 1978
Nationality: United Kingdom
Screening ID: SCR-2024-00847
Risk Level: High
PEP Status: Tier 2 (Family member of PEP)
Sanctions: No match
Adverse Media: 3 articles (Financial Times, Reuters)
Match Confidence: 94%
```

**Company Entity:**
```text
Name: Global Trading Partners Ltd
Jurisdiction: United Kingdom
Company Number: 12345678
UBOs: 3 identified (2 screened)
Directors: 4 (all screened)
Risk Level: Medium
Last Screened: 2 hours ago
```

