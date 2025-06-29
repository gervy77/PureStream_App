import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Song } from '../models/song.model';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private apiUrl = `${environment.apiUrl}/favorites/songs`;
  private favoritesSubject = new BehaviorSubject<Song[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFavorites();
  }

  private loadFavorites(): void {
    this.getFavorites().subscribe({
      next: (response) => {
        this.favoritesSubject.next(response.songs || []);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des favoris:', error);
      }
    });
  }

  getFavorites(): Observable<{ songs: Song[] }> {
    return this.http.get<{ songs: Song[] }>(this.apiUrl);
  }

  addToFavorites(songId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${songId}`, {}).pipe(
      tap(() => {
        // Recharger les favoris après ajout
        this.loadFavorites();
      })
    );
  }

  removeFromFavorites(songId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${songId}`).pipe(
      tap(() => {
        // Recharger les favoris après suppression
        this.loadFavorites();
      })
    );
  }

  toggleFavorite(songId: string): Observable<any> {
    const currentFavorites = this.favoritesSubject.value;
    const isFavorite = currentFavorites.some(song => song._id === songId);
    
    if (isFavorite) {
      return this.removeFromFavorites(songId);
    } else {
      return this.addToFavorites(songId);
    }
  }

  isFavorite(songId: string): boolean {
    return this.favoritesSubject.value.some(song => song._id === songId);
  }

  getFavoritesValue(): Song[] {
    return this.favoritesSubject.value;
  }
} 