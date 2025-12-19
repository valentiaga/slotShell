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
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  username: string = 'Admin';
  shellAddress: string = '';
  private subscription: Subscription = new Subscription();

  /**
   * Inicializa el componente y configura las suscripciones
   */
  ngOnInit(): void {
    this.setupAuthSubscription();
  }

  /**
   * Configura la suscripción al estado de autenticación
   */
  private setupAuthSubscription(): void {
    this.subscription.add(
      this.authService.isAuthenticated$.subscribe(isAuthenticated => {
        if (isAuthenticated) {
          this.handleAuthenticatedUser();
        }
      })
    );
  }

  /**
   * Maneja la lógica cuando el usuario está autenticado
   */
  private handleAuthenticatedUser(): void {
    const idAuth = localStorage.getItem('idAuth');

    if (idAuth) {
      const idAuthNumber = parseInt(idAuth, 10);
      this.updateShellAddress(idAuthNumber);
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.authService.logout();
  }

  /**
   * Verifica si la página actual es la página de administración
   * @returns true si está en la página de administración
   */
  isAdminPage(): boolean {
    return this.router.url === '/panel';
  }

  /**
   * Actualiza la dirección de la estación Shell según el ID de autenticación
   * @param idAuth - ID de autenticación de la estación
   */
  private updateShellAddress(idAuth: number): void {
    const addresses: { [key: number]: string } = {
      1: 'GARAY - Av. Independencia 3190',
      2: 'MATHEU - Matheu Cordoba',
      3: 'ROCA - Av. Independencia, Julio Argentino Roca 3315'
    };
    
    this.shellAddress = addresses[idAuth] || 'Ubicación no definida';
  }
}
