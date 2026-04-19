import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import {
  IonAvatar,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonSpinner,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { ellipse, sendOutline } from 'ionicons/icons';
import { combineLatest, map, of, switchMap } from 'rxjs';

import { MessagesService } from '../../core/services/messages.service';
import { ProfileService } from '../../core/services/profile.service';
import { Conversation } from '../../models/conversation.model';
import { Message } from '../../models/message.model';
import { UserProfile } from '../../models/user-profile.model';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
  imports: [
    AsyncPipe,
    CommonModule,
    FormsModule,
    IonAvatar,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonInput,
    IonSpinner,
    IonToolbar,
  ],
})
export class ChatRoomComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly messagesService = inject(MessagesService);
  private readonly profileService = inject(ProfileService);
  private readonly auth = inject(Auth);

  protected messageText = '';
  protected sending = false;
  protected sendError = '';
  protected readonly currentUserId = this.auth.currentUser?.uid ?? '';
  protected readonly fallbackMessages: Message[] = [
    {
      id: 'demo-1',
      senderId: 'other-user',
      text: 'Hola, este chat quedo listo para conectarse con Firebase.',
      type: 'text',
    },
    {
      id: 'demo-2',
      senderId: this.currentUserId || 'current-user',
      text: 'Perfecto, ahora solo falta empezar a crear conversaciones reales.',
      type: 'text',
    },
  ];

  protected readonly conversationId$ = this.route.paramMap.pipe(
    map((params) => params.get('id') ?? ''),
  );
  protected readonly conversation$ = this.conversationId$.pipe(
    switchMap((conversationId) =>
      conversationId ? this.messagesService.getConversation(conversationId) : of(undefined),
    ),
  );
  protected readonly messages$ = this.conversationId$.pipe(
    switchMap((conversationId) =>
      conversationId ? this.messagesService.getMessages(conversationId) : of([]),
    ),
  );
  protected readonly otherProfile$ = this.conversation$.pipe(
    switchMap((conversation) => {
      const participantIndex = this.getPrimaryParticipantIndex(conversation);
      const otherParticipantId = conversation?.participants?.[participantIndex] ?? '';
      return otherParticipantId
        ? this.profileService.getProfileById(otherParticipantId)
        : of(undefined);
    }),
  );
  protected readonly vm$ = combineLatest([
    this.conversation$,
    this.messages$,
    this.otherProfile$,
  ]).pipe(
    map(([conversation, messages, otherProfile]) => ({
      conversation,
      messages,
      otherProfile,
    })),
  );

  constructor() {
    addIcons({
      ellipse,
      sendOutline,
    });
  }

  protected getConversationName(
    conversation?: Conversation,
    otherProfile?: UserProfile,
  ): string {
    const participantIndex = this.getPrimaryParticipantIndex(conversation);
    return (
      conversation?.title ||
      otherProfile?.displayName ||
      conversation?.participantNames?.[participantIndex] ||
      'Conversacion'
    );
  }

  protected getConversationRole(
    conversation?: Conversation,
    otherProfile?: UserProfile,
  ): string {
    const participantIndex = this.getPrimaryParticipantIndex(conversation);
    return (
      otherProfile?.academicProgram ||
      otherProfile?.role ||
      conversation?.participantRoles?.[participantIndex] ||
      'Comunidad academica'
    );
  }

  protected getConversationAvatar(
    conversation?: Conversation,
    otherProfile?: UserProfile,
  ): string {
    const participantIndex = this.getPrimaryParticipantIndex(conversation);
    return (
      otherProfile?.avatarUrl ||
      conversation?.participantAvatarUrls?.[participantIndex] ||
      'https://ionicframework.com/docs/img/demos/avatar.svg'
    );
  }

  protected isDeveloperConversation(otherProfile?: UserProfile): boolean {
    return otherProfile?.role === 'developer';
  }

  protected isTeacherConversation(otherProfile?: UserProfile): boolean {
    return otherProfile?.role === 'teacher';
  }

  protected isOwnMessage(message: Message): boolean {
    return !!this.currentUserId && message.senderId === this.currentUserId;
  }

  protected async sendMessage(conversationId: string): Promise<void> {
    this.sendError = '';

    if (!this.messageText.trim()) {
      return;
    }

    this.sending = true;

    try {
      await this.messagesService.sendMessage(conversationId, this.messageText);
      this.messageText = '';
    } catch (error) {
      console.error(error);
      this.sendError = 'No se pudo enviar el mensaje.';
    } finally {
      this.sending = false;
    }
  }

  private getPrimaryParticipantIndex(conversation?: Conversation): number {
    if (!conversation) {
      return 0;
    }

    const otherParticipantIndex = conversation.participants.findIndex(
      (participantId) => participantId !== this.currentUserId,
    );

    return otherParticipantIndex >= 0 ? otherParticipantIndex : 0;
  }
}
