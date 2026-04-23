// import { UserRole } from './admin-user';

export interface SchoolGameAccessInterface {
	schoolId: string;
	enabledGameSlugs: string[];
	enabledCharacterSlugs: string[];
	hasCustomGames: boolean;
	hasCustomCharacters: boolean;
	canEdit: boolean;
	viewerRoles?: any[];
}

export interface UpdateSchoolGameAccessPayload {
	enabledGameSlugs: string[];
	enabledCharacterSlugs: string[];
}
