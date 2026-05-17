import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const API_URL = __ENV.API_URL || 'http://localhost:8080/api';
const LOAD_TEST_NAME = 'characters';
const LOAD_PROFILE = __ENV.LOAD_PROFILE || 'standard';
const FALLBACK_SLUGS = (__ENV.CHARACTER_SLUGS || 'anita,iara')
	.split(',')
	.map((slug) => slug.trim())
	.filter(Boolean);

const listDurationWarmup = new Trend('characters_list_ms_warmup', true);
const listDurationLoad = new Trend('characters_list_ms_load', true);
const detailDurationLoad = new Trend('characters_detail_ms_load', true);
const avatarsDurationLoad = new Trend('characters_avatars_ms_load', true);
const cacheLikelyHits = new Counter('characters_cache_likely_hits');

const profiles = {
	smoke: {
		warmup: { duration: '15s', vus: 3 },
		load: [
			{ duration: '20s', target: 15 },
			{ duration: '30s', target: 25 },
			{ duration: '10s', target: 0 },
		],
		thresholds: {
			http_req_duration: ['p(95)<800'],
			characters_list_ms_load: ['p(95)<500'],
		},
	},
	standard: {
		warmup: { duration: '45s', vus: 5 },
		load: [
			{ duration: '30s', target: 25 },
			{ duration: '1m', target: 50 },
			{ duration: '1m', target: 75 },
			{ duration: '1m', target: 75 },
			{ duration: '30s', target: 0 },
		],
		thresholds: {
			http_req_duration: ['p(95)<600'],
			characters_list_ms_load: ['p(95)<400'],
			characters_detail_ms_load: ['p(95)<500'],
			characters_avatars_ms_load: ['p(95)<500'],
		},
	},
	stress: {
		warmup: { duration: '45s', vus: 10 },
		load: [
			{ duration: '30s', target: 50 },
			{ duration: '1m', target: 100 },
			{ duration: '1m', target: 150 },
			{ duration: '1m', target: 150 },
			{ duration: '30s', target: 0 },
		],
		thresholds: {
			http_req_duration: ['p(95)<900'],
			characters_list_ms_load: ['p(95)<600'],
		},
	},
};

const activeProfile = profiles[LOAD_PROFILE] || profiles.standard;

export const options = {
	scenarios: {
		warmup_cache: {
			executor: 'constant-vus',
			vus: activeProfile.warmup.vus,
			duration: activeProfile.warmup.duration,
			exec: 'warmupCache',
			tags: { phase: 'warmup' },
		},
		sustained_reads: {
			executor: 'ramping-vus',
			startTime: activeProfile.warmup.duration,
			startVUs: 0,
			stages: activeProfile.load,
			exec: 'mixedReads',
			tags: { phase: 'load' },
		},
	},
	thresholds: {
		http_req_failed: ['rate<0.02'],
		...activeProfile.thresholds,
	},
};

export function setup() {
	const response = http.get(`${API_URL}/characters`, {
		headers: loadTestHeaders(),
		tags: { name: 'GET /characters (setup)' },
	});

	if (response.status !== 200) {
		console.warn(
			`setup: GET /characters retornou ${response.status}; usando slugs de fallback.`,
		);
		return { slugs: FALLBACK_SLUGS };
	}

	const characters = response.json();
	const slugs = Array.isArray(characters)
		? characters
				.map((character) => character.slug)
				.filter((slug) => typeof slug === 'string' && slug.length > 0)
		: [];

	if (!slugs.length) {
		return { slugs: FALLBACK_SLUGS };
	}

	return { slugs };
}

export function warmupCache() {
	const response = requestListCharacters('warmup');

	recordListDuration(response, listDurationWarmup);
	sleep(0.3);
}

export function mixedReads(data) {
	const roll = Math.random();
	const slugs = data.slugs?.length ? data.slugs : FALLBACK_SLUGS;

	if (roll < 0.7) {
		const response = requestListCharacters('load');
		recordListDuration(response, listDurationLoad);
		maybeCountCacheHit(response);
	} else if (roll < 0.9) {
		const slug = pickSlug(slugs);
		const response = requestCharacterDetail(slug);
		detailDurationLoad.add(response.timings.duration);
		maybeCountCacheHit(response);
	} else {
		const slug = pickSlug(slugs);
		const response = requestCharacterAvatars(slug);
		avatarsDurationLoad.add(response.timings.duration);
		maybeCountCacheHit(response);
	}

	sleep(0.2 + Math.random() * 0.5);
}

function requestListCharacters(phase) {
	const response = http.get(`${API_URL}/characters`, {
		headers: loadTestHeaders(),
		tags: { name: 'GET /characters', phase },
	});

	check(response, {
		'list status is 200': (res) => res.status === 200,
		'list returns array': (res) => Array.isArray(res.json()),
	});

	return response;
}

function requestCharacterDetail(slug) {
	const response = http.get(
		`${API_URL}/characters/${encodeURIComponent(slug)}`,
		{
			headers: loadTestHeaders(),
			tags: { name: 'GET /characters/:slug', phase: 'load' },
		},
	);

	check(response, {
		'detail status is 200': (res) => res.status === 200,
		'detail has slug': (res) => res.json('slug') === slug,
	});

	return response;
}

function requestCharacterAvatars(slug) {
	const response = http.get(
		`${API_URL}/characters/${encodeURIComponent(slug)}/avatars`,
		{
			headers: loadTestHeaders(),
			tags: { name: 'GET /characters/:slug/avatars', phase: 'load' },
		},
	);

	check(response, {
		'avatars status is 200': (res) => res.status === 200,
		'avatars returns array': (res) => Array.isArray(res.json()),
	});

	return response;
}

function loadTestHeaders() {
	return {
		'X-ETNOS-Load-Test': LOAD_TEST_NAME,
		Accept: 'application/json',
	};
}

function pickSlug(slugs) {
	return slugs[__ITER % slugs.length];
}

function recordListDuration(response, trend) {
	if (response.status === 200) {
		trend.add(response.timings.duration);
	}
}

function maybeCountCacheHit(response) {
	if (response.status === 200 && response.timings.duration < 120) {
		cacheLikelyHits.add(1);
	}
}

export function handleSummary(data) {
	const warmupList = data.metrics.characters_list_ms_warmup?.values || {};
	const loadList = data.metrics.characters_list_ms_load?.values || {};

	const summary = {
		profile: LOAD_PROFILE,
		apiUrl: API_URL,
		cacheObservation: {
			warmupListAvgMs: warmupList.avg ?? null,
			warmupListP95Ms: warmupList['p(95)'] ?? null,
			loadListAvgMs: loadList.avg ?? null,
			loadListP95Ms: loadList['p(95)'] ?? null,
			likelyCacheHits: data.metrics.characters_cache_likely_hits?.values?.count ?? 0,
			hint:
				'Com cache quente, a média/p95 de GET /characters na fase de carga tende a ficar bem menor que no warmup inicial.',
		},
	};

	console.log(
		`\n[characters load test] perfil=${LOAD_PROFILE} | warmup list p95=${summary.cacheObservation.warmupListP95Ms ?? 'n/a'}ms | load list p95=${summary.cacheObservation.loadListP95Ms ?? 'n/a'}ms | hits prováveis (<120ms)=${summary.cacheObservation.likelyCacheHits}\n`,
	);

	return {
		'results/characters-cache-observation.json': JSON.stringify(summary, null, 2),
	};
}
