import http from 'k6/http';
import { check, sleep } from 'k6';

const API_URL = __ENV.API_URL || 'http://localhost:8080/api';

export const options = {
	stages: [
		{ duration: '30s', target: 10 },
		{ duration: '1m', target: 100 },
		{ duration: '30s', target: 50 },
		{ duration: '1m', target: 50 },
		{ duration: '30s', target: 0 },
	],
	thresholds: {
		http_req_duration: ['p(95)<600'],
		http_req_failed: ['rate<0.05'],
	},
};

export default function PublicSchools() {
	const response = http.get(`${API_URL}/public/schools`, {
		headers: {
			'X-ETNOS-Load-Test': 'public-schools',
		},
	});

	check(response, {
		'status is 200': (res) => res.status === 200,
		'response time is below 600ms': (res) => res.timings.duration < 600,
	});

	sleep(1);
}
