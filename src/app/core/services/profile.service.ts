import { Injectable, inject } from '@angular/core';
import { Auth, updateProfile } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  query,
  serverTimestamp,
  setDoc,
} from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { Observable, map, of } from 'rxjs';

import { UserProfile } from '../../models/user-profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);
  private readonly storage = inject(Storage);

  getCurrentProfile(): Observable<UserProfile | undefined> {
    const uid = this.auth.currentUser?.uid;

    if (!uid) {
      return of(undefined);
    }

    const profileRef = doc(this.firestore, 'profiles', uid);
    return docData(profileRef) as Observable<UserProfile | undefined>;
  }

  getAvailableProfiles(): Observable<UserProfile[]> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      return of([]);
    }

    const profilesRef = collection(this.firestore, 'profiles');
    const profilesQuery = query(profilesRef);

    return (collectionData(profilesQuery, { idField: 'uid' }) as Observable<UserProfile[]>).pipe(
      map((profiles) => profiles.filter((profile) => profile.uid !== currentUser.uid)),
    );
  }

  getAllProfiles(): Observable<UserProfile[]> {
    const profilesRef = collection(this.firestore, 'profiles');
    const profilesQuery = query(profilesRef);

    return collectionData(profilesQuery, { idField: 'uid' }) as Observable<UserProfile[]>;
  }

  getProfileById(uid: string): Observable<UserProfile | undefined> {
    if (!uid) {
      return of(undefined);
    }

    const profileRef = doc(this.firestore, 'profiles', uid);
    return docData(profileRef, { idField: 'uid' }) as Observable<UserProfile | undefined>;
  }

  async updateCurrentProfile(profile: Partial<UserProfile>): Promise<void> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user available.');
    }

    const normalizedDisplayName =
      profile.displayName?.trim() ||
      currentUser.displayName?.trim() ||
      currentUser.email?.split('@')[0] ||
      'Usuario';
    const normalizedSemester =
      typeof profile.semester === 'number' && profile.semester >= 1
        ? Math.floor(profile.semester)
        : null;
    const profileRef = doc(this.firestore, 'profiles', currentUser.uid);

    if (currentUser.displayName !== normalizedDisplayName) {
      await updateProfile(currentUser, { displayName: normalizedDisplayName });
    }

    await setDoc(
      profileRef,
      {
        uid: currentUser.uid,
        email: currentUser.email ?? '',
        displayName: normalizedDisplayName,
        bio: profile.bio ?? '',
        avatarUrl: profile.avatarUrl ?? '',
        faculty: profile.faculty ?? '',
        studyMode: profile.studyMode ?? '',
        academicProgram: profile.academicProgram ?? '',
        interests: profile.interests ?? [],
        semester: normalizedSemester,
        role: profile.role ?? 'estudiante',
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  async uploadAvatar(file: File): Promise<string> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user available.');
    }

    const storageRef = ref(
      this.storage,
      `avatars/${currentUser.uid}/${Date.now()}-${file.name}`,
    );

    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);

    await this.updateCurrentProfile({ avatarUrl: downloadUrl });

    return downloadUrl;
  }
}
