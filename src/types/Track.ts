export interface Track {
  id: string;
  title: string;
  duration: number;
  audioUrl: string;
  coverUrl: string | null;
  albumId: string | null;
  artistId: string;
  isSingle: boolean;
}

export interface CreateTrackInput {
  title: string;
  duration: number;
  audioUrl: string;
  coverUrl?: string | null;
  albumId?: string;
  artistId: string;
  isSingle: boolean;
}

export interface UpdateTrackInput {
  title?: string;
  duration?: number;
  audioUrl?: string;
  coverUrl?: string | null;
  albumId?: string | null;
  artistId?: string;
  isSingle?: boolean;
}

export interface SearchTrackParams {
  title?: string;
  albumId?: string;
  artistId?: string;
  isSingle?: boolean;
}
