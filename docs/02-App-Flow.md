# 02 - Application Flow & System Architecture (`02-App-Flow.md`)

**Document ID:** `02-App-Flow.md`  
**Builds On:** `01-PRD.md`  
**Purpose:** Maps end-to-end user journeys, background worker pipelines, state transitions, and UI routing.

---

## 1. End-to-End Pipeline Topology


```

+-----------------------------------------------------------------------------------+
|                        DARK-MODE COMMAND DASHBOARD (Next.js)                      |
|  [ Launch City Radar ]    [ Instant Single-URL Audit ]    [ Ranked Prospect UI ]  |
+-------------------+-----------------------+-----------------------+---------------+
|                       |                       ^
v                       v                       |
+-----------------------+   +-----------------------+       |
| POST /api/radar/launch|   | POST /api/audit/single|       |
+-----------+-----------+   +-----------+-----------+       |
|                           |                   |
v                           |                   |
+---------------------------------------+       |                   |
| STAGE 0: OPPORTUNITY RADAR            |       |                   |
| 1. Timezone Guard (9am-5pm Target TZ) |       |                   |
| 2. ScrapingBee Geo-SERP & Maps Scrape |       |                   |
| 3. Directory & Franchise Bouncer      |       |                   |
| 4. Supabase `root_domain` Dedupe      |       |                   |
+-------------------+-------------------+       |                   |
| (Clean Domain Queue)      |                   |
+-------------+-------------+                   |
|                                 |
v                                 |
+-------------------------------------------------------------------+---------------+
| STAGE 1: PARALLEL DEEP AUDIT ENGINE                               |               |
|  ├──> ScrapingBee: Render JS + Mobile Screenshot (390x844)        |               |
|  ├──> Regex Scanner: Ad Pixels (AW-, fbq, CallRail) + Chat + AEO  |               |
|  ├──> Google PageSpeed API: Mobile LCP (sec) + Speed Score        |               |
|  ├──> Google Places API: Review Count, Rating, Recency, GBP Phone |               |
|  └──> Cloudinary: Frame iPhone + Overlay Red/Yellow Warning Badge |               |
+---------------------------------+---------------------------------+               |
|                                                 |
v                                                 |
+-------------------------------------------------------------------+               |
| STAGE 2: CONTACT & SOCIAL WATERFALL                               |               |
|  ├──> Layer 1: Scrape /about, /contact, footer for Owner + IG/FB  |               |
|  ├──> Layer 2: Missing? Run ScrapingBee SERP Fallback Query       |               |
|  └──> Layer 3: Set Recommended Channel ('email' vs 'social_dm')   |               |
+---------------------------------+---------------------------------+               |
|                                                 |
v                                                 |
+-------------------------------------------------------------------+               |
| STAGE 3: LEAK SCORER & AI PITCH GENERATOR                         |               |
|  ├──> Calculate Cash-Burn Leak Score (0-100)                      |               |
|  ├──> LLM Agent: Extract 1 Real Project + Top 2 Leaks             |               |
|  ├──> Generate: Cold Email (<110w), IG/FB DM (<45w), Day-3 Bump   |               |
|  └──> Upsert to Supabase (`prospects` & `pitches` tables) --------+---------------+
+-----------------------------------------------------------------------------------+

```

---

## 2. Core User Flows

### Flow 1: Launching a Bulk City Radar Campaign
1. **Trigger:** User clicks **`[ + Launch City Radar ]`** in the Top Command Header.
2. **Configuration Modal:**
   * Selects **Niche** (`Kitchen Remodeler`, `Bathroom Remodeler`, `Home Remodeler`).
   * Enters **Target City & State** (e.g., `Scottsdale, AZ`).
   * Selects **Target Timezone** (`America/Phoenix`, `America/Chicago`, `America/New_York`, `America/Los_Angeles`).
   * Clicks **`[ Launch Scottsdale Radar (Est. 15–20 Credits) ]`**.
3. **Timezone Guard Evaluation:**
   * **Case A (Target City is 09:00–16:59 Local Time):** Campaign starts immediately (`status = 'running_serp'`). A live progress pill appears in the top bar (`Scanning Scottsdale SERP -> Auditing 14 Remodelers [4/14]...`).
   * **Case B (Target City is Outside Peak Hours):** Campaign is saved as `status = 'queued'` with `scheduled_for` set to 09:30 AM Target City time (e.g., `3:30 PM WAT`). Dashboard banner confirms exact WAT start time.
4. **Completion:** Audited prospects populate the main table sorted by `leak_score DESC`.

---

### Flow 2: Running an Instant Single-URL Audit (Sniper Mode)
1. **Trigger:** User pastes a contractor URL (e.g., `https://premierkitchensaz.com`) into the top quick-audit input bar and clicks **`[ Audit Website Now ]`**.
2. **Pre-Flight Check (<150ms):**
   * Normalizes domain to `premierkitchensaz.com`.
   * Checks Directory/Franchise blocklist. If matched, shows inline validation error.
   * Checks Supabase `prospects.root_domain`. If audited within 30 days, opens the existing Audit & Pitch Drawer immediately (`0 credits spent`).
3. **4-Step Determinate Progress Feedback (8–12s):**
   * Step 1: `Capturing 390x844 Mobile DOM & Ad Pixels via ScrapingBee...`
   * Step 2: `Measuring Mobile LCP & Generating Cloudinary Proof Frame...`
   * Step 3: `Running 3-Layer Owner & Social Contact Waterfall...`
   * Step 4: `Scoring Revenue Leaks & Drafting Custom Email + IG DM...`
4. **Resolution:** Row inserts at top of table and the **Slide-Over Audit & Pitch Drawer** opens automatically.

---

### Flow 3: Inspecting the Scorecard, Live Call Testing & Sending Outreach
1. **Drawer Inspection (Left Column - The Evidence):**
   * User reviews the **Leak Score Header** (`92 / 100 - CRITICAL AD BURN`), **Ad Spend Signals** (`Google PPC Active`, `CallRail Swap Detected`), and **14-Point Technical Grid**.
   * User inspects the **Cloudinary Annotated Mobile Mockup** showing the prospect's actual broken/slow mobile view with the high-contrast warning bar.
2. **Optional 20-Second Phone Test (Interactive Override):**
   * User calls the prospect's `gbp_primary_phone`.
   * If unanswered with no automated SMS text-back, user toggles **`[ Missed Call Leaked (No SMS / AI Callback) ]`** to `ON`.
   * System calls `PATCH /api/prospects/[id]/call-test`, updating the database and rewriting the Email and DM pitches in `<2.5s` to lead with the missed-call bleed.
3. **Outreach Execution (Right Column - The Pitch):**
   * Drawer automatically focuses the tab matching `recommended_channel` (`Cold Email` or `IG/FB Cold DM`).
   * User reviews the highlighted **Extracted Proof Pill** (e.g., *"Referenced Proof: Custom white oak island kitchen in Silverleaf"*).
   * User clicks **`[ Copy Email & Mark as Emailed ]`** (or **`[ Copy DM & Open Instagram ↗ ]`**).
4. **Follow-Up Lifecycle:**
   * Status transitions to `pitched_email` or `pitched_dm` with a `pitched_at` timestamp.
   * After 72 hours without status changing to `replied`, a scheduled check transitions the prospect to `followup_due`, surfacing them in the **`Follow-Ups Due (Day 3+)`** tab with the Day-3 bump ready for 1-click copy.

---

## 3. State Machine Definitions

### 3.1 Campaign Status (`radar_campaigns.status`)
* `queued` -> Waiting for Target City peak ad window (09:00–16:59 local).
* `running_serp` -> ScrapingBee fetching Google LSA, PPC, and Organic #8–#25 results.
* `auditing` -> Iterating through clean contractor domains in batches of 3.
* `completed` -> All candidate domains audited and scored.
* `failed` -> API key exhausted or network error (preserves partial progress).

### 3.2 Prospect Outreach Status (`prospects.outreach_status`)
* `audited` -> Freshly scored and ready for initial outreach.
* `pitched_email` -> Initial customized email sent; 72h follow-up timer active.
* `pitched_dm` -> Initial social cold DM sent; 72h follow-up timer active.
* `followup_due` -> 72+ hours elapsed since initial pitch without reply.
* `replied` -> Prospect responded positively; moved to active sales conversation.
* `archived` -> Disqualified, low score, or unresponsive after follow-up.
