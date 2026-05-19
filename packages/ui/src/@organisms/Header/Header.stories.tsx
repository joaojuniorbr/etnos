import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from './Header';
import { UserProvider } from '@ui/context';

const meta: Meta<typeof Header> = {
	title: 'UI/@organisms/Header',
	component: Header,
	parameters: {
		layout: 'fullscreen',
	},
	decorators: [
		(Story) => (
			<UserProvider>
				<Story />
			</UserProvider>
		),
	],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
