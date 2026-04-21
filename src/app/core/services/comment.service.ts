import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private firestore: Firestore) {}

  getComments(postId: string) {
    const ref = collection(this.firestore, `posts/${postId}/comments`);
    return collectionData(ref, { idField: 'id' });
  }
}