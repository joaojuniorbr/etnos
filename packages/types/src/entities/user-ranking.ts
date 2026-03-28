export interface UserRankingInterface {
  position: number;
  uid: string;
  userId?: string;
  email?: string | null;
  parentName?: string | null;
  childName?: string | null;
  school?: string | null;
  gameSlug: string | null;
  totalScore: number;
}
