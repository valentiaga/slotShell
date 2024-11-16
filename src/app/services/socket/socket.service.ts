import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { fromEvent, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: Socket | undefined;
  private socketIP: Socket;
  private raspberryIp: string = '192.168.100.88';

  constructor() {
    // Conexión al backend
    this.socketIP = io('http://192.168.100.88:5050'); 
    this.connectToRaspberryPi();

    // Eventos del backend
    this.socketIP.on('connect', () => {
      console.log('Conectado al backend');
    });

    this.socketIP.on('disconnect', () => {
      console.log('Desconectado del backend');
    });

    // Escuchar cambios de IP desde el backend
    this.onIpUpdated().subscribe((data) => {
      console.log(`Nueva IP de la Raspberry Pi recibida: ${data.ip}`);
      this.reconnectToRaspberryPi(data.ip);
    });
  }

  private connectToRaspberryPi() {
    this.socket = io(`http://${this.raspberryIp}:5000`);

    this.socket.on('connect', () => {
      console.log('Conectado al servidor de Raspberry Pi');
      this.toggleLed();
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del servidor de Raspberry Pi');
    });
  }

  private reconnectToRaspberryPi(newIp: string) {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Conexión anterior cerrada');
    }

    this.raspberryIp = newIp;
    this.connectToRaspberryPi();
    console.log('Reconectado a la nueva IP de la Raspberry Pi');
  }

  toggleLed() {
    this.socket?.emit('toggle-led');
  }

  // Escuchar cambios de pin
  onPinChange(): Observable<any> {
    return new Observable(observer => {
      this.socket?.on('pin_change', (data) => {
        observer.next(data);
      });
    });
  }

  onIpUpdated(): Observable<{ ip: string }> {
    return fromEvent<{ ip: string }>(this.socketIP, 'ip_updated');
  }
}
