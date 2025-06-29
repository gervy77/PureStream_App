import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlaylistsService } from '../../services/playlists.service';
import { MusicService } from '../../services/music.service';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from '../../services/error.service';
import { AssetService } from '../../services/asset.service';
import { Playlist } from '../../models/playlist.model';
import { Song } from '../../models/song.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './playlists.component.html',
  styleUrl: './playlists.component.scss'
})
export class PlaylistsComponent implements OnInit, OnDestroy {
  playlists: Playlist[] = [];
  selectedPlaylist: Playlist | null = null;
  isLoading = false;
  showCreateModal = false;
  showAddSongModal = false;
  
  newPlaylist = {
    name: '',
    description: '',
    isPublic: true
  };
  
  private destroy$ = new Subject<void>();

  constructor(
    private playlistsService: PlaylistsService,
    private musicService: MusicService,
    public authService: AuthService,
    public assetService: AssetService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.loadPlaylists();
    
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

  loadPlaylists(): void {
    this.isLoading = true;
    this.playlistsService.getPlaylists().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des playlists:', error);
        this.isLoading = false;
      }
    });
  }

  createPlaylist(): void {
    if (!this.newPlaylist.name.trim()) {
      this.errorService.showError('Veuillez saisir un nom pour la playlist.');
      return;
    }
    
    this.playlistsService.createPlaylist({
      name: this.newPlaylist.name.trim(),
      description: this.newPlaylist.description.trim() || undefined,
      isPublic: this.newPlaylist.isPublic
    }).subscribe({
      next: (response) => {
        this.errorService.showSuccess('Playlist créée avec succès !');
        this.closeCreateModal();
        this.resetNewPlaylist();
      },
      error: (error) => {
        console.error('Erreur lors de la création de la playlist:', error);
        this.errorService.showError('Erreur lors de la création de la playlist.');
      }
    });
  }

  updatePlaylist(playlist: Playlist): void {
    this.playlistsService.updatePlaylist(playlist._id, {
      name: playlist.name,
      description: playlist.description,
      isPublic: playlist.isPublic
    }).subscribe({
      next: () => {
        this.errorService.showSuccess('Playlist mise à jour avec succès !');
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour de la playlist:', error);
        this.errorService.showError('Erreur lors de la mise à jour de la playlist.');
      }
    });
  }

  deletePlaylist(playlist: Playlist): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la playlist "${playlist.name}" ?`)) {
      this.playlistsService.deletePlaylist(playlist._id).subscribe({
        next: () => {
          this.errorService.showSuccess('Playlist supprimée avec succès !');
          if (this.selectedPlaylist?._id === playlist._id) {
            this.selectedPlaylist = null;
          }
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de la playlist:', error);
          this.errorService.showError('Erreur lors de la suppression de la playlist.');
        }
      });
    }
  }

  selectPlaylist(playlist: Playlist): void {
    this.selectedPlaylist = playlist;
  }

  playPlaylist(playlist: Playlist): void {
    if (playlist.songs && playlist.songs.length > 0) {
      const songs = playlist.songs.map(playlistSong => playlistSong.song);
      this.musicService.setQueue(songs, 0);
    }
  }

  playSong(song: Song): void {
    this.musicService.playSong(song);
  }

  removeSongFromPlaylist(playlist: Playlist, song: Song, event: Event): void {
    event.stopPropagation();
    this.playlistsService.removeSongFromPlaylist(playlist._id || '', song._id || '').subscribe({
      next: () => {
        this.errorService.showSuccess('Chanson retirée de la playlist !');
      },
      error: (error) => {
        console.error('Erreur lors de la suppression de la chanson:', error);
        this.errorService.showError('Erreur lors de la suppression de la chanson.');
      }
    });
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetNewPlaylist();
  }

  resetNewPlaylist(): void {
    this.newPlaylist = {
      name: '',
      description: '',
      isPublic: true
    };
  }

  openAddSongModal(): void {
    this.showAddSongModal = true;
  }

  closeAddSongModal(): void {
    this.showAddSongModal = false;
  }

  addSongToPlaylist(song: Song): void {
    if (!this.selectedPlaylist) return;
    
    this.playlistsService.addSongToPlaylist(this.selectedPlaylist._id || '', song._id || '').subscribe({
      next: () => {
        this.errorService.showSuccess('Chanson ajoutée à la playlist !');
        this.closeAddSongModal();
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout de la chanson:', error);
        this.errorService.showError('Erreur lors de l\'ajout de la chanson.');
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