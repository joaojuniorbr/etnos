export interface SchoolUserInterface {
  id?: string;
  uid: string;
  email?: string | null;
  parentName?: string | null;
  childName?: string | null;
  school?: string | null;
  roles?: string[];
  updatedAt?: string | Date;
}
