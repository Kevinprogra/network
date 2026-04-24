import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenu,
  IonMenuButton,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  bookmarkOutline,
  chatbubbleOutline,
  documentTextOutline,
  ellipsisHorizontal,
  heartOutline,
  homeOutline,
  notificationsOutline,
  personCircleOutline,
  searchOutline,
  sendOutline,
} from 'ionicons/icons';
import { combineLatest, map } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { HeaderComponent } from '../../core/header/header.component';
import { PostsService } from '../../core/services/posts.service';
import { Post } from '../../models/post.model';
import { UserProfile } from '../../models/user-profile.model';
import { ProfileService } from '../../core/services/profile.service';
import { CommentService } from '../../core/services/comment.service';
import { CommonModule } from '@angular/common';

interface FeedPostVm {
  post: Post;
  authorProfile?: UserProfile;
}

interface FeedCommentVm {
  id?: string;
  authorId?: string;
  authorName: string;
  text: string;
  createdAt?: unknown;
  authorProfile?: UserProfile;
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    HeaderComponent,
    RouterLink,
    IonAvatar,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonMenu,
    IonMenuButton,
    IonToolbar,
    CommonModule,
  ],
})
export class MainComponent {
  private readonly authService = inject(AuthService);
  private readonly postsService = inject(PostsService);
  private readonly profileService = inject(ProfileService);
  private commentService = inject(CommentService);

  protected readonly posts$ = this.postsService.getFeed();
  protected readonly allProfiles$ = this.profileService.getAllProfiles();
  protected readonly postsVm$ = combineLatest([this.posts$, this.allProfiles$]).pipe(
    map(([posts, profiles]) =>
      posts.map((post) => ({
        post,
        authorProfile: profiles.find((profile) => profile.uid === post.authorId),
      }) as FeedPostVm),
    ),
  );
  protected readonly currentProfile$ = this.profileService.getCurrentProfile();
  protected readonly currentUser$ = this.authService.user$;
  protected postContent = '';
  protected publishError = '';
  protected isPublishing = false;
  protected readonly fallbackPosts: Post[] = [
    {
      id: 'demo-1',
      authorId: 'demo-1',
      authorName: 'Ing. Guillermo Tobon',
      authorRole: 'Estructura de Datos',
      content:
        'Estimados estudiantes, he subido la guia de estudio para el segundo parcial de Estructura de Datos. Recuerden que el examen es el proximo martes en el Aula 402.',
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
    },
  ];

  constructor() {
    addIcons({
      addCircleOutline,
      bookmarkOutline,
      chatbubbleOutline,
      documentTextOutline,
      ellipsisHorizontal,
      heartOutline,
      homeOutline,
      notificationsOutline,
      personCircleOutline,
      searchOutline,
      sendOutline,
    });

    this.authService.user$.subscribe((user) => {
      this.currentUserId = user?.uid ?? null;
    });
  }


  commentsMap: Record<string, FeedCommentVm[]> = {};
  currentUserId: string | null = null;





loadComments(postId: string): void {
  combineLatest([this.commentService.getComments(postId), this.allProfiles$]).pipe(
    map(([comments, profiles]) =>
      (comments as FeedCommentVm[]).map((comment) => ({
        ...comment,
        authorProfile: profiles.find((profile) => profile.uid === comment.authorId),
      })),
    ),
  ).subscribe((data) => {
    this.commentsMap[postId] = data;
  });
}





  activeCommentPostId: string | null = null;
newComment: string = '';

toggleComments(postId: string) {
  if (this.activeCommentPostId === postId) {
    this.activeCommentPostId = null;
    return;
  }

  this.activeCommentPostId = postId;

  if (this.commentsMap[postId]) return;

  this.loadComments(postId);
}










async addComment(postId: string) {
  if (!this.newComment.trim()) return;

  console.log('📝 Comentario:', this.newComment);
  console.log('📌 Post:', postId);

  try {
    await this.postsService.addComment(postId, this.newComment);
    this.newComment = '';
  } catch (error) {
    console.error('❌ Error al guardar comentario:', error);
  }
}


  

  async logout(): Promise<void> {
    await this.authService.logout();
  }

  async publishPost(): Promise<void> {
    this.publishError = '';

    if (!this.postContent.trim()) {
      this.publishError = 'Escribe primero un aviso antes de publicar.';
      return;
    }

    this.isPublishing = true;

    try {
      await this.postsService.createPost(this.postContent);
      this.postContent = '';
    } catch (error) {
      this.publishError = 'No se pudo publicar el aviso en Firebase.';
      console.error(error);
    } finally {
      this.isPublishing = false;
    }
  }

  protected getAvatarUrl(post: Post, currentProfile?: UserProfile): string {
    if (currentProfile?.uid === post.authorId && currentProfile.avatarUrl) {
      return currentProfile.avatarUrl;
    }

    return post.authorAvatarUrl ?? '';
  }

  protected isDeveloperProfile(profile?: UserProfile): boolean {
    return profile?.role === 'developer';
  }

  protected isDeveloperPost(profile?: UserProfile): boolean {
    return profile?.role === 'developer';
  }

  protected isTeacherProfile(profile?: UserProfile): boolean {
    return profile?.role === 'teacher';
  }

  protected isTeacherPost(profile?: UserProfile): boolean {
    return profile?.role === 'teacher';
  }

  protected getAuthorAvatarUrl(post: Post, authorProfile?: UserProfile): string {
    return authorProfile?.avatarUrl || post.authorAvatarUrl || '';
  }

  protected isOwnPost(post: Post): boolean {
    return !!this.currentUserId && this.currentUserId === post.authorId;
  }

  protected isOwnComment(comment: FeedCommentVm): boolean {
    return !!this.currentUserId && this.currentUserId === comment.authorId;
  }

  protected getDisplayRole(post: Post, authorProfile?: UserProfile): string {
    if (authorProfile?.role === 'developer') {
      return 'Developer';
    }

    if (authorProfile?.role === 'teacher') {
      return 'Profesor';
    }

    return post.authorRole || 'Comunidad academica';
  }

  protected getCommentAvatarUrl(comment: FeedCommentVm): string {
    return comment.authorProfile?.avatarUrl || '';
  }

  protected getCommentDisplayRole(comment: FeedCommentVm): string {
    if (comment.authorProfile?.role === 'developer') {
      return 'Developer';
    }

    if (comment.authorProfile?.role === 'teacher') {
      return 'Profesor';
    }

    return 'Comunidad academica';
  }

  protected isDeveloperComment(comment: FeedCommentVm): boolean {
    return comment.authorProfile?.role === 'developer';
  }

  protected isTeacherComment(comment: FeedCommentVm): boolean {
    return comment.authorProfile?.role === 'teacher';
  }

  protected getInitials(value?: string | null): string {
    const normalized = value?.trim();

    if (!normalized) {
      return 'U';
    }

    const parts = normalized.split(/\s+/).filter(Boolean).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'U';
  }

  async editPost(post: Post): Promise<void> {
    if (!post.id || !this.isOwnPost(post)) {
      return;
    }

    const updatedContent = window.prompt('Edita tu publicación', post.content)?.trim();

    if (!updatedContent || updatedContent === post.content.trim()) {
      return;
    }

    try {
      await this.postsService.updatePost(post.id, updatedContent);
    } catch (error) {
      console.error('Error al editar publicación:', error);
    }
  }

  async deletePost(post: Post): Promise<void> {
    if (!post.id || !this.isOwnPost(post)) {
      return;
    }

    if (!window.confirm('¿Seguro que quieres eliminar esta publicación?')) {
      return;
    }

    try {
      await this.postsService.deletePost(post.id);

      if (this.activeCommentPostId === post.id) {
        this.activeCommentPostId = null;
      }

      delete this.commentsMap[post.id];
    } catch (error) {
      console.error('Error al eliminar publicación:', error);
    }
  }

  async editComment(postId: string, comment: FeedCommentVm): Promise<void> {
    if (!comment.id || !this.isOwnComment(comment)) {
      return;
    }

    const updatedText = window.prompt('Edita tu comentario', comment.text)?.trim();

    if (!updatedText || updatedText === comment.text.trim()) {
      return;
    }

    try {
      await this.postsService.updateComment(postId, comment.id, updatedText);
    } catch (error) {
      console.error('Error al editar comentario:', error);
    }
  }

  async deleteComment(postId: string, comment: FeedCommentVm): Promise<void> {
    if (!comment.id || !this.isOwnComment(comment)) {
      return;
    }

    if (!window.confirm('¿Seguro que quieres eliminar este comentario?')) {
      return;
    }

    try {
      await this.postsService.deleteComment(postId, comment.id);
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
    }
  }

  protected getRelativeTimeLabel(value: unknown): string {
    const date = this.normalizeDate(value);

    if (!date) {
      return '';
    }

    const diffMs = Date.now() - date.getTime();

    if (diffMs < 60_000) {
      return 'Hace unos segundos';
    }

    const diffMinutes = Math.floor(diffMs / 60_000);

    if (diffMinutes < 60) {
      return `Hace ${diffMinutes} min`;
    }

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24) {
      return diffHours === 1 ? 'Hace 1 hora' : `Hace ${diffHours} horas`;
    }

    const diffDays = Math.floor(diffHours / 24);

    if (diffDays < 7) {
      return diffDays === 1 ? 'Hace 1 dia' : `Hace ${diffDays} dias`;
    }

    const diffWeeks = Math.floor(diffDays / 7);

    if (diffWeeks < 5) {
      return diffWeeks === 1 ? 'Hace 1 semana' : `Hace ${diffWeeks} semanas`;
    }

    const diffMonths = Math.floor(diffDays / 30);

    if (diffMonths < 12) {
      return diffMonths === 1 ? 'Hace 1 mes' : `Hace ${diffMonths} meses`;
    }

    const diffYears = Math.floor(diffDays / 365);
    return diffYears === 1 ? 'Hace 1 ano' : `Hace ${diffYears} anos`;
  }

  private normalizeDate(value: unknown): Date | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'object' && value !== null && 'toDate' in value) {
      const toDate = (value as { toDate?: unknown }).toDate;

      if (typeof toDate === 'function') {
        return toDate.call(value) as Date;
      }
    }

    if (typeof value === 'object' && value !== null && 'seconds' in value) {
      const seconds = (value as { seconds?: unknown }).seconds;

      if (typeof seconds === 'number') {
        return new Date(seconds * 1000);
      }
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const parsedDate = new Date(value);
      return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
    }

    return null;
  }
}
