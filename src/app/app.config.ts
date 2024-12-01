import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
    provideHttpClient(
    ),
    provideAnimationsAsync(),
    provideClientHydration(withHttpTransferCacheOptions({
      includePostRequests: true
    }))
  ]
};
function withTransferState(): import("@angular/common/http").HttpFeature<import("@angular/common/http").HttpFeatureKind> {
  throw new Error('Function not implemented.');
}

