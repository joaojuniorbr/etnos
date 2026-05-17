export const CacheKeys = {
  schoolsAll: () => 'catalog:schools:all',
  characterSlugs: () => 'catalog:character-slugs',
  charactersAll: () => 'catalog:characters:all',
  charactersFilter: (slug: string) => `catalog:characters:filter:${slug}`,
  characterDetail: (slug: string) => `catalog:character:${slug}`,
  characterAvatars: (slug: string) => `catalog:character-avatars:${slug}`,
  gameConfigsAll: () => 'catalog:game-configs:all',
  gameConfigsByGame: (gameSlug: string) =>
    `catalog:game-configs:game:${gameSlug}`,
  gameConfig: (gameSlug: string, characterSlug: string) =>
    `catalog:game-config:${gameSlug}:${characterSlug}`,
  schoolEnabledAccess: (schoolId: string) =>
    `school:enabled-access:${schoolId}`,
  schoolGameAccess: (schoolId: string, rolesKey: string) =>
    `school:game-access:${schoolId}:${rolesKey}`,
  myGameAccess: (firebaseUid: string) => `school:my-game-access:${firebaseUid}`,
} as const;

export const CachePrefixes = {
  schoolGameAccess: 'school:game-access:',
  schoolEnabledAccess: 'school:enabled-access:',
  myGameAccess: 'school:my-game-access:',
  characters: 'catalog:characters:',
  gameConfigs: 'catalog:game-config',
} as const;
