import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MusicService } from '../../services/music.service';
import { FavoritesService } from '../../services/favorites.service';
import { PlaylistsService } from '../../services/playlists.service';
import { AssetService } from '../../services/asset.service';
import { Song } from '../../models/song.model';
import { Playlist } from '../../models/playlist.model';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit, OnDestroy {
  searchQuery = '';
  searchResults: Song[] = [];
  playlists: Playlist[] = [];
  genres: string[] = [];
  selectedGenre = '';
  isLoading = false;
  currentPage = 1;
  hasMoreResults = true;
  totalResults = 0;
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private musicService: MusicService,
    private favoritesService: FavoritesService,
    private playlistsService: PlaylistsService,
    public assetService: AssetService
  ) {}

  ngOnInit(): void {
    this.loadGenres();
    this.loadPlaylists();
    
    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      if (query.trim()) {
        this.performSearch(query);
      } else {
        this.searchResults = [];
        this.totalResults = 0;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  performSearch(query: string): void {
    this.isLoading = true;
    this.currentPage = 1;
    
    this.musicService.searchSongs(query, this.currentPage, 20).subscribe({
      next: (response) => {
        this.searchResults = response.songs || [];
        this.totalResults = response.total || 0;
        this.hasMoreResults = this.searchResults.length === 20;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la recherche:', error);
        this.isLoading = false;
      }
    });
  }

  loadMoreResults(): void {
    if (!this.hasMoreResults || this.isLoading) return;
    
    this.isLoading = true;
    this.currentPage++;
    
    this.musicService.searchSongs(this.searchQuery, this.currentPage, 20).subscribe({
      next: (response) => {
        const newSongs = response.songs || [];
        this.searchResults = [...this.searchResults, ...newSongs];
        this.hasMoreResults = newSongs.length === 20;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de plus de résultats:', error);
        this.isLoading = false;
        this.currentPage--;
      }
    });
  }

  filterByGenre(genre: string): void {
    this.selectedGenre = genre;
    // TODO: Implement genre filtering in the backend
    console.log('Filtrer par genre:', genre);
  }

  clearFilters(): void {
    this.selectedGenre = '';
    this.onSearchInput();
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

  loadPlaylists(): void {
    this.playlistsService.playlists$.subscribe(playlists => {
      this.playlists = playlists;
    });
  }

  playSong(song: Song): void {
    this.musicService.playSong(song);
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

  addToPlaylist(song: Song, playlistId: string, event: Event): void {
    event.stopPropagation();
    this.playlistsService.addSongToPlaylist(playlistId, song._id || '').subscribe({
      next: () => {
        console.log('Chanson ajoutée à la playlist');
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout à la playlist:', error);
      }
    });
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
} 