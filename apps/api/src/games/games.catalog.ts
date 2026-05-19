export const GAME_SLUGS = ['memory-game', 'guess-game'] as const;

export type GameCatalogEntry = {
  slug: string;
  name: string;
  description: string;
  url: string;
};

export const GAME_CATALOG: GameCatalogEntry[] = [
  {
    slug: 'guess-game',
    name: 'Adivinhe a Palavra',
    description:
      'Descubra palavras da cultura brasileira letra por letra. Cada acerto revela tradições, costumes e histórias do nosso povo.',
    url: '/estudante/jogos/advinhe',
  },
  {
    slug: 'memory-game',
    name: 'Jogo da Memória',
    description:
      'Encontre os pares e descubra símbolos culturais do Brasil enquanto exercita sua memória de forma divertida e educativa!',
    url: '/estudante/jogos/jogo-da-memoria',
  },
];

export function getGameCatalogBySlugs(slugs: string[]): GameCatalogEntry[] {
  return GAME_CATALOG.filter((game) => slugs.includes(game.slug));
}
