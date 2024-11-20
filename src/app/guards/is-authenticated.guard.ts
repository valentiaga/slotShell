import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { AuthStatus } from '../interfaces';

export const isAuthenticatedGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router= inject(Router);

  const url= state.url;
  localStorage.removeItem('url');
  localStorage.setItem('url',url);

  if (authService.authStatus() === AuthStatus.authenticated){
    return true;
  }

  if (authService.authStatus() === AuthStatus.checking){
    return false;
  }


  router.navigateByUrl('/login');

  return false;
};