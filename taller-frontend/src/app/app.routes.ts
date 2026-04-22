import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'consulta', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'consulta',
    loadComponent: () => import('./pages/consulta-publica/consulta-publica').then(m => m.ConsultaPublicaComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
    children: [
      { path: 'clientes',  loadComponent: () => import('./pages/clientes/clientes').then(m => m.ClientesComponent) },
      { path: 'vehiculos', loadComponent: () => import('./pages/vehiculos/vehiculos').then(m => m.VehiculosComponent) },
      { path: 'ordenes',   loadComponent: () => import('./pages/ordenes/ordenes').then(m => m.OrdenesComponent) },
      { path: 'repuestos', loadComponent: () => import('./pages/repuestos/repuestos').then(m => m.RepuestosComponent) },
    ]
  },
  { path: '**', redirectTo: 'consulta' }
];
