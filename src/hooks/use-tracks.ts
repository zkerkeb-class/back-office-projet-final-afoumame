import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Track } from '@/types/Track';

const ALBUMS_QUERY_KEY = ['albums'];

export function useCreateTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('http://localhost:8080/api/tracks', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de la piste");
      }
      return response.json() as Promise<Track>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALBUMS_QUERY_KEY });
    },
  });
}

export function useDeleteTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trackId: string) => {
      const response = await fetch(`http://localhost:8080/api/tracks/${trackId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la piste');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALBUMS_QUERY_KEY });
    },
  });
}
