import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ImageLibrary } from './ImageLibrary';
import type { UserProfileInterface } from '@etnos/types';

const mockUser = {
	email: 'iara@etnos.com',
	childName: 'Iara Curumim',
	uid: '123',
} as UserProfileInterface;

const meta: Meta<typeof ImageLibrary> = {
	title: 'UI/@organisms/ImageLibrary',
	component: ImageLibrary,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	args: {
		user: mockUser,
		folder: 'storybook',
		limitPage: 12,
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SelectionMode: Story = {
	args: {
		onSelect: fn(),
		itemsSelected: ['https://picsum.photos/seed/etnos-storybook/400'],
		limitPage: 8,
	},
};

export const AdminShowAll: Story = {
	args: {
		showAll: true,
		folder: 'library',
		limitPage: 24,
	},
};
