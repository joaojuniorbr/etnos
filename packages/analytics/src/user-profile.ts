import type { UserProfileInterface } from '@etnos/types';

export const getDistinctId = (user: UserProfileInterface) =>
	user.uid || user.id || null;

export const toMixpanelPeopleProperties = (user: UserProfileInterface) => {
	const properties: Record<string, string | boolean | string[]> = {};

	if (user.email) {
		properties.$email = user.email;
	}

	const displayName = user.childName || user.parentName;

	if (displayName) {
		properties.$name = displayName;
	}

	if (user.school) {
		properties.school_id = user.school;
	}

	if (user.schoolName) {
		properties.school_name = user.schoolName;
	}

	if (user.role?.length) {
		properties.roles = user.role;
	}

	return properties;
};
