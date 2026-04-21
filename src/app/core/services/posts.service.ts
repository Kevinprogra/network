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
  doc,
  updateDoc,
  increment
} from '@angular/fire/firestore';

import { Observable, firstValueFrom } from 'rxjs';

import { Post } from '../../models/post.model';
import { ProfileService } from './profile.service';
import { CommentService } from './comment.service';

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



  commentsByPost: any = {};

constructor(private commentService: CommentService) {}





  getComments(postId: string): Observable<any[]> {
    const commentsRef = collection(
      this.firestore,
      `posts/${postId}/comments`
    );

    const q = query(commentsRef, orderBy('createdAt', 'asc'));

    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  async addComment(postId: string, text: string): Promise<void> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user.');
    }

    const cleanText = text.trim();
    if (!cleanText) return;

    const profile = await firstValueFrom(
      this.profileService.getCurrentProfile()
    );

    const commentsRef = collection(
      this.firestore,
      `posts/${postId}/comments`
    );

    const authorName =
      profile?.displayName ||
      currentUser.displayName ||
      currentUser.email?.split('@')[0] ||
      'Usuario';

    try {
      await addDoc(commentsRef, {
        authorId: currentUser.uid,
        authorName,
        text: cleanText,
        createdAt: serverTimestamp(),
      });

      console.log('si me gusrda el comentario');

      const postRef = doc(this.firestore, `posts/${postId}`);
      await updateDoc(postRef, {
        commentsCount: increment(1)
      });

    } catch (error) {
      console.error('errrrrororoorr', error);
      throw error;
    }
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

    const profile = await firstValueFrom(
      this.profileService.getCurrentProfile()
    );

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