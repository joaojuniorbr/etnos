import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { mockCharacter } from '@ui/test/fixtures';

import { CulturalGuideCard } from './CulturalGuideCard';

const meta: Meta<typeof CulturalGuideCard> = {
	title: 'UI/@molecules/CulturalGuideCard',
	component: CulturalGuideCard,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	args: {
		guide: mockCharacter,
		onChangeGuide: fn(),
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
