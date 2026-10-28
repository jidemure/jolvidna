# 31-Component Library Contracts (Master UI/UX Standard v2.0)

Every interactive component in a web or mobile product must satisfy its semantic, keyboard, focus, target-size, content, and state contract before release.

## Core Form & Action Components (1-10)

### 1. Button (`<button>`)

- **Semantics:** Native `<button type="button|submit">`. Never use `<div>` or `<a>` without button semantics.
- **Content:** Verb + Object (+ Consequence for irreversible/financial steps, e.g., `Pay $48.00`, `Delete project`).
- **Targets & States:** Minimum `24x24 CSS px` gate (`44pt` iOS / `48dp` Android default for primary actions). Loading state must lock width, show spinner + `aria-busy="true"`, and block duplicate clicks without losing focus. Disabled buttons that block progress should explain why via helper text or remain `aria-disabled="true"` with an inline reason.

### 2. Link (`<a href="...">`)

- **Semantics:** Native `<a href>` for navigation; never use a link for state mutations.
- **Visual & Content:** Must be distinguishable from surrounding body text via persistent underline or non-color cue (`>= 3:1` contrast). Avoid vague copy like "Read more" or "Click here"; name the destination.

### 3. Text Input (`<input>`)

- **Semantics:** Persistent `<label for="...">` above the field. Helper text and error message linked via `aria-describedby`.
- **Attributes:** Set exact `type`, `inputmode` (`numeric`, `email`, `tel`), `autocomplete` (WCAG 1.3.5), and disable autocapitalize/autocorrect on emails, usernames, and codes.
- **Validation:** Validate on blur or submit boundary (never fire red errors on the first keystroke). Preserve entered value on error.

### 4. Select & Combobox

- **Semantics:** Prefer native `<select>` for <= 7 simple options. For searchable/filterable lists, implement WAI-ARIA 1.2 Combobox (`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`).
- **Behavior:** Announce filtered result count via `aria-live="polite"`. Provide a clear-selection button and a zero-match message. On mobile, trigger a native picker or bottom sheet that avoids virtual keyboard occlusion.

### 5. Checkbox, Radio & Toggle Switch

- **Semantics:** Group related options inside `<fieldset>` with a `<legend>`.
- **Behavior:** Use **Switch** (`role="switch"`) only when toggling takes immediate effect without a Submit button (and show sync/revert state if the server call fails). Use **Checkbox** when changes apply after form submission. Include the text label inside the `>= 24px` (`44pt`/`48dp`) hit area.

### 6. Date & Time Picker

- **Semantics & Input:** Always provide a direct typed text input (`YYYY-MM-DD` or localized day/month/year fields) alongside any calendar popover (GOV.UK pattern). Never make a JavaScript calendar the only way to enter a date.
- **Clarity:** Explicitly display the active timezone (`UTC+1`, `Local time`) and format hint. Keyboard users must be able to navigate calendar grids via Arrow keys without trapping focus.

### 7. File Uploader & Dropzone

- **Interaction:** Must support three equal paths: click-to-browse (`<input type="file">`), drag-and-drop (WCAG 2.5.7), and keyboard activation (`Enter`/`Space`).
- **Disclosure:** State allowed file extensions, max file size, and max file count *before* the user selects a file.
- **States:** Show per-file determinate progress bar, cancel button, virus/malware scan status, specific failure reason (e.g., `File exceeds 10MB`), retry button, and remove button.

### 8. Dual-Thumb Range Slider

- **Semantics:** Two independent `<input type="range">` controls or ARIA slider thumbs with explicit `aria-label` (`Minimum price`, `Maximum price`), `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`.
- **Fallback:** Always pair sliders with direct numeric `<input type="number">` fields so keyboard, voice, and motor-impaired users never rely solely on fine dragging (WCAG 2.5.7).

### 9. Color Picker & Swatch Selector

- **Accessibility:** Never rely on visual color swatches alone. Pair every preset swatch with an accessible text name (e.g., `Crimson Red #DC2626`) and provide an explicit hex/RGB text input field. Show live contrast warnings when selecting UI foreground/background colors.

### 10. Rich Text / Block Editor

- **Keyboard:** Ensure `Tab` either indents with a documented `Esc` or `Ctrl+M` keyboard escape hatch (WCAG 2.1.2 No Keyboard Trap) or moves focus to the next form control while toolbar buttons use roving `tabindex`.
- **Resilience:** Sanitize pasted HTML/Markdown, preserve undo stack across autosaves, display `Saved` / `Unsaved changes` / `Offline draft` status, and alert on concurrent edit conflicts.

## Overlays, Navigation & Feedback Components (11-21)

### 11. Modal Dialog (`<dialog>`)

- **Focus & Semantics:** Native `<dialog>` or `role="dialog"` + `aria-modal="true"` + `aria-labelledby`. Trap `Tab` focus inside, lock background scroll, close on `Esc` (prompting if form is dirty), and return focus to the exact invoking button on close.
- **Usage:** Never put long multi-step forms or legal terms exclusively inside cramped modals; use dedicated routes or full sheets.

### 12. Drawer & Bottom Sheet

- **Behavior:** Follows all Modal Dialog focus trap and `Esc` return rules.
- **Mobile:** Any swipe-down-to-dismiss gesture must have a visible, keyboard-focusable `Close` (`X`) button (`>= 44pt`) to satisfy WCAG 2.5.1/2.5.7. Adjust height dynamically when the virtual keyboard opens.

### 13. Toast & Snackbar

- **Rules:** Use `role="status"` (`aria-live="polite"`). Display for at least `5-8 seconds`, pause auto-dismiss on hover or keyboard focus, and never steal active focus.
- **Prohibition:** Never use a disappearing toast as the sole carrier of an error message, receipt number, or critical undo action; mirror outcomes in a persistent notification log or inline status banner.

### 14. Tooltip & Popover

- **WCAG 1.4.13 Contract:** Must be **Dismissible** (`Esc` closes without moving focus), **Hoverable** (pointer can move onto the tooltip content without it vanishing), and **Persistent** (remains open until hover/focus leaves or user dismisses).
- **Guardrail:** Never hide essential instructions, pricing, fees, or legal conditions inside a tooltip. Never attach hover tooltips to touch-only mobile controls.

### 15. Tabs (`role="tablist"`)

- **Keyboard:** `Tab` enters the active tab button; `Left`/`Right` Arrow keys cycle between tabs; `Tab` moves into the active `role="tabpanel"`.
- **State:** Preserve unsaved input inside inactive panels when switching tabs, and sync the active tab to the URL query/hash for deep-linking and browser Back support.

### 16. Accordion (`<details>` / `aria-expanded`)

- **Semantics:** Native `<details><summary>` or `<button aria-expanded="true|false" aria-controls="...">` inside an appropriate heading level (`<h3>`).
- **Guardrail:** Never hide mandatory checkout totals, auto-renewal terms, or destructive consequences inside a collapsed accordion.

### 17. Breadcrumbs

- **Semantics:** `<nav aria-label="Breadcrumb">` containing an ordered list `<ol>`, with the current page marked `aria-current="page"`. On narrow mobile screens, collapse middle ancestors into an expandable menu rather than wrapping onto 3+ lines.

### 18. Action Menu & Dropdown (`role="menu"`)

- **Distinction:** Reserve `role="menu"` and `role="menuitem"` strictly for application action menus (supporting Arrow keys, Home/End, typeahead, and `Esc`). For website header navigation links, use `<nav>` with disclosure buttons (`aria-expanded`), not `role="menu"`.

### 19. Context Menu (Right-Click / Long-Press)

- **Discoverability & Fallback:** Never make an action available *only* via right-click or mobile long-press. Always expose a visible `More actions (...)` button in the row or card that opens the exact same menu on click or `Shift+F10` / `ContextMenu` key.

### 20. Command Palette (`Cmd+K` / `Ctrl+K`)

- **Contract:** Implement as a modal dialog containing an ARIA combobox. Must always have a visible trigger button in the global top bar (showing the shortcut badge) so touch and mouse users can open it without memorizing hotkeys. Announce group headings and empty search states to screen readers.

### 21. Stepper & Multi-Step Progress Indicator

- **Semantics:** `<ol>` with completed, current (`aria-current="step"`), and upcoming steps clearly labelled in text (not color/numbers alone). Allow clicking back to previously completed steps without losing entered data in the current step.

## Data, Media & Spatial Components (22-31)

### 22. Table & Enterprise Data Grid

- **Semantics:** Use semantic `<table>`, `<thead>`, `<th scope="col|row">` for read/comparison tables. Use `role="grid"` only when providing spreadsheet-style 2D Arrow-key cell navigation and inline cell editing.
- **Features:** Expose `aria-sort="ascending|descending|none"` on sortable headers. Keep the first column a human-readable identifier. On mobile (`< 640px`), transform wide tables into prioritized record cards rather than forcing 15-column horizontal page scroll.

### 23. Tree View & Hierarchical Inspector

- **Semantics:** `role="tree"` and `role="treeitem"` with `aria-expanded` and `aria-level`.
- **Keyboard:** `Right Arrow` expands a closed node or moves to first child; `Left Arrow` collapses an open node or moves to parent; `Up`/`Down` moves between visible nodes. Provide explicit expand/collapse chevron buttons for pointer users.

### 24. Pagination & Infinite Scroll

- **Rule:** Prefer explicit Pagination (`<nav aria-label="Pagination">`, showing total item count and page numbers synced to URL `?page=N`) whenever users need orientation, comparison, or footer access.
- **Infinite Scroll Escape:** If infinite scroll is used in feeds, provide a keyboard-reachable "Skip to footer" link, support a "Load more" button mode, and restore exact scroll and item position on browser Back.

### 25. Virtualized List & Infinite Grid

- **Accessibility:** Windowed DOM rendering must explicitly set `aria-setsize` (total dataset count) and `aria-posinset` (`1-based` index) on rendered items so screen readers do not announce "Item 1 of 12" on a 10,000-row dataset. Preserve focus when an active row scrolls out of the DOM buffer.

### 26. Skeleton, Spinner & Determinate Progress

- **Geometry:** Skeletons must match the exact dimensions of the loaded content (`CLS = 0`). Respect `prefers-reduced-motion` by replacing shimmer sweeps with a gentle static opacity state.
- **Announcements:** Use `role="progressbar"` with `aria-valuenow`/`aria-valuetext`, and announce start and completion once via `aria-live="polite"`.

### 27. Carousel, Story & Media Stepper

- **Controls:** Never auto-advance without a visible Pause/Play button (WCAG 2.2.2). Swipe gestures must be paired with visible, high-contrast `Previous` and `Next` buttons (`>= 44pt`). Manage focus or `inert` attributes on off-screen slides so keyboard users cannot tab into invisible links.

### 28. Interactive Chart & Data Visualization

- **Dual Representation:** Provide a concise text takeaway summary and a toggleable or screen-reader-accessible `<table>` alternative for every chart.
- **Visual Honesty:** Start bar/area baselines at `0`; pair colors with stroke patterns or direct data labels (WCAG 1.4.1, 1.4.11); make data points keyboard-focusable; display data freshness timestamp and sample size (`n=...`).

### 29. Interactive Map & Spatial Canvas

- **Fallbacks:** Always pair map views with a synchronized text/card list of results and a text address search input. Provide explicit on-screen buttons for Zoom In (`+`), Zoom Out (`-`), and Pan or Reset View (WCAG 2.5.1/2.5.7).

### 30. Split-Pane Resizer & Code Block

- **Split-Pane Resizer:** Focusable separator (`role="separator"`, `tabindex="0"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`) supporting `Left`/`Right` (or `Up`/`Down`) Arrow keys to resize panes and `Enter` to toggle collapse/restore (WCAG 2.5.7).
- **Code Block & Copy Snippet:** Accessible language label, horizontal scroll region with `tabindex="0"` for keyboard scrolling, and a `Copy code` button that announces `"Copied to clipboard"` via `aria-live="polite"` for 3 seconds.

### 31. Avatar, Status Badge, Chip & Empty State

- **Status Badge / Chip:** Never communicate status (Online, Failed, Verified, Urgent) by color dot alone; include text or distinct icon shape plus an accessible name. Filter chips must have a keyboard-focusable `Remove <filter>` button (`>= 24px`).
- **Empty State:** Distinguish **First-Use Empty** (educates user + offers 1 primary creation/import CTA) from **Filtered/Search Empty** (states what query matched zero items + offers 1-click `Reset filters`).
