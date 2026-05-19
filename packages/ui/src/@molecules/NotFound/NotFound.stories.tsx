import type { Meta, StoryObj } from '@storybook/react-vite';
import { NotFound } from './NotFound';
import { UserProvider } from '@ui/context';

const meta: Meta<typeof NotFound> = {
	title: 'UI/@molecules/NotFound',
	component: NotFound,
	decorators: [
		(Story) => (
			<UserProvider>
				<Story />
			</UserProvider>
		),
	],
	parameters: {
		layout: 'fullscreen',
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
