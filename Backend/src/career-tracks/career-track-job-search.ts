/**
 * Adzuna search parameters per career slug — junior / internship focus (STA-30).
 */
export interface AdzunaSearchParams {
  what: string;
  whatOr: string;
}

export const ADZUNA_SEARCH_TERMS_BY_SLUG: Readonly<
  Record<string, AdzunaSearchParams>
> = {
  'software-development': {
    what: 'desenvolvedor',
    whatOr: 'junior júnior estágio estagio estagiário trainee',
  },
  'data-analysis': {
    what: 'analista dados',
    whatOr: 'junior júnior estágio estagio estagiário trainee',
  },
  'data-science': {
    what: 'cientista dados',
    whatOr: 'junior júnior estágio estagio estagiário trainee',
  },
  'ui-ux-design': {
    what: 'ui ux',
    whatOr: 'junior júnior estágio estagio estagiário trainee',
  },
  devops: {
    what: 'devops',
    whatOr: 'junior júnior estágio estagio estagiário trainee',
  },
  'product-management': {
    what: 'product manager',
    whatOr: 'junior júnior estágio estagio estagiário trainee apm',
  },
  'quality-assurance': {
    what: 'qa',
    whatOr: 'junior júnior estágio estagio estagiário trainee',
  },
  cybersecurity: {
    what: 'segurança informação',
    whatOr: 'junior júnior estágio estagio estagiário trainee',
  },
};

export const DEFAULT_ADZUNA_SEARCH_TERMS: AdzunaSearchParams = {
  what: 'tecnologia',
  whatOr: 'junior júnior estágio estagio estagiário trainee',
};

export function resolveAdzunaSearchParams(slug: string): AdzunaSearchParams {
  return ADZUNA_SEARCH_TERMS_BY_SLUG[slug] ?? DEFAULT_ADZUNA_SEARCH_TERMS;
}

export function buildAdzunaSearchWhat(
  _careerTrackName: string,
  slug: string,
): string {
  return resolveAdzunaSearchParams(slug).what;
}
