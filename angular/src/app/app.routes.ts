import { Routes } from '@angular/router';
import { Home } from './components/pages/home/home';
import { FoodPage } from './components/pages/food-page/food-page';
import { CartPage } from './components/pages/cart-page/cart-page';
import { Login } from './components/pages/login/login';
import { authGuard } from './guards/auth/auth-guard';
import { Register } from './components/pages/register/register';
import { Dashboard } from './components/pages/dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'search/:searchTerm',
    component: Home,
  },
  {
    path: 'tag/:tagId',
    component: Home,
  },
  {
    path: 'food/:id',
    component: FoodPage,
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'register',
    component: Register,
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
  },
  {
    path: 'cart-page',
    component: CartPage,
    canActivate: [authGuard],
  },
];
