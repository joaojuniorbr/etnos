import type { Meta, StoryObj } from '@storybook/react-vite';
import type { UserProfileInterface } from '@etnos/types';

import { MidiaManager } from './MidiaManager';

const mockUser = {
	email: 'admin@etnos.com',
	childName: 'Admin ETNOS',
	uid: 'admin-123',
} as UserProfileInterface;

const meta: Meta<typeof MidiaManager> = {
	title: 'UI/@organisms/MidiaManager',
	component: MidiaManager,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	args: {
		user: mockUser,
		uploadFolder: 'library',
		limitPage: 12,
		showAll: true,
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const UploadFolderGames: Story = {
	args: {
		uploadFolder: 'games/memory-game',
	},
};
