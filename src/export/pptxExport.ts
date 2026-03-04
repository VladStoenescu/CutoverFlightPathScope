import pptxgen from 'pptxgenjs';
import { toPng } from 'html-to-image';
import type { AppState, CutoverEvent } from '../models';
import { computeDerivedMetrics } from '../models';

async function captureChart(exportId: string): Promise<string | null> {
  try {
    const el = document.querySelector<HTMLElement>(`[data-export-id="${exportId}"]`);
    if (!el) return null;
    return await toPng(el, { cacheBust: true });
  } catch (e) {
    console.warn(`Chart capture failed for ${exportId}:`, e);
    return null;
  }
}

export async function exportPptx(state: AppState, sortedEvents: CutoverEvent[], captureCharts = false): Promise<void> {
  const prs = new pptxgen();
  prs.layout = 'LAYOUT_16x9';

  const programName = state.config.programName;
  const goLiveDate = state.config.goLiveDate
    ? new Date(state.config.goLiveDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'TBD';
  const generatedOn = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const NAVY = '0B1F3B';
  const WHITE = 'FFFFFF';
  const LIGHT_GRAY = 'F8FAFC';
  const MID_GRAY = '4B5563';

  function addSlide(titleText: string, bodyLines: string[], chartImg?: string | null) {
    const slide = prs.addSlide();

    slide.addShape('rect' as Parameters<typeof slide.addShape>[0], {
      x: 0, y: 0, w: '100%', h: 1.0,
      fill: { color: NAVY },
    });

    slide.addText(`${programName}  |  ${titleText}  |  Go-Live: ${goLiveDate}`, {
      x: 0.3, y: 0.1, w: 8.5, h: 0.7,
      fontSize: 18, bold: true, color: WHITE, fontFace: 'Calibri',
    });

    if (chartImg) {
      // Place chart image on right side
      const textW = 4.5;
      bodyLines.forEach((line, i) => {
        slide.addText(line, {
          x: 0.5, y: 1.2 + i * 0.42, w: textW, h: 0.38,
          fontSize: 12, color: line.startsWith('•') ? MID_GRAY : '111827',
          fontFace: 'Calibri', bold: !line.startsWith('•') && line.includes(':'),
        });
      });
      slide.addImage({ data: chartImg, x: 5.1, y: 1.1, w: 4.6, h: 3.2 });
    } else {
      bodyLines.forEach((line, i) => {
        slide.addText(line, {
          x: 0.5, y: 1.2 + i * 0.45, w: 9.0, h: 0.4,
          fontSize: 13, color: line.startsWith('•') ? MID_GRAY : '111827',
          fontFace: 'Calibri', bold: !line.startsWith('•') && line.includes(':'),
        });
      });
    }

    slide.addShape('rect' as Parameters<typeof slide.addShape>[0], {
      x: 0, y: 6.8, w: '100%', h: 0.4,
      fill: { color: LIGHT_GRAY },
    });
    slide.addText(`Generated on ${generatedOn}`, {
      x: 0.3, y: 6.85, w: 9.0, h: 0.3,
      fontSize: 9, color: MID_GRAY, fontFace: 'Calibri',
    });
  }

  // Capture chart images if requested
  const [trajectoryImg, scopeImg, qualImg] = captureCharts
    ? await Promise.all([
        captureChart('trajectory-chart'),
        captureChart('scope-chart'),
        captureChart('qual-chart'),
      ])
    : [null, null, null];

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
  addSlide('Overview', overviewLines, trajectoryImg);

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
  addSlide('Scope Coverage', scopeLines, scopeImg);

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
  addSlide('Qualitative', qualLines, qualImg);

  await prs.writeFile({ fileName: `${programName.replace(/\s+/g, '_')}_Flightpath.pptx` });
}
