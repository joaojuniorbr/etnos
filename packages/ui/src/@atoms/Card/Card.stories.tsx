import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
	title: 'UI/@atoms/Card',
	component: Card,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	args: {
		children: 'Conteúdo simples dentro do card.',
		className: 'ui:w-80',
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCustomContent: Story = {
	args: {
		children: (
			<div className="ui:space-y-2">
				<h3 className="ui:text-lg ui:font-bold ui:text-slate-800">
					Título do card
				</h3>
				<p className="ui:text-sm ui:text-slate-600">
					Use este bloco para destacar informações curtas com borda, sombra e
					espaçamento padrão.
				</p>
			</div>
		),
	},
};
