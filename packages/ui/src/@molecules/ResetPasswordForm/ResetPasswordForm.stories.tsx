import type { Meta, StoryObj } from '@storybook/react-vite';
import { message } from 'antd';
import { ResetPasswordForm } from './ResetPasswordForm';

const meta: Meta<typeof ResetPasswordForm> = {
	title: 'UI/@molecules/ResetPasswordForm',
	component: ResetPasswordForm,
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<div className="ui:w-full ui:max-w-md ui:border ui:border-slate-200 ui:p-8 ui:shadow-lg ui:rounded-lg ui:bg-white ui:mx-auto">
				<Story />
			</div>
		),
	],
	args: {
		onSubmit: () => {
			message.success('Modal fechado com sucesso');
		},
	},
	argTypes: {
		onSubmit: { action: 'submitSuccess' },
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
