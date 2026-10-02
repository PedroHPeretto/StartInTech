import { SkillPriority } from '@startintech/shared';
import { CAREER_TRACK_CATALOG } from '../career-tracks/career-track.catalog.js';

export interface RoadmapSeed {
  id: string;
  careerSlug: string;
  title: string;
  description: string | null;
}

export interface RoadmapNodeSeed {
  id: string;
  roadmapId: string;
  parentNodeId: string | null;
  title: string;
  description: string | null;
  priority: SkillPriority;
  sequenceOrder: number;
}

interface CatalogNode {
  id: string;
  title: string;
  description: string | null;
  priority: SkillPriority;
  sequenceOrder: number;
  children: CatalogNode[];
}

interface RoadmapTree {
  id: string;
  title: string;
  description: string | null;
  nodes: CatalogNode[];
}

function roadmapUuid(sequence: number): string {
  return `11111111-1111-4111-8111-${String(sequence).padStart(12, '0')}`;
}

function nodeUuid(sequence: number): string {
  return `22222222-2222-4222-8222-${String(sequence).padStart(12, '0')}`;
}

function topic(
  sequence: number,
  title: string,
  description: string,
  priority: SkillPriority,
  sequenceOrder: number,
  children: CatalogNode[] = [],
): CatalogNode {
  return {
    id: nodeUuid(sequence),
    title,
    description,
    priority,
    sequenceOrder,
    children,
  };
}

const ROADMAP_TREES: Record<string, RoadmapTree> = {
  'software-development': {
    id: roadmapUuid(1),
    title: 'Trilha de Desenvolvimento de Software',
    description: 'Do raciocínio lógico à publicação de uma aplicação web.',
    nodes: [
      topic(
        1,
        'Fundamentos de programação',
        'Decomponha problemas e expresse a solução em código pequeno e legível.',
        SkillPriority.ESSENTIAL,
        1,
        [
          topic(
            2,
            'Lógica e algoritmos',
            'Variáveis, condicionais, laços e funções em exercícios curtos.',
            SkillPriority.ESSENTIAL,
            1,
          ),
          topic(
            3,
            'Estruturas de dados',
            'Listas e dicionários, e quando cada estrutura simplifica o problema.',
            SkillPriority.ESSENTIAL,
            2,
          ),
          topic(
            4,
            'Git e colaboração',
            'Commits, branches e pull requests para trabalhar com outras pessoas.',
            SkillPriority.RECOMMENDED,
            3,
            [
              topic(
                5,
                'Revisão de código',
                'Leia um diff, peça feedback e aplique o que foi combinado.',
                SkillPriority.RECOMMENDED,
                1,
              ),
            ],
          ),
        ],
      ),
      topic(
        6,
        'Aplicações web',
        'Construa uma interface que conversa com um servidor.',
        SkillPriority.ESSENTIAL,
        2,
        [
          topic(
            7,
            'HTML, CSS e acessibilidade',
            'Estrutura semântica, layout e contraste para qualquer pessoa usar.',
            SkillPriority.ESSENTIAL,
            1,
          ),
          topic(
            8,
            'JavaScript no navegador',
            'DOM, eventos e o estado simples de uma tela.',
            SkillPriority.ESSENTIAL,
            2,
            [
              topic(
                9,
                'HTTP e APIs',
                'Requisições, status codes e como ler uma resposta JSON.',
                SkillPriority.RECOMMENDED,
                1,
              ),
            ],
          ),
        ],
      ),
      topic(
        10,
        'Entrega com qualidade',
        'Teste o comportamento visível e publique uma versão utilizável.',
        SkillPriority.RECOMMENDED,
        3,
        [
          topic(
            11,
            'Testes automatizados',
            'Escreva um teste que falha quando o comportamento quebra.',
            SkillPriority.RECOMMENDED,
            1,
          ),
          topic(
            12,
            'Deploy de uma aplicação',
            'Ambiente, variáveis e a publicação de uma versão acessível na web.',
            SkillPriority.ADVANCED,
            2,
          ),
        ],
      ),
    ],
  },
  'data-analysis': {
    id: roadmapUuid(2),
    title: 'Trilha de Análise de Dados',
    description: 'Da pergunta de negócio ao gráfico que sustenta uma decisão.',
    nodes: [
      topic(
        13,
        'Fundamentos analíticos',
        'Entenda o problema antes de abrir a ferramenta.',
        SkillPriority.ESSENTIAL,
        1,
        [
          topic(
            14,
            'Pergunta e métrica',
            'Transforme um pedido vago em uma métrica que dá para calcular.',
            SkillPriority.ESSENTIAL,
            1,
          ),
          topic(
            15,
            'Planilhas para análise',
            'Filtros, tabelas dinâmicas e fórmulas para explorar um conjunto pequeno.',
            SkillPriority.ESSENTIAL,
            2,
          ),
        ],
      ),
      topic(
        16,
        'Dados relacionais',
        'Consulte tabelas e una fontes sem perder o significado.',
        SkillPriority.ESSENTIAL,
        2,
        [
          topic(
            17,
            'SQL para consulta',
            'SELECT, WHERE e ORDER BY para responder perguntas diretas.',
            SkillPriority.ESSENTIAL,
            1,
            [
              topic(
                18,
                'Junções e agregações',
                'JOIN, GROUP BY e HAVING para cruzar e resumir tabelas.',
                SkillPriority.RECOMMENDED,
                1,
              ),
            ],
          ),
          topic(
            19,
            'Limpeza de dados',
            'Nulos, duplicatas e tipos inconsistentes antes de qualquer gráfico.',
            SkillPriority.RECOMMENDED,
            2,
          ),
        ],
      ),
      topic(
        20,
        'Comunicação visual',
        'Mostre o achado para quem decide, sem distorcer o dado.',
        SkillPriority.RECOMMENDED,
        3,
        [
          topic(
            21,
            'Gráficos com intenção',
            'Escolha o gráfico certo e escreva um título que afirma a conclusão.',
            SkillPriority.RECOMMENDED,
            1,
          ),
        ],
      ),
    ],
  },
  'data-science': {
    id: roadmapUuid(3),
    title: 'Trilha de Ciência de Dados',
    description:
      'Estatística, Python e modelos supervisionados em problemas reais.',
    nodes: [
      topic(
        22,
        'Base quantitativa',
        'Leia um conjunto de dados com estatística, não só com intuição.',
        SkillPriority.ESSENTIAL,
        1,
        [
          topic(
            23,
            'Estatística descritiva',
            'Média, mediana, dispersão e quando cada resumo engana.',
            SkillPriority.ESSENTIAL,
            1,
          ),
          topic(
            24,
            'Probabilidade aplicada',
            'Incerteza, amostragem e o que um resultado isolado não prova.',
            SkillPriority.RECOMMENDED,
            2,
          ),
        ],
      ),
      topic(
        25,
        'Python para dados',
        'Carregue, filtre e descreva dados com código reproduzível.',
        SkillPriority.ESSENTIAL,
        2,
        [
          topic(
            26,
            'Exploração com Pandas',
            'DataFrames, seleção e agregação do dia a dia.',
            SkillPriority.ESSENTIAL,
            1,
          ),
          topic(
            27,
            'Visualização em Python',
            'Gráficos exploratórios para achar padrões e outliers.',
            SkillPriority.RECOMMENDED,
            2,
          ),
        ],
      ),
      topic(
        28,
        'Modelos supervisionados',
        'Preveja um alvo a partir de exemplos já rotulados.',
        SkillPriority.RECOMMENDED,
        3,
        [
          topic(
            29,
            'Regressão e classificação',
            'Quando prever um número e quando prever uma categoria.',
            SkillPriority.RECOMMENDED,
            1,
            [
              topic(
                30,
                'Validação e overfitting',
                'Separe treino e teste e desconfie de um acerto alto demais.',
                SkillPriority.ADVANCED,
                1,
              ),
            ],
          ),
        ],
      ),
    ],
  },
  'ui-ux-design': {
    id: roadmapUuid(4),
    title: 'Trilha de Design UI/UX',
    description:
      'Pesquisa, interface e consistência visual para produtos digitais.',
    nodes: [
      topic(
        31,
        'Pesquisa com pessoas',
        'Descubra o problema real antes de desenhar a tela.',
        SkillPriority.ESSENTIAL,
        1,
        [
          topic(
            32,
            'Entrevistas e personas',
            'Conduza conversas e sintetize quem usa o produto e por quê.',
            SkillPriority.ESSENTIAL,
            1,
          ),
          topic(
            33,
            'Jornada e dores',
            'Mapeie etapas, fricções e oportunidades ao longo do uso.',
            SkillPriority.RECOMMENDED,
            2,
          ),
        ],
      ),
      topic(
        34,
        'Interface',
        'Transforme o entendimento em telas que alguém consegue usar.',
        SkillPriority.ESSENTIAL,
        2,
        [
          topic(
            35,
            'Princípios de UI',
            'Hierarquia, espaçamento, tipografia e estados da interface.',
            SkillPriority.ESSENTIAL,
            1,
          ),
          topic(
            36,
            'Prototipação',
            'Monte um fluxo clicável para testar a ideia cedo.',
            SkillPriority.ESSENTIAL,
            2,
            [
              topic(
                37,
                'Teste de usabilidade',
                'Observe alguém usando o protótipo e registre onde a pessoa trava.',
                SkillPriority.RECOMMENDED,
                1,
              ),
            ],
          ),
        ],
      ),
      topic(
        38,
        'Sistema visual',
        'Mantenha consistência quando o produto cresce.',
        SkillPriority.RECOMMENDED,
        3,
        [
          topic(
            39,
            'Componentes e tokens',
            'Cores, espaçamento e componentes que podem ser reutilizados.',
            SkillPriority.RECOMMENDED,
            1,
          ),
        ],
      ),
    ],
  },
  devops: {
    id: roadmapUuid(5),
    title: 'Trilha de Engenharia DevOps',
    description: 'Entrega contínua, conteinerização e operação de um serviço.',
    nodes: [
      topic(
        40,
        'Fundamentos de operação',
        'Entenda o ambiente em que o software roda.',
        SkillPriority.ESSENTIAL,
        1,
        [
          topic(
            41,
            'Linux e terminal',
            'Arquivos, processos e comandos para investigar um servidor.',
            SkillPriority.ESSENTIAL,
            1,
          ),
          topic(
            42,
            'Redes e HTTP',
            'Portas, DNS e o caminho de uma requisição até a aplicação.',
            SkillPriority.RECOMMENDED,
            2,
          ),
        ],
      ),
      topic(
        43,
        'Entrega contínua',
        'Automatize o caminho do commit até um ambiente executável.',
        SkillPriority.ESSENTIAL,
        2,
        [
          topic(
            44,
            'Git e pipeline de CI',
            'Um pipeline que instala dependências, testa e sinaliza falha.',
            SkillPriority.ESSENTIAL,
            1,
            [
              topic(
                45,
                'Testes no pipeline',
                'Decida o que roda a cada commit e o que pode esperar.',
                SkillPriority.RECOMMENDED,
                1,
              ),
            ],
          ),
          topic(
            46,
            'Conteinerização',
            'Empacote a aplicação para ela rodar igual em qualquer máquina.',
            SkillPriority.RECOMMENDED,
            2,
          ),
        ],
      ),
      topic(
        47,
        'Operação em nuvem',
        'Publique e observe um serviço fora da sua máquina.',
        SkillPriority.RECOMMENDED,
        3,
        [
          topic(
            48,
            'Deploy e variáveis',
            'Ambientes, segredos e um rollback simples quando a versão falha.',
            SkillPriority.ADVANCED,
            1,
          ),
        ],
      ),
    ],
  },
  'product-management': {
    id: roadmapUuid(6),
    title: 'Trilha de Gestão de Produto',
    description: 'Descoberta, priorização e entrega alinhada com o time.',
    nodes: [
      topic(
        49,
        'Descoberta',
        'Separe o problema do usuário da solução que o time quer construir.',
        SkillPriority.ESSENTIAL,
        1,
        [
          topic(
            50,
            'Problema e usuário',
            'Quem sofre, em que contexto e qual evidência sustenta isso.',
            SkillPriority.ESSENTIAL,
            1,
          ),
          topic(
            51,
            'Entrevistas de descoberta',
            'Perguntas abertas e síntese sem vender a solução.',
            SkillPriority.RECOMMENDED,
            2,
          ),
        ],
      ),
      topic(
        52,
        'Priorização',
        'Escolha o que entra agora e o que fica explicitamente de fora.',
        SkillPriority.ESSENTIAL,
        2,
        [
          topic(
            53,
            'Objetivos e métricas',
            'Um objetivo de produto e a métrica que mostra progresso.',
            SkillPriority.ESSENTIAL,
            1,
          ),
          topic(
            54,
            'Backlog e critérios de aceite',
            'Histórias pequenas com um critério claro de pronto.',
            SkillPriority.ESSENTIAL,
            2,
          ),
        ],
      ),
      topic(
        55,
        'Entrega com o time',
        'Alinhe escopo, risco e comunicação enquanto o produto é construído.',
        SkillPriority.RECOMMENDED,
        3,
        [
          topic(
            56,
            'Rituais e comunicação',
            'Planejamento, revisão e o registro de uma decisão.',
            SkillPriority.RECOMMENDED,
            1,
          ),
        ],
      ),
    ],
  },
  'quality-assurance': {
    id: roadmapUuid(7),
    title: 'Trilha de Qualidade de Software',
    description:
      'Testes manuais, automação e a escolha do que vale a pena cobrir.',
    nodes: [
      topic(
        57,
        'Fundamentos de teste',
        'Encontre falhas cedo e descreva-as de um jeito que o time corrija.',
        SkillPriority.ESSENTIAL,
        1,
        [
          topic(
            58,
            'Casos de teste e defeitos',
            'Passos, resultado esperado e um relatório de bug reproduzível.',
            SkillPriority.ESSENTIAL,
            1,
          ),
          topic(
            59,
            'Técnicas de caixa-preta',
            'Partição de equivalência e valores-limite sem ler o código.',
            SkillPriority.RECOMMENDED,
            2,
          ),
        ],
      ),
      topic(
        60,
        'Automação',
        'Transforme checagens repetidas em testes que rodam sozinhos.',
        SkillPriority.ESSENTIAL,
        2,
        [
          topic(
            61,
            'Testes de interface',
            'Cubra um fluxo crítico de ponta a ponta.',
            SkillPriority.ESSENTIAL,
            1,
            [
              topic(
                62,
                'Seletores estáveis',
                'Escolha âncoras que sobrevivem a um ajuste visual.',
                SkillPriority.RECOMMENDED,
                1,
              ),
            ],
          ),
          topic(
            63,
            'Testes de API',
            'Valide contrato, status e erros de um endpoint.',
            SkillPriority.RECOMMENDED,
            2,
          ),
        ],
      ),
      topic(
        64,
        'Estratégia de qualidade',
        'Decida o que testar à mão, o que automatizar e o que não testar.',
        SkillPriority.RECOMMENDED,
        3,
        [
          topic(
            65,
            'Pirâmide e risco',
            'Distribua o esforço de teste conforme o risco do produto.',
            SkillPriority.ADVANCED,
            1,
          ),
        ],
      ),
    ],
  },
  cybersecurity: {
    id: roadmapUuid(8),
    title: 'Trilha de Segurança da Informação',
    description:
      'Conceitos de defesa, falhas comuns em aplicações e resposta inicial.',
    nodes: [
      topic(
        66,
        'Fundamentos de segurança',
        'Pense em confidencialidade, integridade e disponibilidade antes da ferramenta.',
        SkillPriority.ESSENTIAL,
        1,
        [
          topic(
            67,
            'Tríade CIA e ameaças',
            'O que proteger, de quem, e qual o impacto se a proteção falhar.',
            SkillPriority.ESSENTIAL,
            1,
          ),
          topic(
            68,
            'Autenticação e senhas',
            'Sessão, senha e o que nunca deve ficar exposto no cliente.',
            SkillPriority.ESSENTIAL,
            2,
          ),
        ],
      ),
      topic(
        69,
        'Segurança de aplicações',
        'Reconheça falhas comuns em formulários, login e APIs.',
        SkillPriority.ESSENTIAL,
        2,
        [
          topic(
            70,
            'OWASP para iniciantes',
            'As falhas que mais aparecem em aplicações web de entrada.',
            SkillPriority.ESSENTIAL,
            1,
            [
              topic(
                71,
                'Injeção e XSS',
                'Como uma entrada não confiável vira comando ou script.',
                SkillPriority.RECOMMENDED,
                1,
              ),
            ],
          ),
        ],
      ),
      topic(
        72,
        'Defesa no dia a dia',
        'Detecte, registre e responda sem piorar o incidente.',
        SkillPriority.RECOMMENDED,
        3,
        [
          topic(
            73,
            'Logs e resposta',
            'O que registrar e os primeiros passos quando algo sai do esperado.',
            SkillPriority.RECOMMENDED,
            1,
          ),
          topic(
            74,
            'Noções de compliance',
            'Por que regras de privacidade e de acesso existem no produto.',
            SkillPriority.ADVANCED,
            2,
          ),
        ],
      ),
    ],
  },
};

function treeFor(slug: string): RoadmapTree {
  const tree = ROADMAP_TREES[slug];
  if (!tree) {
    throw new Error(`Missing career roadmap seed for ${slug}`);
  }
  return tree;
}

function flattenNodes(
  roadmapId: string,
  nodes: readonly CatalogNode[],
  parentNodeId: string | null,
  acc: RoadmapNodeSeed[],
): void {
  for (const node of nodes) {
    acc.push({
      id: node.id,
      roadmapId,
      parentNodeId,
      title: node.title,
      description: node.description,
      priority: node.priority,
      sequenceOrder: node.sequenceOrder,
    });
    flattenNodes(roadmapId, node.children, node.id, acc);
  }
}

export const CAREER_ROADMAP_SEEDS: readonly RoadmapSeed[] =
  CAREER_TRACK_CATALOG.map((track) => {
    const tree = treeFor(track.slug);
    return {
      id: tree.id,
      careerSlug: track.slug,
      title: tree.title,
      description: tree.description,
    };
  });

export const ROADMAP_NODE_SEEDS: readonly RoadmapNodeSeed[] =
  CAREER_ROADMAP_SEEDS.flatMap((roadmap) => {
    const nodes: RoadmapNodeSeed[] = [];
    flattenNodes(roadmap.id, treeFor(roadmap.careerSlug).nodes, null, nodes);
    return nodes;
  });
