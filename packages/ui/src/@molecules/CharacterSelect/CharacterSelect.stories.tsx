import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { mockCharacters } from '@ui/test/fixtures';

import { CharacterSelect } from './CharacterSelect';

const meta: Meta<typeof CharacterSelect> = {
	title: 'UI/@molecules/CharacterSelect',
	component: CharacterSelect,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	args: {
		characters: mockCharacters,
		selectedCharacter: mockCharacters[0],
		onSelect: fn(),
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
