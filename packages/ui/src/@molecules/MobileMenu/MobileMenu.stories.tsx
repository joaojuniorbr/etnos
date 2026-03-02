import type { Meta, StoryObj } from '@storybook/react-vite';
import { MobileMenu } from './MobileMenu';
import type { UserProfileInterface } from '@etnos/types';

const meta: Meta<typeof MobileMenu> = {
	title: 'UI/@molecules/MobileMenu',
	component: MobileMenu,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	args: {
		onLogout: () => alert('Logout clicado'),
		toggleDrawer: () => {},
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		open: false,
		user: null,
	},
};

export const LoggedUser: Story = {
	args: {
		open: true,
		user: {
			email: 'iara@etnos.com',
			childName: 'Iara Curumim',
			uid: '123',
		} as UserProfileInterface,
	},
};
