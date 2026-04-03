import type { CharacterInterface } from '@etnos/types';
import { Button } from '@etnos/ui';
import Image from 'next/image';

interface FinishGameProps {
	handleRestart: () => void;
	isLoading: boolean;
	handleSaveScore: () => void;
	selectedCharacter?: CharacterInterface;
	isLoser?: boolean;
}

export const FinishGame = ({
	selectedCharacter,
	isLoading,
	isLoser,
	handleRestart,
	handleSaveScore,
}: FinishGameProps) => (
	<div className="text-center">
		<h2 className="text-3xl font-bold text-primary m-0">
			{isLoser ? 'Você perdeu' : 'Parabéns!'}
		</h2>
		<h3 className="text-lg text-primary">
			{isLoser ? 'Tente novamente' : 'Você completou o desafio.'}
		</h3>

		{selectedCharacter?.slug && (
			<div className="flex justify-center">
				<Image
					src={`/games/${isLoser ? 'error' : 'success'}/${selectedCharacter.slug}.jpg`}
					width={400}
					height={400}
					alt={selectedCharacter.name}
					className="rounded"
				/>
			</div>
		)}

		<div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
			<Button
				onClick={handleRestart}
				loading={isLoading}
				disabled={isLoading}
				block
			>
				Reiniciar Jogo
			</Button>

			<Button
				type="primary"
				onClick={handleSaveScore}
				loading={isLoading}
				disabled={isLoading || isLoser}
				block
			>
				Salvar Pontuação
			</Button>
		</div>
	</div>
);
