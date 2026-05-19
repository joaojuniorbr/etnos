import {
	MIDIA_UNCATEGORIZED_FOLDER,
	type MidiaFolderSummary,
} from '@etnos/types';

export const MIDIA_ALL_FILTER = '__all__';

export function buildFolderFilterOptions(
	folders: MidiaFolderSummary[],
	uncategorizedCount: number,
) {
	const options: { value: string; label: string }[] = [
		{ value: MIDIA_ALL_FILTER, label: 'Todas as imagens' },
	];

	if (uncategorizedCount > 0) {
		options.push({
			value: MIDIA_UNCATEGORIZED_FOLDER,
			label: `Sem pasta (${uncategorizedCount})`,
		});
	}

	for (const item of folders) {
		options.push({
			value: item.folder,
			label: `${item.folder} (${item.count})`,
		});
	}

	return options;
}

export function folderFilterToQuery(filter: string | undefined) {
	if (!filter || filter === MIDIA_ALL_FILTER) {
		return undefined;
	}

	return filter;
}

export function formatMidiaFolderLabel(folder?: string | null) {
	if (!folder) {
		return 'Sem pasta';
	}

	return folder;
}

export function filterFolderMoveOption(
	input: string,
	option?: { label?: unknown },
) {
	return String(option?.label).toLowerCase().includes(input.toLowerCase());
}
