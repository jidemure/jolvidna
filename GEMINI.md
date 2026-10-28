# GEMINI.md — System Constitution & Agent Operating Instructions

**Project Name:** Opportunity Radar & Pitch Engine  
**Target Environment:** Google Antigravity 2.0 + Next.js 15 (App Router, TypeScript) + Supabase + Ant Design v5 + Tailwind CSS  
**Primary Objective:** Private internal agency lead discovery, 14-point website/funnel audit engine, visual proof generator, and hyper-personalized outreach pitch builder targeting High-Ticket Home Service Businesses & Specialty Contractors.

---

## 1. Source-of-Truth Hierarchy (Read Order)

Before generating, refactoring, or debugging any code in this repository, you MUST read and strictly obey the specification files in this exact sequential order:

1. **`01-PRD.md` (Product Requirements):** Business logic, the 14 remodeler revenue leaks, the 4-stage pipeline, and non-functional guardrails.
2. **`02-App-Flow.md` (Application Flow):** User journeys (Bulk City Radar vs. Instant Sniper Audit), background worker sequences, and state machines.
3. **`03-Schema.md` (Database Schema):** Exact PostgreSQL tables (`radar_campaigns`, `prospects`, `pitches`), column names, constraints, and RPC functions. **Never invent or rename database columns outside `03-Schema.md`.**
4. **`04-TRD.md` (Technical Requirements):** Environment variables, DOM regex signatures, the `0–100` Cash-Burn Leak Score math, API route payloads, and LLM JSON output contracts.
5. **`05-Design-Brief.md` (UI/UX & Accessibility Contract):** Typography (`Outfit` + `DM Sans` + `JetBrains Mono`), Dark Mode palette (`#0A0A0A` canvas, `#141414` elevated cards, `#FFD700` primary yellow accents), WCAG 2.2 AA rules, and the 12-state UI matrix.
6. **`06-Implementation-Plan.md` (Build Order):** Phased file creation and verification checklist.

> **Skill Integration (Google Antigravity 2.0):** Whenever designing, building, or modifying any UI component or screen (`src/app/**` or `src/components/**`), load and follow `.agent/skills/master-ui-ux-skills/SKILL.md` (or `~/.gemini/antigravity/skills/master-ui-ux-skills/SKILL.md`) and its `references/` contracts.

---

## 2. Six Non-Negotiable Engineering Guardrails ("Hard Locks")

You must NEVER bypass or weaken these 6 architectural locks when writing backend or frontend code:

1. **LOCK 1 — Directory & Franchise Bouncer First (`<150ms`):**
   * Never call ScrapingBee, Google PageSpeed, Google Places, or Cloudinary before running `normalizeRootDomain(url)` and `isBlockedOrDirectory(url)` in `src/lib/auditEngine.ts`.
   * Reject `yelp.com`, `angi.com`, `houzz.com`, `thumbtack.com`, `homeadvisor.com`, `bbb.org`, `homedepot.com`, `lowes.com`, `bathfitter.com`, `rebath.com`, and social root domains immediately with zero paid API calls.
2. **LOCK 2 — Root Domain Deduplication (`prospects.root_domain UNIQUE`):**
   * Before scraping any URL, query `public.prospects` by normalized `root_domain`. If a record exists and `last_audited_at` is within the last 30 days (and `force_refresh !== true`), return the existing prospect and pitch immediately without spending API credits.
3. **LOCK 3 — WAT-to-Target-City Timezone Guard (`src/lib/timezoneGuard.ts`):**
   * Because the operator runs this tool from Lagos (`Africa/Lagos`, WAT), Stage 0 live SERP discovery (`POST /api/radar/launch`) MUST check whether the target US/UK/CA city is currently between **09:00 and 16:59 local time**.
   * If outside local business hours (when contractors pause daily Google Ads budgets), queue the campaign in `radar_campaigns` (`status = 'queued'`) for the next 09:30 local window unless `force_run_now = true` is explicitly passed.
4. **LOCK 4 — Dual URL & Dual Phone Preservation:**
   * Always store both `homepage_url` and `ad_landing_page_url` (when a paid search ad routes to a dedicated landing page). Run PageSpeed against `ad_landing_page_url || homepage_url`.
   * Always store both `gbp_primary_phone` (from Google Maps/Places) and `website_display_phone` (which may be a CallRail forwarding number) so live missed-call tests dial the contractor's real line.
5. **LOCK 5 — The "Rule of 2" & Zero-Fabrication Pitch Contract (`src/lib/pitchAgent.ts`):**
   * **Zero Hallucination:** The LLM agent must extract 1 authentic detail from the scraped website text (`specific_project_detail`). Never invent neighborhoods, wood species, or owner names. If `owner_first_name` is `null`, use `"Hey [Business Name] team,"`.
   * **Rule of 2:** Even if 10 technical flaws are detected on the scorecard, the generated pitch may only mention **the top 2 highest-cost revenue leaks**.
   * **Strict Length & Anti-Spam:** Cold Email `< 110 words` (embeds `cloudinary_annotated_mockup_url`). Cold Instagram/Facebook DM `< 45 words` with **ZERO links** so messages land in the primary inbox.
6. **LOCK 6 — Graceful Partial Degradation:**
   * Wrap external API calls in `Promise.allSettled()` with an `8,000ms` timeout circuit breaker. If Google PageSpeed times out on a slow contractor site, fallback to `mobile_speed_score = 38` and `mobile_lcp_seconds = 8.5` rather than failing the whole audit.

---

## 3. UI/UX, Styling & Accessibility Rules

* **Dark-Mode Command Aesthetic:**
  * Canvas Background: `#0A0A0A`
  * Elevated Cards / Table / Drawer: `#141414` with `1px solid #262626` borders
  * Primary Action Highlight: Vibrant Yellow `#FFD700` (hover `#FACC15`) with `#0A0A0A` bold text (`14.2:1` contrast)
  * Status Tokens: Danger `#EF4444`, Warning `#F59E0B`, Success `#10B981`
* **Typography:**
  * Headings: `Outfit` (`600`, `700`)
  * Body & Controls: `DM Sans` (`400`, `500`), minimum `16px` (`1rem`) for pitch text editors, `14px` for table cells
  * Numeric Scores & Metrics: `JetBrains Mono` (`500`)
* **WCAG 2.2 AA Enforcement:**
  * Every status badge MUST pair color with an explicit icon and text label (e.g., `[🔥 92/100 High Burn]`, `[❌ No Budget Calc]`) — never rely on color alone (WCAG 1.4.1).
  * Every form input MUST have a persistent visible `<label>` (never placeholder-only labels, WCAG 3.3.2).
  * All interactive buttons must meet `>= 44x44px` (primary) or `>= 24x24px` (`36px` row actions) with `>= 8px` gap (WCAG 2.5.8) and visible `2px solid #FFD700` focus rings (WCAG 2.4.11).
  * Consequence-explicit CTAs: Use `"Copy Email & Mark as Emailed"` or `"Launch Scottsdale Radar"`, never vague `"Submit"` or `"Continue"` labels.

---

## 4. Directory Structure & File Ownership Map

```
opportunity-radar/
├── GEMINI.md                           # THIS FILE: Root Agent Constitution
├── docs/
│   ├── 01-PRD.md                       # Product Requirements Document
│   ├── 02-App-Flow.md                  # Application Flow & State Machines
│   ├── 03-Schema.md                    # Supabase PostgreSQL DDL
│   ├── 04-TRD.md                       # Technical & API Contracts
│   ├── 05-Design-Brief.md              # UI/UX Tokens & 12-State Matrix
│   └── 06-Implementation-Plan.md       # Step-by-Step Build Checklist
├── supabase/
│   └── schema.sql                      # Executable SQL from 03-Schema.md
└── src/
    ├── app/
    │   ├── layout.tsx                  # Outfit/DM Sans fonts + Antd Dark/Yellow ConfigProvider
    │   ├── page.tsx                    # Single-screen Opportunity Radar Workspace
    │   └── api/
    │       ├── radar/launch/route.ts   # Stage 0: Timezone Guard + ScrapingBee Geo-SERP
    │       ├── audit/single/route.ts   # Stages 1-3: Parallel Scrape + Cloudinary + LLM Pitch
    │       └── prospects/[id]/
    │           ├── status/route.ts     # Outreach lifecycle state transitions + Undo
    │           └── call-test/route.ts  # Live Missed-Call toggle + instant pitch rewrite
    ├── components/
    │   ├── CommandHeader.tsx           # Instant URL Audit Input + City Radar Modal
    │   ├── StatsCardRow.tsx            # 4 Clickable Decision KPI Cards
    │   ├── ProspectTable.tsx           # Ranked Leak Score Table with non-color badges
    │   └── AuditPitchDrawer.tsx        # 980px 2-Column Scorecard + Pitch Editor Drawer
    └── lib/
        ├── supabase.ts                 # Supabase Service Role client
        ├── auditEngine.ts              # Bouncer, DOM Regex Scanner & Leak Scorer
        ├── visualProof.ts              # ScrapingBee 390x844 capture + Cloudinary banner
        ├── timezoneGuard.ts            # WAT-to-US Target City peak hours validator
        └── pitchAgent.ts               # Structured JSON LLM Pitch Generator
```

---

## 5. Agent Execution Protocol

1. **Incremental Verification:** Build and verify one phase from `06-Implementation-Plan.md` at a time. Run `tsc --noEmit` after creating or updating any TypeScript module.
2. **Strict Type Safety:** Never use `any`. Define shared interfaces (`ProspectRecord`, `PitchRecord`, `RadarCampaignRecord`, `HtmlScanResult`) matching `03-Schema.md` and `04-TRD.md`.
3. **Server-Only Secrets:** Never expose `SUPABASE_SERVICE_ROLE_KEY`, `SCRAPINGBEE_API_KEY`, `CLOUDINARY_API_SECRET`, or `LLM_API_KEY` in client components (`'use client'`). All external API orchestration belongs strictly inside `src/app/api/**` and `src/lib/**`.
