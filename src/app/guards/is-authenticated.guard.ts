import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { AuthStatus } from '../interfaces';

/**
 * Guard que verifica si el usuario está autenticado
 * @param route - Ruta activada
 * @param state - Estado del router
 * @returns true si está autenticado, false en caso contrario
 */
export const isAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return checkAuthentication(authService, router);
};

/**
 * Verifica el estado de autenticación y redirige si es necesario
 * @param authService - Servicio de autenticación
 * @param router - Router de Angular
 * @returns true si está autenticado, false en caso contrario
 */
function checkAuthentication(authService: AuthService, router: Router): boolean {
  const status = authService.authStatus();
  
  if (status === AuthStatus.authenticated) {
    return true;
  }

  if (status === AuthStatus.checking) {
    return false;
  }

  router.navigateByUrl('/login');
  return false;
}
