import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  // Utilise la racine du backend pour les assets
  private backendUrl = 'http://localhost:3000';

  constructor() { }

  /**
   * Obtient l'URL d'un asset depuis le backend
   */
  getAssetUrl(assetPath: string): string {
    return `${this.backendUrl}/uploads/assets/${assetPath}`;
  }

  /**
   * Obtient l'URL de l'avatar par défaut
   */
  getDefaultAvatar(): string {
    return this.getAssetUrl('default-avatar.png');
  }

  /**
   * Obtient l'URL de la cover par défaut
   */
  getDefaultCover(): string {
    return this.getAssetUrl('default-cover.png');
  }

  /**
   * Obtient l'URL de la playlist par défaut
   */
  getDefaultPlaylist(): string {
    return this.getAssetUrl('default-playlist.png');
  }

  /**
   * Obtient l'URL d'une image de profil utilisateur
   */
  getUserProfilePicture(profilePicture?: string): string {
    if (!profilePicture) {
      return this.getDefaultAvatar();
    }
    return `${this.backendUrl}/uploads/${profilePicture}`;
  }

  /**
   * Obtient l'URL d'une cover de chanson
   */
  getSongCover(coverImage?: string): string {
    if (!coverImage) {
      return this.getDefaultCover();
    }
    return `${this.backendUrl}/uploads/${coverImage}`;
  }

  /**
   * Obtient l'URL d'une image de playlist
   */
  getPlaylistImage(playlistImage?: string): string {
    if (!playlistImage) {
      return this.getDefaultPlaylist();
    }
    return `${this.backendUrl}/uploads/${playlistImage}`;
  }
} 