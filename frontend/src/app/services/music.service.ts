import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Howl, Howler } from 'howler';
import { environment } from '../../environments/environment';
import { Song } from '../models/song.model';

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentSong: Song | null;
  queue: Song[];
  currentIndex: number;
}

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private apiUrl = `${environment.apiUrl}/songs`;
  private currentSound: Howl | null = null;
  private playbackStateSubject = new BehaviorSubject<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.5,
    currentSong: null,
    queue: [],
    currentIndex: -1
  });

  public playbackState$ = this.playbackStateSubject.asObservable();

  constructor(private http: HttpClient) {
    this.setupHowler();
  }

  private setupHowler(): void {
    // Configuration globale de Howler
    Howler.volume(0.5);
    
    // Mettre à jour le temps de lecture toutes les 100ms
    setInterval(() => {
      if (this.currentSound && this.currentSound.playing()) {
        const currentTime = this.currentSound.seek() as number;
        this.updatePlaybackState({ currentTime });
      }
    }, 100);
  }

  // Charger et jouer une chanson
  playSong(song: Song): void {
    this.stop();
    // Prend le champ filePath, audioUrl ou url, selon ce qui existe
    const audioPath = song.filePath || song.audioUrl || song.url || '';
    if (!audioPath) {
      console.warn('Aucun fichier audio associé à cette chanson :', song);
      alert('Aucun fichier audio disponible pour cette chanson.');
      return;
    }
    
    // Normaliser le chemin (remplacer les backslashes par des forward slashes)
    const normalizedPath = audioPath.replace(/\\/g, '/');
    
    const songUrl = normalizedPath.startsWith('uploads/')
      ? `${environment.apiUrl.replace('/api', '')}/${normalizedPath}`
      : normalizedPath;
      
    console.log('Lecture de la chanson, audioPath :', audioPath);
    console.log('Chemin normalisé :', normalizedPath);
    console.log('URL complète envoyée à Howler :', songUrl);
    console.log('Song object complet :', song);
    
    this.currentSound = new Howl({
      src: [songUrl],
      html5: true,
      volume: this.playbackStateSubject.value.volume,
      onload: () => {
        console.log('✅ Fichier audio chargé avec succès');
        const duration = this.currentSound!.duration();
        this.updatePlaybackState({
          currentSong: song,
          duration,
          currentTime: 0,
          isPlaying: true
        });
        this.currentSound!.play();
        this.incrementPlayCount(song._id || '');
      },
      onloaderror: (id, error) => {
        console.error('❌ Erreur lors du chargement du fichier audio :', error);
        console.error('URL qui a échoué :', songUrl);
        alert(`Erreur lors du chargement de l'audio : ${error}`);
      },
      onplayerror: (id, error) => {
        console.error('❌ Erreur lors de la lecture :', error);
        this.currentSound!.once('unlock', () => {
          this.currentSound!.play();
        });
      },
      onend: () => {
        this.next();
      },
      onstop: () => {
        this.updatePlaybackState({ isPlaying: false });
      },
      onplay: () => {
        this.updatePlaybackState({ isPlaying: true });
      },
      onpause: () => {
        this.updatePlaybackState({ isPlaying: false });
      }
    });
  }

  // Jouer/Pause
  togglePlay(): void {
    if (!this.currentSound) return;

    if (this.currentSound.playing()) {
      this.currentSound.pause();
    } else {
      this.currentSound.play();
    }
  }

  // Arrêter
  stop(): void {
    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound.unload();
      this.currentSound = null;
    }
    this.updatePlaybackState({
      isPlaying: false,
      currentTime: 0,
      currentSong: null
    });
  }

  // Chanson suivante
  next(): void {
    const state = this.playbackStateSubject.value;
    if (state.queue.length === 0) return;

    const nextIndex = (state.currentIndex + 1) % state.queue.length;
    this.playFromQueue(nextIndex);
  }

  // Chanson précédente
  previous(): void {
    const state = this.playbackStateSubject.value;
    if (state.queue.length === 0) return;

    const prevIndex = state.currentIndex <= 0 ? state.queue.length - 1 : state.currentIndex - 1;
    this.playFromQueue(prevIndex);
  }

  // Jouer depuis la queue
  playFromQueue(index: number): void {
    const state = this.playbackStateSubject.value;
    if (index >= 0 && index < state.queue.length) {
      this.updatePlaybackState({ currentIndex: index });
      this.playSong(state.queue[index]);
    }
  }

  // Définir la queue de lecture
  setQueue(songs: Song[], startIndex: number = 0): void {
    this.updatePlaybackState({ queue: songs, currentIndex: startIndex });
    if (songs.length > 0) {
      this.playFromQueue(startIndex);
    }
  }

  // Ajouter à la queue
  addToQueue(song: Song): void {
    const state = this.playbackStateSubject.value;
    this.updatePlaybackState({ queue: [...state.queue, song] });
  }

  // Contrôles de volume
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    Howler.volume(clampedVolume);
    this.updatePlaybackState({ volume: clampedVolume });
  }

  // Contrôles de position
  seek(time: number): void {
    if (this.currentSound) {
      this.currentSound.seek(time);
      this.updatePlaybackState({ currentTime: time });
    }
  }

  // Formatage du temps
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // API calls
  getSongs(page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  getPopularSongs(limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/popular?limit=${limit}`);
  }

  getGenres(): Observable<any> {
    return this.http.get(`${this.apiUrl}/genres`);
  }

  searchSongs(query: string, page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  likeSong(songId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${songId}/like`, {});
  }

  private incrementPlayCount(songId: string): void {
    this.http.post(`${this.apiUrl}/${songId}/play`, {}).subscribe();
  }

  private updatePlaybackState(updates: Partial<PlaybackState>): void {
    const currentState = this.playbackStateSubject.value;
    this.playbackStateSubject.next({ ...currentState, ...updates });
  }

  // Getters
  getCurrentSong(): Song | null {
    return this.playbackStateSubject.value.currentSong;
  }

  getQueue(): Song[] {
    return this.playbackStateSubject.value.queue;
  }

  isPlaying(): boolean {
    return this.playbackStateSubject.value.isPlaying;
  }

  getCurrentTime(): number {
    return this.playbackStateSubject.value.currentTime;
  }

  getDuration(): number {
    return this.playbackStateSubject.value.duration;
  }

  getVolume(): number {
    return this.playbackStateSubject.value.volume;
  }
} 