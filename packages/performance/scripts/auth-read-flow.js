import http from 'k6/http';
import { check, fail, sleep } from 'k6';

const API_URL = __ENV.API_URL || 'http://localhost:8080/api';
const LOAD_TEST_NAME = 'auth-read-flow';
const USERS = parseUsers();
let authSession;

export const options = {
	stages: [
		{ duration: '30s', target: 10 },
		{ duration: '1m', target: 50 },
		{ duration: '30s', target: 0 },
	],
	thresholds: {
		http_req_duration: ['p(95)<800'],
		http_req_failed: ['rate<0.05'],
		'http_req_duration{name:POST /auth/login}': ['p(95)<1200'],
		'http_req_duration{name:GET /auth/profile}': ['p(95)<800'],
		'http_req_duration{name:GET /schools/me/game-access}': ['p(95)<800'],
		'http_req_duration{name:GET /characters?slug}': ['p(95)<800'],
	},
};

export function setup() {
	if (!USERS.length) {
		fail(
			'Informe AUTH_USERS_JSON ou AUTH_EMAIL/AUTH_PASSWORD para rodar o teste autenticado.',
		);
	}

	return { users: USERS };
}

export default function AuthReadFlow(data) {
	authSession ||= createAuthSession(data.users);

	const authHeaders = {
		Authorization: `Bearer ${authSession.idToken}`,
		'X-ETNOS-Load-Test': LOAD_TEST_NAME,
	};

	const profileResponse = http.get(`${API_URL}/auth/profile`, {
		headers: authHeaders,
		tags: { name: 'GET /auth/profile' },
	});

	check(profileResponse, {
		'profile status is 200': (res) => res.status === 200,
		'profile response time is below 800ms': (res) =>
			res.timings.duration < 800,
	});

	const gameAccessResponse = http.get(`${API_URL}/schools/me/game-access`, {
		headers: authHeaders,
		tags: { name: 'GET /schools/me/game-access' },
	});

	check(gameAccessResponse, {
		'game access status is 200': (res) => res.status === 200,
		'game access returned enabled characters': (res) =>
			Array.isArray(res.json('enabledCharacterSlugs')),
		'game access response time is below 800ms': (res) =>
			res.timings.duration < 800,
	});

	const enabledCharacterSlugs =
		gameAccessResponse.json('enabledCharacterSlugs') || [];
	const characterSlug =
		enabledCharacterSlugs[__ITER % Math.max(enabledCharacterSlugs.length, 1)];

	if (characterSlug) {
		const characterResponse = http.get(
			`${API_URL}/characters?slug=${encodeURIComponent(characterSlug)}`,
			{
				headers: authHeaders,
				tags: { name: 'GET /characters?slug' },
			},
		);

		check(characterResponse, {
			'character status is 200': (res) => res.status === 200,
			'character response is an array': (res) => Array.isArray(res.json()),
			'character response time is below 800ms': (res) =>
				res.timings.duration < 800,
		});
	}

	sleep(1);
}

function createAuthSession(users) {
	const user = users[(__VU - 1) % users.length];
	const loginResponse = login(user);
	const idToken = loginResponse.json('idToken');

	if (!idToken) {
		fail('Login nao retornou idToken.');
	}

	return { idToken };
}

function login(user) {
	const response = http.post(
		`${API_URL}/auth/login`,
		JSON.stringify({
			email: user.email,
			password: user.password,
		}),
		{
			headers: {
				'Content-Type': 'application/json',
				'X-ETNOS-Load-Test': LOAD_TEST_NAME,
			},
			tags: { name: 'POST /auth/login' },
		},
	);

	check(response, {
		'login status is 201': (res) => res.status === 201,
		'login returned idToken': (res) => Boolean(res.json('idToken')),
		'login response time is below 1200ms': (res) =>
			res.timings.duration < 1200,
	});

	return response;
}

function parseUsers() {
	if (__ENV.AUTH_USERS_JSON) {
		const users = JSON.parse(__ENV.AUTH_USERS_JSON);

		if (!Array.isArray(users)) {
			fail('AUTH_USERS_JSON deve ser um array JSON.');
		}

		return users;
	}

	if (__ENV.AUTH_EMAIL && __ENV.AUTH_PASSWORD) {
		return [
			{
				email: __ENV.AUTH_EMAIL,
				password: __ENV.AUTH_PASSWORD,
			},
		];
	}

	return [];
}
