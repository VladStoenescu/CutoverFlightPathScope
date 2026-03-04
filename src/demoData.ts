import type { AppState } from './models';

export const demoData: AppState = {
  config: {
    programName: 'Project Phoenix Migration',
    cutoverDate: '2025-09-30',
    readinessTarget: 100,
    goLiveWindowStart: '2025-08-01',
    goLiveWindowEnd: '2025-09-30',
  },
  events: [
    {
      id: 'drh-1-demo',
      type: 'DRH',
      name: 'DRH-1',
      date: '2025-04-15',
      sequenceNumber: 1,
      goals: [
        'Validate runbook execution end-to-end',
        'Confirm reference data migration completeness',
        'Identify top 5 critical defects',
      ],
      scope: {
        runbookScopePctPlanned: 30, runbookScopePctActual: 25,
        migrationScopePctPlanned: 25, migrationScopePctActual: 20,
        applicationsScopePctPlanned: 20, applicationsScopePctActual: 15,
        legacyIdConversionScopePctPlanned: 15, legacyIdConversionScopePctActual: 10,
      },
      quantitative: {
        records: {
          referenceDataPlanned: 50000, referenceDataActual: 48000,
          staticDataPlanned: 20000, staticDataActual: 18500,
          transactionPositionPlanned: 30000, transactionPositionActual: 22000,
          inflightDataPlanned: 5000, inflightDataActual: 3000,
        },
        runtime: { expectedRunbookRuntimeMinutes: 240, actualRunbookRuntimeMinutes: 285 },
      },
      qualitative: {
        expectedOpenDefects: 20, actualOpenDefects: 35,
        expectedReconciliationBreaks: 10, actualReconciliationBreaks: 18,
        topicsSignedOffCount: 5, topicsTotalCount: 20,
      },
      notes: 'First dry run revealed several gaps in runbook steps 14-22. Teams aligned on remediation plan.',
      completed: true,
    },
    {
      id: 'mdr-1-demo',
      type: 'MDR',
      name: 'MDR-1',
      date: '2025-05-20',
      sequenceNumber: 2,
      goals: [
        'Test migration pipeline with production-like data volume',
        'Reduce open defects to < 15',
        'Achieve > 80% records migrated',
      ],
      scope: {
        runbookScopePctPlanned: 50, runbookScopePctActual: 48,
        migrationScopePctPlanned: 50, migrationScopePctActual: 45,
        applicationsScopePctPlanned: 40, applicationsScopePctActual: 35,
        legacyIdConversionScopePctPlanned: 35, legacyIdConversionScopePctActual: 30,
      },
      quantitative: {
        records: {
          referenceDataPlanned: 80000, referenceDataActual: 76000,
          staticDataPlanned: 35000, staticDataActual: 33000,
          transactionPositionPlanned: 55000, transactionPositionActual: 48000,
          inflightDataPlanned: 8000, inflightDataActual: 6500,
        },
        runtime: { expectedRunbookRuntimeMinutes: 300, actualRunbookRuntimeMinutes: 330 },
      },
      qualitative: {
        expectedOpenDefects: 15, actualOpenDefects: 18,
        expectedReconciliationBreaks: 8, actualReconciliationBreaks: 12,
        topicsSignedOffCount: 10, topicsTotalCount: 20,
      },
      notes: 'Migration pipeline showed improvement but reconciliation breaks still high. Legacy ID conversion needs additional work.',
      completed: true,
    },
    {
      id: 'drh-2-demo',
      type: 'DRH',
      name: 'DRH-2',
      date: '2025-06-25',
      sequenceNumber: 3,
      goals: [
        'Achieve > 90% runbook scope coverage',
        'Reduce runtime variance to < 10%',
        'Sign off on 15+ topics',
      ],
      scope: {
        runbookScopePctPlanned: 75, runbookScopePctActual: 78,
        migrationScopePctPlanned: 70, migrationScopePctActual: 68,
        applicationsScopePctPlanned: 65, applicationsScopePctActual: 62,
        legacyIdConversionScopePctPlanned: 60, legacyIdConversionScopePctActual: 58,
      },
      quantitative: {
        records: {
          referenceDataPlanned: 100000, referenceDataActual: 99000,
          staticDataPlanned: 50000, staticDataActual: 49500,
          transactionPositionPlanned: 80000, transactionPositionActual: 74000,
          inflightDataPlanned: 12000, inflightDataActual: 10500,
        },
        runtime: { expectedRunbookRuntimeMinutes: 280, actualRunbookRuntimeMinutes: 295 },
      },
      qualitative: {
        expectedOpenDefects: 10, actualOpenDefects: 9,
        expectedReconciliationBreaks: 5, actualReconciliationBreaks: 6,
        topicsSignedOffCount: 15, topicsTotalCount: 20,
      },
      notes: 'Great improvement across all metrics. Runbook now stable. Remaining defects are P3/P4 only.',
      completed: false,
    },
    {
      id: 'mdr-2-demo',
      type: 'MDR',
      name: 'MDR-2',
      date: '2025-08-05',
      sequenceNumber: 4,
      goals: [
        'Full scope 100% dry run',
        'Zero P1/P2 defects remaining',
        'All 20 topics signed off',
        'Runtime within 5% of expected',
      ],
      scope: {
        runbookScopePctPlanned: 95, runbookScopePctActual: 94,
        migrationScopePctPlanned: 95, migrationScopePctActual: 93,
        applicationsScopePctPlanned: 90, applicationsScopePctActual: 91,
        legacyIdConversionScopePctPlanned: 90, legacyIdConversionScopePctActual: 88,
      },
      quantitative: {
        records: {
          referenceDataPlanned: 150000, referenceDataActual: 149000,
          staticDataPlanned: 75000, staticDataActual: 74800,
          transactionPositionPlanned: 120000, transactionPositionActual: 118000,
          inflightDataPlanned: 18000, inflightDataActual: 17500,
        },
        runtime: { expectedRunbookRuntimeMinutes: 270, actualRunbookRuntimeMinutes: 278 },
      },
      qualitative: {
        expectedOpenDefects: 5, actualOpenDefects: 4,
        expectedReconciliationBreaks: 3, actualReconciliationBreaks: 2,
        topicsSignedOffCount: 19, topicsTotalCount: 20,
      },
      notes: 'Near-perfect run. One outstanding topic pending legal sign-off. System is ready for cutover pending final approval.',
      completed: false,
    },
  ],
};
