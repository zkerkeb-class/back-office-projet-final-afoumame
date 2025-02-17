import { useQuery } from '@tanstack/react-query';
import { Artist } from '@/types/Artist';

const ARTISTS_QUERY_KEY = ['artists'];

export function useArtists() {
  return useQuery({
    queryKey: ARTISTS_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch('http://localhost:8080/api/artists');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des artistes');
      }
      return response.json() as Promise<Artist[]>;
    },
  });
}
