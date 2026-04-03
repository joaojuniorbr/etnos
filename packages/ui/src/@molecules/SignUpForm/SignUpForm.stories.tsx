import type { Meta, StoryObj } from '@storybook/react-vite';
import { message } from 'antd';
import { SignUpForm } from './SignUpForm';

const meta: Meta<typeof SignUpForm> = {
	title: 'UI/@molecules/SignUpForm',
	component: SignUpForm,
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<div className="ui:w-full ui:max-w-2xl ui:border ui:border-slate-200 ui:p-10 ui:shadow-lg ui:rounded-lg ui:bg-white ui:mx-auto">
				<Story />
			</div>
		),
	],
	args: {
		schools: [
			{ id: '1', name: 'Escola Municipal Sol Nascente' },
			{ id: '2', name: 'Colégio Horizonte' },
		],
		isLoadingSchools: false,
		onRegisterSuccess: () => {
			message.success('Cadastro concluído!');
		},
	},
	argTypes: {
		onRegisterSuccess: { action: 'registerSuccess' },
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LoadingSchools: Story = {
	args: {
		isLoadingSchools: true,
	},
};
