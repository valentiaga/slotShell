import { Component } from '@angular/core';
import { SocketService } from '../../services/socket/socket.service';

@Component({
  selector: 'app-ip-viewer',
  standalone: true,
  imports: [],
  templateUrl: './ip-viewer.component.html',
  styleUrl: './ip-viewer.component.css'
})
export class IpViewerComponent {
  ip: string | null = null;

  constructor(private webSocketService: SocketService) {}

  ngOnInit() {
    this.webSocketService.onIpUpdated().subscribe((data) => {
      this.ip = data.ip;
      console.log(`IP actualizada: ${data.ip}`);
    });
  }
}
