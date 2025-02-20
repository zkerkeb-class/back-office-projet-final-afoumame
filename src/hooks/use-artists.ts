import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Artist, CreateArtistInput, UpdateArtistInput } from '@/types/Artist';

const ARTISTS_QUERY_KEY = ['artists'];

export interface SearchArtistParams {
  name?: string;
}

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

export function useSearchArtists(params: SearchArtistParams) {
  return useQuery({
    queryKey: ['artists', 'search', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.name) searchParams.append('name', params.name);

      const response = await fetch(`http://localhost:8080/api/artists/search?${searchParams}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la recherche des artistes');
      }
      return response.json() as Promise<Artist[]>;
    },
    enabled: Object.values(params).some(value => value !== undefined),
  });
}

export function useCreateArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('http://localhost:8080/api/artists', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la création de l'artiste");
      }
      return response.json() as Promise<Artist>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARTISTS_QUERY_KEY });
    },
  });
}

export function useUpdateArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateArtistInput }) => {
      const response = await fetch(`http://localhost:8080/api/artists/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la modification de l'artiste");
      }
      return response.json() as Promise<Artist>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARTISTS_QUERY_KEY });
    },
  });
}

export function useDeleteArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (artistId: string) => {
      const response = await fetch(`http://localhost:8080/api/artists/${artistId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'artiste");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARTISTS_QUERY_KEY });
    },
  });
}
