export interface CharacterInterface {
	id: string;
	name: string;
	region: string;
	description: string;
	slug: string;
	imageUrl?: string;
	imageSuccessUrl?: string | null;
	imageErrorUrl?: string | null;
	avatarUrls?: string[];
}
