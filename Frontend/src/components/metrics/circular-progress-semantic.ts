export function getSemanticStrokeColor(normalizedValue: number): string {
  if (normalizedValue >= 80) {
    return '#10B981';
  }
  if (normalizedValue >= 50) {
    return '#F59E0B';
  }
  return '#EF4444';
}
