import { Component } from '@angular/core';
import { ToastService } from '../services/toast/toast.service';
import { NgClass, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgClass, NgSwitch, NgSwitchCase, NgIf],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  toast: any = null;

  constructor(private toastService: ToastService) {
    this.toastService.toast$.subscribe((toast) => {
      this.toast = toast;
    });
  }

  closeToast() {
    this.toast = null;
  }
}
