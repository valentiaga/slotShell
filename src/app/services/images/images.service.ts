import { EventEmitter, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environments } from '../../../assets/environment';
import { ImageResponse, Image } from '../../interfaces/image';
import { UtilService } from '../util/util.service';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {
  private readonly baseUrl: string = environments.BASE_URL
  public imagesChanged = new EventEmitter<void>();

  constructor(private util: UtilService) { }

  getimages(): Observable<ImageResponse> {
    let url = `${this.baseUrl}/images`;
    
    return this.util.buildRequest<ImageResponse>('get', url, null, false);
  }
}
