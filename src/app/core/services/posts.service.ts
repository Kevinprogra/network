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
import { Observable } from 'rxjs';

import { Post } from '../../models/post.model';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);

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

    if (!cleanContent) {
      throw new Error('Post content is empty.');
    }

    const postsRef = collection(this.firestore, 'posts');
    const authorName =
      currentUser.displayName?.trim() ||
      currentUser.email?.split('@')[0] ||
      'Usuario';

    await addDoc(postsRef, {
      authorId: currentUser.uid,
      authorName,
      authorRole: 'Comunidad academica',
      content: cleanContent,
      likesCount: 0,
      commentsCount: 0,
      createdAt: serverTimestamp(),
    });
  }
}
