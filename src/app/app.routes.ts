import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./features/users/pages/user-list/user-list.component').then(
        (m) => m.UserListComponent,
      ),
    title: 'Gerenciamento de Usuarios',
  },
  {
    path: '**',
    redirectTo: 'users',
  },
];
