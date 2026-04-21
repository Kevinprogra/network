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
      })),
    ),
  );
  protected readonly currentProfile$ = this.profileService.getCurrentProfile();
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
  }


  commentsMap: { [postId: string]: any[] } = {};





loadComments(postId: string) {
  console.log('resivir usuario resteandooo', postId);

  this.commentService.getComments(postId)
    .subscribe((data) => {
      console.log('probando entrada comentarios kkkk', data);

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

  this.postsService.getComments(postId).subscribe((comments) => {
    this.commentsMap[postId] = comments;
  });
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
