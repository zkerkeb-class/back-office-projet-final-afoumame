'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Music, Clock, Calendar, User, Pencil, Trash, Plus, Loader2, Upload } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { Track } from '@/types/Track';
import { useTracks, useUpdateTrack, useDeleteTrack, useCreateTrack } from '@/hooks/use-tracks';
import { cn } from '@/lib/utils';
import { TrackWaveform } from '@/components/track-waveform';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useAlbums } from '@/hooks/use-albums';
import { useArtists } from '@/hooks/use-artists';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';

interface TrackDetailsProps {
  track: Track;
  onClose: () => void;
}

function TrackDetails({ track, onClose }: TrackDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTrack, setEditedTrack] = useState({ ...track, isSingle: !track.albumId });
  const [isLoading, setIsLoading] = useState(false);
  const [isSingle, setIsSingle] = useState(!track.albumId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const updateTrack = useUpdateTrack();
  const deleteTrack = useDeleteTrack();
  const { data: albums } = useAlbums();
  const { data: artists } = useArtists();

  const album = albums?.find(a => a.id === track.albumId);
  const artist = artists?.find(a => a.id === track.artistId);

  const handlePlayPause = (playing: boolean) => {
    setIsPlaying(playing);
  };

  const handleTrackEdit = async () => {
    if (updateTrack.isPending) return;

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('title', editedTrack.title);
      formData.append('artistId', editedTrack.artistId);
      formData.append('isSingle', isSingle.toString());
      if (!isSingle) {
        formData.append('albumId', editedTrack.albumId || '');
      } else if (coverFile) {
        formData.append('cover', coverFile);
      }

      await updateTrack.mutateAsync({
        id: track.id,
        data: formData,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la modification de la piste:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSingleToggle = (checked: boolean) => {
    setIsSingle(checked);
    if (checked) {
      setEditedTrack(prev => ({ ...prev, albumId: null, isSingle: true }));
    } else {
      setEditedTrack(prev => ({ ...prev, isSingle: false }));
      setCoverFile(null);
      setPreviewUrl(null);
    }
  };

  const handleDeleteTrack = async () => {
    if (deleteTrack.isPending) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer cette piste ?')) {
      try {
        setIsLoading(true);
        await deleteTrack.mutateAsync(track.id);
        onClose();
      } catch (error) {
        console.error('Erreur lors de la suppression de la piste:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <span>Détails de la piste</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
              disabled={isLoading}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteTrack}
              disabled={isLoading || deleteTrack.isPending}
            >
              {deleteTrack.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin text-destructive" />
              ) : (
                <Trash className="h-4 w-4 text-destructive" />
              )}
            </Button>
          </div>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Titre</Label>
              <Input
                id="edit-title"
                value={editedTrack.title}
                onChange={e => setEditedTrack(prev => ({ ...prev, title: e.target.value }))}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="edit-artist">Artiste</Label>
              <Select
                value={editedTrack.artistId}
                onValueChange={value => setEditedTrack(prev => ({ ...prev, artistId: value }))}
                disabled={isLoading}
              >
                <SelectTrigger id="edit-artist">
                  <SelectValue placeholder="Sélectionner un artiste" />
                </SelectTrigger>
                <SelectContent>
                  {artists?.map(artist => (
                    <SelectItem key={artist.id} value={artist.id}>
                      {artist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="single-mode"
                checked={isSingle}
                onCheckedChange={handleSingleToggle}
                disabled={isLoading}
              />
              <Label htmlFor="single-mode">Single</Label>
            </div>
            {isSingle && (
              <div className="space-y-2">
                <Label htmlFor="edit-cover">Couverture du single</Label>
                <div className="flex flex-col items-center gap-4">
                  {(previewUrl || track.coverUrl) && (
                    <div className="relative aspect-square w-full max-w-[200px]">
                      <Image
                        src={previewUrl || track.coverUrl || ''}
                        alt="Prévisualisation"
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  )}
                  <div className="flex w-full items-center gap-2">
                    <Input
                      id="edit-cover"
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCoverFile(file);
                          const url = URL.createObjectURL(file);
                          setPreviewUrl(url);
                        }
                      }}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('edit-cover')?.click()}
                      disabled={isLoading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {coverFile || track.coverUrl ? "Changer l'image" : 'Sélectionner une image'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {!isSingle && (
              <div>
                <Label htmlFor="edit-album">Album</Label>
                <Select
                  value={editedTrack.albumId || undefined}
                  onValueChange={value => setEditedTrack(prev => ({ ...prev, albumId: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger id="edit-album">
                    <SelectValue placeholder="Sélectionner un album" />
                  </SelectTrigger>
                  <SelectContent>
                    {albums?.map(album => (
                      <SelectItem key={album.id} value={album.id}>
                        {album.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                Annuler
              </Button>
              <Button onClick={handleTrackEdit} disabled={isLoading || updateTrack.isPending}>
                {updateTrack.isPending ? (
                  <>
                    <span className="mr-2">Enregistrement...</span>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  'Enregistrer les modifications'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {track.coverUrl && !track.albumId && (
                <div className="relative aspect-square w-full max-w-[200px] mx-auto">
                  <Image
                    src={track.coverUrl}
                    alt={track.title}
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              )}
              <h3 className="text-2xl font-bold">{editedTrack.title}</h3>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {artist ? (
                    <Link href={`/artists?id=${artist.id}`} className="hover:underline">
                      {artist.name}
                    </Link>
                  ) : (
                    'Artiste inconnu'
                  )}
                </div>
                {album && (
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    <Link href={`/albums?id=${album.id}`} className="hover:underline">
                      {album.title}
                    </Link>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formatDuration(track.duration)}
                </div>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <TrackWaveform
                url={track.audioUrl}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
              />
            </div>
          </>
        )}
      </div>
    </DialogContent>
  );
}

export default function TracksPage() {
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [trackForm, setTrackForm] = useState({
    title: '',
    duration: '',
    artistId: '',
    albumId: '',
    audio: null as File | null,
    cover: null as File | null,
    isLoading: false,
    isSingle: true,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: tracks, isLoading } = useTracks();
  const { data: albums } = useAlbums();
  const { data: artists } = useArtists();
  const createTrack = useCreateTrack();
  const updateTrack = useUpdateTrack();
  const deleteTrack = useDeleteTrack();

  const extractAudioMetadata = async (file: File) => {
    setTrackForm(prev => ({ ...prev, isLoading: true }));

    try {
      const audioContext = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const fileName = file.name.replace(/\.[^/.]+$/, '');

      setTrackForm(prev => ({
        ...prev,
        title: fileName,
        duration: Math.ceil(audioBuffer.duration).toString(),
        audio: file,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Erreur lors de l'extraction des métadonnées:", error);
      setTrackForm(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackForm.audio || createTrack.isPending) return;

    const formData = new FormData();
    formData.append('title', trackForm.title);
    formData.append('duration', trackForm.duration);
    formData.append('artistId', trackForm.artistId);
    formData.append('audio', trackForm.audio);
    formData.append('isSingle', trackForm.isSingle.toString());
    if (!trackForm.isSingle && trackForm.albumId) {
      formData.append('albumId', trackForm.albumId);
    }
    if (trackForm.isSingle && trackForm.cover) {
      formData.append('cover', trackForm.cover);
    }

    try {
      await createTrack.mutateAsync(formData);
      setCreateModalOpen(false);
      setTrackForm({
        title: '',
        duration: '',
        artistId: '',
        albumId: '',
        audio: null,
        cover: null,
        isLoading: false,
        isSingle: true,
      });
      setPreviewUrl(null);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la piste:", error);
    }
  };

  const handlePlayPause = (trackId: string, isPlaying: boolean) => {
    if (isPlaying) {
      setPlayingTrackId(trackId);
    } else {
      setPlayingTrackId(null);
    }
  };

  const handleTrackClick = (track: Track) => {
    setSelectedTrack(track);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedTrack(null);
    setPlayingTrackId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(5)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!tracks || !albums || !artists) {
    return null;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pistes</h1>
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une piste
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle piste</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="track-audio">Fichier audio</Label>
                <Input
                  id="track-audio"
                  type="file"
                  accept="audio/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      extractAudioMetadata(file);
                    }
                  }}
                  required
                />
                {trackForm.isLoading && (
                  <p className="text-sm text-muted-foreground">
                    Extraction des métadonnées en cours...
                  </p>
                )}
              </div>

              {trackForm.audio && !trackForm.isLoading && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="track-title">Titre de la piste</Label>
                    <Input
                      id="track-title"
                      value={trackForm.title}
                      onChange={e => setTrackForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="track-artist">Artiste</Label>
                    <Select
                      value={trackForm.artistId}
                      onValueChange={value => setTrackForm(prev => ({ ...prev, artistId: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un artiste" />
                      </SelectTrigger>
                      <SelectContent>
                        {artists?.map(artist => (
                          <SelectItem key={artist.id} value={artist.id}>
                            {artist.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="single-mode"
                      checked={trackForm.isSingle}
                      onCheckedChange={checked =>
                        setTrackForm(prev => ({
                          ...prev,
                          isSingle: checked,
                          albumId: checked ? '' : prev.albumId,
                          cover: checked ? prev.cover : null,
                        }))
                      }
                    />
                    <Label htmlFor="single-mode">Single</Label>
                  </div>
                  {!trackForm.isSingle && (
                    <div className="space-y-2">
                      <Label htmlFor="track-album">Album</Label>
                      <Select
                        value={trackForm.albumId}
                        onValueChange={value => setTrackForm(prev => ({ ...prev, albumId: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un album" />
                        </SelectTrigger>
                        <SelectContent>
                          {albums?.map(album => (
                            <SelectItem key={album.id} value={album.id}>
                              {album.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {trackForm.isSingle && (
                    <div className="space-y-2">
                      <Label htmlFor="track-cover">Couverture du single</Label>
                      <div className="flex flex-col items-center gap-4">
                        {previewUrl && (
                          <div className="relative aspect-square w-full max-w-[200px]">
                            <Image
                              src={previewUrl}
                              alt="Prévisualisation"
                              fill
                              className="rounded-lg object-cover"
                            />
                          </div>
                        )}
                        <div className="flex w-full items-center gap-2">
                          <Input
                            id="track-cover"
                            name="cover"
                            type="file"
                            accept="image/*"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setTrackForm(prev => ({ ...prev, cover: file }));
                                const url = URL.createObjectURL(file);
                                setPreviewUrl(url);
                              }
                            }}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => document.getElementById('track-cover')?.click()}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {trackForm.cover ? "Changer l'image" : 'Sélectionner une image'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="track-duration">Durée (en secondes)</Label>
                    <Input
                      id="track-duration"
                      type="number"
                      value={trackForm.duration}
                      onChange={e => setTrackForm(prev => ({ ...prev, duration: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setCreateModalOpen(false)}
                      disabled={createTrack.isPending}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={createTrack.isPending}>
                      {createTrack.isPending ? (
                        <>
                          <span className="mr-2">Création en cours...</span>
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </>
                      ) : (
                        'Ajouter la piste'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {tracks.map(track => {
          const album = albums.find(a => a.id === track.albumId);
          const artist = artists.find(a => a.id === track.artistId);

          return (
            <div key={track.id}>
              <Card
                className={cn(
                  'transition-colors hover:bg-muted/50 cursor-pointer',
                  playingTrackId === track.id && 'bg-muted/50',
                )}
                onClick={() => handleTrackClick(track)}
              >
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium truncate">{track.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          {artist && <span>{artist.name}</span>}
                          {album && (
                            <>
                              <span>•</span>
                              <span>{album.title}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(track.duration)}</span>
                        </div>
                        {track.albumId ? (
                          <div className="flex items-center gap-1">
                            <Music className="h-4 w-4" />
                            <span>Album</span>
                          </div>
                        ) : (
                          <span className="text-primary">Single</span>
                        )}
                      </div>
                    </div>
                    <div onClick={e => e.stopPropagation()}>
                      <TrackWaveform
                        url={track.audioUrl}
                        isPlaying={playingTrackId === track.id}
                        onPlayPause={isPlaying => handlePlayPause(track.id, isPlaying)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedTrack && <TrackDetails track={selectedTrack} onClose={handleDialogClose} />}
      </Dialog>
    </div>
  );
}
