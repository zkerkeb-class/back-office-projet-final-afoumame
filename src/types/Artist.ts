import { Album } from './Album';
import { Track } from './Track';

export interface Artist {
  id: string;
  name: string;
  imageUrl: string | null;
  biography: string | null;
  createdAt: string;
  albums: Album[];
  tracks: Track[];
}

export interface CreateArtistInput {
  name: string;
  biography?: string;
  image?: File;
}

export interface UpdateArtistInput {
  name?: string;
  biography?: string;
  imageUrl?: string | null;
}
