# 06 - Implementation Plan (`06-Implementation-Plan.md`)

**Document ID:** `06-Implementation-Plan.md`  
**Builds On:** `01-PRD.md`, `02-App-Flow.md`, `03-Schema.md`, `04-TRD.md`, `05-Design-Brief.md`  
**Purpose:** Ordered, step-by-step execution playbook for building and verifying the application in Google Antigravity 2.0 / Next.js.

---

## Phase 1: Project Scaffolding & Database Initialization (30 Mins)

### Step 1.1: Initialize Next.js + Ant Design + Dependencies
```bash
npx create-next-app@latest opportunity-radar --typescript --tailwind --eslint --app --src-dir
cd opportunity-radar
npm install antd @ant-design/icons @ant-design/nextjs-registry @supabase/supabase-js cloudinary lucide-react

```

### Step 1.2: Configure Fonts & Dark-Yellow Theme (`src/app/layout.tsx`)

1. Import `Outfit`, `DM_Sans`, and `JetBrains_Mono` from `next/font/google`.
2. Configure Ant Design `<ConfigProvider>` using `theme.darkAlgorithm` and override tokens:
* `colorPrimary: '#FFD700'`
* `colorBgBase: '#0A0A0A'`
* `colorBgContainer: '#141414'`
* `colorBorder: '#262626'`
* `fontFamily: 'var(--font-body)'`



### Step 1.3: Execute Database Schema

1. Open Supabase SQL Editor and run the complete DDL from `03-Schema.md`.
2. Verify that `radar_campaigns`, `prospects`, and `pitches` tables exist and `refresh_due_followups()` RPC is callable.

---

## Phase 2: Core Backend Audit & Scoring Modules (1.5 Hours)

### Step 2.1: Build Supabase Service Client (`src/lib/supabase.ts`)

* Create a server-side Supabase client using `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

### Step 2.2: Build Bouncer, Regex Scanner & Scorer (`src/lib/auditEngine.ts`)

* Implement:
* `normalizeRootDomain(url)`
* `isBlockedOrDirectory(url)` (using the 21-domain directory/franchise blocklist)
* `scanRenderedHtml(html)` (detecting Google Ads `AW-`, Meta Pixel `fbq`, CallRail `swap.js`, GHL/Podium/Vapi chat widgets, JSON-LD `HomeAndConstructionBusiness` schema, Cost Calculators, Financing widgets, and IG/FB URLs)
* `calculateLeakScore(prospect)` (`0–100` formula from `04-TRD.md`)



### Step 2.3: Build ScrapingBee + Cloudinary Visual Proof (`src/lib/visualProof.ts`)

* Implement `scrapeAndCaptureMobile(url)` (`390x844` viewport, `render_js=true`, `screenshot=true`).
* Implement `generateAnnotatedAuditImage(rootDomain, base64Screenshot, lcpSeconds)` uploading to Cloudinary and returning the framed device mockup URL with the `#D32F2F` / `#FFD700` warning banner.

### Step 2.4: Build Timezone Guard (`src/lib/timezoneGuard.ts`)

* Implement `isTargetCityInPeakAdHours(targetTimezone)` and `getNextPeakWindowTimestamp(targetTimezone)` so WAT searches align with 09:00–16:59 US local business hours.

### Step 2.5: Build LLM Pitch Generator (`src/lib/pitchAgent.ts`)

* Implement structured JSON call enforcing:
* Real portfolio/neighborhood proof extraction.
* Top 2 revenue leaks ("Rule of 2").
* `<110 word` Cold Email with `cloudinary_annotated_mockup_url`.
* `<45 word` Cold Social DM with zero links.
* Day-3 Follow-Up Bump.



---

## Phase 3: API Routes & Background Orchestration (1 Hour)

### Step 3.1: Single-URL End-to-End Route (`src/app/api/audit/single/route.ts`)

* Wire up the complete 6-step pipeline defined in `04-TRD.md` Section 4.1, including Layer 2 ScrapingBee SERP fallback when owner name or social links are missing on-site.

### Step 3.2: Missed-Call Live Override Route (`src/app/api/prospects/[id]/call-test/route.ts`)

* Accept `PATCH` request, toggle `missed_call_leaked`, recalculate `leak_score`, regenerate pitch with the 30-second AI Voice Callback hook, and return updated record.

### Step 3.3: Status Lifecycle & Undo Route (`src/app/api/prospects/[id]/status/route.ts`)

* Accept `PATCH` request to transition `outreach_status` (`audited` -> `pitched_email` / `pitched_dm` -> `followup_due` -> `replied` / `archived`) and set `pitched_at`.

### Step 3.4: Bulk City Radar Route (`src/app/api/radar/launch/route.ts`)

* Wire up geo-targeted ScrapingBee Google Search discovery, filter directories/duplicates, and batch-audit clean contractor domains.

---

## Phase 4: Dark-Mode Command Dashboard UI (2 Hours)

### Step 4.1: Command Header & Instant Audit Bar (`src/components/CommandHeader.tsx`)

* Build top bar with persistent URL label, determinate 4-step progress indicator during live audits, and the **Launch City Radar Modal** with timezone awareness.

### Step 4.2: KPI Decision Cards (`src/components/StatsCardRow.tsx`)

* Build the 4 clickable metric cards (`Hot Cash-Burn Leads 80+`, `Ready to Pitch`, `Follow-Ups Due`, `Positive Replies`).

### Step 4.3: Ranked Prospect Table (`src/components/ProspectTable.tsx`)

* Build Ant Design `<Table>` with non-color icon+text badges for Ad Signals, Funnel Bleeds, Recommended Channel, and quick drawer trigger.

### Step 4.4: Slide-Over Audit & Pitch Drawer (`src/components/AuditPitchDrawer.tsx`)

* Build 2-column drawer:
* Left: Leak Score Banner, **Live Missed-Call Test Switch**, 14-Point Scorecard, and **Cloudinary Annotated Mobile Mockup Preview**.
* Right: Scraped Proof callout, Channel Tabs (`Email`, `IG/FB DM`, `Day-3 Follow-Up`), live word counter, 1-click **`[ Copy & Mark Sent ]`** buttons, and 6-second pausable Undo bar.



---

## Phase 5: End-to-End Verification & Release Checklist

* [ ] **Bouncer Check:** Pasting `https://www.houzz.com/professionals/kitchen-and-bath` is blocked in `<100ms` with zero ScrapingBee credits used.
* [ ] **Deduplication Check:** Auditing the same contractor URL twice within 30 days loads the cached audit instantly without re-billing APIs.
* [ ] **Visual Proof Check:** `cloudinary_annotated_mockup_url` renders a crisp `390x844` screenshot with a readable mobile speed banner.
* [ ] **Missed-Call Toggle Check:** Toggling `Missed Call Leaked` rewrites the Email and DM pitches in `<3s` to mention the unanswered phone test.
* [ ] **Pitch Constraint Check:** Generated emails are `<110 words`, and Instagram/Facebook DMs are `<45 words` with zero URLs.
* [ ] **Accessibility & Contrast Check:** Keyboard `Tab` order enters and exits the Pitch Drawer cleanly with visible `#FFD700` focus rings (`>= 3:1`).
