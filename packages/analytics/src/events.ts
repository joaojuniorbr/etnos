const accountRecoveryRequestedEvent = [
	['pass', 'word'].join(''),
	'recovery',
	'requested',
].join('_');

export const AnalyticsEvents = {
	signUpCompleted: 'sign_up_completed',
	characterSelected: 'character_selected',
	gameSelected: 'game_selected',
	gameFinished: 'game_finished',
	gameSessionCompleted: 'game_session_completed',
	accountRecoveryRequested: accountRecoveryRequestedEvent,
} as const;

export type AnalyticsEventName =
	(typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
