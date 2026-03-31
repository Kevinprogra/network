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
    path: 'header',
    loadComponent: () =>
      import('./core/header/header.component').then((m) => m.HeaderComponent),
  },
];
