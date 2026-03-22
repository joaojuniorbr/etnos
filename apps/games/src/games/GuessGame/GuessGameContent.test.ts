import { GuessGameContent } from './GuessGameContent';

describe('GuessGameContent', () => {
	it('gera conteúdo para todos os personagens com imagem derivada do slug', () => {
		expect(Object.keys(GuessGameContent)).toEqual(
			expect.arrayContaining(['anita', 'dandara', 'iara', 'tonico', 'zeca'])
		);

		expect(GuessGameContent.anita![0]).toEqual(
			expect.objectContaining({
				word: expect.any(String),
				about: expect.any(String),
				tips: expect.any(Array),
				image: expect.stringMatching(
					/^\/games\/memory-game\/anita\/cards\/.+\.jpg$/
				),
			})
		);
	});
});
