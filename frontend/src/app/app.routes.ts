import { Routes } from '@angular/router';
import { AppShellComponent } from './shared/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      { path: 'inicio', redirectTo: 'usuarios', pathMatch: 'full' },
      {
        path: 'usuarios',
        loadChildren: () => import('./features/usuarios/usuarios.routes').then((m) => m.USUARIOS_ROUTES)
      }
    ]
  }
];
