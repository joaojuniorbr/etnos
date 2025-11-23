import type { Meta, StoryObj } from '@storybook/react-vite';

import { Footer } from '.';

const meta = {
	title: 'UI/@molecules/Footer',
	component: Footer,
	parameters: {},

	tags: ['autodocs'],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
};
