// src/data/portfolio.js

/**
 * Dados de portfólio para a seção WORK.
 * Cada objeto representa um projeto com:
 *  - id: identificador único
 *  - categories: lista de categorias/tags
 *  - title: título principal do projeto
 *  - subtitle: breve descrição
 *  - imageUrl: caminho ou URL da imagem de destaque
 *  - link: URL relativa ou absoluta para a página do projeto
 */

export const portfolio = [
  {
    id: 1,
    categories: ['UIUX', 'WEBSITE', 'E-COMMERCE', 'DIGITAL STRATEGY'],
    title: 'Loja Virtual Alpha',
    subtitle: 'Plataforma de e-commerce com foco em conversão',
    imageUrl: '/assets/projects/alpha.jpg',
    link: '/projects/alpha'
  },
  {
    id: 2,
    categories: ['WEBSITE', 'BRANDING'],
    title: 'Branding Beta',
    subtitle: 'Reformulação completa de identidade visual',
    imageUrl: '/assets/projects/beta.jpg',
    link: '/projects/beta'
  },
  {
    id: 3,
    categories: ['UIUX', 'MOBILE APP'],
    title: 'App Gamma',
    subtitle: 'Aplicativo mobile para gerenciamento de tarefas',
    imageUrl: '/assets/projects/gamma.jpg',
    link: '/projects/gamma'
  },
  {
    id: 4,
    categories: ['DIGITAL STRATEGY', 'MARKETING'],
    title: 'Campanha Delta',
    subtitle: 'Estratégia digital integrada para lançamento de produto',
    imageUrl: '/assets/projects/delta.jpg',
    link: '/projects/delta'
  },
  {
    id: 5,
    categories: ['WEBSITE', 'ANIMAÇÃO'],
    title: 'Site Epsilon',
    subtitle: 'Website corporativo com animações customizadas',
    imageUrl: '/assets/projects/epsilon.jpg',
    link: '/projects/epsilon'
  }
];
