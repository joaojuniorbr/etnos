import type { UserProfileInterface } from '@etnos/types';
import { getDistinctId, toMixpanelPeopleProperties } from '../user-profile';
import type { AnalyticsAppName, SignUpMethod } from '../types';
import { AnalyticsEvents } from '../events';
import { getCurrentAppName, getMixpanelWeb } from './client';

export const syncMixpanelUser = (
	user: UserProfileInterface | null | undefined,
	appName?: AnalyticsAppName,
) => {
	const client = getMixpanelWeb();

	if (!client || !user) {
		return;
	}

	const distinctId = getDistinctId(user);

	if (!distinctId) {
		return;
	}

	client.identify(distinctId);
	client.people.set(toMixpanelPeopleProperties(user));

	if (appName) {
		client.register({ app_name: appName });
	}
};

export const resetMixpanelUser = () => {
	const client = getMixpanelWeb();

	if (!client) {
		return;
	}

	client.reset();
};

export const trackMixpanelEvent = (
	eventName: string,
	properties?: Record<string, string | number | boolean | null | undefined>,
) => {
	const client = getMixpanelWeb();

	if (!client) {
		return;
	}

	client.track(eventName, {
		app_name: getCurrentAppName(),
		platform: 'web',
		...properties,
	});
};

export const trackSignUpCompleted = (
	user: UserProfileInterface,
	signUpMethod: SignUpMethod,
	appName?: AnalyticsAppName,
) => {
	syncMixpanelUser(user, appName);

	trackMixpanelEvent(AnalyticsEvents.signUpCompleted, {
		sign_up_method: signUpMethod,
		app_name: appName ?? getCurrentAppName(),
	});
};

export const trackCharacterSelected = (properties: {
	character_slug: string;
	character_name?: string;
}) => {
	trackMixpanelEvent(AnalyticsEvents.characterSelected, properties);
};

export const trackGameSelected = (properties: {
	game_slug: string;
	character_slug: string;
	game_name?: string;
}) => {
	trackMixpanelEvent(AnalyticsEvents.gameSelected, properties);
};

export const trackGameFinished = (properties: {
	game_slug: string;
	character_slug: string;
	score: number;
	outcome?: 'won' | 'lost';
}) => {
	trackMixpanelEvent(AnalyticsEvents.gameFinished, properties);
};

export const trackGameSessionCompleted = (properties: {
	game_slug: string;
	character_slug: string;
	score: number;
}) => {
	trackMixpanelEvent(AnalyticsEvents.gameSessionCompleted, properties);
};

export const trackPasswordRecoveryRequested = (properties?: {
	email_domain?: string;
}) => {
	trackMixpanelEvent(AnalyticsEvents.accountRecoveryRequested, properties);
};
