const readFirstEnv = (keys: string[]): string | undefined => {
	for (const key of keys) {
		const value = process.env[key]?.trim();

		if (value) {
			return value;
		}
	}

	return undefined;
};

/** Token do projeto Mixpanel (client-side). Lê `NEXT_PUBLIC_*` (web) ou `EXPO_PUBLIC_*` (mobile). */
export const getMixpanelProjectToken = (): string | undefined =>
	readFirstEnv(['NEXT_PUBLIC_MIXPANEL_TOKEN', 'EXPO_PUBLIC_MIXPANEL_TOKEN']);

export const isMixpanelEnabled = (): boolean =>
	Boolean(getMixpanelProjectToken());
