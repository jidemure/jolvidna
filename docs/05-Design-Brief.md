# 05 - UI/UX Design Brief & Component Contracts (`05-Design-Brief.md`)

**Document ID:** `05-Design-Brief.md`  
**Builds On:** `01-PRD.md`, `02-App-Flow.md`, `03-Schema.md`, `04-TRD.md`  
**Design Standard:** Premium UI/UX in 2026 Master Standard (v2.0) — Dark Mode Command Workspace  
**Framework:** Next.js App Router + Ant Design v5 (`ConfigProvider` dark algorithm) + Tailwind CSS

---

## 1. Visual Identity, Typography & Semantic Color Tokens

### 1.1 Typography System (Google Fonts)
* **Heading Font (`--font-heading`):** **`Outfit`**, weights `600` (SemiBold) and `700` (Bold). Used for page titles, KPI metric numbers, drawer headers, and section titles. Line-height `1.2`, letter-spacing `-0.02em`.
* **Body & UI Font (`--font-body`):** **`DM Sans`**, weights `400` (Regular) and `500` (Medium). Used for table cells, pitch editors, form inputs, and badges. Minimum `16px` (`1rem`) for pitch body copy, `14px` for high-density table data, line-height `1.5`.
* **Monospace Font (`--font-mono`):** **`JetBrains Mono`**, weight `500`. Used for Leak Scores (`92/100`), LCP load times (`7.4s`), and domain URLs.

### 1.2 3-Layer Semantic Color Tokens (Dark Mode First + Vibrant Yellow Accents)
| Semantic Token | Hex Value | Usage & Contrast Contract |
| :--- | :--- | :--- |
| `surface-canvas` | `#0A0A0A` | Primary application background |
| `surface-elevated` | `#141414` | KPI cards, Prospect Table container, Slide-Over Drawer |
| `surface-interactive` | `#1F1F1F` | Hover row states, input backgrounds, inactive tabs |
| `border-subtle` | `#262626` | Card outlines, table dividers (`>= 3:1` against `#0A0A0A` when active) |
| `text-primary` | `#F5F5F5` | Headings, primary table text, pitch editor text (`18.1:1` contrast) |
| `text-muted` | `#A3A3A3` | Timestamps, secondary metadata (`7.8:1` contrast — passes WCAG AA) |
| `action-primary` | `#FFD700` | Primary CTAs (`Launch Radar`, `Audit Website`, `Copy Pitch`). Paired with `#0A0A0A` bold text (`14.2:1` contrast) |
| `action-primary-hover`| `#FACC15` | Hover/active state for primary yellow buttons |
| `status-danger` | `#EF4444` | High Leak Score (`80–100`), Slow Speed (`>4.0s`), Missing AI/Calc badges |
| `status-warning` | `#F59E0B` | Medium Leak Score (`50–79`), Queued Timezone campaigns, Follow-Up Due |
| `status-success` | `#10B981` | Positive Replies, Installed Pixels (`Google PPC Active`), Fast Speed |
| `focus-ring` | `#FFD700` | `2px solid #FFD700` with `2px` offset on all interactive controls (WCAG 2.4.11) |

*Non-Color Cue Rule (WCAG 1.4.1):* Never rely on red/green color alone. Every badge pairs color with an explicit icon and text label (e.g., `[🔥 92/100 High Burn]`, `[❌ No Budget Calc]`, `[✅ Google PPC]`).

---

## 2. Layout Architecture & Numeric Defaults

* **Spacing Scale:** Strict `4px` base grid (`4, 8, 12, 16, 24, 32, 48px`).
* **Touch & Click Targets:** Minimum `44x44px` for primary action buttons (`Audit Website`, `Copy Email`, `Missed Call Switch`) and `>= 24x24px` (`36px` height default) for table row actions with `8px` gap between adjacent buttons (WCAG 2.5.8).
* **Z-Index Hierarchy:** `base: 0`, `sticky-header: 100`, `drawer-backdrop: 200`, `pitch-drawer: 300`, `radar-modal: 400`, `status-toast: 500`.

### Single-Screen Workspace Layout (`1440px+` Desktop & `320px` Zoom Reflow)
1. **Sticky Command Header (`height: 72px`, `bg-[#141414]`, `border-b #262626`):**
   * Left: Brand mark + `Opportunity Radar` (`Outfit 700`, `20px`) with yellow radar pulse dot.
   * Center: **Instant Single-URL Audit Bar** (`<input type="url">` with persistent visible label + **`[ Audit Website Now ]`** `#FFD700` button).
   * Right: **`[ + Launch City Radar ]`** button + Active Timezone Clock (`Plano, TX: 10:42 AM CDT — Peak Ad Window Open`).
2. **4-Column KPI Decision Row (`gap: 16px`, `margin-top: 24px`):**
   * Card 1: **Hot Cash-Burn Leads (Score 80+)** — Clicking filters table to `leak_score >= 80`.
   * Card 2: **Ready to Pitch (`audited`)** — Clicking filters table to unpitched leads.
   * Card 3: **Follow-Ups Due (72h+)** — Highlighted with `#F59E0B` border when `> 0`.
   * Card 4: **Positive Replies (`replied`)** — Conversion velocity tracker.
3. **Prospect Work Queue Table (`surface-elevated #141414`):**
   * Filter Bar: Status tabs + Search by domain/city + `Last synced` timestamp + manual refresh button.
   * Columns:
     1. `Contractor & Domain` (Business Name in `Outfit 600` + clickable root domain + city).
     2. `Cash-Burn Score` (`JetBrains Mono` pill: `92/100` with flame icon).
     3. `Money-in-Motion Signals` (`[🎯 Google PPC]`, `[📞 CallRail]`, `[📘 Meta Pixel]`).
     4. `Top Funnel Bleeds` (`[🐢 7.4s Mobile]`, `[❌ No Calc]`, `[❌ No AI Voice]`).
     5. `Best Channel` (`[✉️ Personal Email]` or `[📸 Instagram DM]` with owner name).
     6. `Outreach Status` (Interactive dropdown + timestamp).
     7. `Action` (**`[ Inspect & Pitch → ]`** `#FFD700` ghost/solid button).
4. **Slide-Over Audit & Pitch Drawer (`width: 980px`, 2-Column Split):**
   * **Left Column (45% width — The Evidence):**
     * **Live Call Test Card:** Prominent switch: `Tested Phone ({gbp_primary_phone}) -> Went to Voicemail with No SMS Back`. Toggling triggers immediate pitch regeneration.
     * **14-Point Technical & GBP Scorecard:** Grouped into *Ad Spend*, *Speed & AEO*, *Capture & Qualify*, and *Reviews*.
     * **Cloudinary Visual Proof Card:** Displays the framed mobile screenshot with 1-click **`[ Copy Annotated Image Link ]`**.
   * **Right Column (55% width — The Conversion Engine):**
     * **Scraped Proof Banner:** Shows exact portfolio detail extracted by the agent.
     * **Channel Tabs:** `Cold Email (<110w)` | `IG / FB Cold DM (<45w)` | `Day-3 Follow-Up`.
     * **Editable Pitch Surface:** `DM Sans 16px` textarea (`45-70ch` measure), live word-count badge (`94 / 110 words`), and consequence-explicit primary CTA: **`[ Copy Email & Mark as Emailed ]`** or **`[ Copy DM & Open Instagram ↗ ]`**.

---

## 3. Complete 12-State UI Inventory

| State | Visual & Functional Contract |
| :--- | :--- |
| **1. First-Use Empty** | Shows onboarding card explaining Sniper Audit vs. City Radar + **`[ Run Sample Audit on Demo Remodeler ]`** button. |
| **2. Populated High-Density** | Paginates at 25 rows/page; truncates long business names at `28ch` with accessible tooltip; horizontally scrolls table cleanly on narrow viewports. |
| **3. Filtered-Empty** | Shows active filter chips (e.g., `Score >= 80`, `Follow-Up Due`) + **`[ Clear All Filters ]`** button. |
| **4. Loading (>1s & >10s)** | Single audit (`8-12s`) renders a 4-step determinate progress bar (`Rendering DOM -> PageSpeed -> Cloudinary -> Writing Pitch`). Bulk Radar runs in a non-blocking top status drawer. |
| **5. Partial API Failure** | If Google PageSpeed times out, the Speed card shows `[⚠️ Speed Timed Out (Defaulted to 8.5s Slow)]` with a local **`[ Retry Speed Check ]`** button while the rest of the audit succeeds. |
| **6. Stale Data (>30d)** | Displays `Audited 34d ago` pill in drawer with **`[ Re-Audit Live Site ]`** button. |
| **7. Offline / Network Drop** | Preserves any manual edits made inside the Pitch Textarea in `localStorage` keyed by `prospect_id`. |
| **8. Validation / Bouncer Error**| Inline error above URL input (`"yelp.com is a directory — paste an independent contractor domain"`) linked via `aria-describedby`. |
| **9. Timezone Gate Lock** | When launching a Radar outside US business hours, displays a clear schedule confirmation banner (`Queued for 3:30 PM WAT when Texas Google Ads go live`) with **`[ Force Run Now Anyway ]`** override. |
| **10. Duplicate Domain Match** | If user pastes an already-audited URL, opens existing drawer immediately with a top banner: `"Loaded existing audit from 3 days ago (0 credits used)"`. |
| **11. Rate Limit / Cooldown** | Disables duplicate clicks during active scrape and shows countdown if ScrapingBee concurrency limit (5 simultaneous requests) is reached. |
| **12. Success, Receipt & Undo** | Clicking **`[ Copy Email & Mark as Emailed ]`** copies text, updates status to `pitched_email`, and shows a 6-second pausable status bar with **`[ Undo Status Change ]`**. |
