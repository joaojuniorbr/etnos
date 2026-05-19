import { GAME_CATALOG, getGameCatalogBySlugs } from './games.catalog';

describe('games.catalog', () => {
	it('filtra jogos habilitados pelos slugs informados', () => {
		expect(getGameCatalogBySlugs(['memory-game'])).toEqual([
			GAME_CATALOG.find((game) => game.slug === 'memory-game'),
		]);
		expect(getGameCatalogBySlugs(['guess-game', 'memory-game'])).toEqual(
			GAME_CATALOG,
		);
		expect(getGameCatalogBySlugs(['inexistente'])).toEqual([]);
	});
});
