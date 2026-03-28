import type { Meta, StoryObj } from '@storybook/react-vite';
import { message } from 'antd';
import { GuessGameExperience } from './GuessGameExperience';

const word = 'Bomba';

const normalize = (value: string) =>
	value
		.normalize('NFD')
		.replaceAll(/[\u0300-\u036f]/g, '')
		.toLowerCase();

const meta = {
	title: 'Games/GuessGame',
	component: GuessGameExperience,
	parameters: {
		layout: 'padded',
	},
	args: {
		bestScore: 90,
		content: {
			id: 'guess-1',
			title: 'Chimarrao',
			tips: [
				'Uso para beber chimarrão.',
				'Tenho furinhos na ponta',
				'Sou feito de metal ou madeira',
				'Sou usado para beber o chimarrão',
				'Sou conhecido como bomba de chimarrão',
			],
			imageUrl: '/images/character/xl/anita.jpg',
			characterSlug: 'anita',
			wordLength: word.length,
		},
		selectedCharacter: {
			id: '1',
			name: 'Anita',
			region: 'Sul',
			description: 'Representacao do Sul para o jogo adivinhe a palavra',
			slug: 'anita',
		},
		onPlaySound: () => undefined,
		onSaveScore: async (score: number) => {
			message.success(`Pontuação ${score} salva na story`);
		},
		onValidateAttempt: async ({
			guess,
			type,
		}: {
			guess: string;
			type: 'letter' | 'word';
		}) => {
			if (type === 'word') {
				const isCorrect = normalize(guess) === normalize(word);

				return {
					isCorrect,
					isSolved: isCorrect,
					matchedIndexes: [],
					revealedCharacters: [],
					word: isCorrect ? word : undefined,
					description: isCorrect
						? 'A bomba é o canudo de metal usado para beber o chimarrão.'
						: undefined,
				};
			}

			const matchedIndexes: number[] = [];
			const revealedCharacters: string[] = [];

			for (let index = 0; index < word.length; index += 1) {
				const character = word[index];

				if (character && normalize(character) === normalize(guess)) {
					matchedIndexes.push(index);
					revealedCharacters.push(character);
				}
			}

			return {
				isCorrect: matchedIndexes.length > 0,
				isSolved: false,
				matchedIndexes,
				revealedCharacters,
			};
		},
	},
} satisfies Meta<typeof GuessGameExperience>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
