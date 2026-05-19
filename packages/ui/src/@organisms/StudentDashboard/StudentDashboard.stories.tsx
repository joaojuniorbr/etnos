import type { Meta, StoryObj } from '@storybook/react-vite';

import {
	mockStudentDashboard,
	mockStudentDashboardWithoutGuide,
} from '@ui/test/fixtures';

import { StudentDashboard } from './StudentDashboard';

const meta: Meta<typeof StudentDashboard> = {
	title: 'UI/@organisms/StudentDashboard',
	component: StudentDashboard,
	parameters: {
		layout: 'fullscreen',
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithGuide: Story = {
	args: {
		data: mockStudentDashboard,
	},
};

export const WithoutGuide: Story = {
	args: {
		data: mockStudentDashboardWithoutGuide,
	},
};
