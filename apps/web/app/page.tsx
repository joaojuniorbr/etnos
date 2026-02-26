import { GameHighlight, HeroHome, WhatLearn } from '@components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Etnos',
};

export default function Page() {
	return (
		<>
			<HeroHome />
			<GameHighlight />
			<WhatLearn />
		</>
	);
}
