import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { NgxUiLoaderModule } from 'ngx-ui-loader';

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
  private fb = inject(FormBuilder)
  public authService = inject (AuthService);
  private router = inject(Router)
  public hidePassword: boolean = true;

  public loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  })

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  get userName(){
    return this.loginForm.get('username')?.value;
  }
  get password(){
    return this.loginForm.get('password')?.value;
  }

  login(){
    const {username, password} = this.loginForm.value

    this.authService.login(username,password)
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/panel')},
        error: () => {
          console.log('error al loguear');
        }
      })
  }
}
