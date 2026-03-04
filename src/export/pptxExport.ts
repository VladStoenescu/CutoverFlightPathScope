import pptxgen from 'pptxgenjs';
import type { AppState, CutoverEvent } from '../models';
import { computeDerivedMetrics } from '../models';

export function exportPptx(state: AppState, sortedEvents: CutoverEvent[]): void {
  const prs = new pptxgen();
  prs.layout = 'LAYOUT_16x9';

  const programName = state.config.programName;
  const goLiveDate = state.config.cutoverDate
    ? new Date(state.config.cutoverDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'TBD';
  const generatedOn = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const NAVY = '0B1F3B';
  const WHITE = 'FFFFFF';
  const LIGHT_GRAY = 'F8FAFC';
  const MID_GRAY = '4B5563';

  function addSlide(titleText: string, bodyLines: string[]) {
    const slide = prs.addSlide();

    // Title bar background
    slide.addShape('rect' as Parameters<typeof slide.addShape>[0], {
      x: 0, y: 0, w: '100%', h: 1.0,
      fill: { color: NAVY },
    });

    // Title text
    slide.addText(`${programName}  |  ${titleText}  |  Go-Live: ${goLiveDate}`, {
      x: 0.3, y: 0.1, w: 8.5, h: 0.7,
      fontSize: 18,
      bold: true,
      color: WHITE,
      fontFace: 'Calibri',
    });

    // Body content
    bodyLines.forEach((line, i) => {
      slide.addText(line, {
        x: 0.5,
        y: 1.2 + i * 0.45,
        w: 9.0,
        h: 0.4,
        fontSize: 13,
        color: line.startsWith('•') ? MID_GRAY : '111827',
        fontFace: 'Calibri',
        bold: !line.startsWith('•') && line.includes(':'),
      });
    });

    // Footer bar
    slide.addShape('rect' as Parameters<typeof slide.addShape>[0], {
      x: 0, y: 6.8, w: '100%', h: 0.4,
      fill: { color: LIGHT_GRAY },
    });
    slide.addText(`Generated on ${generatedOn}`, {
      x: 0.3, y: 6.85, w: 9.0, h: 0.3,
      fontSize: 9,
      color: MID_GRAY,
      fontFace: 'Calibri',
    });
  }

  // Slide 1: Overview
  const latestEvent = sortedEvents[sortedEvents.length - 1];
  const metrics = latestEvent ? computeDerivedMetrics(latestEvent) : null;
  const overviewLines = [
    `Program Overview`,
    `Events: ${sortedEvents.length} total  (${sortedEvents.filter(e => e.type === 'DRH').length} DRH, ${sortedEvents.filter(e => e.type === 'MDR').length} MDR)`,
    metrics ? `Overall Readiness: ${metrics.overallReadinessPct}%` : 'No events yet',
    metrics ? `  Scope: ${metrics.scopeReadinessPct}%   Quantitative: ${metrics.quantitativeReadinessPct}%   Qualitative: ${metrics.qualitativeReadinessPct}%` : '',
    '',
    'Event Timeline:',
    ...sortedEvents.map(e => `• ${e.name} (${e.type})  ${e.date}  —  ${computeDerivedMetrics(e).overallReadinessPct}% readiness`),
  ];
  addSlide('Overview', overviewLines);

  // Slide 2: Scope
  const scopeLines = [
    'Scope Coverage — Latest Event',
    latestEvent ? `Event: ${latestEvent.name}  (${latestEvent.date})` : 'No events',
    '',
    latestEvent ? `Runbook Scope:      Planned ${latestEvent.scope.runbookScopePctPlanned}%  →  Actual ${latestEvent.scope.runbookScopePctActual}%` : '',
    latestEvent ? `Migration Scope:    Planned ${latestEvent.scope.migrationScopePctPlanned}%  →  Actual ${latestEvent.scope.migrationScopePctActual}%` : '',
    latestEvent ? `Applications Scope: Planned ${latestEvent.scope.applicationsScopePctPlanned}%  →  Actual ${latestEvent.scope.applicationsScopePctActual}%` : '',
    latestEvent ? `Legacy ID Conv:     Planned ${latestEvent.scope.legacyIdConversionScopePctPlanned}%  →  Actual ${latestEvent.scope.legacyIdConversionScopePctActual}%` : '',
    '',
    metrics ? `Scope Readiness: ${metrics.scopeReadinessPct}%` : '',
  ];
  addSlide('Scope Coverage', scopeLines);

  // Slide 3: Quantitative
  const quantLines = [
    'Quantitative Readiness — Latest Event',
    latestEvent ? `Event: ${latestEvent.name}  (${latestEvent.date})` : 'No events',
    '',
    latestEvent ? `Reference Data:       Planned ${latestEvent.quantitative.records.referenceDataPlanned.toLocaleString()}  →  Actual ${latestEvent.quantitative.records.referenceDataActual.toLocaleString()}` : '',
    latestEvent ? `Static Data:          Planned ${latestEvent.quantitative.records.staticDataPlanned.toLocaleString()}  →  Actual ${latestEvent.quantitative.records.staticDataActual.toLocaleString()}` : '',
    latestEvent ? `Transaction+Position: Planned ${latestEvent.quantitative.records.transactionPositionPlanned.toLocaleString()}  →  Actual ${latestEvent.quantitative.records.transactionPositionActual.toLocaleString()}` : '',
    latestEvent ? `Inflight Data:        Planned ${latestEvent.quantitative.records.inflightDataPlanned.toLocaleString()}  →  Actual ${latestEvent.quantitative.records.inflightDataActual.toLocaleString()}` : '',
    '',
    latestEvent ? `Runbook Runtime:  Expected ${latestEvent.quantitative.runtime.expectedRunbookRuntimeMinutes}m  →  Actual ${latestEvent.quantitative.runtime.actualRunbookRuntimeMinutes}m` : '',
    metrics ? `Quantitative Readiness: ${metrics.quantitativeReadinessPct}%` : '',
  ];
  addSlide('Quantitative', quantLines);

  // Slide 4: Qualitative
  const qualLines = [
    'Qualitative Readiness — Latest Event',
    latestEvent ? `Event: ${latestEvent.name}  (${latestEvent.date})` : 'No events',
    '',
    latestEvent ? `Open Defects:          Expected ${latestEvent.qualitative.expectedOpenDefects}  →  Actual ${latestEvent.qualitative.actualOpenDefects}` : '',
    latestEvent ? `Reconciliation Breaks: Expected ${latestEvent.qualitative.expectedReconciliationBreaks}  →  Actual ${latestEvent.qualitative.actualReconciliationBreaks}` : '',
    latestEvent ? `Topics Signed Off:     ${latestEvent.qualitative.topicsSignedOffCount} / ${latestEvent.qualitative.topicsTotalCount}` : '',
    '',
    metrics ? `Qualitative Readiness: ${metrics.qualitativeReadinessPct}%` : '',
  ];
  addSlide('Qualitative', qualLines);

  prs.writeFile({ fileName: `${programName.replace(/\s+/g, '_')}_Flightpath.pptx` });
}
