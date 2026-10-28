# 01 - Product Requirements Document (PRD): Opportunity Radar & Pitch Engine

**Document ID:** `01-PRD.md`  
**Version:** 2.0.0  
**Date:** October 27, 2026  
**Target Environment:** Google Antigravity 2.0 + Next.js (App Router) + Supabase  
**Product Type:** Private Internal Agency Lead Discovery, Funnel Audit & Pitch Engine  
**Target Niche:** High-Ticket Home Services (Kitchen & Bathroom Remodelers)

---

## 1. Product Vision & Strategic Goal

The **Opportunity Radar & Pitch Engine** is a single-tenant internal software platform built to automate client acquisition for high-ticket web development, custom web/mobile apps, and AI automation services. 

Kitchen and bathroom remodelers operate on massive job values ($15,000–$35,000 for bathrooms; $40,000–$100,000+ for kitchens), yet most lose tens of thousands of dollars per month to slow mobile websites, unanswered job-site phone calls, unqualified "tire-kicker" estimates, and stalled PDF quotes. 

Instead of manually hunting for prospects and guessing their pain points, this system automates the entire 4-stage acquisition pipeline:
1. **Stage 0 (Opportunity Radar):** Hunts independent remodelers in target cities who are actively spending money on ads (or ranking on pages 2–3) during their local peak business hours.
2. **Stage 1 (Deep Technical & Funnel Audit):** Inspects their live mobile site, ad pixels, load speed, schema markup, interactive calculators, AI chat/voice widgets, and Google review velocity—and builds an annotated mobile screenshot as undeniable visual proof.
3. **Stage 2 (Contact & Social Waterfall):** Uncovers the business owner's name, direct email, and active Instagram/Facebook profiles so zero qualified leads are lost to dead `info@` inboxes.
4. **Stage 3 (Leak Scoring & Custom Pitch Generation):** Ranks every prospect by a **0–100 Cash-Burn Leak Score** and generates a 100% customized Cold Email, Cold Social DM, and Day-3 Follow-Up adhering to the **"Rule of 2."**

---

## 2. Target Customer Profile & Core Pain Points Addressed

### 2.1 Ideal Prospect Avatar
* **Industry:** Residential Kitchen Remodelers, Bathroom Remodelers, Design-Build Contractors.
* **Size:** Independent local operations (1 to 3 locations, $500k–$5M annual revenue).
* **Excluded Entities:** National franchises (Bath Fitter, Re-Bath), big-box retailers (Home Depot, Lowe's), and directories (Angi, Houzz, Yelp, Thumbtack).

### 2.2 The 14 Revenue Leaks We Audit & Solve
| Category | Prospect Pain Point | Solution We Pitch |
| :--- | :--- | :--- |
| **Visibility & Trust** | Generic service pages losing local traffic | Local SEO Service-Area Pages |
| **Visibility & Trust** | Invisible to ChatGPT / Google AI Overviews | AEO (`HomeAndConstructionBusiness` & `FAQPage` JSON-LD) |
| **Visibility & Trust** | 8MB raw phone photos causing 7s+ mobile load | Next-Gen Mobile Speed & UI/UX Refactor |
| **Visibility & Trust** | Static, messy photo dumps with no context | Interactive Draggable Before/After Sliders |
| **Visibility & Trust** | Portfolio hasn't been updated in 2+ years | "Snap-to-Site" Mobile Portfolio Uploader App |
| **Lead Capture** | Dead "Contact Us" forms losing night visitors | 24/7 Web AI Voice & Chat Booking Agent |
| **Lead Capture** | Missing calls while on loud job sites | Missed-Call Text Back + 30–60s AI Voice Callback |
| **Pre-Qualification** | Driving 8 hrs/wk to quote $5k tire-kickers | Interactive 60-Second Remodel Budget Calculator |
| **Pre-Qualification** | Homeowners delaying projects over cash flow | Embedded Monthly Financing Estimator Widget |
| **Operations & Close** | Leads tracked on sticky notes / spreadsheets | Centralized CRM & Visual Deal Pipeline |
| **Operations & Close** | $50k PDF estimates ghosted after sending | Automated 30-Day "Quote Chaser" SMS/Email Sequence |
| **Reputation & LTV** | Fewer than 40 reviews or none in 90+ days | Automated Google Review Request & Smart Routing |
| **Reputation & LTV** | Past kitchen clients never pitched on bathrooms | Database Reactivation & Seasonal Upsell Engine |
| **Client Experience** | Anxious homeowners texting daily for updates | Lightweight Client Milestone Portal & SMS Notifier |

---

## 3. Core Functional Requirements

### 3.1 Stage 0: Opportunity Radar & Discovery Guards
* **FR-01 (Dual Input Modes):** Support both **Bulk City Radar Mode** (`Niche` + `City` + `Target Timezone`) and **Instant Sniper Mode** (paste a single contractor URL).
* **FR-02 (WAT-to-Target-City Timezone Lock):** Because the system is operated from Lagos (`Africa/Lagos`, WAT), automated SERP discovery MUST only run when the target US/UK/CA city is between **09:00 and 16:59 local time** so daily Google Ads budgets are active.
* **FR-03 (3-Layer Ad-Spend Detection):**
  1. *Live SERP:* Detect Google Local Services Ads (LSAs), Search PPC (`Sponsored`), and Organic Ranks #8–#25. Capture both `homepage_url` and `ad_landing_page_url`.
  2. *On-Site Pixels:* Detect `AW-` / `gclid` (Google Ads), `fbq` / `fbevents.js` (Meta Pixel), and Call Tracking (`CallRail`, `WhatConverts`, `CallTrackingMetrics`) even when live ads are paused.
  3. *Ad Library Verification:* Optional domain lookup link for Google Ads Transparency Center and Meta Ad Library.
* **FR-04 (Directory & Franchise Bouncer):** Blocklist national directories and multi-state franchises prior to executing paid ScrapingBee renders or PageSpeed calls.
* **FR-05 (Root Domain Deduplication):** Normalize domains (`abcremodeling.com`) and block duplicate audits within a 30-day window.

### 3.2 Stage 1: Technical & Visual Proof Engine
* **FR-06 (Headless Mobile Render):** Capture rendered DOM HTML and a `390x844` mobile screenshot via ScrapingBee (`render_js=true`).
* **FR-07 (Automated 14-Point DOM & Speed Scan):** Combine DOM regex signatures with Google PageSpeed Insights API (`strategy=mobile`) and Google Places API (review count, star rating, days since last review, primary GBP phone number).
* **FR-08 (Cloudinary Visual Proof Transformation):** Upload the mobile screenshot to Cloudinary and overlay a high-contrast warning banner (`MOBILE LOAD: 7.4s | NO BUDGET FILTER`) inside a device frame (`cloudinary_annotated_mockup_url`).

### 3.3 Stage 2: Contact & Social Fallback Waterfall
* **FR-09 (3-Layer Contact Discovery):**
  * *Layer 1:* Scrape `/`, `/about`, `/team`, `/contact` for owner name, direct email, Instagram, and Facebook URLs.
  * *Layer 2:* If owner name or social links are missing on-site, run a secondary ScrapingBee Google SERP query: `"Business Name" "City" (site:instagram.com OR site:facebook.com OR "owner")`.
  * *Layer 3:* Automatically assign `recommended_channel = 'email'` if a personal/valid email is found, or `recommended_channel = 'social_dm'` if only generic/no email exists alongside an active IG/FB profile.

### 3.4 Stage 3: Leak Scoring & Hyper-Custom Pitch Engine
* **FR-10 (0–100 Cash-Burn Leak Score):** Rank prospects automatically by combining Ad Spend signals (+45 max) and Funnel Bleed signals (+55 max), while applying a `-60` penalty to prospects who already have a fast site, AI chat, and cost calculator.
* **FR-11 (Live Phone Test Override):** Provide a 1-click toggle in the UI (`Missed Call Tested -> Voicemail / No SMS Back`) that immediately re-prioritizes the pitch around the **30-Second AI Voice Callback** solution.
* **FR-12 (Strict Pitch Generation Rules):**
  * Extract 1 real project detail or neighborhood from their site (zero fabrication).
  * Apply the **Rule of 2** (mention at most 2 high-cost leaks).
  * Output 3 copy-ready assets: **Cold Email (<110 words)** with Cloudinary link, **IG/FB Cold DM (<45 words, zero links)**, and **Day-3 Follow-Up Bump**.

---

## 4. Non-Functional Requirements & Guardrails

* **NFR-01 (Single-User Simplicity):** No multi-tenant billing, public sign-up, or complex RBAC. Protected by single-owner environment auth.
* **NFR-02 (API Credit Conservation):** Bouncer and Supabase `root_domain` deduplication must execute in `<150ms` before any external paid API call.
* **NFR-03 (Fault Tolerance):** Partial API timeouts (e.g., PageSpeed timeout on a broken contractor site) must degrade gracefully to safe fallback defaults without crashing the audit pipeline.
