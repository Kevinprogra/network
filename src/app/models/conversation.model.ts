export interface Conversation {
  id?: string;
  participants: string[];
  participantNames: string[];
  participantAvatarUrls?: string[];
  participantRoles?: string[];
  title?: string;
  type?: 'direct' | 'group';
  lastMessage: string;
  lastMessageSenderId?: string;
  lastMessageAt?: unknown;
  unreadCount?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}
