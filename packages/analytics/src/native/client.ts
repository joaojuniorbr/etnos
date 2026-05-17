import { Mixpanel } from 'mixpanel-react-native';
import { getMixpanelProjectToken, isMixpanelEnabled } from '../config';
import type { AnalyticsAppName } from '../types';

let mixpanel: Mixpanel | null = null;
let initPromise: Promise<void> | null = null;
let currentAppName: AnalyticsAppName = 'student-mobile';

export const initMixpanelNative = async (appName: AnalyticsAppName = 'student-mobile') => {
	if (initPromise) {
		return initPromise;
	}

	const token = getMixpanelProjectToken();

	if (!isMixpanelEnabled() || !token) {
		return;
	}

	initPromise = (async () => {
		mixpanel = new Mixpanel(token, true);
		await mixpanel.init();
		currentAppName = appName;
		mixpanel.registerSuperProperties({
			app_name: appName,
			platform: 'mobile',
		});
	})();

	return initPromise;
};

export const getMixpanelNative = () => mixpanel;

export const getNativeAppName = () => currentAppName;
