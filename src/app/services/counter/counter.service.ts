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
  private counterSignal: WritableSignal<number> = signal(0);

  constructor(private http: HttpClient, private util: UtilService) {}

  // Method to get the current counter value from the server
  getCounter(): WritableSignal<number> {
    const idAuth = localStorage.getItem('idAuth');

    if (!idAuth) {
      throw new Error('No se ha encontrado id_authentication en el almacenamiento local');
    }

    const url = `${this.baseUrl}/counters/id_authentication/${idAuth}`;
    this.util.buildRequest<CounterResponse>('get', url,{}, false).pipe(
      map((response) => {
        this.counterSignal.set(response.body.counter);
      })
    ).subscribe();

    return this.counterSignal;
  }

  postCounter(nuevoCounter: postCounter): Observable<any> {
    const url = `${this.baseUrl}/counters`;
    return this.util.buildRequest<any>('post', url, nuevoCounter);
  }

  incrementCounter(estacionID: number): Observable<any> {
    const url = `${this.baseUrl}/counters/increment?tenantId=${estacionID}`;
    return this.util.buildRequest<any>('post', url, {}, false);
  }
}
