'use client';

import { Button, Spin } from 'antd';

import { CharacterCard } from '@etnos/ui';
import { useCharacter } from '@etnos/tools';
import type { CharacterInterface } from '@etnos/types';
import { useRouter } from 'next/navigation';

export const CharacterSelect = () => {
	const router = useRouter();

	const { data, selectCharacter, selectedCharacter, isLoading } =
		useCharacter();

	return (
		<Spin spinning={isLoading}>
			<div className="flex flex-col gap-10">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{data?.map((character: CharacterInterface) => (
						<CharacterCard
							key={character.slug}
							character={character}
							selected={selectedCharacter?.slug === character.slug}
							onClick={() => selectCharacter(character.slug)}
						/>
					))}
				</div>

				<Button
					type="primary"
					size="large"
					disabled={!selectedCharacter}
					onClick={() => router.push('/estudante/jogos')}
				>
					Iniciar a Jornada
				</Button>
			</div>
		</Spin>
	);
};
