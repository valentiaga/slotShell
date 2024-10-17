import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SlotComponent } from './pages/slot/slot.component';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SlotComponent, HttpClientModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'slot_shell';
}
