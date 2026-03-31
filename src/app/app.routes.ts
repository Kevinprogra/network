import { Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { HeaderComponent } from './core/header/header.component';

export const routes: Routes = [
 

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


  {
    path: 'main',
    loadComponent: () =>
      import('./pages/main/main.component').then((m) => m.MainComponent),
  },


  {
    path: 'header',
    loadComponent: () =>
      import('./core/header/header.component').then((m) => m.HeaderComponent),
  }






];
