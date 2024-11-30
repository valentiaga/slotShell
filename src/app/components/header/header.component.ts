import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username: String = 'Admin';
  shell_add: string = '';
  private subscription: Subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(
      this.authService.isAuthenticated$.subscribe(isAuthenticated => {
        if (isAuthenticated) {
          const idAuth = localStorage.getItem('idAuth');

          if (idAuth) {
            const idAuthNumber = parseInt(idAuth, 10);
            this.updateShellAddress(idAuthNumber);
          }
        }
      })
    );
  }

  logout(){
    this.authService.logout()
  }

  isAdminPage(): any {    
    return this.router.url === '/panel';
  }

  private updateShellAddress(idAuth: number) {
    switch (idAuth) {
      case 1:
        this.shell_add = 'GARAY - Av. Independencia 3190';
        break;
      case 2:
        this.shell_add = 'MATHEU - Matheu Cordoba';
        break;
      case 3:
        this.shell_add = 'ROCA - Av. Independencia, Julio Argentino Roca 3315';
        break;
      default:
        this.shell_add = 'Ubicación no definida';
    }
  }
}
