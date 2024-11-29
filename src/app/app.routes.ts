import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from './guards/is-authenticated.guard';

export const routes: Routes = [
    {
      path: '',
      canActivate: [isAuthenticatedGuard],
      loadComponent: () =>
        import('./pages/slot/slot.component').then((mod) => mod.SlotComponent),
    },
    {
      path: 'login',
      loadComponent: () =>
        import('./pages/login/login.component').then(
          (mod) => mod.LoginPageComponent
        ),
    },
    {
        path: 'panel',
        canActivate: [isAuthenticatedGuard],
        loadComponent: () =>
            import('./pages/admin-page/admin-page.component').then((mod) => mod.AdminPageComponent),
    },

];
