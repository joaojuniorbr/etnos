export const QUERY_STALE_TIME = {
	default: 60_000,
	catalog: 5 * 60_000,
	gameAccess: 30_000,
} as const;

export const QUERY_GC_TIME = {
	catalog: 10 * 60_000,
} as const;
