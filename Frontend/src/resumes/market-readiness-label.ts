import { SeniorityLevel } from '@startintech/shared';

const MARKET_READINESS_LABELS: Record<SeniorityLevel, string> = {
  [SeniorityLevel.INTERNSHIP]: 'Estágio',
  [SeniorityLevel.JUNIOR]: 'Júnior',
};

export function getMarketReadinessLabel(level: SeniorityLevel): string {
  return MARKET_READINESS_LABELS[level];
}
