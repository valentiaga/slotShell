import { Injectable, signal, WritableSignal } from '@angular/core';
import { environments } from '../../../assets/environment';
import { CounterResponse, postCounter } from '../../interfaces/counter';
import { UtilService } from '../util/util.service';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CounterService {
  private readonly baseUrl: string = environments.BASE_URL;
  private readonly counterSignal: WritableSignal<number> = signal(0);

  constructor(
    private readonly http: HttpClient, 
    private readonly util: UtilService
  ) {}

  /**
   * Obtiene el valor actual del contador desde el servidor
   * @returns Signal con el valor del contador
   * @throws Error si no se encuentra el id_authentication
   */
  getCounter(): WritableSignal<number> {
    const idAuth = this.getAuthIdFromStorage();
    const url = this.buildCounterUrl(idAuth);
    
    this.fetchCounterValue(url);
    return this.counterSignal;
  }

  /**
   * Obtiene el ID de autenticación del almacenamiento local
   * @returns ID de autenticación
   * @throws Error si no se encuentra el ID
   */
  private getAuthIdFromStorage(): string {
    const idAuth = localStorage.getItem('idAuth');

    if (!idAuth) {
      throw new Error('No se ha encontrado id_authentication en el almacenamiento local');
    }

    return idAuth;
  }

  /**
   * Construye la URL para obtener el contador
   * @param idAuth - ID de autenticación
   * @returns URL construida
   */
  private buildCounterUrl(idAuth: string): string {
    return `${this.baseUrl}/counters/id_authentication/${idAuth}`;
  }

  /**
   * Obtiene el valor del contador desde el servidor
   * @param url - URL del endpoint
   */
  private fetchCounterValue(url: string): void {
    this.util.buildRequest<CounterResponse>('get', url, {}, false).pipe(
      map((response) => {
        this.counterSignal.set(response.body.counter);
      })
    ).subscribe();
  }

  /**
   * Crea un nuevo contador
   * @param newCounter - Datos del nuevo contador
   * @returns Observable con la respuesta
   */
  postCounter(newCounter: postCounter): Observable<any> {
    const url = `${this.baseUrl}/counters`;
    return this.util.buildRequest<any>('post', url, newCounter);
  }

  /**
   * Incrementa el contador de una estación
   * @param stationId - ID de la estación
   * @returns Observable con la respuesta
   */
  incrementCounter(stationId: number): Observable<any> {
    const url = `${this.baseUrl}/counters/increment?tenantId=${stationId}`;
    return this.util.buildRequest<any>('post', url, {}, false);
  }
}
