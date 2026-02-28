module.exports = {
	branches: ['main'],
	plugins: [
		[
			'@semantic-release/commit-analyzer',
			{
				preset: 'conventionalcommits',
				releaseRules: [
					{ type: 'docs', release: 'patch' },
					{ type: 'perf', release: 'patch' },
					{ type: 'style', release: 'patch' },
					{ type: 'refactor', release: 'patch' },
					{ type: 'ci', release: 'patch' },
					{ type: 'build', release: 'patch' },
				],
			},
		],
		[
			'@semantic-release/release-notes-generator',
			{
				preset: 'conventionalcommits',
				parserOpts: {
					mergePattern: /^Merge pull request #(\d+) from (.*)$/,
					mergeCorrespondence: ['id', 'source'],
				},
				writerOpts: {
					commitsSort: ['type', 'scope', 'subject'],
					transform: (commit) => {
						const typeToSection = {
							feat: '✨ Features (Novidades)',
							fix: '🐛 Bug Fixes (Correções)',
							perf: '⚡ Performance',
							refactor: '🔨 Refatoração',
							docs: '📝 Documentação',
							style: '🎨 Estilo/UI',
							chore: '⚙️ Manutenção',
							test: '✅ Testes',
							ci: '🧪 CI/CD',
							build: '🏗️ Build',
							merge: '🔀 Merges',
						};

						const normalizedCommit = { ...commit };

						if (normalizedCommit.merge) {
							normalizedCommit.type = 'merge';
						}

						if (!normalizedCommit.type) {
							return;
						}

						normalizedCommit.type =
							typeToSection[normalizedCommit.type] ?? normalizedCommit.type;

						return normalizedCommit;
					},
				},
			},
		],
		[
			'@semantic-release/changelog',
			{
				changelogFile: 'CHANGELOG.md',
			},
		],
		[
			'@semantic-release/npm',
			{
				npmPublish: false,
			},
		],
		[
			'@semantic-release/git',
			{
				assets: [
					'package.json',
					'CHANGELOG.md',
					'packages/**/package.json',
					'apps/**/package.json',
				],
				message: 'chore(release): ${nextRelease.version} [skip ci]',
			},
		],
		'@semantic-release/github',
	],
};
