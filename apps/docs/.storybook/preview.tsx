import './main.css';
import '../../../apps/games/src/styles.css';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import type { Preview } from '@storybook/react-vite';

import ptBR from 'antd/locale/pt_BR';

import dayjs from 'dayjs';

import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

const queryClient = new QueryClient({
	defaultOptions: {
		queries: { retry: false },
	},
});

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
			<QueryClientProvider client={queryClient}>
				<ConfigProvider
					locale={ptBR}
					theme={{
						token: {
							colorPrimary: '#371f12',
							fontFamily: 'Nunito, sans-serif',
						},
					}}
				>
					<Story />
				</ConfigProvider>
			</QueryClientProvider>
		),
	],
};

export default preview;
