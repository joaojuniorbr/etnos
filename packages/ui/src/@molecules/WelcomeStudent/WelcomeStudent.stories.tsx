import type { Meta, StoryObj } from '@storybook/react-vite';

import { WelcomeStudent } from './WelcomeStudent';

const meta: Meta<typeof WelcomeStudent> = {
	title: 'UI/@molecules/WelcomeStudent',
	component: WelcomeStudent,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	args: {
		name: 'Ana',
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
