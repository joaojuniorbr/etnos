import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryGameExperience } from './MemoryGameExperience';
import { message } from 'antd';

const meta = {
	title: 'Games/MemoryGame',
	component: MemoryGameExperience,
	parameters: {
		layout: 'padded',
	},
	args: {
		bestScore: 180,
		coverImage: '/games/memory-game/cover/anita.jpg',
		content: [
			{
				name: 'chimarrao',
				image: '/games/memory-game/anita/cards/chimarrao.jpg',
			},
			{
				name: 'churrasco',
				image: '/games/memory-game/anita/cards/churrasco.jpg',
			},
			{ name: 'danca', image: '/games/memory-game/anita/cards/danca.jpg' },
			{ name: 'poncho', image: '/games/memory-game/anita/cards/poncho.jpg' },
			{ name: 'musica', image: '/games/memory-game/anita/cards/musica.jpg' },
			{ name: 'prenda', image: '/games/memory-game/anita/cards/prenda.jpg' },
		],
		selectedCharacter: {
			id: '1',
			name: 'Anita',
			region: 'Sul',
			description: 'Representacao do Sul para o jogo da memoria',
			slug: 'anita',
		},
		onSaveScore: () => {
			message.success('Metodo que salva a pontuação foi chamado');
		},
	},
} satisfies Meta<typeof MemoryGameExperience>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
