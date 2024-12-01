import { Component, computed, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './components/header/header.component';
import { AuthStatus } from './interfaces';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'slot_shell';

  private authService = inject(AuthService);
  private router = inject(Router);

  public finishedAuthCheck = computed<boolean>(() => {
    if (this.authService.authStatus() === AuthStatus.checking) {
      return true;
    }
    return false;
  })

  public authStatusChangedEffect = effect( ()=> {

    switch(this.authService.authStatus()){

      case AuthStatus.checking:
        return;

      case AuthStatus.authenticated:
          return;

      case AuthStatus.notAuthenticated:
        if(this.router.url !== '/')
          this.router.navigateByUrl('/login')
        break;
    };
  })
}