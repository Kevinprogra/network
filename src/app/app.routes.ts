import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },

{
  path: 'login',
  loadComponent: () =>
    import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
},


{
  path: 'register',
  loadComponent: () =>
    import('./pages/auth/register/register.component').then((m) => m.RegisterComponent),

},
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },








];
