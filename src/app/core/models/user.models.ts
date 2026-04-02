export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  academicProgram?: string;
  avatarUrl?: string;
  semester?: number;
  bio?: string;
  interests?: string[];
  role: 'estudiante' | 'profesor';
  createdAt: any;
}

