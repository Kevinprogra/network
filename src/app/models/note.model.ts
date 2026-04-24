export interface Note {
  id?: string;
  subject: string;
  score: number;
  teacherName?: string;
  classroom?: string;
  schedule?: string;
  semester?: number | null;
  period?: string;
  status?: string;
  source?: 'manual' | 'portal';
  syncKey?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface NotesSummary {
  totalSubjects: number;
  averageScore: number;
}

export interface NotesSyncState {
  enabled: boolean;
  lastStatus: 'idle' | 'pending' | 'success' | 'error';
  lastSyncedAt?: unknown;
  source?: string;
  lastImportedCount?: number;
  lastErrorMessage?: string;
  accumulatedAverage?: number | null;
}

export interface PortalSyncCredentials {
  username: string;
  password: string;
}

export interface PortalSyncResponse {
  notes: Array<
    Pick<Note, 'subject' | 'score' | 'teacherName' | 'semester' | 'period' | 'status'>
  >;
  accumulatedAverage?: number | null;
  syncedAt?: string;
}
