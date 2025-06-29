import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { UploadService } from '../../services/upload.service';
import { MusicService } from '../../services/music.service';
import { ErrorService } from '../../services/error.service';
import { Song } from '../../models/song.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent implements OnInit, OnDestroy {
  audioFile: File | null = null;
  coverImage: File | null = null;
  genres: string[] = [];
  
  songMetadata = {
    title: '',
    artist: '',
    album: '',
    genre: ''
  };
  
  isUploading = false;
  uploadProgress = 0;
  isDragOver = false;
  previewUrl: string | null = null;
  coverPreviewUrl: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private uploadService: UploadService,
    private musicService: MusicService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.loadGenres();
    
    // Subscribe to upload progress
    this.uploadService.uploadProgress$
      .pipe(takeUntil(this.destroy$))
      .subscribe(progress => {
        if (progress) {
          this.uploadProgress = progress.progress;
        } else {
          this.uploadProgress = 0;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadGenres(): void {
    this.musicService.getGenres().subscribe({
      next: (response) => {
        this.genres = response.genres || [];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des genres:', error);
      }
    });
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    
    if (files && files.length > 0) {
      this.handleAudioFile(files[0]);
    }
  }

  onCoverSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    
    if (files && files.length > 0) {
      this.handleCoverFile(files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      if (file.type.startsWith('audio/')) {
        this.handleAudioFile(file);
      } else if (file.type.startsWith('image/')) {
        this.handleCoverFile(file);
      }
    }
  }

  private handleAudioFile(file: File): void {
    if (!file.type.startsWith('audio/')) {
      this.errorService.showError('Veuillez sélectionner un fichier audio valide.');
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      this.errorService.showError('Le fichier est trop volumineux. Taille maximale : 50MB');
      return;
    }
    
    this.audioFile = file;
    this.createAudioPreview(file);
  }

  private handleCoverFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.errorService.showError('Veuillez sélectionner une image valide.');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      this.errorService.showError('L\'image est trop volumineuse. Taille maximale : 5MB');
      return;
    }
    
    this.coverImage = file;
    this.createCoverPreview(file);
  }

  private createAudioPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  private createCoverPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.coverPreviewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  uploadSong(): void {
    if (!this.audioFile) {
      this.errorService.showError('Veuillez sélectionner un fichier audio.');
      return;
    }
    
    if (!this.songMetadata.title.trim() || !this.songMetadata.artist.trim()) {
      this.errorService.showError('Veuillez remplir le titre et l\'artiste.');
      return;
    }
    
    this.isUploading = true;
    this.uploadProgress = 0;
    
    console.log('Starting upload...');
    
    this.uploadService.uploadSong(this.audioFile, {
      title: this.songMetadata.title.trim(),
      artist: this.songMetadata.artist.trim(),
      album: this.songMetadata.album.trim() || undefined,
      genre: this.songMetadata.genre || undefined,
      coverImage: this.coverImage || undefined
    }).subscribe({
      next: (event: HttpEvent<any>) => {
        console.log('Upload event received:', event.type);
        
        switch (event.type) {
          case HttpEventType.Sent:
            console.log('Upload started');
            break;
          case HttpEventType.UploadProgress:
            if ('loaded' in event && 'total' in event && event.total) {
              this.uploadProgress = Math.round(100 * event.loaded / event.total);
              console.log(`Upload progress: ${this.uploadProgress}%`);
            }
            break;
          case HttpEventType.Response:
            console.log('Upload completed successfully:', event.body);
            this.isUploading = false;
            this.resetForm();
            this.errorService.showSuccess('Chanson uploadée avec succès !');
            break;
        }
      },
      error: (error) => {
        console.error('Erreur lors de l\'upload:', error);
        this.errorService.showError('Erreur lors de l\'upload. Veuillez réessayer.');
        this.isUploading = false;
        this.uploadProgress = 0;
      }
    });
  }

  resetForm(): void {
    this.audioFile = null;
    this.coverImage = null;
    this.songMetadata = {
      title: '',
      artist: '',
      album: '',
      genre: ''
    };
    this.previewUrl = null;
    this.coverPreviewUrl = null;
    this.uploadProgress = 0;
    
    // Reset file inputs
    const audioInput = document.getElementById('audioFile') as HTMLInputElement;
    const coverInput = document.getElementById('coverImage') as HTMLInputElement;
    if (audioInput) audioInput.value = '';
    if (coverInput) coverInput.value = '';
  }

  removeAudioFile(): void {
    this.audioFile = null;
    this.previewUrl = null;
  }

  removeCoverImage(): void {
    this.coverImage = null;
    this.coverPreviewUrl = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
} 