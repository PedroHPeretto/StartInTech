export function sanitizeSkillName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s+#.]/gu, '');
}

export function normalizeSkillNameKey(name: string): string {
  return sanitizeSkillName(name).toLowerCase();
}

export function dedupeSkillsByNormalizedName<
  T extends { name: string; category: unknown },
>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const key = normalizeSkillNameKey(item.name);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(item);
  }
  return result;
}
