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

import { AuthService } from '../../core/auth/auth.service';
import { HeaderComponent } from '../../core/header/header.component';
import { PostsService } from '../../core/services/posts.service';
import { Post } from '../../models/post.model';

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
  ],
})
export class MainComponent {
  private readonly authService = inject(AuthService);
  private readonly postsService = inject(PostsService);

  protected readonly posts$ = this.postsService.getFeed();
  protected postContent = '';
  protected publishError = '';
  protected isPublishing = false;
  protected readonly fallbackPosts: Post[] = [
    {
      id: 'demo-1',
      authorId: 'demo-1',
      authorName: 'Ing. Guillermo Tobon',
      authorRole: 'Estructura de Datos · Hace 15 min',
      content:
        'Estimados estudiantes, he subido la guia de estudio para el segundo parcial de Estructura de Datos. Recuerden que el examen es el proximo martes en el Aula 402.',
      likesCount: 0,
      commentsCount: 0,
    },
    {
      id: 'demo-2',
      authorId: 'demo-2',
      authorName: 'Dra. Elena Garrido',
      authorRole: 'Ciencias Basicas · Hace 1 hora',
      content:
        'Se encuentra habilitado el formulario para registrar monitorias academicas del proximo semestre. Por favor revisen requisitos y fechas limite.',
      likesCount: 12,
      commentsCount: 4,
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
}
