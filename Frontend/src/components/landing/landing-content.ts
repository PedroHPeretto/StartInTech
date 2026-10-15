import devIcon from '@/assets/icons/developer-icon.svg';
import dataAnalystIcon from '@/assets/icons/data-analyst-icon.svg';
import dataScientistIcon from '@/assets/icons/data-scientist-icon.svg';
import designerIcon from '@/assets/icons/designer-icon.svg';
import devopsIcon from '@/assets/icons/devops-engineer-icon.svg';
import qaIcon from '@/assets/icons/qa-icon.svg';
import cyberIcon from '@/assets/icons/cybersecurity-icon.svg';
import pmIcon from '@/assets/icons/product-manager-icon.svg';

export interface NavLinkItem {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLinkItem[] = [
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Trilhas', href: '#trilhas' },
  { label: 'FAQ', href: '#faq' },
];

export interface PainPointItem {
  problemTitle: string;
  problemText: string;
  solutionTitle: string;
  solutionText: string;
}

export const PAIN_POINTS: PainPointItem[] = [
  {
    problemTitle: 'Currículo ignorado pelos robôs ATS',
    problemText:
      'A maioria das candidaturas é descartada antes mesmo de um humano ler, por falta de formatação e termos-chave adequados.',
    solutionTitle: 'Análise ATS em segundos',
    solutionText:
      'Veja exatamente como os sistemas de recrutamento enxergam seu currículo e corrija falhas antes de enviar.',
  },
  {
    problemTitle: 'Sensação de não saber o que estudar',
    problemText:
      'Requisitos confusos e excesso de opções deixam quem está começando sem direção clara de evolução.',
    solutionTitle: 'Roadmap personalizado',
    solutionText:
      'Um plano de estudos estruturado que prioriza as tecnologias reais exigidas pelo mercado de trabalho.',
  },
  {
    problemTitle: 'Toda vaga pede experiência prévia',
    problemText:
      'O paradoxo do primeiro emprego: como ter experiência comprovada se ninguém dá a primeira oportunidade?',
    solutionTitle: 'Vagas com match de habilidades',
    solutionText:
      'Oportunidades de estágio e nível júnior ranqueadas por afinidade com o que você já sabe e construiu.',
  },
];

export interface FeatureItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  isFeatured?: boolean;
}

export const FEATURES: FeatureItem[] = [
  {
    id: 'ats-analysis',
    badge: 'Análise Inteligente',
    title: 'Análise ATS e Diagnóstico de Currículo',
    description:
      'Descubra sua pontuação de compatibilidade com os robôs de RH, identifique palavras-chave faltantes e receba recomendações diretas para ser notado pelos recrutadores.',
    isFeatured: true,
  },
  {
    id: 'skill-gap',
    badge: 'Gap de Habilidades',
    title: 'Diagnóstico de Tecnologias Faltantes',
    description:
      'Compare seu perfil técnico com os requisitos das vagas mais abertas do mercado e saiba o que priorizar nos seus estudos.',
  },
  {
    id: 'roadmap',
    badge: 'Trilha Personalizada',
    title: 'Roadmap de Carreira Passo a Passo',
    description:
      'Acompanhe seu progresso de aprendizagem com etapas práticas, do básico aos projetos de portfólio que chamam a atenção das empresas.',
  },
  {
    id: 'job-matching',
    badge: 'Match de Oportunidades',
    title: 'Vagas Júnior e Estágio com Match',
    description:
      'Chega de aplicar às cegas. Veja exatamente a porcentagem de afinidade do seu currículo com cada vaga antes de se candidatar.',
  },
];

export interface LandingStepItem {
  number: number;
  title: string;
  description: string;
}

export const STEPS: LandingStepItem[] = [
  {
    number: 1,
    title: 'Defina sua meta',
    description:
      'Escolha a trilha que mais combina com você e conte sobre sua bagagem técnica e acadêmica.',
  },
  {
    number: 2,
    title: 'Receba o diagnóstico',
    description:
      'Envie seu currículo em PDF e tenha em segundos o raio-X da sua pontuação ATS e pontos de melhoria.',
  },
  {
    number: 3,
    title: 'Evolua e aplique com segurança',
    description:
      'Siga seu plano de estudos prático e candidate-se a vagas júnior com alta taxa de match.',
  },
];

export interface CareerTrackItem {
  id: string;
  name: string;
  iconSrc: string;
  description: string;
}

export const CAREER_TRACKS: CareerTrackItem[] = [
  {
    id: 'developer',
    name: 'Desenvolvimento',
    iconSrc: devIcon,
    description:
      'Front-end, Back-end e Full-stack para construir sistemas e aplicações web modernas.',
  },
  {
    id: 'data-analyst',
    name: 'Análise de Dados',
    iconSrc: dataAnalystIcon,
    description:
      'SQL, dashboards e análise de métricas para transformar números em decisões estratégicas.',
  },
  {
    id: 'data-scientist',
    name: 'Ciência de Dados',
    iconSrc: dataScientistIcon,
    description:
      'Modelos estatísticos, Machine Learning e Python para desvendar padrões complexos.',
  },
  {
    id: 'designer',
    name: 'UI/UX Design',
    iconSrc: designerIcon,
    description:
      'Pesquisa com usuários, prototipação e interfaces intuitivas que encantam.',
  },
  {
    id: 'devops-engineer',
    name: 'DevOps & Cloud',
    iconSrc: devopsIcon,
    description:
      'Infraestrutura como código, containers e pipelines de integração contínua na nuvem.',
  },
  {
    id: 'qa',
    name: 'Qualidade (QA)',
    iconSrc: qaIcon,
    description:
      'Automação de testes, segurança e garantia de entrega sem bugs para o usuário final.',
  },
  {
    id: 'cybersecurity',
    name: 'Cibersegurança',
    iconSrc: cyberIcon,
    description:
      'Proteção de redes, auditoria de vulnerabilidades e resposta rápida a incidentes.',
  },
  {
    id: 'product-manager',
    name: 'Gestão de Produto',
    iconSrc: pmIcon,
    description:
      'Visão de negócio, descoberta de produto e conexão entre tecnologia e clientes.',
  },
];

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'item-1',
    question: 'A StartInTech é realmente gratuita?',
    answer:
      'Sim! O diagnóstico de currículo via ATS, o roadmap personalizado e a recomendação de vagas de entrada são 100% gratuitos para estudantes e profissionais em transição.',
  },
  {
    id: 'item-2',
    question: 'Preciso ter experiência prévia para usar a plataforma?',
    answer:
      'Não. A StartInTech foi criada especialmente para quem está em busca do primeiro emprego ou estágio na área de tecnologia, orientando desde os primeiros projetos até as candidaturas.',
  },
  {
    id: 'item-3',
    question: 'Como funciona a análise ATS do currículo?',
    answer:
      'Nosso algoritmo processa a estrutura do seu arquivo PDF, verifica a legibilidade dos blocos de texto, identifica palavras-chave exigidas pelo mercado e calcula um score de compatibilidade com recrutadores.',
  },
  {
    id: 'item-4',
    question: 'Meus dados e meu currículo ficam seguros?',
    answer:
      'Totalmente. Seus arquivos e informações pessoais são protegidos com padrões rígidos de privacidade e segurança, nunca sendo compartilhados sem o seu consentimento explícito.',
  },
  {
    id: 'item-5',
    question: 'Quais tipos de vagas encontro na StartInTech?',
    answer:
      'Focamos exclusivamente em oportunidades para iniciantes: vagas de estágio, trainee e cargos júnior das principais empresas de tecnologia do país.',
  },
];
