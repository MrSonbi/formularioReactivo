import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'Registro',
    loadComponent: () => import('./Registro/RegistroPage.page').then((m) => m.RegistroPage),
  },
  {
    path: '',
    redirectTo: 'Registro',
    pathMatch: 'full',
  },
];
