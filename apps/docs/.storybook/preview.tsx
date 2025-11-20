import './main.css';

import React from 'react';
import { ConfigProvider } from 'antd';
import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		a11y: {
			test: 'todo',
		},
	},
	decorators: [
		(Story) => (
			<ConfigProvider
				theme={{
					token: {
						colorPrimary: '#371f12',
						fontFamily: 'Nunito, sans-serif',
					},
				}}
			>
				<Story />
			</ConfigProvider>
		),
	],
};

export default preview;
