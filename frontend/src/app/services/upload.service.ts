import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Song } from '../models/song.model';

export interface UploadProgress {
  progress: number;
  loaded: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = `${environment.apiUrl}/songs/upload`;
  private uploadProgressSubject = new BehaviorSubject<UploadProgress | null>(null);
  public uploadProgress$ = this.uploadProgressSubject.asObservable();
  
  private uploadCompletedSubject = new BehaviorSubject<boolean>(false);
  public uploadCompleted$ = this.uploadCompletedSubject.asObservable();

  constructor(private http: HttpClient) {}

  uploadSong(
    file: File, 
    metadata: { 
      title: string; 
      artist: string; 
      album?: string; 
      genre?: string; 
      coverImage?: File 
    }
  ): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('title', metadata.title);
    formData.append('artist', metadata.artist);
    
    if (metadata.album) {
      formData.append('album', metadata.album);
    }
    
    if (metadata.genre) {
      formData.append('genre', metadata.genre);
    }
    
    if (metadata.coverImage) {
      formData.append('coverImage', metadata.coverImage);
    }

    console.log('Uploading song with metadata:', metadata);
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    return this.http.post(this.apiUrl, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  updateUploadProgress(event: HttpEvent<any>): void {
    console.log('Upload event:', event.type, event);
    
    switch (event.type) {
      case HttpEventType.UploadProgress:
        if (event.total) {
          const progress = Math.round(100 * event.loaded / event.total);
          console.log(`Upload progress: ${progress}%`);
          this.uploadProgressSubject.next({
            progress,
            loaded: event.loaded,
            total: event.total
          });
        }
        break;
      case HttpEventType.Response:
        console.log('Upload completed:', event.body);
        this.uploadProgressSubject.next(null);
        this.uploadCompletedSubject.next(true);
        // Reset after a delay
        setTimeout(() => {
          this.uploadCompletedSubject.next(false);
        }, 2000);
        break;
      case HttpEventType.Sent:
        console.log('Upload started');
        break;
    }
  }

  resetUploadProgress(): void {
    this.uploadProgressSubject.next(null);
  }

  getUploadProgress(): UploadProgress | null {
    return this.uploadProgressSubject.value;
  }

  // Méthode pour valider les fichiers avant upload
  validateFile(file: File): { valid: boolean; error?: string } {
    // Vérifier la taille (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Le fichier ${file.name} est trop volumineux (max 50MB)`
      };
    }

    // Vérifier le type de fichier
    const allowedTypes = [
      'audio/mpeg',
      'audio/wav',
      'audio/flac',
      'audio/aac',
      'audio/mp4'
    ];

    const allowedExtensions = ['.mp3', '.wav', '.flac', '.aac', '.m4a'];
    const fileName = file.name.toLowerCase();

    const isValidType = allowedTypes.includes(file.type) ||
      allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidType) {
      return {
        valid: false,
        error: `Le format de fichier ${file.name} n'est pas supporté`
      };
    }

    return { valid: true };
  }

  // Méthode pour extraire les métadonnées d'un fichier audio
  extractMetadata(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);

      audio.addEventListener('loadedmetadata', () => {
        const metadata = {
          duration: Math.round(audio.duration),
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: '',
          album: '',
          genre: '',
          releaseYear: new Date().getFullYear()
        };

        URL.revokeObjectURL(url);
        resolve(metadata);
      });

      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        reject(new Error('Impossible de lire le fichier audio'));
      });

      audio.src = url;
    });
  }
} 