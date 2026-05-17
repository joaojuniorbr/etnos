import type { UserProfileInterface } from '@etnos/types';
import { AnalyticsEvents } from '../events';
import { getDistinctId, toMixpanelPeopleProperties } from '../user-profile';
import type { SignUpMethod } from '../types';
import { getMixpanelNative, getNativeAppName } from './client';

export const syncMixpanelUserNative = async (
	user: UserProfileInterface | null | undefined,
) => {
	const client = getMixpanelNative();

	if (!client || !user) {
		return;
	}

	const distinctId = getDistinctId(user);

	if (!distinctId) {
		return;
	}

	await client.identify(distinctId);
	client.getPeople().set(toMixpanelPeopleProperties(user));
};

export const resetMixpanelUserNative = () => {
	const client = getMixpanelNative();

	if (!client) {
		return;
	}

	client.reset();
};

export const trackMixpanelEventNative = (
	eventName: string,
	properties?: Record<string, string | number | boolean | null | undefined>,
) => {
	const client = getMixpanelNative();

	if (!client) {
		return;
	}

	client.track(eventName, {
		app_name: getNativeAppName(),
		platform: 'mobile',
		...properties,
	});
};

export const trackSignUpCompletedNative = async (
	user: UserProfileInterface,
	signUpMethod: SignUpMethod,
) => {
	await syncMixpanelUserNative(user);
	trackMixpanelEventNative(AnalyticsEvents.signUpCompleted, {
		sign_up_method: signUpMethod,
	});
};

export const trackCharacterSelectedNative = async (properties: {
	character_slug: string;
	character_name?: string;
}) => {
	trackMixpanelEventNative(AnalyticsEvents.characterSelected, properties);
};

export const trackGameSelectedNative = async (properties: {
	game_slug: string;
	character_slug: string;
	game_name?: string;
}) => {
	trackMixpanelEventNative(AnalyticsEvents.gameSelected, properties);
};

export const trackGameFinishedNative = async (properties: {
	game_slug: string;
	character_slug: string;
	score: number;
	outcome?: 'won' | 'lost';
}) => {
	trackMixpanelEventNative(AnalyticsEvents.gameFinished, properties);
};

export const trackGameSessionCompletedNative = async (properties: {
	game_slug: string;
	character_slug: string;
	score: number;
}) => {
	trackMixpanelEventNative(AnalyticsEvents.gameSessionCompleted, properties);
};

export const trackPasswordRecoveryRequestedNative = async (properties?: {
	email_domain?: string;
}) => {
	trackMixpanelEventNative(
		AnalyticsEvents.accountRecoveryRequested,
		properties,
	);
};
