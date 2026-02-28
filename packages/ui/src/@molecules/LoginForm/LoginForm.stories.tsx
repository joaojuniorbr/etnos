import type { Meta, StoryObj } from '@storybook/react-vite';
import { LoginForm } from './LoginForm';
import { message } from 'antd';

const meta: Meta<typeof LoginForm> = {
	title: 'UI/@molecules/LoginForm',
	component: LoginForm,
	tags: ['autodocs'],

	decorators: [
		(Story) => (
			<div className='ui:w-full ui:max-w-lg ui:border ui:border-slate-200 ui:p-10 ui:shadow-lg ui:rounded-lg ui:bg-white ui:mx-auto'>
				<Story />
			</div>
		),
	],
	args: {
		onLoginSuccess: () => {
			message.success('Login bem-sucedido!');
		},
	},
	argTypes: {
		onLoginSuccess: { action: 'loginSuccess' },
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
