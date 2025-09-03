import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@ant-design/v5-patch-for-react-19';

import '@etnos/ui/styles.css';
import './globals.css';

import type { Metadata } from 'next';
import { App, ConfigProvider } from 'antd';

export const metadata: Metadata = {
	title: 'Etnos',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AntdRegistry>
			<ConfigProvider
				theme={{
					token: {
						colorPrimary: '#371f12',
					},
				}}
			>
				<App>
					<html lang='pt-BR'>
						<body>{children}</body>
					</html>
				</App>
			</ConfigProvider>
		</AntdRegistry>
	);
}
