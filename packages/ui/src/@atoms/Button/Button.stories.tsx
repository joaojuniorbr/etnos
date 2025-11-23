import type { Meta, StoryObj } from '@storybook/react-vite';

import { fn } from 'storybook/test';

import { Button } from '.';

const meta = {
	title: 'UI/@atoms/Button',
	component: Button,
	parameters: {
		layout: 'centered',
	},

	tags: ['autodocs'],

	args: {
		onClick: fn(),
	},
	argTypes: {
		danger: {
			control: { type: 'boolean' },
		},
		type: {
			options: ['primary', 'default', 'dashed', 'link', 'text'],
			control: { type: 'select' },
		},
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
	args: {
		children: 'Botão',
		type: 'primary',
	},
};
