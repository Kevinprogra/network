import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  writeBatch,
} from '@angular/fire/firestore';
import { Observable, map, of } from 'rxjs';

import { Note, NotesSummary } from '../../models/note.model';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);

  getCurrentUserNotes(): Observable<Note[]> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      return of([]);
    }

    const notesRef = collection(this.firestore, 'profiles', currentUser.uid, 'notes');

    return (collectionData(notesRef, { idField: 'id' }) as Observable<Note[]>).pipe(
      map((notes) =>
        [...notes].sort((left, right) => left.subject.localeCompare(right.subject, 'es')),
      ),
    );
  }

  getCurrentUserNotesSummary(): Observable<NotesSummary> {
    return this.getCurrentUserNotes().pipe(
      map((notes) => {
        const validScores = notes
          .map((note) => Number(note.score))
          .filter((score) => Number.isFinite(score) && score > 0);
        const totalSubjects = notes.length;
        const averageScore =
          validScores.length > 0
            ? Number(
                (validScores.reduce((total, score) => total + score, 0) / validScores.length).toFixed(
                  1,
                ),
              )
            : 0;

        return {
          totalSubjects,
          averageScore,
        };
      }),
    );
  }

  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user available.');
    }

    const notesRef = collection(this.firestore, 'profiles', currentUser.uid, 'notes');

    await addDoc(notesRef, {
      subject: note.subject.trim(),
      score: Number(note.score),
      teacherName: note.teacherName?.trim() ?? '',
      classroom: note.classroom?.trim() ?? '',
      schedule: note.schedule?.trim() ?? '',
      semester: note.semester ?? null,
      period: note.period?.trim() ?? '',
      status: note.status?.trim() ?? '',
      source: note.source ?? 'manual',
      syncKey: note.syncKey ?? '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async updateNote(
    noteId: string,
    note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<void> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user available.');
    }

    const noteRef = doc(this.firestore, 'profiles', currentUser.uid, 'notes', noteId);

    await setDoc(
      noteRef,
      {
        subject: note.subject.trim(),
        score: Number(note.score),
        teacherName: note.teacherName?.trim() ?? '',
        classroom: note.classroom?.trim() ?? '',
        schedule: note.schedule?.trim() ?? '',
        semester: note.semester ?? null,
        period: note.period?.trim() ?? '',
        status: note.status?.trim() ?? '',
        source: note.source ?? 'manual',
        syncKey: note.syncKey ?? '',
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  async upsertSyncedNotes(
    notes: Array<
      Pick<
        Note,
        'subject' | 'score' | 'teacherName' | 'classroom' | 'schedule' | 'semester' | 'period' | 'status'
      >
    >,
  ): Promise<void> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user available.');
    }

    const batch = writeBatch(this.firestore);

    notes.forEach((note) => {
      const syncKey = this.createSyncKey(note.subject, note.period, note.semester);
      const noteRef = doc(this.firestore, 'profiles', currentUser.uid, 'notes', syncKey);

      batch.set(
        noteRef,
        {
          subject: note.subject.trim(),
          score: Number(note.score),
          teacherName: note.teacherName?.trim() ?? '',
          classroom: note.classroom?.trim() ?? '',
          schedule: note.schedule?.trim() ?? '',
          semester: note.semester ?? null,
          period: note.period?.trim() ?? '',
          status: note.status?.trim() ?? '',
          source: 'portal',
          syncKey,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );
    });

    await batch.commit();
  }

  private createSyncKey(subject: string, period?: string, semester?: number | null): string {
    const normalizedSubject = subject
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const normalizedPeriod = (period ?? `sem-${semester ?? 'na'}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return `${normalizedSubject}-${normalizedPeriod}`;
  }

  async deleteNote(noteId: string): Promise<void> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user available.');
    }

    const noteRef = doc(this.firestore, 'profiles', currentUser.uid, 'notes', noteId);
    await deleteDoc(noteRef);
  }
}
