import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, docData, serverTimestamp, setDoc } from '@angular/fire/firestore';
import { Observable, map, of } from 'rxjs';

import { NotesSyncState } from '../../models/note.model';

@Injectable({
  providedIn: 'root',
})
export class NotesSyncService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);

  getCurrentSyncState(): Observable<NotesSyncState> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      return of({
        enabled: false,
        lastStatus: 'idle',
        source: 'Portal institucional',
      });
    }

    const profileRef = doc(this.firestore, 'profiles', currentUser.uid);

    return docData(profileRef).pipe(map(mapProfileToSyncState));
  }

  async setSyncEnabled(enabled: boolean): Promise<void> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user available.');
    }

    const profileRef = doc(this.firestore, 'profiles', currentUser.uid);

    await setDoc(
      profileRef,
      {
        notesSyncEnabled: enabled,
        notesSyncSource: 'Portal institucional',
        notesSyncUpdatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  async requestPortalSync(): Promise<void> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user available.');
    }

    const profileRef = doc(this.firestore, 'profiles', currentUser.uid);

    await setDoc(
      profileRef,
      {
        notesSyncEnabled: true,
        notesSyncSource: 'Portal institucional',
        notesSyncStatus: 'pending',
        notesSyncErrorMessage: '',
        notesSyncRequestedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  async markSyncSuccess(importedCount: number, accumulatedAverage?: number | null): Promise<void> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user available.');
    }

    const profileRef = doc(this.firestore, 'profiles', currentUser.uid);

    await setDoc(
      profileRef,
      {
        notesSyncStatus: 'success',
        notesLastSyncedAt: serverTimestamp(),
        notesImportedCount: importedCount,
        accumulatedAverage:
          typeof accumulatedAverage === 'number' && Number.isFinite(accumulatedAverage)
            ? accumulatedAverage
            : null,
        notesSyncErrorMessage: '',
      },
      { merge: true },
    );
  }

  async markSyncError(message: string): Promise<void> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user available.');
    }

    const profileRef = doc(this.firestore, 'profiles', currentUser.uid);

    await setDoc(
      profileRef,
      {
        notesSyncStatus: 'error',
        notesSyncErrorMessage: message,
        notesSyncUpdatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProfileToSyncState(profile: any): NotesSyncState {
  return {
    enabled: Boolean(profile?.notesSyncEnabled),
    lastStatus: (profile?.notesSyncStatus as NotesSyncState['lastStatus']) || 'idle',
    lastSyncedAt: profile?.notesLastSyncedAt,
    source: profile?.notesSyncSource || 'Portal institucional',
    lastImportedCount: profile?.notesImportedCount ?? 0,
    lastErrorMessage: profile?.notesSyncErrorMessage || '',
    accumulatedAverage:
      typeof profile?.accumulatedAverage === 'number' ? profile.accumulatedAverage : null,
  };
}
