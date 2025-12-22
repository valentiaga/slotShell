// cloudinary.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { CloudinaryImage } from '../../interfaces/image';
import { environments } from '../../../assets/environment';

declare global {
  interface Window {
    cloudinary: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private readonly baseUrl = environments.BASE_URL;
  private widget: any;

  // Cache de imágenes
  private imageCache = new Map<string, HTMLImageElement>();
  private newImagesSubject = new BehaviorSubject<boolean>(false);
  public hasNewImages$ = this.newImagesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCloudinaryWidget();
  }

  // Cargar el script del widget de Cloudinary
  private loadCloudinaryWidget(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.cloudinary) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Cloudinary widget'));
      document.head.appendChild(script);
    });
  }

  // Obtener firma del backend para upload seguro
  // Nota: para uploads con cropping el widget agrega params (ej: custom_coordinates) y
  // la firma debe generarse con EXACTAMENTE los params_to_sign que entrega el widget.
  private getSignature(paramsToSign?: Record<string, any>): Observable<any> {
    const body = paramsToSign ? { params_to_sign: paramsToSign } : {};
    return this.http.post(`${this.baseUrl}/cloudinary/signature`, body);
  }

  // Abrir widget de Cloudinary con validaciones
  async openUploadWidget(
    onSuccess: (result: any) => void,
    onError?: (error: any) => void,
    onClose?: () => void
  ) {
    await this.loadCloudinaryWidget();

    const signatureResponse = await this.getSignature().toPromise();

    const state = {
      didSucceed: false,
      didCloseCallback: false
    };

    const options = this.buildUploadWidgetOptions(signatureResponse, onError);

    this.widget = window.cloudinary.createUploadWidget(
      options,
      (error: any, result: any) => this.handleUploadWidgetResult(error, result, state, onSuccess, onError, onClose)
    );

    this.widget.open();
  }

  private buildUploadWidgetOptions(signatureResponse: any, onError?: (error: any) => void): any {
    return {
      cloudName: signatureResponse.cloudname,
      apiKey: signatureResponse.apikey,
      uploadSignature: (callback: (signature: string) => void, paramsToSign: Record<string, any>) => {
        console.log('[Cloudinary UW] params_to_sign:', paramsToSign);
        this.getSignature(paramsToSign).subscribe({
          next: (resp) => {
            callback(resp.signature);
          },
          error: (err) => {
            console.error('Error obteniendo firma:', err);
            if (onError) onError(err);
          }
        });
      },
      folder: 'prizes',
      sources: ['local'],
      multiple: false,
      maxFiles: 1,
      maxFileSize: 10000000,
      clientAllowedFormats: ['webp', 'png'],
      cropping: true,
      croppingAspectRatio: 1,
      croppingDefaultSelectionRatio: 1,
      croppingShowDimensions: true,
      styles: {
        palette: {
          window: '#FFFFFF',
          windowBorder: '#90A0B3',
          tabIcon: '#000000',
          menuIcons: '#5A616A',
          textDark: '#000000',
          textLight: '#FFFFFF',
          link: '#0078FF',
          action: '#FF620C',
          inactiveTabIcon: '#0E2F5A',
          error: '#F44235',
          inProgress: '#0078FF',
          complete: '#20B832',
          sourceBg: '#E4EBF1'
        },
        fonts: {
          default: null,
          "'Poppins', sans-serif": {
            url: 'https://fonts.googleapis.com/css?family=Poppins',
            active: true
          }
        }
      },
      text: {
        es: {
          or: 'o',
          back: 'Atrás',
          advanced: 'Avanzado',
          close: 'Cerrar',
          no_results: 'Sin resultados',
          search_placeholder: 'Buscar archivos',
          about_uw: 'Acerca del widget',
          menu: {
            files: 'Mis archivos',
            web: 'Dirección web',
            camera: 'Cámara'
          },
          local: {
            browse: 'Explorar',
            dd_title_single: 'Arrastra una imagen aquí',
            dd_title_multi: 'Arrastra imágenes aquí',
            drop_title_single: 'Suelta para subir',
            drop_title_multiple: 'Suelta para subir'
          },
          crop: {
            title: 'Recortar',
            crop_btn: 'Recortar y continuar',
            skip_btn: 'Saltar',
            reset_btn: 'Reiniciar',
            close_prompt: '¿Cerrar el recorte cancelará la subida?'
          }
        }
      },
      language: 'es'
    };
  }

  private handleUploadWidgetResult(
    error: any,
    result: any,
    state: { didSucceed: boolean; didCloseCallback: boolean },
    onSuccess: (result: any) => void,
    onError?: (error: any) => void,
    onClose?: () => void
  ): void {
    if (error) {
      console.error('Error en upload:', error);
      if (onError) onError(error);
      return;
    }

    if (this.isWidgetCloseEvent(result)) {
      this.maybeInvokeOnClose(state, onClose);
      return;
    }

    if (result?.event === 'success') {
      state.didSucceed = true;
      console.log('Upload exitoso:', result.info);
      this.newImagesSubject.next(true);
      onSuccess(result.info);
    }
  }

  private isWidgetCloseEvent(result: any): boolean {
    const isHiddenDisplayChange =
      result?.event === 'display-changed' &&
      (result?.info === 'hidden' || result?.info?.display === 'hidden' || result?.info?.state === 'hidden');

    return result?.event === 'close' || result?.event === 'abort' || result?.event === 'batch-cancelled' || isHiddenDisplayChange;
  }

  private maybeInvokeOnClose(state: { didSucceed: boolean; didCloseCallback: boolean }, onClose?: () => void): void {
    if (state.didSucceed || state.didCloseCallback || !onClose) {
      return;
    }

    state.didCloseCallback = true;
    onClose();
  }

  // Pre-cargar imágenes para caché (lazy loading inteligente)
  preloadImages(imageUrls: string[]): void {
    imageUrls.forEach(url => {
      if (!this.imageCache.has(url)) {
        const img = new Image();
        img.src = this.getOptimizedUrl(url);
        img.onload = () => {
          this.imageCache.set(url, img);
        };
      }
    });
  }

  // Obtener imagen desde caché
  getFromCache(url: string): HTMLImageElement | undefined {
    return this.imageCache.get(url);
  }

  // Verificar si hay imagen en caché
  isImageCached(url: string): boolean {
    return this.imageCache.has(url);
  }

  // Limpiar caché de imágenes
  clearCache(): void {
    this.imageCache.clear();
  }

  // Reset flag de nuevas imágenes
  resetNewImagesFlag(): void {
    this.newImagesSubject.next(false);
  }

  // Generar URL optimizada de Cloudinary
  getOptimizedUrl(url: string, width = 1024, height = 1024): string {
    // Si ya es una URL completa de Cloudinary, extraer el public_id y reconstruir con optimizaciones
    if (url.includes('cloudinary.com')) {
      // Extraer public_id de la URL
      const urlParts = url.split('/upload/');
      if (urlParts.length === 2) {
        const cloudNameMatch = url.match(/cloudinary\.com\/([^\/]+)\//);
        const cloudName = cloudNameMatch ? cloudNameMatch[1] : '';
        const publicIdPart = urlParts[1];
        // Remover transformaciones existentes y extensión
        const publicId = publicIdPart.replace(/^[^\/]+\//, '').replace(/\.[^.]+$/, '');

        // Construir URL optimizada
        return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${height},c_fill,f_auto,q_auto/${publicId}`;
      }
      // Si no se puede parsear, devolver la URL original
      return url;
    }

    // Si no es una URL de Cloudinary, devolver tal cual
    return url;
  }

  // Guardar metadata de imagen en BD
  saveImageMetadata(imageData: CloudinaryImage): Observable<any> {
    return this.http.post(`${this.baseUrl}/images`, imageData);
  }

  // Eliminar imagen de Cloudinary y BD
  deleteImage(publicId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cloudinary/delete/${publicId}`);
  }
}
