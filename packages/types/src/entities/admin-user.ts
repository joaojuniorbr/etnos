export type UserRole = 'admin' | 'school' | 'student' | 'teacher';

export interface AdminUserInterface {
	id: string;
	uid: string;
	email?: string | null;
	parentName?: string | null;
	childName?: string | null;
	school?: string | null;
	schoolName?: string | null;
	roles: UserRole[];
	isActive: boolean;
	hasPushToken?: boolean;
	expoPushToken?: string | null;
	notificationsEnabled?: boolean;
	createdAt: string | Date;
	updatedAt: string | Date;
}

export interface UpdateAdminUserPayload {
	roles?: UserRole[];
	school?: string | null;
	isActive?: boolean;
}
