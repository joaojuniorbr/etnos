'use client';

import { useEffect } from 'react';
import type { AnalyticsAppName } from '../types';
import { initMixpanelWeb } from './client';

type MixpanelProviderProps = {
	appName: AnalyticsAppName;
	/** Passe `process.env.NEXT_PUBLIC_MIXPANEL_TOKEN` do app Next */
	projectToken?: string;
	children: React.ReactNode;
};

export const MixpanelProvider = ({
	appName,
	projectToken,
	children,
}: MixpanelProviderProps) => {
	useEffect(() => {
		initMixpanelWeb(appName, projectToken);
	}, [appName, projectToken]);

	return children;
};
