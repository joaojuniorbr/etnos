import type { Meta, StoryObj } from '@storybook/react-vite';
import { CharacterCard } from './CharacterCard';

const mockCharacter = {
	id: 'iara',
	slug: 'iara',
	name: 'Iara',
	region: 'Norte',
	description: 'Descrição do personagem',
} as const;

const meta: Meta<typeof CharacterCard> = {
	title: 'UI/@atoms/CharacterCard',
	component: CharacterCard,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	args: {
		character: mockCharacter,
		selected: false,
	},
	argTypes: {
		selected: {
			control: { type: 'boolean' },
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
