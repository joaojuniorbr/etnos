import { Footer, Header } from '@etnos/ui/index';

export default function Page() {
	return (
		<div className='flex flex-col w-full min-h-screen'>
			<Header />

			<main className='flex-1'></main>

			<Footer />
		</div>
	);
}
