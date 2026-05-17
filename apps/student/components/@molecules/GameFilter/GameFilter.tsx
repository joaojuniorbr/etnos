'use client';

import { Select } from 'antd';
import { useGames, useMyGameAccess } from '@etnos/tools';

interface GameFilterProps {
	value?: string;
	onChange: (value?: string) => void;
}

export const GameFilter = ({ value, onChange }: GameFilterProps) => {
	const { allGames } = useGames();
	const { data: gameAccess } = useMyGameAccess();
	const enabledGames = allGames.filter((game) =>
		gameAccess?.enabledGameSlugs?.includes(game.slug),
	);

	const options = [
		{ label: 'Todos os Jogos', value: '' },
		...(enabledGames?.map((game) => ({
			label: game.name,
			value: game.slug,
		})) || []),
	];

	const uniqueOptions = options.filter(
		(option, index, self) =>
			index === self.findIndex((o) => o.value === option.value),
	);

	return (
		<div className="flex items-center gap-2">
			<span className="text-slate-600 font-medium">Filtrar por:</span>
			<Select
				className="w-48"
				placeholder="Selecione um jogo"
				value={value || ''}
				onChange={(val) => onChange(val || undefined)}
				options={uniqueOptions}
				style={{ textTransform: 'capitalize' }}
				aria-label="Filtrar histórico por jogo"
			/>
		</div>
	);
};
