import type { StudentDashboardInterface } from '@etnos/types';
import type { GameCatalogEntry } from 'src/games/games.catalog';

type ScoreRow = { slug: string; characterSlug: string; score: number };
type SchoolScoreRow = ScoreRow & { userId: string };

export type StudentDashboardRawData = {
  profile: {
    firebaseUid: string;
    childName: string | null;
    parentName: string | null;
    email: string | null;
    schoolId: string | null;
  };
  characterSlug?: string;
  scores: ScoreRow[];
  history: Array<{
    id: string;
    gameSlug: string;
    characterSlug: string;
    score: number;
    startedAt: Date;
    endedAt: Date | null;
    status: string;
  }>;
  games: GameCatalogEntry[];
  enabledCharacterSlugs: string[];
  schoolUsers: Array<{
    firebaseUid: string;
    childName: string | null;
    parentName: string | null;
    email: string | null;
  }>;
  schoolScoresByUid: Map<string, number>;
  characters: Array<{
    id: string;
    slug: string;
    name: string;
    region: string;
    description: string;
    imageUrl: string | null;
  }>;
  covers: Map<string, string | null>;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getDisplayName(user: {
  childName: string | null;
  parentName: string | null;
  email: string | null;
}) {
  return user.childName || user.parentName || user.email || 'Estudante';
}

function playedPairs(scores: ScoreRow[]) {
  const pairs = new Set<string>();
  for (const row of scores) {
    if (row.score > 0) pairs.add(`${row.slug}:${row.characterSlug}`);
  }
  return pairs;
}

function totalScore(scores: ScoreRow[]) {
  const best = new Map<string, number>();
  for (const row of scores) {
    if (row.score <= 0) continue;
    best.set(
      row.characterSlug,
      Math.max(best.get(row.characterSlug) ?? 0, row.score),
    );
  }
  return [...best.values()].reduce((sum, value) => sum + value, 0);
}

export function totalScoreByUser(scores: SchoolScoreRow[]) {
  const byUser = new Map<string, ScoreRow[]>();
  for (const row of scores) {
    const list = byUser.get(row.userId) ?? [];
    list.push(row);
    byUser.set(row.userId, list);
  }
  const result = new Map<string, number>();
  for (const [userId, userScores] of byUser) {
    result.set(userId, totalScore(userScores));
  }
  return result;
}

function gamesCompleted(
  pairs: Set<string>,
  gameSlugs: string[],
  characterSlugs: string[],
) {
  return gameSlugs.filter((game) =>
    characterSlugs.every((character) => pairs.has(`${game}:${character}`)),
  ).length;
}

function classRank(
  uid: string,
  schoolId: string | null,
  users: StudentDashboardRawData['schoolUsers'],
  scoresByUid: Map<string, number>,
) {
  if (!schoolId) return null;
  const sorted = users
    .map((user) => ({
      uid: user.firebaseUid,
      score: scoresByUid.get(user.firebaseUid) ?? 0,
    }))
    .sort((a, b) => b.score - a.score);
  const index = sorted.findIndex((entry) => entry.uid === uid);
  return index >= 0 ? index + 1 : null;
}

function coverUrl(
  covers: Map<string, string | null>,
  gameSlug: string,
  characterSlug: string,
) {
  return covers.get(`${gameSlug}:${characterSlug}`) ?? null;
}

export function toStudentDashboard(
  data: StudentDashboardRawData,
): StudentDashboardInterface {
  const pairs = playedPairs(data.scores);

  const guide = data.characterSlug
    ? data.characters.find((c) => c.slug === data.characterSlug) ?? null
    : null;

  const characters = data.characters.map((character) => ({
    id: character.id,
    slug: character.slug,
    name: character.name,
    region: character.region,
    description: character.description,
    imageUrl: character.imageUrl ?? undefined,
  }));

  return {
    user: {
      name: getDisplayName(data.profile),
      totalScore: totalScore(data.scores),
      gamesCompleted: gamesCompleted(
        pairs,
        data.games.map((game) => game.slug),
        data.enabledCharacterSlugs,
      ),
      classRank: classRank(
        data.profile.firebaseUid,
        data.profile.schoolId,
        data.schoolUsers,
        data.schoolScoresByUid,
      ),
      schoolStudentsCount: data.schoolUsers.length,
    },
    culturalGuide: guide
      ? {
          id: guide.id,
          slug: guide.slug,
          name: guide.name,
          region: guide.region,
          description: guide.description,
          imageUrl: guide.imageUrl ?? undefined,
        }
      : null,
    characters,
    classRanking: data.schoolUsers
      .map((user) => ({
        uid: user.firebaseUid,
        name: getDisplayName(user),
        score: data.schoolScoresByUid.get(user.firebaseUid) ?? 0,
      }))
      .sort(
        (a, b) => b.score - a.score || a.name.localeCompare(b.name, 'pt-BR'),
      )
      .slice(0, 5)
      .map((entry, index) => ({
        rank: index + 1,
        initials: getInitials(entry.name),
        name: entry.name,
        score: entry.score,
        isCurrentUser: entry.uid === data.profile.firebaseUid,
      })),
    availableGames: data.games.map((game) => ({
      slug: game.slug,
      name: game.name,
      coverUrl: guide ? coverUrl(data.covers, game.slug, guide.slug) : null,
    })),
    recentActivity: data.history
      .filter((row) => row.status === 'completed' && row.score > 0)
      .slice(0, 5)
      .map((row) => ({
        id: row.id,
        description: `Pontuou no ${
          data.games.find((game) => game.slug === row.gameSlug)?.name ??
          row.gameSlug
        }`,
        highlight: `+${row.score}`,
        gameSlug: row.gameSlug,
        characterSlug: row.characterSlug,
        timestamp: (row.endedAt ?? row.startedAt).toISOString(),
        points: row.score,
        coverUrl: coverUrl(data.covers, row.gameSlug, row.characterSlug),
      })),
  };
}
