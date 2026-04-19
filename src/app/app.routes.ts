import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth-guard';
import { publicGuard } from './core/auth/public.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./pages/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'main',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/main/main.component').then((m) => m.MainComponent),
  },
  {
    path: 'news',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/news/news.component').then((m) => m.NewsComponent),
  },
  {
    path: 'events',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/events/events.component').then((m) => m.EventsComponent),
  },
  {
    path: 'messages',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/messages/messages.component').then((m) => m.MessagesComponent),
  },
  {
    path: 'messages/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/chat-room/chat-room.component').then((m) => m.ChatRoomComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'profile/academic',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profile-academic/profile-academic.component').then(
        (m) => m.ProfileAcademicComponent,
      ),
  },
  {
    path: 'chat',
    redirectTo: 'messages',
    pathMatch: 'full',
  },
  {
    path: 'notifications',
    redirectTo: 'news',
    pathMatch: 'full',
  },
  {
    path: 'header',
    loadComponent: () =>
      import('./core/header/header.component').then((m) => m.HeaderComponent),
  },
];
