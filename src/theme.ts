export const colors = {
  navy: '#0B1F3B',
  pBlue: '#1F4E79',
  teal: '#2AA7A1',
  gold: '#C9A227',
  n900: '#111827',
  n600: '#4B5563',
  n200: '#E5E7EB',
  n50: '#F8FAFC',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
} as const;

export function getReadinessColorToken(pct: number): string {
  if (pct >= 90) return colors.success;
  if (pct >= 70) return colors.warning;
  return colors.danger;
}
