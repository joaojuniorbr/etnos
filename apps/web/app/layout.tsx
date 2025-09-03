import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@ant-design/v5-patch-for-react-19';

import '@etnos/ui/styles.css';
import './globals.css';

import type { Metadata } from 'next';
import { App, ConfigProvider } from 'antd';
import { Footer } from '@etnos/ui/index';
import { Header } from '@etnos/components';

export const metadata: Metadata = {
	title: 'Etnos',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='pt-BR'>
			<head>
				<link rel='preconnect' href='https://fonts.googleapis.com' />
				<link rel='preconnect' href='https://fonts.gstatic.com' />
				<link
					href='https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap'
					rel='stylesheet'
				/>
			</head>
			<body>
				<AntdRegistry>
					<ConfigProvider
						theme={{
							token: {
								colorPrimary: '#371f12',
								fontFamily: 'Nunito, sans-serif',
							},
						}}
					>
						<App>
							<div className='flex flex-col w-full min-h-screen'>
								<Header />

								<main className='flex-1'>{children}</main>

								<Footer />
							</div>
						</App>
					</ConfigProvider>
				</AntdRegistry>
			</body>
		</html>
	);
}
