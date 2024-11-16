import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: Socket;

  constructor() {
    this.socket = io('http://192.168.100.88:5000'); 

    this.socket.on('connect', () => {
      console.log('Conectado al servidor de Raspberry Pi');
      this.toggleLed()
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del servidor');
    });
  }

  toggleLed() {
    this.socket.emit('toggle-led');
  }

  onPinChange(): Observable<any> {
    console.log('Esperando al socket ')
    return new Observable(observer => {
      this.socket.on("pin_change", (data) => {
        console.log(data)
        observer.next(data);
      });
    });
  }
}
