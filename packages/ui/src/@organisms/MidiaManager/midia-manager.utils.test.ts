import { describe, expect, it } from 'vitest';
import { MIDIA_UNCATEGORIZED_FOLDER } from '@etnos/types';

import {
	buildFolderFilterOptions,
	filterFolderMoveOption,
	folderFilterToQuery,
	formatMidiaFolderLabel,
	MIDIA_ALL_FILTER,
} from './midia-manager.utils';

describe('midia-manager.utils', () => {
	it('monta opções de filtro apenas com todas quando não houver sem pasta', () => {
		const options = buildFolderFilterOptions([{ folder: 'library', count: 2 }], 0);

		expect(options).toEqual([
			{ value: MIDIA_ALL_FILTER, label: 'Todas as imagens' },
			{ value: 'library', label: 'library (2)' },
		]);
	});

	it('monta opções de filtro com todas e sem pasta', () => {
		const options = buildFolderFilterOptions(
			[{ folder: 'library', count: 2 }],
			3,
		);

		expect(options[0]).toEqual({
			value: MIDIA_ALL_FILTER,
			label: 'Todas as imagens',
		});
		expect(options[1]).toEqual({
			value: MIDIA_UNCATEGORIZED_FOLDER,
			label: 'Sem pasta (3)',
		});
		expect(options[2]).toEqual({
			value: 'library',
			label: 'library (2)',
		});
	});

	it('converte filtro para query da API', () => {
		expect(folderFilterToQuery(MIDIA_ALL_FILTER)).toBeUndefined();
		expect(folderFilterToQuery('library')).toBe('library');
		expect(folderFilterToQuery(MIDIA_UNCATEGORIZED_FOLDER)).toBe(
			MIDIA_UNCATEGORIZED_FOLDER,
		);
	});

	it('formata rótulo de pasta', () => {
		expect(formatMidiaFolderLabel(null)).toBe('Sem pasta');
		expect(formatMidiaFolderLabel('games')).toBe('games');
	});

	it('filtra opções de mover por nome da pasta', () => {
		expect(
			filterFolderMoveOption('lib', { label: 'library' }),
		).toBe(true);
		expect(
			filterFolderMoveOption('xyz', { label: 'library' }),
		).toBe(false);
		expect(filterFolderMoveOption('sem', { label: 'Sem pasta' })).toBe(true);
		expect(filterFolderMoveOption('sem', undefined)).toBe(false);
	});
});
