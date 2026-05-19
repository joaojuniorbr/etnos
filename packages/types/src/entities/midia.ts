/** Valor enviado à API para listar mídias sem pasta (`folder` null). */
export const MIDIA_UNCATEGORIZED_FOLDER = '__uncategorized__';

export interface MidiaInterface {
	id?: string;
	url: string;
	userId: string;
	folder?: string | null;
	path?: string;
	timestamp?: unknown;
	createdAt?: unknown;
}

export interface MidiaFolderSummary {
	folder: string;
	count: number;
}

export interface MidiaFoldersResponse {
	folders: MidiaFolderSummary[];
	uncategorizedCount: number;
}
