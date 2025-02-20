import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Album, UpdateAlbumInput, SearchAlbumParams } from '@/types/Album';

const ALBUMS_QUERY_KEY = ['albums'];
const ARTISTS_QUERY_KEY = ['artists'];
export function useAlbums() {
  return useQuery({
    queryKey: ALBUMS_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch('http://localhost:8080/api/albums');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des albums');
      }
      return response.json() as Promise<Album[]>;
    },
  });
}

export function useCreateAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('http://localhost:8080/api/albums', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la création de l'album");
      }
      return response.json() as Promise<Album>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALBUMS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ARTISTS_QUERY_KEY });
    },
  });
}

export function useUpdateAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAlbumInput }) => {
      const response = await fetch(`http://localhost:8080/api/albums/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la modification de l'album");
      }
      return response.json() as Promise<Album>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALBUMS_QUERY_KEY });
    },
  });
}

export function useDeleteAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (albumId: string) => {
      const response = await fetch(`http://localhost:8080/api/albums/${albumId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'album");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALBUMS_QUERY_KEY });
    },
  });
}

export function useSearchAlbums(params: SearchAlbumParams) {
  return useQuery({
    queryKey: ['albums', 'search', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.title) searchParams.append('title', params.title);
      if (params.artistId) searchParams.append('artistId', params.artistId);
      if (params.startDate) searchParams.append('startDate', params.startDate.toString());
      if (params.endDate) searchParams.append('endDate', params.endDate.toString());

      const response = await fetch(`http://localhost:8080/api/albums/search?${searchParams}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la recherche des albums');
      }
      return response.json() as Promise<Album[]>;
    },
    enabled: Object.values(params).some(value => value !== undefined),
  });
}
