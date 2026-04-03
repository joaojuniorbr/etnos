import type { Meta, StoryObj } from '@storybook/react-vite';
import { ImageMultipleUpload } from './ImageMultipleUpload';

const meta: Meta<typeof ImageMultipleUpload> = {
	title: 'UI/@molecules/ImageMultipleUpload',
	component: ImageMultipleUpload,
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
