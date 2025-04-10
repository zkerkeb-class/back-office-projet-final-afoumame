import { Track } from './Track';

export interface Album {
  id: string;
  title: string;
  releaseDate: string;
  coverUrl: string | null;
  artistId: string;
  tracks: Track[];
}

export interface CreateAlbumInput {
  title: string;
  releaseDate: Date;
  artistId: string;
  coverUrl?: string | null;
}

export interface UpdateAlbumInput {
  title?: string;
  releaseDate?: Date;
  artistId?: string;
  coverUrl?: string | null;
}

export interface SearchAlbumParams {
  title?: string;
  artistId?: string;
  startDate?: string;
  endDate?: string;
}
