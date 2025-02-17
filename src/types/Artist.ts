export interface Artist {
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface CreateArtistInput {
  name: string;
  image?: File;
}

export interface UpdateArtistInput {
  name?: string;
  imageUrl?: string | null;
}
