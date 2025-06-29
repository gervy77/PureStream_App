import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlaylistsService } from '../../services/playlists.service';

@Component({
  selector: 'app-create-playlist-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-playlist-modal.component.html',
  styleUrl: './create-playlist-modal.component.scss'
})
export class CreatePlaylistModalComponent {
  @Output() playlistCreated = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  playlistName = '';
  playlistDescription = '';
  isPrivate = false;

  constructor(private playlistsService: PlaylistsService) {}

  createPlaylist(): void {
    if (!this.playlistName.trim()) return;

    this.playlistsService.createPlaylist({
      name: this.playlistName.trim(),
      description: this.playlistDescription.trim(),
      isPublic: !this.isPrivate
    }).subscribe({
      next: () => {
        this.playlistCreated.emit();
        this.closeModal();
      },
      error: (error) => {
        console.error('Erreur lors de la création de la playlist:', error);
      }
    });
  }

  closeModal(): void {
    this.modalClosed.emit();
  }
} 