import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { NgxUiLoaderConfig, NgxUiLoaderHttpModule, NgxUiLoaderModule, NgxUiLoaderRouterModule, NgxUiLoaderService, PB_DIRECTION, POSITION, SPINNER } from 'ngx-ui-loader';
import { spinnerInterceptor } from './interceptors/spinner.interceptor';

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  fgsColor: '#FFD500',
  fgsPosition: POSITION.centerCenter,
  fgsSize: 80,
  fgsType: SPINNER.chasingDots,
  pbColor: '#FF0000',
  pbDirection: PB_DIRECTION.leftToRight,
  pbThickness: 5,
  bgsColor: '#FF0000',
  bgsPosition: POSITION.bottomCenter,
  bgsSize: 100,
  bgsType: SPINNER.rectangleBounce,
};

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
    provideHttpClient(withInterceptors([spinnerInterceptor])),
    importProvidersFrom(
      NgxUiLoaderModule.forRoot(ngxUiLoaderConfig)
    ),
    provideAnimationsAsync(),
    provideClientHydration(withHttpTransferCacheOptions({
      includePostRequests: true
    }))
  ]
};

