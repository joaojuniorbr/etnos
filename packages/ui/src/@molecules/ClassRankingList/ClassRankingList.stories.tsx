import type { Meta, StoryObj } from '@storybook/react-vite';

import { ClassRankingList } from './ClassRankingList';

const meta: Meta<typeof ClassRankingList> = {
	title: 'UI/@molecules/ClassRankingList',
	component: ClassRankingList,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	args: {
		entries: [
			{
				rank: 1,
				initials: 'JP',
				name: 'João Pedro',
				score: 2100,
				isCurrentUser: false,
			},
			{
				rank: 2,
				initials: 'AS',
				name: 'Ana Silva',
				score: 1250,
				isCurrentUser: true,
			},
		],
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
	args: {
		entries: [],
	},
};
