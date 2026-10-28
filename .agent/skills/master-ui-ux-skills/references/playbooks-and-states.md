# Unified Product Playbooks & 12-State Architecture (Master UI/UX Standard v2.0)

## Part 1: The 12-State Route & Mutation Inventory

Every screen, route, and data mutation must explicitly define behavior across these 12 states:

1. **First-Use / Instructional Empty:** Explains what the surface does, shows realistic preview/sample option, and offers 1 primary action.
2. **Populated & High-Density:** Handles real user data, 10k+ records, missing optional fields, and 30-100% text expansion without layout breakage.
3. **Filtered-Empty / Zero-Result:** Preserves the search bar and active filter chips; offers 1-click filter removal and nearby/broadened suggestions.
4. **Loading & Skeleton:** `<100ms` instant; `100ms-1s` subtle spinner; `>1s` geometry-matched skeleton; `>10s` determinate step progress + background execution option.
5. **Partial Data / Single-Dependency Failure:** Isolates failing widgets with a local warning and `Retry` button while keeping the rest of the page functional.
6. **Stale Data & Freshness:** Shows `Updated 4m ago` (distinct from `Last checked`); offers manual refresh or non-disruptive `N new updates` pill.
7. **Offline & Reconnect:** Displays offline banner, timestamps cached views, preserves unsaved form drafts in local storage, and reconciles safely upon reconnect.
8. **Validation & Server Error:** Distinguishes user-fixable field errors from 5xx/network failures. Uses a top error summary linked to inline fields (`aria-describedby`) while keeping all typed input intact.
9. **Permission & Eligibility Denial:** Explains *why* an action or view is locked (role, plan, region) and provides a direct path to request access, switch accounts, or upgrade.
10. **Conflict & Concurrent Edit:** Detects when another user or tab modifies the same record (`ETag`/version mismatch). Prevents silent overwrites by showing a diff or `Keep mine / Take server / Merge` choice.
11. **Rate Limit & Timeout:** Shows human-readable cooldown time (`Try again in 24 seconds`), disables spam clicking, and ensures retries use idempotency keys.
12. **Success, Receipt, Undo & Rollback:** Displays authoritative server confirmation, durable reference ID, next step, and a 5-8s pausable `Undo` or audit-log rollback route.

---

## Part 2: The 16 Product Domain Playbooks

### 1. Landing Pages & Conversion-Focused Marketing Sites

- **First Viewport Contract:** Must immediately answer: (1) What the product is, (2) Who it is for, (3) The concrete outcome, (4) Proof/credibility, (5) Next action (`Verb + Object`), and (6) Commitment/cost expectations.
- **Recommended Anatomy:** Optional announcement bar -> Concise header with real navigation -> Intent-matched Hero (1 primary CTA + 1 low-friction explore/demo CTA) -> Immediate proof with context/methodology -> Problem/workflow demonstration -> Differentiated benefits -> Specific social proof -> Transparent pricing/qualification -> Objections/FAQ -> Final CTA -> Complete footer (pricing, security, privacy, support).
- **Guardrails:** Never strip legal/support/pricing navigation, never autoplay audio, never use fake countdown timers, and ensure hero value is 100% comprehensible even if images/videos fail to load.

### 2. Full Multi-Page Websites (Corporate, Service & Brand Sites)

- **Information Architecture:** Consistent global navigation (`<nav>`), clear current-page indicators (`aria-current="page"`), predictable service/solution pages, transparent pricing or scoping guide, case studies with verifiable metrics, accessible contact/booking paths, and trust/compliance hub.
- **Conversion Continuity:** Every internal page should align its promise with a context-specific next step (e.g., on an Enterprise Security page, the CTA is `Download SOC 2 & Security Brief`, not a generic `Contact Us`).

### 3. Sales Funnels, Checkout & Lifecycle Conversion

- **State Pipeline:** `Discover/Pricing -> Compare -> Guest or Account Choice -> Details -> Payment -> Review -> Confirmation -> Activation -> Retention/Renewal`.
- **Guest Checkout Mandate:** Make Guest Checkout the most prominent default option; offer 1-click account creation *after* purchase completion.
- **Pre-Commitment Review:** Display item, quantity, base price, discount, tax, shipping/delivery, recurring renewal cadence, trial end date, and refund/cancellation policy right beside a consequence-labelled button (`Pay $84.20` or `Start 14-day free trial - then $20/mo`).
- **Unknown Payment Recovery:** If a 3DS redirect or webhook times out, never prompt a blind retry; check order status by idempotency key and show `Payment processing - verifying status`.

### 4. Directory, Marketplace, Listing & Search/Discovery

- **Shell Structure:** Query heading + live accessible result count (`aria-live="polite"`) + active filter chips with `Clear all` + Filter/Sort controls + View switcher + Result cards.
- **Comparison Cards:** Every card must expose title, qualified total price (including mandatory fees), primary differentiator, location/delivery, freshness, rating + review count + provenance, provider verification status, and 1 primary action. Clearly label `Sponsored` results.
- **URL State Persistence:** Sync query, filters, sort, page number, and scroll position to the URL so Refresh, Share, and Browser Back never reset the user's discovery work.

### 5. Blog, Editorial & Content-Heavy Products

- **Article Anatomy:** Topic breadcrumb -> Single precise `<h1>` -> Summary dek -> Author byline + credentials -> Published & Last Updated timestamps -> Hero media with caption/credit/alt -> Semantic body (`45-75ch` measure) -> Inline citations/sources -> Corrections log -> Related reading -> Non-intrusive conversion CTA.
- **Reflow:** Must reflow cleanly into a single readable column at `320px` width (400% zoom) without clipping captions, tables, or code blocks. Preserve reading position across sign-in or paywall handoffs.

### 6. News, Media, Alerts & Real-Time Information

- **Two-Layer Story Model:** Layer 1: Timestamped `What we know now` summary with source and confidence cues. Layer 2: Chronological live timeline and background explainer.
- **Live Stream Control:** Never auto-insert new items above the user's current reading viewport; display a focus-safe `12 new updates - Show now` pill (WCAG 2.2.2, 4.1.3).
- **Granular Alert Controls:** Separate breaking alerts, major developments, scheduled digests, and topic follows, with quiet-hours and 1-tap story muting.

### 7. CRM, Admin, Operations & Enterprise Workflows

- **Work Queue Architecture:** Global search/command (`Cmd+K`) + Role-specific work queue + Saved views + Filter builder + Column chooser + Result count + Last sync timestamp + Bulk action toolbar.
- **Bulk & Risky Mutations:** Bulk actions must state exact scope (`Approve 42 selected invoices totaling $18,400`), execute idempotently, report partial failures item-by-item, write to an immutable audit trail, and support rollback where feasible.

### 8. General SaaS Web Apps & Complex Dashboards

- **Decision-First Dashboards:** Lead with 3-5 role-specific metrics paired with comparison period (`vs. last 30 days`), freshness timestamp, plain-language interpretation, and a direct click path from any anomaly to the underlying records.
- **Long-Running Operations (>10s):** Provide a persistent background jobs drawer showing step progress, estimated remaining time, `Cancel`, `Retry`, and durable downloadable output history.

### 9. Mobile Apps & Mobile-First Responsive Screens

- **Ergonomics & Layout:** Safe-area-aware top bar, bottom navigation (`3-5` top-level destinations max), and bottom sheets for interruptive tasks. Preserve drafts, filters, playback, and scroll across app backgrounding, rotation, foldable posture changes, and OS process kills.
- **Contextual Permissions & Hardware Fallbacks:** Request camera, location, mic, or notification permissions only at the moment of use, with an explanation and a fully functional fallback if denied (e.g., manual file upload if camera is denied; manual ZIP/address search if GPS is denied; PIN/password fallback if FaceID/biometrics fail).

### 10. E-Commerce, Subscriptions, Payments & Service Booking

- **Service Booking Specifics:** Always pair calendar pickers with typed date inputs; display customer timezone vs. venue timezone, appointment duration, hold expiration timer, provider identity, no-show/cancellation policy, and 1-click reschedule/cancel links on the confirmation screen.

### 11. Authentication, Identity & Account Recovery Flows

- **Frictionless Sign-In:** Support Passkeys (WebAuthn), password managers, paste in all fields, show/hide password toggle, and `autocomplete="one-time-code"` for SMS/Email OTPs with a visible resend countdown timer.
- **First-Class Recovery:** Provide clear recovery paths for lost device, lost email, or expired magic link. Prevent account enumeration in error copy while giving actionable next steps.
- **Session Expiry Protection:** Warn users at least 60-120 seconds before session timeout with a 1-click `Extend session` button, and auto-save form drafts so re-authentication returns to the exact unsaved work (WCAG 2.2.1).

### 12. AI Copilot, Assistant & Agentic Interfaces

- **Input & Scope Honesty:** Show realistic starter prompts, supported attachment types, and explicit capability boundaries.
- **Streaming & Screen Readers:** Provide a visible `Stop generating` button during streaming. Never spam `aria-live` on every token; announce `"Generating response..."` at start and `"Response complete"` when finished.
- **Provenance & Human-in-the-Loop:** Render inline source citations, distinguish AI-generated synthesis from verified database facts, and require an explicit **Preview & Approve** confirmation card before any AI agent executes a consequential action (sending messages, modifying records, charging cards, deleting data, or changing permissions).

### 13. Data Visualization & Honest Analytics

- **Accessibility & Integrity:** Every chart requires a plain-text headline takeaway, a keyboard-accessible data table view, non-color differentiation (patterns, shapes, direct labels), zero-baseline bar charts, explicit axis units, sample size (`n`), and explicit handling of empty, partial, or outlier ranges.

### 14. Settings, Preferences & Notification Management

- **Organization:** Group settings logically with a top search filter. Never mix immediate-save switches and explicit-save text inputs inside the same card boundary. Provide a `Reset to defaults` option, a `Channel x Event Category` matrix for notifications (Email, Push, SMS, In-App) with a global Pause toggle, and a visible security audit log for sensitive account changes.

### 15. Value-First Onboarding & First-Run Experiences

- **Rules:** Demonstrate product value before demanding heavy setup or billing. Keep interactive tours under 4 steps with an ever-present `Skip` button and a persistent `Getting Started` checklist widget users can reopen anytime. Offer realistic **Sample Data Mode** so new workspaces never look dead on day one.

### 16. Rich Media, Long Multi-Step Forms & Print/Export

- **Media:** Captions, transcripts, keyboard-accessible scrubber/volume, playback speed controls, and zero unmuted autoplay.
- **Long Forms:** Break into logical task steps, auto-save on step transition, provide a `Save & Finish Later` link, and include an editable `Review & Confirm` summary step.
- **Print & Export:** Provide `@media print` CSS (stripping nav/chat chrome), tagged accessible PDFs, and UTF-8 CSV exports with locale-safe ISO timestamps and formula-injection sanitization.
