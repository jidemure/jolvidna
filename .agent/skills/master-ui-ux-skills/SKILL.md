---
name: master-ui-ux-skills
description: Design, audit, refactor, and build production-grade web and mobile UI/UX screens, flows, and components using the unified Premium UI/UX in 2026 Master Standard (v2.0) and the Live UI Vibe Tuner overlay. Use whenever the user asks to design, build, review, critique, improve, or spec any UI/UX screen, landing page, website, web app, SaaS dashboard, CRM, mobile app, e-commerce checkout, directory, editorial site, AI interface, or UI component across any framework or dev tool.
---
# Master UI/UX Skills

Turn cross-category UI/UX research, WCAG 2.2 AA accessibility criteria, state-machine architecture, anti-dark-pattern guardrails, and the interactive **Live UI Vibe Tuner** into production-ready screens, component specifications, code implementations, and release audits. This skill treats UI/UX as a system of promises and recoverable states rather than static visual screens.

## When to Use

- Designing a new screen, flow, or full application from scratch (web, iOS, Android, or desktop)
- Auditing, refactoring, or improving an existing UI/UX layout, user flow, or frontend codebase
- Specifying or coding reusable design-system components with full state, keyboard, and ARIA contracts
- Optimizing conversion funnels, landing pages, checkouts, or onboarding flows without dark patterns
- Verifying a product against WCAG 2.2 AA, Core Web Vitals, and the S0-S3 release quality scorecard
- Embedding a live visual inspector (`VibeTuner`) to fine-tune spacing, typography, and colors directly on the rendered screen

## Supplementary Resources

Load the following reference files from the `references/` folder as soon as the user completes the qualification step:

- `references/component-contracts.md` - Complete specifications for all 31 interactive UI components, including HTML/ARIA semantics, keyboard navigation, focus management, touch targets, and edge states.
- `references/playbooks-and-states.md` - All 16 product domain playbooks, the 12-state route inventory, multi-user conflict resolution patterns, third-party script circuit breakers, and mobile hardware/sensor fallbacks.
- `references/wcag-scorecard-and-defaults.md` - Numeric heuristic defaults (spacing, typography, motion, loading tiers, z-index layers), the full WCAG 2.2 Level A/AA criterion map, the global regulatory map, the measurable Premium Scorecard, and the S0-S3 severity model.
- `references/vibe-tuner-overlay.md` - Drop-in code for the **Live UI Vibe Tuner (`Alt+S`)** visual inspector in React/Next.js (`VibeTuner.tsx`) and Vanilla JS (`vibe-tuner.js`), featuring 4px-grid spacing sliders, typography controls, live WCAG contrast checking, and 1-click AI patch prompt export.
- `references/cross-tool-adapters.md` - Installation guides and config wrappers for Google Antigravity 2.0, Claude Code, Cursor, and OpenAI Codex.

## Steps

### Step 1: Run the Mandatory Interactive Qualification Gate (Pause and Ask First)

Never jump straight into generating final UI designs, wireframes, or frontend code on an initial request unless the user has already provided every detail below. Always start by greeting the user and presenting the **Stage 1 & Stage 2 Discovery Questionnaire** so you can lock the exact scope.

#### Stage 1: Select Operation Mode and Target Surface

Ask the user to choose one **Operation Mode** and one or more **Target Surfaces** by number or letter:

**1. Operation Mode:**

- **A. Design & Build from Scratch** - Create a new screen, multi-step flow, or component implementation (includes optional **Live UI Vibe Tuner** overlay for real-time visual tweaking).
- **B. Audit & Improve Existing UI/UX** - Diagnose and fix usability, conversion, state, visual hierarchy, or accessibility gaps in an existing design or codebase.
- **C. Design System & Component Architect** - Define design tokens, numeric defaults, and 31-component accessibility/state contracts.

**2. Target Surface / Product Archetype:**

- **1. Landing Page / Conversion Marketing Site** (Hero, proof, pricing, objection handling, lead capture)
- **2. Full Multi-Page Website** (Brand site, corporate site, service business, or portfolio)
- **3. SaaS Web App / Complex Dashboard** (Workspace shell, decision metrics, async jobs, role workflows)
- **4. CRM, Admin, Operations, or Enterprise Data Workflow** (10k+ row tables, queues, bulk mutations, audit trails)
- **5. Mobile App / Mobile-First Responsive Screen** (iOS, Android, foldables, bottom sheets, offline/sensor states)
- **6. E-Commerce, Checkout, Subscription, or Booking Funnel** (Cart, guest checkout, payment recovery, scheduling)
- **7. Directory, Marketplace, or Search & Discovery Listing** (Faceted search, comparison cards, zero-result recovery)
- **8. Blog, Editorial, News, or Real-Time Media Product** (Article hierarchy, live timelines, provenance, alert controls)
- **9. AI Copilot, Chat Assistant, or Agentic Interface** (Streaming states, citations, human-in-the-loop approval, undo)
- **10. Authentication, Onboarding, Settings, or Account Flow** (Passkeys, OTP, session recovery, notification matrix)
- **11. Specific UI Component(s)** (Modals, Comboboxes, Data Grids, Command Palettes, Charts, File Uploaders, etc.)

#### Stage 2: Ask Targeted Context Questions

In the same message (or as a quick follow-up after they select a surface), ask 4 concise qualifying questions tailored to their goal:

1. **Core User Job & Primary Commitment:** Who is the target user, what job are they trying to finish, and what is the primary action they take (including any cost, data, or irreversible consequence)?
2. **Platform, Tech Stack & Aesthetic Preference:** Is this for Web, iOS, Android, or Cross-Platform? What stack are you using (e.g., React, Next.js, Tailwind, React Native, plain HTML/CSS), and do you prefer Dark Mode first, Light Mode first, or specific brand accent colors?
3. **Critical States, Data Density & Edge Cases:** Does this screen handle high-density data, payments, multi-user editing, slow/async background jobs (>10s), third-party embeds, or offline usage?
4. **Current Baseline & Live Vibe Tuner Preference:** (If improving existing UI/UX, share the code, screenshot, or pain points.) Also confirm: **Would you like the toggleable `⚡ Live UI Vibe Tuner (Alt+S)` bundled in dev mode** so you can visually adjust spacing, fonts, and colors on screen after generation?

Wait for the user's answers before executing Steps 2 through 5. If the user asks to skip questions or says "use best-practice defaults", state your chosen assumptions explicitly in a 5-bullet summary and proceed.

### Step 2: Lock the Job, Promise, and 12-State Matrix

Once the user responds, load `references/playbooks-and-states.md` and define the **Qualification Lock**:

1. **User Job & Success Condition:** Map the shortest safe path from entry to verified completion, rather than designing around internal database objects.
2. **Explicit Action Labels (Verb + Object + Consequence):** Replace vague labels ("Submit", "Continue", "Get Started") with consequence-explicit actions ("Pay $48.00", "Book Tuesday at 14:00", "Delete 12 records permanently", "Start 14-day trial - then $20/mo").
3. **12-State Route Inventory:** Ensure the design or code accounts for every applicable state:
   - First-use / instructional empty state (explains value + 1 primary action)
   - Populated / high-density state (truncation policy, long localization +30-100% expansion)
   - Filtered-empty / zero-result state (shows active query/filters + 1-click "Clear filters" recovery)
   - Loading state (<100ms none; 100ms-1s subtle indicator; >1s geometry-matching skeleton; >10s determinate progress + background execution)
   - Partial data / single-dependency failure (degrade only the affected card/widget, never crash the full screen)
   - Stale data state (explicit "Last updated" timestamp + manual refresh control)
   - Offline & reconnect state (preserve drafts, scroll, and filters; queue or warn on mutations)
   - Validation & server error state (GOV.UK pattern: top error summary linked to inline field errors via `aria-describedby`, preserving user input)
   - Permission / eligibility denial state (explain missing role/plan and provide request-access or upgrade path)
   - Conflict / concurrent edit state (detect stale version; offer side-by-side diff or keep/overwrite choice)
   - Rate-limit & timeout state (show countdown timer or safe retry without blind duplicate mutation)
   - Success, receipt & undo state (durable reference ID, next step, and 5-8s pausable undo or history log)

### Step 3: Apply Numeric Defaults, Component Contracts, and Domain Playbooks

Load `references/component-contracts.md` and `references/wcag-scorecard-and-defaults.md` and enforce concrete specifications:

1. **Spacing & Layout:** Use a 4px base spacing scale (`4, 8, 12, 16, 24, 32, 48, 64px`). Use semantic z-index layers (`base`, `sticky`, `drawer`, `modal`, `toast`). Test layout survival from `320px` width (400% zoom) up to ultra-wide split views without horizontal page scroll.
2. **Typography:** Minimum `16px` (`1rem`) body text on web, `1.4-1.6` line-height, `45-75ch` reading measure, and single meaningful `<h1>` per route. Must survive 200% text enlargement without clipping prices, dates, names, or legal terms.
3. **Touch & Pointer Targets:** Enforce a hard release gate of `24x24 CSS px` minimum (WCAG 2.5.8) and a premium default of `44x44pt` (iOS) / `48x48dp` (Android) for primary interactive controls, with at least `8px` separation.
4. **Semantic Color Tokens & Non-Color Cues:** Use 3-layer tokens (`reference` -> `semantic role` like `surface-elevated`, `text-muted`, `action-primary`, `status-danger`, `focus-ring` -> `component`). Never rely on color alone for errors, status, or chart series; always pair color with icons, text labels, or patterns.
5. **Component Contracts:** Every interactive widget must implement native HTML elements first (`<button>`, `<input>`, `<select>`, `<dialog>`, `<details>`) or full WAI-ARIA APG keyboard and focus return rules from `references/component-contracts.md`.

### Step 4: Enforce WCAG 2.2 AA, Performance Budgets, and Trust Guardrails

1. **WCAG 2.2 AA Baseline:**
   - Focus rings (`>= 3:1` contrast) must never be obscured by sticky headers, bottom bars, chat widgets, or cookie banners (WCAG 2.4.11).
   - Provide single-pointer/button equivalents for all drag-and-drop, swipe, pinch, or hover interactions (WCAG 2.5.7, 1.4.13).
   - Never block paste in password or OTP fields; support passkeys, password managers, and `autocomplete="one-time-code"` (WCAG 3.3.8, NIST SP 800-63B).
   - Auto-carry previously entered data (e.g., shipping to billing) to prevent redundant entry (WCAG 3.3.7).
2. **Core Web Vitals & Async Resilience:**
   - Design for field p75 budgets: `LCP <= 2.5s`, `INP <= 200ms`, `CLS <= 0.1`.
   - Reserve explicit `width`/`height` or `aspect-ratio` for all media, ads, embeds, and skeletons so late loads never shift primary buttons.
   - Wrap third-party iframes/scripts (payments, maps, captchas, chat) in 8-second timeout circuit breakers with manual fallback UI.
3. **Trust & Anti-Dark-Pattern Architecture:**
   - Place material terms (total price, taxes, fees, renewal cadence, trial end date, cancellation policy, data usage) immediately adjacent to the commitment button, never hidden inside accordions or tooltips.
   - Give privacy/cookie "Reject all" and subscription "Cancel" paths equal visual weight and click effort to "Accept" and "Sign up".

### Step 5: Deliver the Output, Bundle the Live Vibe Tuner, and Run the S0-S3 Scorecard

Structure your final deliverable clearly based on the user's chosen Operation Mode:

- **For New Designs / Code:** Provide (1) Qualification & Architecture Summary, (2) Layout & Component Specification, (3) Complete State Matrix, (4) Production-Ready Code or Wireframe Blueprint, (5) **Live UI Vibe Tuner Integration** (from `references/vibe-tuner-overlay.md` when requested or building web UIs, so the user can press `Alt+S` to visually tweak spacing/fonts/colors and copy back an AI patch prompt), and (6) Verification Scorecard.
- **For Audits / Improvements:** Provide (1) Executive Verdict & Premium Scorecard Grade, (2) Categorized Findings graded `S0 Blocker`, `S1 Major`, `S2 Minor`, and `S3 Polish`, (3) Concrete Before/After Fixes (Copy, Layout, States, Code), and (4) Verification Checklist.

Never conclude an audit or build with a binary pass/fail without grading any remaining trade-offs using the `S0-S3` severity model in `references/wcag-scorecard-and-defaults.md`.

## Gotchas

- **Skipping the intake questions:** Jumping straight into generic code or mockups produces surface-level templates that miss the user's real workflow, state edge cases, and platform constraints. Always ask the Stage 1 & Stage 2 qualifying questions first.
- **Treating placeholders as labels:** Disappearing placeholders fail WCAG 3.3.2 and strain short-term memory. Always use persistent visible `<label>` elements above inputs.
- **Using toasts for errors or critical receipts:** Auto-dismissing toasts violate timing and focus rules for errors and lose receipt references. Use inline/summary errors for failures and persistent history/receipt surfaces for completed transactions.
- **Blind retry on unknown payment or mutation state:** If a network drops during checkout or form submission, never tell the user to "Try again" without checking idempotency or server status first, or you risk double-charging.
- **Relying on outdated regulatory assumptions:** The US FTC Click-to-Cancel rule was vacated by the 8th Circuit in July 2025, though ROSCA, FTC enforcement, and strict state auto-renewal laws (e.g., California ARL) still mandate transparent consent and easy cancellation. Always cite accurate legal context from `references/wcag-scorecard-and-defaults.md`.
