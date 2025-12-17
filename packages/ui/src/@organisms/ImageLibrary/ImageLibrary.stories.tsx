import type { Meta, StoryObj } from '@storybook/react-vite';
import { ImageLibrary } from './ImageLibrary';
import { UserProfileInterface } from '@etnos/tools';

const mockUser = {
	email: 'iara@etnos.com',
	childName: 'Iara Curumim',
	uid: '123',
} as UserProfileInterface;

const meta: Meta<typeof ImageLibrary> = {
	title: 'UI/@organisms/ImageLibrary',
	component: ImageLibrary,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	args: {
		user: mockUser
	},
	argTypes: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
