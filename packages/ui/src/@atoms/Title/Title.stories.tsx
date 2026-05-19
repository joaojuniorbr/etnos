import type { Meta, StoryObj } from '@storybook/react-vite';

import { Title } from './Title';

const meta: Meta<typeof Title> = {
	title: 'UI/@atoms/Title',
	component: Title,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	args: {
		children: 'Título da seção',
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
