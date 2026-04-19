import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  orderBy,
  query,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Observable, firstValueFrom } from 'rxjs';

import { Post } from '../../models/post.model';
import { ProfileService } from './profile.service';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);
  private readonly profileService = inject(ProfileService);

  getFeed(): Observable<Post[]> {
    const postsRef = collection(this.firestore, 'posts');
    const postsQuery = query(postsRef, orderBy('createdAt', 'desc'));

    return collectionData(postsQuery, { idField: 'id' }) as Observable<Post[]>;
  }

  async createPost(content: string): Promise<void> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user available.');
    }

    const cleanContent = content.trim();
    const profile = await firstValueFrom(this.profileService.getCurrentProfile());

    if (!cleanContent) {
      throw new Error('Post content is empty.');
    }

    const postsRef = collection(this.firestore, 'posts');
    const authorName =
      profile?.displayName?.trim() ||
      currentUser.displayName?.trim() ||
      currentUser.email?.split('@')[0] ||
      'Usuario';

    await addDoc(postsRef, {
      authorId: currentUser.uid,
      authorName,
      authorAvatarUrl: profile?.avatarUrl ?? '',
      authorRole: 'Comunidad academica',
      content: cleanContent,
      likesCount: 0,
      commentsCount: 0,
      createdAt: serverTimestamp(),
    });
  }
}
