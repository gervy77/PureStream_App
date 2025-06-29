export interface Song {
  _id?: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  duration?: number;
  filePath?: string;
  audioUrl?: string;
  url?: string;
  lyrics?: string;
  releaseYear?: number;
  tags?: string[];
  isPublic?: boolean;
  uploadedBy?: string;
  playCount?: number;
  coverImage?: string;
  createdAt?: string;
  updatedAt?: string;
  likes?: number;
}

export interface SongUploadRequest {
  title: string;
  artist: string;
  album: string;
  genre: string;
  releaseYear?: number;
  lyrics?: string;
  tags?: string;
}

export interface SongsResponse {
  songs: Song[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface GenresResponse {
  genres: string[];
} 