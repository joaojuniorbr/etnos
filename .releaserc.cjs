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
	revert: '⏪ Reverts',
	merge: '🔀 Merges',
};

const sectionOrder = Object.values(typeToSection);

module.exports = {
	branches: ['main'],
	plugins: [
		[
			'@semantic-release/commit-analyzer',
			{
				preset: 'angular',
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
				preset: 'angular',
				parserOpts: {
					mergePattern: /^Merge pull request #(\d+) from (.*)$/,
					mergeCorrespondence: ['id', 'source'],
				},
				writerOpts: {
					// We build custom nested groups (scope -> type) in finalizeContext.
					groupBy: false,
					commitsSort: ['scopeTitle', 'typeTitle', 'subject'],
					mainTemplate: `{{> header}}

{{#each scopedGroups}}
### {{scope}}

{{#each typeGroups}}
#### {{type}}

{{#each commits}}
{{> commit root=@root}}
{{/each}}

{{/each}}
{{/each}}
{{> footer}}
`,
					transform: (commit) => {
						const normalizedCommit = { ...commit };

						if (normalizedCommit.merge) {
							normalizedCommit.type = 'merge';
						}

						if (!normalizedCommit.type) {
							return;
						}

						if (typeof normalizedCommit.hash === 'string') {
							normalizedCommit.shortHash = normalizedCommit.hash.substring(0, 7);
						}

						normalizedCommit.typeTitle =
							typeToSection[normalizedCommit.type] ?? normalizedCommit.type;
						normalizedCommit.scopeTitle = normalizedCommit.scope || 'geral';
						normalizedCommit.scope = '';

						return normalizedCommit;
					},
					finalizeContext: (context, _options, filteredCommits) => {
						const scopeGroupsMap = new Map();

						for (const commit of filteredCommits) {
							const scope = commit.scopeTitle || 'geral';
							const type = commit.typeTitle || 'Outros';

							if (!scopeGroupsMap.has(scope)) {
								scopeGroupsMap.set(scope, new Map());
							}

							const typeGroupsMap = scopeGroupsMap.get(scope);

							if (!typeGroupsMap.has(type)) {
								typeGroupsMap.set(type, []);
							}

							typeGroupsMap.get(type).push(commit);
						}

						const scopedGroups = Array.from(scopeGroupsMap.entries())
							.map(([scope, typeGroupsMap]) => {
								const typeGroups = Array.from(typeGroupsMap.entries())
									.map(([type, commits]) => ({ type, commits }))
									.sort((a, b) => {
										const indexA = sectionOrder.indexOf(a.type);
										const indexB = sectionOrder.indexOf(b.type);
										return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
									});

								return { scope, typeGroups };
							})
							.sort((a, b) => a.scope.localeCompare(b.scope, 'pt-BR'));

						return { ...context, scopedGroups };
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
