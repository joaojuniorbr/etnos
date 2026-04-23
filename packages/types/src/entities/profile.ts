export interface UserProfileInterface {
	uid: string;
	email?: string | null;
	id?: string;
	parentName?: string;
	childName?: string;
	childBirthDate?: string;
	parentPhone?: string;
	school?: string;
	updatedAt?: string;
	role?: string[];
	roles?: string[];
	isActive?: boolean;
	photoURL?: string | null;
	avatarCharacterSlug?: string | null;
	displayName?: string | null;
}
