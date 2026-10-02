import { describe, expect, it } from 'vitest';
import { CAREER_TRACK_CATALOG } from '../src/career-tracks/career-track.catalog.js';

describe('CAREER_TRACK_CATALOG', () => {
  it('lists the eight official career tracks', () => {
    expect(CAREER_TRACK_CATALOG).toEqual([
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
    ]);
  });
});
