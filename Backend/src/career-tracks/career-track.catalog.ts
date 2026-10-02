export interface CareerTrackCatalogEntry {
  slug: string;
  name: string;
  description: string;
}

export const CAREER_TRACK_CATALOG: readonly CareerTrackCatalogEntry[] = [
  {
    slug: 'software-development',
    name: 'Desenvolvimento de Software',
    description: 'Frontend, Backend, Full Stack e Mobile',
  },
  {
    slug: 'data-analysis',
    name: 'Análise de Dados',
    description: 'SQL, planilhas, visualização e métricas de negócio',
  },
  {
    slug: 'data-science',
    name: 'Ciência de Dados',
    description: 'Python, estatística e machine learning',
  },
  {
    slug: 'ui-ux-design',
    name: 'Design UI/UX',
    description: 'Prototipação, usabilidade e design system',
  },
  {
    slug: 'devops',
    name: 'Engenharia DevOps',
    description: 'CI/CD, nuvem e infraestrutura',
  },
  {
    slug: 'product-management',
    name: 'Gestão de Produto',
    description: 'Descoberta, priorização e entrega de produto',
  },
  {
    slug: 'quality-assurance',
    name: 'Qualidade de Software',
    description: 'Testes, automação e qualidade',
  },
  {
    slug: 'cybersecurity',
    name: 'Segurança da Informação',
    description: 'Defesa cibernética e compliance',
  },
];
