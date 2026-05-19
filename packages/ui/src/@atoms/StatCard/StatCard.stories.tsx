import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
	title: 'UI/@atoms/StatCard',
	component: StatCard,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	args: {
		label: 'Pontuação total',
		value: '1.250',
		icon: '🏆',
		className: 'ui:w-56',
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NumericValue: Story = {
	args: {
		label: 'Jogos concluídos',
		value: 4,
		icon: '🎮',
	},
};
