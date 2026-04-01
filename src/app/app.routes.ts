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
<<<<<<< Updated upstream
=======
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'main',
    loadComponent: () => import('./pages/main/main.component').then((m) => m.MainComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
    // CONTENEDOR MAESTRO (Layout Shell): 
  // Todas las rutas dentro de 'children' heredan el Header Compartido y la barra de Tabs inferior.
    children: [
      {
        path: 'perfil',
        loadComponent: () => import('./pages/perfil/perfil.page').then(m => m.PerfilPage)
      }
    ]
  },
  {
    // Dejamos un solo redireccionamiento base. Por ahora, que te lleve directo a tu maquetación.
>>>>>>> Stashed changes
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
