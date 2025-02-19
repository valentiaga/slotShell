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
    path: 'garay',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/slot/slot.component').then((mod) => mod.SlotComponent),
        data: { id: 1 },
      },
      {
        path: 'test',
        loadComponent: () =>
          import('./pages/slot/slot.component').then((mod) => mod.SlotComponent),
        data: { id: 1, testMode: true },
      },
    ],
  },
  {
    path: 'matheu',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/slot/slot.component').then((mod) => mod.SlotComponent),
        data: { id: 2 },
      },
      {
        path: 'test',
        loadComponent: () =>
          import('./pages/slot/slot.component').then((mod) => mod.SlotComponent),
        data: { id: 2, testMode: true },
      },
    ],
  },
  {
    path: 'roca',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/slot/slot.component').then((mod) => mod.SlotComponent),
        data: { id: 3 },
      },
      {
        path: 'test',
        loadComponent: () =>
          import('./pages/slot/slot.component').then((mod) => mod.SlotComponent),
        data: { id: 3, testMode: true },
      },
    ],
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
      import('./pages/admin-page/admin-page.component').then(
        (mod) => mod.AdminPageComponent
      ),
  },
];
