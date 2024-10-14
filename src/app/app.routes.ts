import { Routes } from '@angular/router';

export const routes: Routes = [
    {
      path: '',
      loadComponent: () =>
        import('./pages/slot/slot.component').then((mod) => mod.SlotComponent),
    },
    {
        path: 'panel',
        loadComponent: () =>
            import('./pages/admin-page/admin-page.component').then((mod) => mod.AdminPageComponent),
    },
    // {
    //     path: '**',
    //     loadComponent: () =>
    //       import('./pages/slot/slot.component').then((mod) => mod.SlotComponent),
    // },
];
