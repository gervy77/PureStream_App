import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Playlist } from '../models/playlist.model';
import { Song } from '../models/song.model';

@Injectable({
  providedIn: 'root'
})
export class PlaylistsService {
  private apiUrl = `${environment.apiUrl}/playlists`;
  private playlistsSubject = new BehaviorSubject<Playlist[]>([]);
  public playlists$ = this.playlistsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadPlaylists();
  }

  private loadPlaylists(): void {
    this.getPlaylists().subscribe({
      next: (response) => {
        this.playlistsSubject.next(response.playlists || []);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des playlists:', error);
      }
    });
  }

  getPlaylists(): Observable<{ playlists: Playlist[] }> {
    return this.http.get<{ playlists: Playlist[] }>(`${this.apiUrl}/public`);
  }

  getPlaylist(id: string): Observable<{ playlist: Playlist }> {
    return this.http.get<{ playlist: Playlist }>(`${this.apiUrl}/${id}`);
  }

  createPlaylist(playlist: { name: string; description?: string; isPublic?: boolean }): Observable<{ playlist: Playlist }> {
    return this.http.post<{ playlist: Playlist }>(this.apiUrl, playlist).pipe(
      tap(() => {
        this.loadPlaylists();
      })
    );
  }

  updatePlaylist(id: string, updates: Partial<Playlist>): Observable<{ playlist: Playlist }> {
    return this.http.put<{ playlist: Playlist }>(`${this.apiUrl}/${id}`, updates).pipe(
      tap(() => {
        this.loadPlaylists();
      })
    );
  }

  deletePlaylist(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.loadPlaylists();
      })
    );
  }

  addSongToPlaylist(playlistId: string, songId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${playlistId}/songs/${songId}`, {}).pipe(
      tap(() => {
        this.loadPlaylists();
      })
    );
  }

  removeSongFromPlaylist(playlistId: string, songId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${playlistId}/songs/${songId}`).pipe(
      tap(() => {
        this.loadPlaylists();
      })
    );
  }

  getPlaylistsValue(): Playlist[] {
    return this.playlistsSubject.value;
  }
} 