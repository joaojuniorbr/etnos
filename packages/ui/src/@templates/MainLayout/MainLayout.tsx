import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

import { AntdRegistry } from '@ant-design/nextjs-registry';

import { App, ConfigProvider } from 'antd';

import { Footer } from '../../@molecules';
import { Header } from '../../@organisms';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
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
							<div className='ui:flex ui:flex-col ui:w-full ui:min-h-screen'>
								<Header />

								<main className='ui:flex-1'>{children}</main>

								<Footer />
							</div>
						</App>
					</ConfigProvider>
				</AntdRegistry>
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
};
