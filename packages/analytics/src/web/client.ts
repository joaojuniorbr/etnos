import mixpanel from 'mixpanel-browser';
import { getMixpanelProjectToken } from '../config';
import type { AnalyticsAppName } from '../types';

let initialized = false;
let currentAppName: AnalyticsAppName = 'web';

/**
 * @param projectToken Passe `process.env.NEXT_PUBLIC_MIXPANEL_TOKEN` do app Next.
 *   O `.env.local` do app não é lido automaticamente dentro de pacotes do monorepo.
 */
export const initMixpanelWeb = (
	appName: AnalyticsAppName,
	projectToken?: string,
) => {
	if (initialized || globalThis.window === undefined) {
		return;
	}

	const token = projectToken?.trim() || getMixpanelProjectToken();

	if (!token) {
		return;
	}

	mixpanel.init(token, {
		debug: process.env.NODE_ENV !== 'production',
		track_pageview: true,
		persistence: 'localStorage',
	});

	mixpanel.register({
		app_name: appName,
		platform: 'web',
	});

	currentAppName = appName;
	initialized = true;
};

export const getMixpanelWeb = () => {
	if (!initialized) {
		return null;
	}

	return mixpanel;
};

export const getCurrentAppName = () => currentAppName;

export const resetMixpanelWeb = () => {
	const client = getMixpanelWeb();

	if (!client) {
		return;
	}

	client.reset();
};
