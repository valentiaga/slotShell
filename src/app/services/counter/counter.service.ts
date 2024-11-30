import { computed, EventEmitter, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { environments } from '../../../assets/environment';
import { Counter, CounterResponse, postCounter } from '../../interfaces/counter';
import { UtilService } from '../util/util.service';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CounterService {
  private readonly baseUrl: string = environments.BASE_URL

  constructor(private http: HttpClient, private util: UtilService) {}

  getCounter(): Observable<number> {      
    const idAuth = localStorage.getItem('idAuth');  
  
    if (!idAuth) {
      throw new Error('No se ha encontrado id_authentication en el almacenamiento local');
    }
  
    const url = `${this.baseUrl}/counters/id_authentication/${idAuth}`;
    return this.util.buildRequest<CounterResponse>('get', url).pipe(
      map((response) => response.body.counter)
    );
  }

  postCounter(nuevoCounter: postCounter): Observable<any> {
    const url = `${this.baseUrl}/counters`;
    return this.util.buildRequest<any>('post', url, nuevoCounter);
  }
  
  incrementCounter(): Observable<any> {
    const url = `${this.baseUrl}/counters/increment`;
    const body = { message: 'Hola' };
    return this.util.buildRequest<any>('post', url, body);
  }
}
