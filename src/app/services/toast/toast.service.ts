import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new BehaviorSubject<{ type: string; message: string } | null>(null);
  toast$ = this.toastSubject.asObservable();

  private toastTimeout: any = null; 

  showToast(type: 'success' | 'error' | 'warning', message: string) {
    console.log('SHOW TOAST', type, message);

    // Si hay un toast ya activo, limpia el temporizador anterior
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    // Muestra el nuevo toast
    this.toastSubject.next({ type, message });

    this.toastTimeout = setTimeout(() => {
      this.toastSubject.next(null);
    }, 3000);
  }
}
