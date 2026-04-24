export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  faculty?: string;
  studyMode?: string;
  academicProgram?: string;
  accumulatedAverage?: number | null;
  interests?: string[];
  semester?: number | null;
  role?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}
