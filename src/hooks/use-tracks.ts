import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Track, SearchTrackParams } from '@/types/Track';

const TRACKS_QUERY_KEY = ['tracks'];

export function useTracks() {
  return useQuery<Track[]>({
    queryKey: TRACKS_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch('http://localhost:8080/api/tracks');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des pistes');
      }
      return response.json();
    },
  });
}

interface UpdateTrackData {
  id: string;
  data: Partial<Track> | FormData;
}

export function useUpdateTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateTrackData) => {
      const response = await fetch(`http://localhost:8080/api/tracks/${id}`, {
        method: 'PUT',
        headers:
          data instanceof FormData
            ? {}
            : {
                'Content-Type': 'application/json',
              },
        body: data instanceof FormData ? data : JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la piste');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRACKS_QUERY_KEY });
    },
  });
}

export function useDeleteTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`http://localhost:8080/api/tracks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la piste');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRACKS_QUERY_KEY });
    },
  });
}

export function useCreateTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('http://localhost:8080/api/tracks', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la piste');
      }

      return response.json() as Promise<Track>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRACKS_QUERY_KEY });
    },
    onError: error => {
      console.error('Erreur lors de la création de la piste:', error);
    },
  });
}

export function useSearchTracks(params: SearchTrackParams) {
  return useQuery({
    queryKey: ['tracks', 'search', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.title) searchParams.append('title', params.title);
      if (params.albumId) searchParams.append('albumId', params.albumId);
      if (params.artistId) searchParams.append('artistId', params.artistId);
      if (params.isSingle !== undefined)
        searchParams.append('isSingle', params.isSingle.toString());

      const response = await fetch(`http://localhost:8080/api/tracks/search?${searchParams}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la recherche des pistes');
      }
      return response.json() as Promise<Track[]>;
    },
    enabled: Object.values(params).some(value => value !== undefined),
  });
}
