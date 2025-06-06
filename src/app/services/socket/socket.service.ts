import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: Socket;
  private readonly SERVER_URL = 'https://api.shell-suarez.com';

  constructor() {
    // Conexión al servidor de sockets
    this.socket = io(this.SERVER_URL);
  }

  // Método para unirse a un room
  joinRoom(room: string): void {
    this.socket.emit('joinRoom', room);
    this.socket.on('roomJoined', (room) => {
      console.log(`✅ Cliente confirmado en room ${room}`);
    });
  }

  // Escuchar eventos de "accionarRuleta"
  onRuletaAccionada(callback: (data: any) => void): void {
    this.socket.on('accionarRuleta', callback);
    this.socket.on('testMessage', (data) => {
      console.log('Mensaje recibido:', data);
    });
  }

  // Método para emitir eventos al servidor
  emit(event: string, data: any): void {
    this.socket.emit(event, data);
  }


  // private socket: Socket | undefined;
  // private socketIP: Socket;
  // private raspberryIp: string = '';
  // private readonly baseUrl: string = environments.BASE_URL
  // private pinChangeSubject = new BehaviorSubject<any>({});

  // constructor(private http: HttpClient, private util: UtilService) {
  //   // Conexión al backend
  //   this.socketIP = io(`172.20.10.9:3000`);
  //   this.connectToRaspberryPi();
  //   console.log("🚀 ~ SocketService ~ constructor ~ this.socketIP:", this.socketIP);

  //   // Eventos del backend
  //   this.socketIP.on('connect', () => {
  //     console.log('Conectado al backend');
  //   });

  //   this.socketIP.on('disconnect', () => {
  //     console.log('Desconectado del backend');
  //   });

  //   // Escuchar cambios de IP desde el backend
  //   this.onIpUpdated().subscribe((data) => {
  //     console.log(`Nueva IP de la Raspberry Pi recibida: ${data.ip_address}`);
  //     this.reconnectToRaspberryPi(data.ip_address);
  //   });
  // }

  // async connectToRaspberryPi() {

  //   this.getCurrentIP().subscribe((response => {
  //     console.log(response.body);
  //     this.raspberryIp = response.body;
  //     this.socket = io(`http://${this.raspberryIp}:5000`);

  //       this.socket.on('connect', () => {
  //         console.log('Conectado al servidor de Raspberry Pi');
  //         this.toggleLed();
  //       });

  //       this.socket.on('pin_change', (data) => {
  //         console.log('Evento pin_change recibido:', data);
  //         this.pinChangeSubject.next(data); // Emitir el evento
  //       });

  //       this.socket.on('disconnect', () => {
  //         console.log('Desconectado del servidor de Raspberry Pi');
  //       });
  //     }
  //   ));

  // }

  // private reconnectToRaspberryPi(newIp: string) {
  //   if (this.socket) {
  //     this.socket.disconnect();
  //     console.log('Conexión anterior cerrada');
  //   }

  //   this.raspberryIp = newIp;
  //   this.connectToRaspberryPi();
  // }

  // toggleLed() {
  //   this.socket?.emit('toggle-led');
  // }

  // // Escuchar cambios de pin
  // onPinChange(): Observable<any> {
  //   return this.pinChangeSubject.asObservable(); // Devuelve el Subject como un Observable
  // }


  // onIpUpdated(): Observable<{ ip_address: string }> {
  //   return fromEvent<{ ip_address: string }>(this.socketIP, 'ip_updated');
  // }

  // getCurrentIP() {
  //   const url = `${this.baseUrl}/ip/current-ip`
  //   console.log("🚀 ~ SocketService ~ getCurrentIP ~ this.util.buildRequest<any>('get', url):", this.util.buildRequest<any>('get', url));
  //   return this.util.buildRequest<any>('get', url);
  // }
}
