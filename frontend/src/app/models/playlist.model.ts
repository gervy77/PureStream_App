import { Song } from './song.model';

export interface Playlist {
  _id: string;
  name: string;
  description: string;
  coverImage?: string;
  owner: {
    _id: string;
    username: string;
  };
  songs: PlaylistSong[];
  isPublic: boolean;
  isCollaborative: boolean;
  followers: number;
  tags: string[];
  totalDuration: number;
  playCount: number;
  songCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistSong {
  song: Song;
  addedAt: string;
  addedBy: {
    _id: string;
    username: string;
  };
}

export interface CreatePlaylistRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
  isCollaborative?: boolean;
  tags?: string;
}

export interface UpdatePlaylistRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
  isCollaborative?: boolean;
  tags?: string;
}

export interface PlaylistsResponse {
  playlists: Playlist[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
} 