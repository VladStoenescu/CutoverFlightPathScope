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
