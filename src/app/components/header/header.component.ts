import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  // private authService = inject(AuthService);
  private router = inject(Router);

  username: String = 'Admin';
  shell_add: String = 'GARAY, Av. Independencia 3190';

  // options: HeaderOption[] = HEADER_ESTRUCTURA;

  logout(){
    // this.authService.logout()
  }

  isAdminPage(): any {    
    return this.router.url === '/panel';
  }
}
