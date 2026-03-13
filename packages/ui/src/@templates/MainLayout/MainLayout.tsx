import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

import { AntdRegistry } from '@ant-design/nextjs-registry';

import { App, ConfigProvider } from 'antd';
import ptBR from 'antd/locale/pt_BR';

import dayjs from 'dayjs';

import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

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

				<meta name='apple-mobile-web-app-status-bar-style' content='default' />
				<meta name='apple-mobile-web-app-title' content='ETNOS' />
				<meta name='application-name' content='ETNOS' />
				<meta name='msapplication-TileColor' content='#371f12' />
				<meta name='theme-color' content='#371f12' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />

				<link
					rel='icon'
					type='image/png'
					href='/favicon/favicon-96x96.png'
					sizes='96x96'
				/>
				<link rel='icon' type='image/svg+xml' href='/favicon/favicon.svg' />
				<link rel='shortcut icon' href='/favicon/favicon.ico' />
				<link
					rel='apple-touch-icon'
					sizes='180x180'
					href='/favicon/apple-touch-icon.png'
				/>
				<link rel='manifest' href='/favicon/site.webmanifest' />
			</head>
			<body>
				<AntdRegistry>
					<ConfigProvider
						locale={ptBR}
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
