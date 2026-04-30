export interface UserProfileInterface {
	uid: string;
	email?: string | null;
	id?: string;
	parentName?: string;
	childName?: string;
	childBirthDate?: string;
	parentPhone?: string;
	school?: string;
	schoolName?: string;
	updatedAt?: string;
	role?: string[];
	roles?: string[];
	isActive?: boolean;
	notificationsEnabled?: boolean;
	hasPushToken?: boolean;
	expoPushToken?: string | null;
	photoURL?: string | null;
	avatarCharacterSlug?: string | null;
	displayName?: string | null;
}
