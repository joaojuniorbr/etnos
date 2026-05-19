import type { Meta, StoryObj } from '@storybook/react-vite';

import { ActivityRow } from './ActivityRow';

const meta: Meta<typeof ActivityRow> = {
	title: 'UI/@molecules/ActivityRow',
	component: ActivityRow,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	args: {
		relativeTime: 'Hoje',
		activity: {
			id: 'activity-1',
			description: 'Pontuou no Jogo da Memória',
			highlight: '+120',
			gameSlug: 'memory-game',
			characterSlug: 'iara',
			timestamp: new Date().toISOString(),
			points: 120,
			coverUrl: null,
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
