import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';

let activeRequestCount = 0;

/**
 * Interceptor que muestra un spinner durante las peticiones HTTP
 * @param req - Petición HTTP
 * @param next - Handler de la petición
 * @returns Observable con la respuesta
 */
export const spinnerInterceptor: HttpInterceptorFn = (req, next) => {
  const ngxUiLoaderService = inject(NgxUiLoaderService);

  startSpinnerIfNeeded(ngxUiLoaderService);
  activeRequestCount++;

  return next(req).pipe(
    finalize(() => handleRequestComplete(ngxUiLoaderService))
  );
};

/**
 * Inicia el spinner si no hay peticiones activas
 * @param loaderService - Servicio de loader
 */
function startSpinnerIfNeeded(loaderService: NgxUiLoaderService): void {
  if (activeRequestCount === 0) {
    loaderService.start();
  }
}

/**
 * Maneja la finalización de una petición
 * @param loaderService - Servicio de loader
 */
function handleRequestComplete(loaderService: NgxUiLoaderService): void {
  activeRequestCount--;
  
  if (activeRequestCount === 0) {
    loaderService.stop();
  }
}
