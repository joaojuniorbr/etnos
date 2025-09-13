'use client';

import { Button } from 'antd';

import { CharacterCard } from '@etnos/ui';
import { useCharacter } from '@etnos/tools';
import { useRouter } from 'next/navigation';

export const CharacterSelect = () => {
	const router = useRouter();

	const { characters, selectCharacter, selectedCharacter } = useCharacter();

	return (
		<div className='flex flex-col gap-10'>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				{characters.map((character) => (
					<CharacterCard
						key={character.slug}
						character={character}
						selected={selectedCharacter?.slug === character.slug}
						onClick={() => selectCharacter(character.slug)}
					/>
				))}
			</div>

			<Button
				type='primary'
				size='large'
				disabled={!selectedCharacter}
				onClick={() => router.push('/estudante/jogos')}
			>
				Iniciar a Jornada
			</Button>
		</div>
	);
};
