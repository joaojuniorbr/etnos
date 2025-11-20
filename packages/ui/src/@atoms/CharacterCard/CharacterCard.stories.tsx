import type { Meta, StoryObj } from '@storybook/react-vite';
import { CharacterCard } from './CharacterCard';
import { CharactersContent } from '@etnos/tools';

const charactersMap = CharactersContent;

const meta: Meta<typeof CharacterCard> = {
	title: 'UI/CharacterCard',
	component: CharacterCard,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	args: {
		character: charactersMap.iara,
		selected: false,
	},
	argTypes: {
		selected: {
			control: { type: 'boolean' },
		},
		character: {
			control: { type: 'radio' },
			options: Object.keys(charactersMap),
			mapping: charactersMap,
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
