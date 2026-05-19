import type { ReactNode } from 'react';

const noop = () => undefined;

export const trackCharacterSelected = noop;
export const trackGameFinished = noop;
export const trackGameSelected = noop;
export const trackGameSessionCompleted = noop;
export const trackMixpanelEvent = noop;
export const trackPasswordRecoveryRequested = noop;
export const trackSignUpCompleted = noop;
export const resetMixpanelUser = noop;
export const syncMixpanelUser = noop;
export const initMixpanelWeb = noop;
export const resetMixpanelWeb = noop;
export const getMixpanelWeb = () => null;
export const getCurrentAppName = () => 'storybook';

export function MixpanelProvider({ children }: { children: ReactNode }) {
	return children;
}
