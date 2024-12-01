import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';

let _activeRequest = 0;
export const spinnerInterceptor: HttpInterceptorFn = (req, next) => {
  let _ngxUiLoaderService = inject(NgxUiLoaderService);

  if (_activeRequest === 0) {    
    _ngxUiLoaderService.start();    
  }
  _activeRequest++;

  return next(req).pipe(finalize(() => {_activeRequest--;
    if (_activeRequest === 0) {      
      _ngxUiLoaderService.stop();
    }}));
};
