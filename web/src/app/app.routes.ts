import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'sign-in' },
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./features/auth/sign-in.component').then((m) => m.SignInComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./features/auth/sign-up.component').then((m) => m.SignUpComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'welcome',
    loadComponent: () =>
      import('./features/welcome/welcome.component').then((m) => m.WelcomeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'menu',
    loadComponent: () => import('./features/menu/menu.component').then((m) => m.MenuComponent),
    canActivate: [authGuard],
  },
  {
    path: 'order',
    loadComponent: () => import('./features/order/order.component').then((m) => m.OrderComponent),
    canActivate: [authGuard],
  },
  {
    path: 'delivery',
    loadComponent: () =>
      import('./features/delivery/delivery.component').then((m) => m.DeliveryComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'welcome' },
];
