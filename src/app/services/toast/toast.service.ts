import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly toastSubject = new BehaviorSubject<{ type: string; message: string } | null>(null);
  public readonly toast$ = this.toastSubject.asObservable();

  private toastTimeout: any = null; 

  /**
   * Muestra un mensaje toast
   * @param type - Tipo de toast (success, error, warning)
   * @param message - Mensaje a mostrar
   */
  showToast(type: 'success' | 'error' | 'warning', message: string): void {
    this.clearPreviousToast();
    this.displayToast(type, message);
    this.scheduleToastHide();
  }

  /**
   * Limpia el toast anterior si existe
   */
  private clearPreviousToast(): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  /**
   * Muestra el toast con el tipo y mensaje especificados
   * @param type - Tipo de toast
   * @param message - Mensaje a mostrar
   */
  private displayToast(type: string, message: string): void {
    this.toastSubject.next({ type, message });
  }

  /**
   * Programa el ocultamiento automático del toast
   */
  private scheduleToastHide(): void {
    this.toastTimeout = setTimeout(() => {
      this.toastSubject.next(null);
    }, 3000);
  }
}
