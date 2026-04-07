import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  docData,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';

import { Conversation } from '../../models/conversation.model';
import { Message } from '../../models/message.model';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);

  getConversationFeed(): Observable<Conversation[]> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      return of([]);
    }

    const conversationsRef = collection(this.firestore, 'conversations');
    const conversationsQuery = query(
      conversationsRef,
      where('participants', 'array-contains', currentUser.uid),
    );

    return collectionData(conversationsQuery, { idField: 'id' }) as Observable<Conversation[]>;
  }

  getMessages(conversationId: string): Observable<Message[]> {
    const messagesRef = collection(this.firestore, 'conversations', conversationId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));

    return collectionData(messagesQuery, { idField: 'id' }) as Observable<Message[]>;
  }

  getConversation(conversationId: string): Observable<Conversation | undefined> {
    const conversationRef = doc(this.firestore, 'conversations', conversationId);
    return docData(conversationRef, { idField: 'id' }) as Observable<Conversation | undefined>;
  }

  async sendMessage(conversationId: string, text: string): Promise<void> {
    const currentUser = this.auth.currentUser;
    const cleanText = text.trim();

    if (!currentUser) {
      throw new Error('No authenticated user available.');
    }

    if (!cleanText) {
      throw new Error('Message is empty.');
    }

    const conversationRef = doc(this.firestore, 'conversations', conversationId);
    const messagesRef = collection(this.firestore, 'conversations', conversationId, 'messages');

    await addDoc(messagesRef, {
      senderId: currentUser.uid,
      text: cleanText,
      type: 'text',
      createdAt: serverTimestamp(),
    });

    await setDoc(
      conversationRef,
      {
        lastMessage: cleanText,
        lastMessageSenderId: currentUser.uid,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  async createDirectConversation(input: {
    otherUserId: string;
    otherUserName: string;
    otherUserAvatarUrl?: string;
    otherUserRole?: string;
    currentUserName: string;
    currentUserAvatarUrl?: string;
    currentUserRole?: string;
  }): Promise<string> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user available.');
    }

    const conversationsRef = collection(this.firestore, 'conversations');
    const existingQuery = query(
      conversationsRef,
      where('type', '==', 'direct'),
      where('participants', 'array-contains', currentUser.uid),
      limit(25),
    );
    const existingSnapshot = await getDocs(existingQuery);
    const existingConversation = existingSnapshot.docs.find((conversationDoc) => {
      const data = conversationDoc.data() as Conversation;
      return data.participants.includes(input.otherUserId);
    });

    if (existingConversation) {
      return existingConversation.id;
    }

    const newConversationRef = doc(conversationsRef);

    await setDoc(newConversationRef, {
      type: 'direct',
      participants: [currentUser.uid, input.otherUserId],
      participantNames: [input.currentUserName, input.otherUserName],
      participantAvatarUrls: [input.currentUserAvatarUrl ?? '', input.otherUserAvatarUrl ?? ''],
      participantRoles: [input.currentUserRole ?? 'Usuario', input.otherUserRole ?? 'Usuario'],
      lastMessage: '',
      unreadCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return newConversationRef.id;
  }
}
