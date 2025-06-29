import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicService } from '../../services/music.service';
import { FavoritesService } from '../../services/favorites.service';
import { UploadService } from '../../services/upload.service';
import { StatsService } from '../../services/stats.service';
import { AssetService } from '../../services/asset.service';
import { Song } from '../../models/song.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  popularSongs: Song[] = [];
  recentSongs: Song[] = [];
  genres: string[] = [];
  totalSongs = 0;
  totalPlaylists = 0;
  totalUsers = 0;
  
  private uploadSubscription?: Subscription;

  constructor(
    private musicService: MusicService,
    private favoritesService: FavoritesService,
    private uploadService: UploadService,
    private statsService: StatsService,
    public assetService: AssetService
  ) {}

  ngOnInit(): void {
    this.loadPopularSongs();
    this.loadRecentSongs();
    this.loadGenres();
    this.loadStats();
    
    // Écouter les notifications d'upload pour rafraîchir les données
    this.uploadSubscription = this.uploadService.uploadCompleted$.subscribe(
      (uploaded) => {
        if (uploaded) {
          console.log('Nouvelle chanson uploadée, rafraîchissement des données...');
          this.loadRecentSongs();
          this.loadPopularSongs();
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.uploadSubscription) {
      this.uploadSubscription.unsubscribe();
    }
  }

  loadPopularSongs(): void {
    this.musicService.getPopularSongs(8).subscribe({
      next: (response) => {
        this.popularSongs = response.songs || [];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des chansons populaires:', error);
      }
    });
  }

  loadRecentSongs(): void {
    this.musicService.getSongs(1, 8).subscribe({
      next: (response) => {
        this.recentSongs = response.songs || [];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des chansons récentes:', error);
      }
    });
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

  loadStats(): void {
    this.statsService.getStats().subscribe({
      next: (stats) => {
        this.totalSongs = stats.songs;
        this.totalPlaylists = stats.playlists;
        this.totalUsers = stats.users;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    });
  }

  playSong(song: Song): void {
    this.musicService.playSong(song);
  }

  toggleFavorite(song: Song, event: Event): void {
    event.stopPropagation(); // Empêcher la lecture de la chanson
    this.favoritesService.toggleFavorite(song._id || '').subscribe({
      next: () => {
        // Mettre à jour l'état local si nécessaire
        console.log('Favori mis à jour');
      },
      error: (error: any) => {
        console.error('Erreur lors de la mise à jour du favori:', error);
      }
    });
  }

  isFavorite(songId: string): boolean {
    // TODO: Implémenter la vérification des favoris
    return false;
  }

  exploreGenre(genre: string): void {
    // Navigation vers la page de recherche avec le genre
    console.log('Explorer le genre:', genre);
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