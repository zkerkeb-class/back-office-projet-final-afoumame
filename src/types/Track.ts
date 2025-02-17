export interface Track {
  id: string;
  title: string;
  duration: number;
  audioUrl: string;
  albumId: string | null;
  artistId: string;
}

export interface CreateTrackInput {
  title: string;
  duration: number;
  audioUrl: string;
  albumId?: string;
  artistId: string;
  isSingle?: boolean;
}

export interface UpdateTrackInput {
  title?: string;
  duration?: number;
  audioUrl?: string;
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
