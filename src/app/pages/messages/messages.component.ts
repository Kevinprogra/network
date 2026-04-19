import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonAvatar,
  IonBadge,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonSearchbar,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  chatbubbleEllipsesOutline,
  closeOutline,
  searchOutline,
} from 'ionicons/icons';
import { Observable, combineLatest, firstValueFrom, map } from 'rxjs';

import { MessagesService } from '../../core/services/messages.service';
import { Conversation } from '../../models/conversation.model';
import { ProfileService } from '../../core/services/profile.service';
import { UserProfile } from '../../models/user-profile.model';

interface ConversationPreview {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  timeLabel: string;
  avatarUrl: string;
  isDeveloper?: boolean;
  isTeacher?: boolean;
  unreadCount?: number;
  online?: boolean;
}

@Component({
  selector: 'app-messages',
  standalone: true,
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
  imports: [
    AsyncPipe,
    CommonModule,
    FormsModule,
    RouterLink,
    IonAvatar,
    IonBadge,
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonSearchbar,
    IonToolbar,
  ],
})
export class MessagesComponent {
  private readonly messagesService = inject(MessagesService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);
  private readonly auth = inject(Auth);
  private readonly currentUserId = this.auth.currentUser?.uid ?? '';

  protected readonly availableProfiles$ = this.profileService.getAvailableProfiles();
  protected readonly conversations$: Observable<ConversationPreview[]> = combineLatest([
    this.messagesService.getConversationFeed(),
    this.availableProfiles$,
  ]).pipe(
    map(([conversations, profiles]) =>
      conversations.map((conversation) => this.mapConversation(conversation, profiles)),
    ),
  );
  protected searchTerm = '';
  protected contactSearchTerm = '';
  protected showingNewMessageSheet = false;
  protected creatingConversation = false;
  protected readonly fallbackConversations: ConversationPreview[] = [
    {
      id: 'c1',
      name: 'Dr. Roberto Mendoza',
      role: 'Profesor · Calculo IV',
      lastMessage: 'Recuerden que el examen parcial sera el proximo jueves.',
      timeLabel: '10:30',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      unreadCount: 2,
      online: true,
    },
    {
      id: 'c2',
      name: 'Valentina Soto',
      role: 'Estudiante',
      lastMessage: '¿Ya terminaste el laboratorio de fisica?',
      timeLabel: '9:45',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      online: false,
    },
    {
      id: 'c3',
      name: 'Grupo de Tesis',
      role: 'Proyecto de Grado',
      lastMessage: 'Carlos: Acabo de subir el borrador al drive compartido.',
      timeLabel: 'Ayer',
      avatarUrl:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
      online: true,
    },
    {
      id: 'c4',
      name: 'Secretaria Academica',
      role: 'Administracion',
      lastMessage: 'Su solicitud de certificado ha sido procesada.',
      timeLabel: 'Lunes',
      avatarUrl:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      online: false,
    },
  ];

  constructor() {
    addIcons({
      addOutline,
      chatbubbleEllipsesOutline,
      closeOutline,
      searchOutline,
    });
  }

  protected get filteredConversations(): ConversationPreview[] {
    return this.filterConversations(this.fallbackConversations);
  }

  protected mapConversation(
    conversation: Conversation,
    profiles: UserProfile[] = [],
  ): ConversationPreview {
    const participantIndex = this.getPrimaryParticipantIndex(conversation);
    const otherParticipantId = conversation.participants[participantIndex];
    const liveProfile = profiles.find((profile) => profile.uid === otherParticipantId);

    return {
      id: conversation.id ?? 'conversation',
      name:
        conversation.title ||
        liveProfile?.displayName ||
        conversation.participantNames[participantIndex] ||
        'Conversacion',
      role:
        liveProfile?.academicProgram ||
        liveProfile?.role ||
        conversation.participantRoles?.[participantIndex] ||
        'Comunidad academica',
      lastMessage: conversation.lastMessage || 'Sin mensajes por ahora.',
      timeLabel: this.formatConversationTime(conversation.lastMessageAt ?? conversation.updatedAt),
      avatarUrl:
        liveProfile?.avatarUrl ||
        conversation.participantAvatarUrls?.[participantIndex] ||
        'https://ionicframework.com/docs/img/demos/avatar.svg',
      isDeveloper: liveProfile?.role === 'developer',
      isTeacher: liveProfile?.role === 'teacher',
      unreadCount: conversation.unreadCount ?? 0,
      online: false,
    };
  }

  protected filterConversations(conversations: ConversationPreview[]): ConversationPreview[] {
    const search = this.searchTerm.trim().toLowerCase();

    if (!search) {
      return conversations;
    }

    return conversations.filter((conversation) =>
      [conversation.name, conversation.role, conversation.lastMessage]
        .join(' ')
        .toLowerCase()
        .includes(search),
    );
  }

  protected filterProfiles(profiles: UserProfile[]): UserProfile[] {
    const search = this.contactSearchTerm.trim().toLowerCase();

    if (!search) {
      return profiles;
    }

    return profiles.filter((profile) =>
      [profile.displayName, profile.academicProgram, profile.role, profile.email]
        .join(' ')
        .toLowerCase()
        .includes(search),
    );
  }

  protected abrirNuevoMensaje(): void {
    this.contactSearchTerm = '';
    this.showingNewMessageSheet = true;
  }

  protected cerrarNuevoMensaje(): void {
    this.showingNewMessageSheet = false;
  }

  protected async iniciarConversacion(profile: UserProfile): Promise<void> {
    const currentProfile = await firstValueFrom(this.profileService.getCurrentProfile());

    if (!currentProfile) {
      return;
    }

    this.creatingConversation = true;

    try {
      const conversationId = await this.messagesService.createDirectConversation({
        otherUserId: profile.uid,
        otherUserName: profile.displayName,
        otherUserAvatarUrl: profile.avatarUrl,
        otherUserRole: profile.role || profile.academicProgram || 'Usuario',
        currentUserName: currentProfile.displayName,
        currentUserAvatarUrl: currentProfile.avatarUrl,
        currentUserRole: currentProfile.role || currentProfile.academicProgram || 'Usuario',
      });

      this.showingNewMessageSheet = false;
      await this.router.navigate(['/messages', conversationId]);
    } catch (error) {
      console.error(error);
    } finally {
      this.creatingConversation = false;
    }
  }

  private formatConversationTime(value: unknown): string {
    if (!value || typeof value !== 'object' || !('toDate' in value)) {
      return 'Reciente';
    }

    const timestamp = value as { toDate: () => Date };
    const date = timestamp.toDate();

    return new Intl.DateTimeFormat('es-CO', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  }

  private getPrimaryParticipantIndex(conversation: Conversation): number {
    const otherParticipantIndex = conversation.participants.findIndex(
      (participantId) => participantId !== this.currentUserId,
    );

    return otherParticipantIndex >= 0 ? otherParticipantIndex : 0;
  }
}
