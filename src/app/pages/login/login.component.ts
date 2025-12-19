import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { ToastService } from '../../services/toast/toast.service';

@Component({
  selector: 'auth-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgxUiLoaderModule
  ],
  templateUrl: './login.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  public readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  
  public hidePassword: boolean = true;

  public loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  /**
   * Obtiene el valor del campo username
   * @returns Valor del username
   */
  get userName(): string {
    return this.loginForm.get('username')?.value;
  }
  
  /**
   * Obtiene el valor del campo password
   * @returns Valor del password
   */
  get password(): string {
    return this.loginForm.get('password')?.value;
  }

  /**
   * Ejecuta el proceso de login
   */
  login(): void {
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password)
      .subscribe({
        next: () => this.handleLoginSuccess(),
        error: () => this.handleLoginError()
      });
  }

  /**
   * Maneja el éxito del login
   */
  private handleLoginSuccess(): void {
    this.router.navigateByUrl('/panel');
  }

  /**
   * Maneja el error del login
   */
  private handleLoginError(): void {
    this.toastService.showToast('error', 'Usuario o contraseña incorrectos');
  }
}
