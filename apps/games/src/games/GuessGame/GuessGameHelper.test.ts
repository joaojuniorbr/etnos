import { GuessGameCreateItem } from './GuessGameHelper';

describe('GuessGameCreateItem', () => {
	it('cria um item com word, tips e about', () => {
		expect(
			GuessGameCreateItem('chimarrao', ['dica 1', 'dica 2'], 'descricao')
		).toEqual({
			word: 'chimarrao',
			tips: ['dica 1', 'dica 2'],
			about: 'descricao',
		});
	});
});
