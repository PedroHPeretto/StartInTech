import type { ResumeHistoryItemDto } from '@startintech/shared';

export function formatHistoryDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatHistoryScore(score: number | null): string {
  if (score === null) {
    return 'Sem nota';
  }
  return String(score);
}

export function computeScoreDelta(
  item: ResumeHistoryItemDto,
  olderVersion: ResumeHistoryItemDto | undefined,
): number | null {
  if (
    item.atsScore === null ||
    !olderVersion ||
    olderVersion.atsScore === null
  ) {
    return null;
  }
  return item.atsScore - olderVersion.atsScore;
}

export function formatScoreDelta(delta: number | null): string {
  if (delta === null) {
    return '';
  }
  if (delta > 0) {
    return `+${delta}`;
  }
  if (delta < 0) {
    return String(delta);
  }
  return '±0';
}

export function buildHistoryPillLabel(
  item: ResumeHistoryItemDto,
  olderVersion: ResumeHistoryItemDto | undefined,
): string {
  const date = formatHistoryDate(item.createdAt);
  const score = formatHistoryScore(item.atsScore);
  const delta = formatScoreDelta(computeScoreDelta(item, olderVersion));
  const deltaSuffix = delta ? ` (${delta})` : '';
  return `${date} · ${score}${deltaSuffix}`;
}
