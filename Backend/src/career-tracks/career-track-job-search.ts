/**
 * Adzuna `what` terms per career slug — junior / internship focus (STA-30).
 */
export const CAREER_TRACK_JOB_SEARCH_SUFFIX_BY_SLUG: Readonly<
  Record<string, string>
> = {
  'software-development': 'desenvolvedor junior estágio',
  'data-analysis': 'analista de dados junior estágio',
  'data-science': 'cientista de dados junior estágio',
  'ui-ux-design': 'design ui ux junior estágio',
  devops: 'devops junior estágio',
  'product-management': 'product manager junior estágio',
  'quality-assurance': 'qa tester junior estágio',
  cybersecurity: 'segurança da informação junior estágio',
};

export function buildAdzunaSearchWhat(
  careerTrackName: string,
  slug: string,
): string {
  const suffix =
    CAREER_TRACK_JOB_SEARCH_SUFFIX_BY_SLUG[slug] ?? 'junior estágio';
  return `${careerTrackName} ${suffix}`;
}
