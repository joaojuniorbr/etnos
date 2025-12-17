import type { Meta, StoryObj } from '@storybook/react-vite';
import { ImageUpload } from './ImageUpload';

const meta: Meta<typeof ImageUpload> = {
	title: 'UI/@molecules/ImageUpload',
	component: ImageUpload,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	args: {
		userId: 'userTestId',
		folder: 'unitTest',
	},
	argTypes: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
