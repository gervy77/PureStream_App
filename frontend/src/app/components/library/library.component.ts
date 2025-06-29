import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicService } from '../../services/music.service';
import { FavoritesService } from '../../services/favorites.service';
import { PlaylistsService } from '../../services/playlists.service';
import { AuthService } from '../../services/auth.service';
import { AssetService } from '../../services/asset.service';
import { Song } from '../../models/song.model';
import { Playlist } from '../../models/playlist.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss'
})
export class LibraryComponent implements OnInit, OnDestroy {
  favorites: Song[] = [];
  playlists: Playlist[] = [];
  isLoading = false;
  activeTab = 'favorites';
  
  private destroy$ = new Subject<void>();

  constructor(
    private musicService: MusicService,
    private favoritesService: FavoritesService,
    private playlistsService: PlaylistsService,
    public authService: AuthService,
    public assetService: AssetService
  ) {}

  ngOnInit(): void {
    this.loadLibrary();
    
    // Subscribe to favorites updates
    this.favoritesService.favorites$
      .pipe(takeUntil(this.destroy$))
      .subscribe(favorites => {
        this.favorites = favorites;
      });
    
    // Subscribe to playlists updates
    this.playlistsService.playlists$
      .pipe(takeUntil(this.destroy$))
      .subscribe(playlists => {
        this.playlists = playlists;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLibrary(): void {
    this.isLoading = true;
    
    // Load favorites and playlists in parallel
    Promise.all([
      this.favoritesService.getFavorites().toPromise(),
      this.playlistsService.getPlaylists().toPromise()
    ]).finally(() => {
      this.isLoading = false;
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  playSong(song: Song): void {
    this.musicService.playSong(song);
  }

  playPlaylist(playlist: Playlist): void {
    if (playlist.songs && playlist.songs.length > 0) {
      const songs = playlist.songs.map(playlistSong => playlistSong.song);
      this.musicService.setQueue(songs, 0);
    }
  }

  toggleFavorite(song: Song, event: Event): void {
    event.stopPropagation();
    this.favoritesService.toggleFavorite(song._id || '').subscribe({
      next: () => {
        console.log('Favori mis à jour');
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du favori:', error);
      }
    });
  }

  isFavorite(songId: string): boolean {
    return this.favoritesService.isFavorite(songId);
  }

  removeFromFavorites(song: Song, event: Event): void {
    event.stopPropagation();
    this.favoritesService.removeFromFavorites(song._id || '').subscribe({
      next: () => {
        console.log('Chanson retirée des favoris');
      },
      error: (error) => {
        console.error('Erreur lors de la suppression du favori:', error);
      }
    });
  }

  deletePlaylist(playlist: Playlist, event: Event): void {
    event.stopPropagation();
    if (confirm(`Êtes-vous sûr de vouloir supprimer la playlist "${playlist.name}" ?`)) {
      this.playlistsService.deletePlaylist(playlist._id).subscribe({
        next: () => {
          console.log('Playlist supprimée');
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de la playlist:', error);
        }
      });
    }
  }

  formatDuration(duration: number): string {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getPlaylistDuration(playlist: Playlist): number {
    if (!playlist.songs) return 0;
    return playlist.songs.reduce((total, playlistSong) => total + (playlistSong.song.duration || 0), 0);
  }

  formatPlaylistDuration(playlist: Playlist): string {
    const totalSeconds = this.getPlaylistDuration(playlist);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
} 