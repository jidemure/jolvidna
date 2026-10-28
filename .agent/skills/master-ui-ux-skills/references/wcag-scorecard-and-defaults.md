# Numeric Defaults, WCAG 2.2 Map, Regulatory Map & Release Scorecard (v2.0)

## 1. Numeric Heuristic Defaults (Starting Baseline)

Use these concrete defaults whenever a project does not yet have a validated design system:

| Dimension | Default Specification |
| :--- | :--- |
| **Spacing Scale** | `4px` base unit (`4, 8, 12, 16, 24, 32, 48, 64, 96px`). |
| **Typography Scale** | Web body `>= 16px` (`1rem`); secondary/caption `>= 12px` (`0.75rem`) with `>= 4.5:1` contrast; line-height `1.5` for body, `1.15-1.25` for headings; reading measure `45-75ch`. |
| **Touch & Click Targets** | **Release Gate:** `24x24 CSS px` minimum (WCAG 2.5.8). **Primary Control Default:** `44x44pt` (iOS) / `48x48dp` (Android) / `44x44px` (Web touch) with `>= 8px` gap between targets. |
| **Color Contrast** | Body text `< 18pt`: `>= 4.5:1`. Large text (`>= 18pt` or `>= 14pt bold`): `>= 3.0:1`. UI borders, icons, focus rings, chart series: `>= 3.0:1`. |
| **Focus Ring** | `2px solid` high-contrast ring with `2px` offset (or dual-color inner/outer ring), never obscured by sticky headers/footers (WCAG 2.4.11). |
| **Motion & Transitions** | Micro-interactions `100-150ms`; layout drawers/modals `200-300ms` (`ease-out` enter, `ease-in` exit). Collapse/disable under `prefers-reduced-motion: reduce`. |
| **Loading Feedback Tiers** | `< 100ms`: no indicator. `100ms - 1.0s`: subtle inline indicator. `1.0s - 10s`: geometry-matching skeleton or progress bar. `> 10s`: step progress, time estimate, and background execution. |
| **Toast Duration** | `5-8s` minimum display, pauses on hover/focus, `role="status"`, never used for errors or sole transaction receipts. |
| **Z-Index Semantic Layers** | `base: 0`, `elevated: 10`, `sticky-nav: 100`, `backdrop: 200`, `drawer/popover: 300`, `modal: 400`, `toast/alert: 500`, `tooltip: 600`. |
| **Performance Budgets** | Field p75 gates: `LCP <= 2.5s`, `INP <= 200ms`, `CLS <= 0.1`. Route budgets: initial JS `<= 170KB` gzipped, critical CSS `<= 50KB`, third-party timeout `8s`. |

---

## 2. Complete WCAG 2.2 Level A & AA Criterion Map

Audit every screen and component against these normative criteria (note: `4.1.1 Parsing` is obsolete and removed in WCAG 2.2):

- **Structure & Semantics:** `1.1.1 Non-text Content (A)`, `1.3.1 Info and Relationships (A)`, `1.3.2 Meaningful Sequence (A)`, `1.3.3 Sensory Characteristics (A)`, `2.4.1 Bypass Blocks / Skip Links (A)`, `2.4.2 Page Titled (A)`, `2.4.4 Link Purpose in Context (A)`, `2.4.5 Multiple Ways (AA)`, `2.4.6 Headings and Labels (AA)`, `3.1.1 Language of Page (A)`, `3.1.2 Language of Parts (AA)`, `3.2.3 Consistent Navigation (AA)`, `3.2.4 Consistent Identification (AA)`, `4.1.2 Name, Role, Value (A)`.
- **Keyboard & Focus:** `2.1.1 Keyboard (A)`, `2.1.2 No Keyboard Trap (A)`, `2.1.4 Character Key Shortcuts (A)`, `2.4.3 Focus Order (A)`, `2.4.7 Focus Visible (AA)`, `2.4.11 Focus Not Obscured - Minimum (AA - New in 2.2)`.
- **Pointer, Touch & Gestures:** `2.5.1 Pointer Gestures (A)`, `2.5.2 Pointer Cancellation (A)`, `2.5.3 Label in Name (A)`, `2.5.4 Motion Actuation (A)`, `2.5.7 Dragging Movements (AA - New in 2.2)`, `2.5.8 Target Size - Minimum 24x24 CSS px (AA - New in 2.2)`.
- **Forms, Auth & Error Prevention:** `1.3.5 Identify Input Purpose (AA)`, `3.2.1 On Focus (A)`, `3.2.2 On Input (A)`, `3.2.6 Consistent Help (A - New in 2.2)`, `3.3.1 Error Identification (A)`, `3.3.2 Labels or Instructions (A)`, `3.3.3 Error Suggestion (AA)`, `3.3.4 Error Prevention - Legal, Financial, Data (AA)`, `3.3.7 Redundant Entry (A - New in 2.2)`, `3.3.8 Accessible Authentication - Minimum (AA - New in 2.2)`.
- **Layout, Zoom & Contrast:** `1.3.4 Orientation (AA)`, `1.4.1 Use of Color (A)`, `1.4.3 Contrast Minimum 4.5:1 (AA)`, `1.4.4 Resize Text 200% (AA)`, `1.4.5 Images of Text (AA)`, `1.4.10 Reflow at 320 CSS px (AA)`, `1.4.11 Non-text Contrast 3:1 (AA)`, `1.4.12 Text Spacing (AA)`, `1.4.13 Content on Hover or Focus (AA)`.
- **Timing, Motion & Status:** `1.2.1-1.2.5 Audio/Video Captions, Transcripts & Audio Description (A/AA)`, `1.4.2 Audio Control (A)`, `2.2.1 Timing Adjustable (A)`, `2.2.2 Pause, Stop, Hide (A)`, `2.3.1 Three Flashes or Below Threshold (A)`, `4.1.3 Status Messages (AA)`.

---

## 3. Global Regulatory & Compliance Map (Non-Legal Operational Guide)

*Disclaimer: Operational UX engineering mapping, not legal advice. Confirm jurisdiction-specific counsel.*

- **Accessibility:** **EU Accessibility Act (EAA)** (in force since June 28, 2025) & **EN 301 549**, **US ADA Title II/III & Section 508**, **UK Equality Act 2010**, **Canada ACA / Ontario AODA** -> Require WCAG 2.1/2.2 AA conformance across core discovery, authentication, checkout, and support paths.
- **Subscriptions & Consumer Protection:** Note that the **US FTC Negative Option ("Click-to-Cancel") Rule** was vacated by the 8th Circuit Court of Appeals in July 2025 on procedural grounds; however, **ROSCA**, **FTC Act Section 5 enforcement**, **California Automatic Renewal Law (ARL)**, other US state auto-renewal statutes, and the **EU Consumer Rights Directive** remain strictly enforced. Always display total price, mandatory fees, and renewal terms before billing capture, obtain express consent, and provide an online cancellation flow as easy as sign-up.
- **Privacy & Consent:** **EU/UK GDPR & ePrivacy**, **US CCPA/CPRA**, **Brazil LGPD** -> Require equal visual prominence for `Reject All` and `Accept All` cookie/tracking controls, granular purpose toggles, support for Global Privacy Control (`GPC`), and self-serve data export/deletion.
- **Platforms, Safety & AI:** **EU Digital Services Act (DSA)** & **UK Online Safety Act** (transparent moderation status, statement of reasons, appeal routes, no undisclosed shadow-banning); **EU AI Act** (explicit disclosure when interacting with an AI system and provenance labels on AI-generated content); **PSD2 / SCA & PCI DSS v4.0** (3DS2 redirect state preservation and iframe script integrity).

---

## 4. Measurable "Premium" Scorecard & S0-S3 Release Severity Model

### 4.1 The Premium Scorecard

1. **Task Success:** `>= 90%` unassisted completion across top user jobs.
2. **Comprehension:** `>= 85%` of users accurately state total price, renewal terms, data usage, and consequence before clicking commit.
3. **Accessibility:** `0` open `S0` or `S1` WCAG 2.2 AA defects on critical paths; full keyboard and screen-reader walkthrough pass.
4. **Performance:** Field p75 `LCP <= 2.5s`, `INP <= 200ms`, `CLS <= 0.1` across route classes.
5. **Error Recovery:** `>= 90%` recovery from seeded validation, network, or payment interruption without losing entered data.
6. **Trust Parity:** `0` dark-pattern flags; opt-out and cancellation click count `<=` opt-in and sign-up click count (`+1` confirmation step max).
7. **State Completeness:** `100%` of the 12 route states defined with copy, UI, and fallback behavior.

### 4.2 Severity Grading Model (`S0` - `S3`)

- **S0 - Release Blocker (DO NOT SHIP):** Prevents task completion, causes financial/data loss or double-charging, hides mandatory legal/pricing terms, exposes PII, or fails keyboard/screen-reader access on a critical path.
- **S1 - Major Defect (SHIP ONLY WITH MITIGATION & 7-14 DAY SLA):** Significant friction requiring a non-obvious workaround, fails a WCAG 2.2 AA criterion on a secondary route, misses an edge-state screen (`partial`, `stale`, `conflict`), or misses p75 INP/LCP targets by `< 25%`.
- **S2 - Minor Defect (BACKLOG WITH 30-DAY SLA):** Visual alignment drift (`1-3px`), inconsistent border radii, non-critical truncation with accessible fallback, or minor microcopy ambiguity.
- **S3 - Polish / Enhancement (OPPORTUNISTIC):** Micro-interaction refinement or visual delight beyond functional and accessibility baselines.
