// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ProgramConfig {
  programName: string;
  cutoverDate: string; // ISO date string
  readinessTarget: 100;
}

export interface EventScope {
  runbookScopePctPlanned: number;
  runbookScopePctActual: number;
  migrationScopePctPlanned: number;
  migrationScopePctActual: number;
  applicationsScopePctPlanned: number;
  applicationsScopePctActual: number;
  legacyIdConversionScopePctPlanned: number;
  legacyIdConversionScopePctActual: number;
}

export interface EventRecords {
  referenceDataPlanned: number;
  referenceDataActual: number;
  staticDataPlanned: number;
  staticDataActual: number;
  transactionPositionPlanned: number;
  transactionPositionActual: number;
  inflightDataPlanned: number;
  inflightDataActual: number;
}

export interface EventRuntime {
  expectedRunbookRuntimeMinutes: number;
  actualRunbookRuntimeMinutes: number;
}

export interface EventQuantitative {
  records: EventRecords;
  runtime: EventRuntime;
}

export interface EventQualitative {
  expectedOpenDefects: number;
  actualOpenDefects: number;
  expectedReconciliationBreaks: number;
  actualReconciliationBreaks: number;
  topicsSignedOffCount: number;
  topicsTotalCount: number;
}

export interface CutoverEvent {
  id: string;
  type: 'DRH' | 'MDR';
  name: string;
  date: string; // ISO date string, optional
  sequenceNumber: number;
  goals: string[];
  scope: EventScope;
  quantitative: EventQuantitative;
  qualitative: EventQualitative;
  notes: string;
}

export interface AppState {
  config: ProgramConfig;
  events: CutoverEvent[];
}

// ─── Derived Metrics ──────────────────────────────────────────────────────────

export interface DerivedMetrics {
  scopeReadinessPct: number;
  quantitativeReadinessPct: number;
  qualitativeReadinessPct: number;
  overallReadinessPct: number;
}

export function computeScopeReadiness(scope: EventScope): number {
  const items = [
    scope.runbookScopePctActual,
    scope.migrationScopePctActual,
    scope.applicationsScopePctActual,
    scope.legacyIdConversionScopePctActual,
  ];
  const sum = items.reduce((a, b) => a + b, 0);
  return Math.round(sum / items.length);
}

export function computeQuantitativeReadiness(quant: EventQuantitative): number {
  const { records, runtime } = quant;
  // Records readiness: ratio of actual to planned for each category, capped at 100
  const recordsItems = [
    records.referenceDataPlanned > 0 ? Math.min(100, (records.referenceDataActual / records.referenceDataPlanned) * 100) : 0,
    records.staticDataPlanned > 0 ? Math.min(100, (records.staticDataActual / records.staticDataPlanned) * 100) : 0,
    records.transactionPositionPlanned > 0 ? Math.min(100, (records.transactionPositionActual / records.transactionPositionPlanned) * 100) : 0,
    records.inflightDataPlanned > 0 ? Math.min(100, (records.inflightDataActual / records.inflightDataPlanned) * 100) : 0,
  ];
  const recordsReadiness = recordsItems.reduce((a, b) => a + b, 0) / recordsItems.length;

  // Runtime adherence: score based on variance from expected
  let runtimeReadiness = 100;
  if (runtime.expectedRunbookRuntimeMinutes > 0 && runtime.actualRunbookRuntimeMinutes > 0) {
    const variance = Math.abs(runtime.actualRunbookRuntimeMinutes - runtime.expectedRunbookRuntimeMinutes) / runtime.expectedRunbookRuntimeMinutes;
    if (variance > 0.25) runtimeReadiness = 50;
    else if (variance > 0.10) runtimeReadiness = 75;
    else runtimeReadiness = 100;
  }

  return Math.round((recordsReadiness * 0.7 + runtimeReadiness * 0.3));
}

export function computeQualitativeReadiness(qual: EventQualitative): number {
  // Defects: lower is better; if actual <= expected, 100%; scale down otherwise
  let defectScore = 100;
  if (qual.expectedOpenDefects > 0) {
    defectScore = Math.max(0, Math.min(100, (1 - (qual.actualOpenDefects - qual.expectedOpenDefects) / qual.expectedOpenDefects) * 100));
  } else if (qual.actualOpenDefects === 0) {
    defectScore = 100;
  } else {
    defectScore = 50;
  }

  // Reconciliation breaks
  let breaksScore = 100;
  if (qual.expectedReconciliationBreaks > 0) {
    breaksScore = Math.max(0, Math.min(100, (1 - (qual.actualReconciliationBreaks - qual.expectedReconciliationBreaks) / qual.expectedReconciliationBreaks) * 100));
  } else if (qual.actualReconciliationBreaks === 0) {
    breaksScore = 100;
  } else {
    breaksScore = 50;
  }

  // Sign-off
  const signOffScore = qual.topicsTotalCount > 0 ? (qual.topicsSignedOffCount / qual.topicsTotalCount) * 100 : 0;

  return Math.round((defectScore * 0.35 + breaksScore * 0.35 + signOffScore * 0.3));
}

export function computeDerivedMetrics(event: CutoverEvent): DerivedMetrics {
  const scopeReadinessPct = computeScopeReadiness(event.scope);
  const quantitativeReadinessPct = computeQuantitativeReadiness(event.quantitative);
  const qualitativeReadinessPct = computeQualitativeReadiness(event.qualitative);
  const overallReadinessPct = Math.round(
    scopeReadinessPct * 0.4 +
    quantitativeReadinessPct * 0.4 +
    qualitativeReadinessPct * 0.2
  );
  return { scopeReadinessPct, quantitativeReadinessPct, qualitativeReadinessPct, overallReadinessPct };
}

export function getReadinessColor(pct: number): string {
  if (pct >= 90) return '#10b981'; // good
  if (pct >= 70) return '#f59e0b'; // warning
  return '#ef4444'; // bad
}

export function getRuntimeVariancePct(runtime: EventRuntime): number {
  if (runtime.expectedRunbookRuntimeMinutes === 0) return 0;
  return Math.round(((runtime.actualRunbookRuntimeMinutes - runtime.expectedRunbookRuntimeMinutes) / runtime.expectedRunbookRuntimeMinutes) * 100);
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function createDefaultScope(): EventScope {
  return {
    runbookScopePctPlanned: 0, runbookScopePctActual: 0,
    migrationScopePctPlanned: 0, migrationScopePctActual: 0,
    applicationsScopePctPlanned: 0, applicationsScopePctActual: 0,
    legacyIdConversionScopePctPlanned: 0, legacyIdConversionScopePctActual: 0,
  };
}

export function createDefaultQuantitative(): EventQuantitative {
  return {
    records: {
      referenceDataPlanned: 0, referenceDataActual: 0,
      staticDataPlanned: 0, staticDataActual: 0,
      transactionPositionPlanned: 0, transactionPositionActual: 0,
      inflightDataPlanned: 0, inflightDataActual: 0,
    },
    runtime: { expectedRunbookRuntimeMinutes: 0, actualRunbookRuntimeMinutes: 0 },
  };
}

export function createDefaultQualitative(): EventQualitative {
  return {
    expectedOpenDefects: 0, actualOpenDefects: 0,
    expectedReconciliationBreaks: 0, actualReconciliationBreaks: 0,
    topicsSignedOffCount: 0, topicsTotalCount: 0,
  };
}

export function createEvent(type: 'DRH' | 'MDR', sequenceNumber: number): CutoverEvent {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    name: `${type}-${sequenceNumber}`,
    date: '',
    sequenceNumber,
    goals: [],
    scope: createDefaultScope(),
    quantitative: createDefaultQuantitative(),
    qualitative: createDefaultQualitative(),
    notes: '',
  };
}
