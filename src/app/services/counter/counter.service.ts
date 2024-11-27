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
  private _counter: WritableSignal<number> = signal(0);
  public counter = computed(() => this._counter())
  private idEmpresa = environments.ID_EMPRESA;

  constructor(private http: HttpClient, private util: UtilService) {
    this.getCounter(this.idEmpresa).subscribe();
  }

  getCounter(id_empresa: number): Observable<number> {  
    const url = `${this.baseUrl}/counters/id_authentication/${id_empresa}`;
    return this.util.buildRequest<CounterResponse>('get', url).pipe(
      tap((response) => this._counter.set(response.body.counter)),
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
