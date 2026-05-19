import type { Meta, StoryObj } from '@storybook/react-vite';

import { SectionPanel } from './SectionPanel';

const meta: Meta<typeof SectionPanel> = {
	title: 'UI/@molecules/SectionPanel',
	component: SectionPanel,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	args: {
		title: 'Ranking da turma',
		className: 'ui:w-96',
		children: <p className="ui:m-0 ui:text-sm ui:text-slate-600">Conteúdo do painel.</p>,
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
	args: {
		action: (
			<button type="button" className="ui:text-xs ui:font-bold ui:text-primary">
				Ver tudo
			</button>
		),
	},
};
