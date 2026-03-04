# Cutover Flightpath Dashboard

A single-page executive dashboard that tells a timeline story of readiness reaching 100% by Cutover.

## Tech Stack

- React + TypeScript (Vite)
- Tailwind CSS for styling
- Recharts for charts
- localStorage for persistence

## Install & Run

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## Build for Production

```bash
npm run build
npm run preview
```

## Import / Export JSON

- **Export**: Click the "Export JSON" button in the header to download a `.json` file containing all program configuration and event data.
- **Import**: Click the "Import JSON" button and select a previously exported `.json` file to restore or share data.
- The JSON format matches the `AppState` TypeScript interface defined in `src/models.ts`.

## Demo Data

Click the "Demo Data" button in the header to load a sample project ("Project Phoenix Migration") with 4 events (2 DRH + 2 MDR) showing a progression from ~45% to ~90% readiness.

## Readiness Calculation

Overall readiness is a weighted combination of three dimensions:

| Dimension | Weight | How it's calculated |
|-----------|--------|---------------------|
| **Scope** | 40% | Average of 4 scope area actuals: Runbook, Migration, Applications, Legacy ID Conversion |
| **Quantitative** | 40% | 70% records migrated % (average across 4 categories) + 30% runtime adherence score |
| **Qualitative** | 20% | 35% defect score + 35% reconciliation breaks score + 30% topics sign-off % |

### Color Semantics

- 🟢 **Good** (≥ 90%): Green
- 🟡 **Warning** (70–89%): Amber
- 🔴 **Bad** (< 70%): Red

### Runtime Variance

- ≤ 10% variance: Good
- 10–25% variance: Warning
- > 25% variance: Bad

## Data Persistence

All data is automatically saved to `localStorage` on every change and restored on page reload.

## Project Structure

```
src/
  models.ts          # TypeScript interfaces + derived metric functions
  storage.ts         # localStorage persistence + JSON import/export
  demoData.ts        # Sample/demo data
  App.tsx            # Main 1-page application
  components/
    Timeline.tsx      # Horizontal flightpath timeline
    EventCard.tsx     # Event card with KPIs and badge
    EventDrawer.tsx   # Side panel for editing events (tabbed)
    ScopePanel.tsx    # Scope coverage bar chart
    QuantPanel.tsx    # Records + runtime chart
    QualPanel.tsx     # Defects/breaks/sign-off charts
    ReadinessGauge.tsx # SVG circular progress gauge
    TrajectoryChart.tsx # Line chart of readiness trajectory
```

## Sign-off Topics, Criteria & Defects

The **Sign-off** page (`/signoff`) provides a structured approach to tracking readiness sign-offs:

- **Topics**: Named sign-off areas with owner, domain, status (`not-started` | `in-review` | `signed-off` | `blocked`) and free-text rationale.
- **Criteria**: Checklist items per topic. Each criterion is marked `pass` / `fail` / `n/a`. Clicking cycles the state.
- **Defects**: Linked defects with severity (1–4) and status (`open` | `in-progress` | `closed`). Severity-1 defects block sign-off.
- **Sign-off gate**: The "Sign Off" button is disabled if any criteria are `fail` or if an open Sev-1 defect is linked. A "Risk Accepted" checkbox overrides the gate.
- The existing `qualitative.topicsSignedOffCount` manual field is **additive** — the new topic system does not replace it.

All topic/criteria/defect data is stored in `AppState` and persisted to `localStorage`.

## PPTX Chart Export

The "Export PPTX" button captures chart images using `html-to-image` and embeds them in the slide deck:

1. `exportMode` is set to `true`, disabling hover/animation states.
2. Two animation frames are awaited to let the DOM settle.
3. `html-to-image.toPng()` is called on each element with a `data-export-id` attribute:
   - `trajectory-chart` (TrajectoryChart)
   - `scope-chart` (ScopePanel)
   - `qual-chart` (QualPanel)
4. Captured PNG data URLs are added as images to relevant PPTX slides.
5. If capture fails (e.g. CORS, off-screen element), the export continues with text-only content and logs a warning.

**Limitations**: Charts must be visible (rendered) in the DOM at export time. Cross-origin images inside charts may cause capture failure.

## Role-Based Views

The header includes a **👔 Exec / 🔧 Working** toggle:

- **Executive mode**: The `+ DRH` and `+ MDR` event-add buttons are hidden. Suitable for read-only executive reviews.
- **Working mode** (default): Full edit controls are visible.

The role is stored in `AppState.role` and persisted to `localStorage`.

## Command Palette (Ctrl+K)

Press **Ctrl+K** (or **⌘K** on macOS) to open the command palette. Available commands:

- Navigate to any page (Overview, Scope, Quant, Qual, Insights, Sign-off)
- Add DRH / MDR event
- Export PPTX
- Load Demo Data

Use arrow keys to navigate, Enter to execute, Esc to close.

## Compact Mode

Click the **🗜️** button in the header to reduce padding and make the layout more dense. State is persisted to `localStorage`.
