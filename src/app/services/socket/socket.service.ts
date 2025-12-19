import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private readonly socket: Socket;
  private readonly SERVER_URL = 'https://api.shell-suarez.com';

  constructor() {
    this.socket = io(this.SERVER_URL);
  }

  /**
   * Une el cliente a una sala específica
   * @param room - Nombre de la sala
   */
  joinRoom(room: string): void {
    this.socket.emit('joinRoom', room);
    this.setupRoomJoinedListener();
  }

  /**
   * Configura el listener para confirmar la unión a la sala
   */
  private setupRoomJoinedListener(): void {
    this.socket.on('roomJoined', (room) => {
      console.log(`✅ Cliente confirmado en room ${room}`);
    });
  }

  /**
   * Escucha eventos de accionamiento de ruleta
   * @param callback - Función callback a ejecutar cuando se acciona la ruleta
   */
  onRuletaAccionada(callback: (data: any) => void): void {
    this.socket.on('accionarRuleta', callback);
    this.setupTestMessageListener();
  }

  /**
   * Configura el listener para mensajes de prueba
   */
  private setupTestMessageListener(): void {
    this.socket.on('testMessage', (data) => {
      console.log('Mensaje recibido:', data);
    });
  }

  /**
   * Emite un evento al servidor
   * @param event - Nombre del evento
   * @param data - Datos a enviar
   */
  emit(event: string, data: any): void {
    this.socket.emit(event, data);
  }


}
