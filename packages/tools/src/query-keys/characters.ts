export const characterKeys = {
	all: () => ['characters', 'all'] as const,
	filter: (slug: string) => ['characters', 'filter', slug] as const,
	detail: (slug: string) => ['characters', 'detail', slug] as const,
	avatars: (slug: string) => ['characters', slug, 'avatars'] as const,
	selected: (slug?: string) => ['characters', 'selected', slug] as const,
};
