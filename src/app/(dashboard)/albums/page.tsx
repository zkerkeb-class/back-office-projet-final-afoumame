'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Upload,
  Calendar,
  User,
  Music,
  Clock,
  Pencil,
  Trash,
  Search,
  CalendarIcon,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AudioPlayer } from '@/components/audio-player';
import {
  useAlbums,
  useCreateAlbum,
  useUpdateAlbum,
  useDeleteAlbum,
  useSearchAlbums,
} from '@/hooks/use-albums';
import { useArtists } from '@/hooks/use-artists';
import { useCreateTrack, useDeleteTrack } from '@/hooks/use-tracks';
import { SearchAlbumParams } from '@/types/Album';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface Track {
  id: string;
  title: string;
  duration: number;
  audioUrl: string;
  albumId: string | null;
  artistId: string;
}

interface Album {
  id: string;
  title: string;
  releaseDate: string;
  coverUrl: string | null;
  artistId: string;
  tracks: Track[];
}

interface Artist {
  id: string;
  name: string;
  imageUrl: string | null;
}

interface CreateAlbumForm {
  title: string;
  releaseDate: string;
  artistId: string;
  cover: File | null;
}

interface AlbumDetailsProps {
  album: Album;
  artist: Artist | undefined;
  onClose: () => void;
}

interface CreateTrackForm {
  title: string;
  duration: string;
  artistId: string;
  audio: File | null;
  isLoading?: boolean;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function AlbumDetails({ album, artist, onClose }: AlbumDetailsProps) {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAlbum, setEditedAlbum] = useState(album);
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [trackForm, setTrackForm] = useState<CreateTrackForm>({
    title: '',
    duration: '',
    artistId: album.artistId,
    audio: null,
    isLoading: false,
  });

  const updateAlbum = useUpdateAlbum();
  const createTrack = useCreateTrack();
  const deleteTrack = useDeleteTrack();
  const deleteAlbum = useDeleteAlbum();

  const handleAlbumEdit = async () => {
    if (updateAlbum.isPending) return;

    try {
      await updateAlbum.mutateAsync({
        id: album.id,
        data: {
          title: editedAlbum.title,
          releaseDate: new Date(editedAlbum.releaseDate),
          artistId: editedAlbum.artistId,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la modification de l'album:", error);
    }
  };

  const extractAudioMetadata = async (file: File) => {
    setTrackForm(prev => ({ ...prev, isLoading: true }));

    try {
      const audioContext = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Extraire le nom du fichier sans l'extension comme titre par défaut
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

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackForm.audio || createTrack.isPending) return;

    const formData = new FormData();
    formData.append('title', trackForm.title);
    formData.append('duration', trackForm.duration);
    formData.append('artistId', trackForm.artistId);
    formData.append('albumId', album.id);
    formData.append('audio', trackForm.audio);
    formData.append('isSingle', 'false');

    try {
      const newTrack = await createTrack.mutateAsync(formData);
      setEditedAlbum(prev => ({
        ...prev,
        tracks: [...prev.tracks, newTrack],
      }));
      setShowAddTrack(false);
      setTrackForm({
        title: '',
        duration: '',
        artistId: album.artistId,
        audio: null,
        isLoading: false,
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la piste:", error);
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    try {
      await deleteTrack.mutateAsync(trackId);
      setEditedAlbum(prev => ({
        ...prev,
        tracks: prev.tracks.filter(t => t.id !== trackId),
      }));
      if (selectedTrack?.id === trackId) {
        setSelectedTrack(null);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la piste:', error);
    }
  };

  const handleDeleteAlbum = async () => {
    if (deleteAlbum.isPending) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer cet album ?')) {
      try {
        await deleteAlbum.mutateAsync(album.id);
        onClose();
      } catch (error) {
        console.error("Erreur lors de la suppression de l'album:", error);
      }
    }
  };

  return (
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <span>Détails de l'album</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
              disabled={updateAlbum.isPending || deleteAlbum.isPending}
            >
              {updateAlbum.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Pencil className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteAlbum}
              disabled={updateAlbum.isPending || deleteAlbum.isPending}
            >
              {deleteAlbum.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin text-destructive" />
              ) : (
                <Trash className="h-4 w-4 text-destructive" />
              )}
            </Button>
          </div>
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="relative aspect-square w-full bg-muted rounded-lg overflow-hidden">
          {editedAlbum.coverUrl ? (
            <Image
              src={editedAlbum.coverUrl}
              alt={editedAlbum.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Titre</Label>
                <Input
                  id="edit-title"
                  value={editedAlbum.title}
                  onChange={e => setEditedAlbum(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-releaseDate">Date de sortie</Label>
                <Input
                  id="edit-releaseDate"
                  type="date"
                  value={editedAlbum.releaseDate.split('T')[0]}
                  onChange={e => setEditedAlbum(prev => ({ ...prev, releaseDate: e.target.value }))}
                />
              </div>
              <Button onClick={handleAlbumEdit} disabled={updateAlbum.isPending} className="mt-4">
                {updateAlbum.isPending ? (
                  <>
                    <span className="mr-2">Enregistrement...</span>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  'Enregistrer les modifications'
                )}
              </Button>
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-bold">{editedAlbum.title}</h3>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Calendar className="mr-2 h-4 w-4" />
                Sorti le {new Date(editedAlbum.releaseDate).toLocaleDateString('fr-FR')}
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <User className="mr-2 h-4 w-4" />
                {artist ? artist.name : 'Artiste inconnu'}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">Pistes</h4>
          <Button variant="outline" size="sm" onClick={() => setShowAddTrack(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une piste
          </Button>
        </div>
        {showAddTrack && (
          <div className="mb-4 rounded-lg border bg-card p-4">
            <form onSubmit={handleTrackSubmit} className="space-y-4">
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
                      onClick={() => setShowAddTrack(false)}
                      disabled={createTrack.isPending}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={createTrack.isPending}>
                      {createTrack.isPending ? (
                        <>
                          <span className="mr-2">Ajout en cours...</span>
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
          </div>
        )}
        {selectedTrack && (
          <div className="rounded-lg border bg-card p-4 mb-4">
            <AudioPlayer url={selectedTrack.audioUrl} title={selectedTrack.title} />
          </div>
        )}
        {editedAlbum.tracks.length > 0 ? (
          <div className="space-y-2">
            {editedAlbum.tracks.map((track, index) => (
              <div
                key={track.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                  selectedTrack?.id === track.id
                    ? 'bg-primary/10 hover:bg-primary/15'
                    : 'bg-secondary/50 hover:bg-secondary'
                }`}
              >
                <div
                  className="flex items-center gap-3 flex-1"
                  onClick={() => setSelectedTrack(track)}
                >
                  <span className="text-sm font-medium text-muted-foreground w-6 text-right">
                    {index + 1}
                  </span>
                  <Music className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{track.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    {formatDuration(track.duration)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDeleteTrack(track.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune piste disponible pour cet album
          </p>
        )}
      </div>
    </DialogContent>
  );
}

export default function AlbumsPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateAlbumForm>({
    title: '',
    releaseDate: '',
    artistId: '',
    cover: null,
  });
  const [searchParams, setSearchParams] = useState<SearchAlbumParams>({});
  const [searchTitle, setSearchTitle] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [searchArtistId, setSearchArtistId] = useState<string>('');

  const { data: albums, isLoading: isLoadingAlbums } = useAlbums();
  const { data: searchResults, isLoading: isSearching } = useSearchAlbums(searchParams);
  const { data: artists, isLoading: isLoadingArtists } = useArtists();
  const createAlbum = useCreateAlbum();

  // Récupérer le paramètre selected de l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedId = urlParams.get('selected');

    if (selectedId && albums) {
      const album = albums.find(a => a.id === selectedId);
      if (album) {
        setSelectedAlbum(album);
        setDialogOpen(true);
      }
    }
  }, [albums]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;

    if (type === 'file' && files) {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [name]: file,
      }));

      if (file) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleArtistChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      artistId: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createAlbum.isPending) return;

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('releaseDate', formData.releaseDate);
    submitData.append('artistId', formData.artistId);
    if (formData.cover) {
      submitData.append('cover', formData.cover);
    }

    try {
      await createAlbum.mutateAsync(submitData);
      setCreateModalOpen(false);
      setFormData({
        title: '',
        releaseDate: '',
        artistId: '',
        cover: null,
      });
      setPreviewUrl(null);
    } catch (error) {
      console.error("Erreur lors de la création de l'album:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      title: searchTitle || undefined,
      artistId: searchArtistId || undefined,
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
    });
  };

  const resetSearch = () => {
    setSearchTitle('');
    setSearchArtistId('');
    setStartDate(undefined);
    setEndDate(undefined);
    setSearchParams({});
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (isLoadingAlbums || isLoadingArtists) {
    return (
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!albums || !artists) {
    return null;
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Albums</h1>
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un album..."
                value={searchTitle}
                onChange={e => setSearchTitle(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={searchArtistId} onValueChange={setSearchArtistId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par artiste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les artistes</SelectItem>
                {artists.map(artist => (
                  <SelectItem key={artist.id} value={artist.id}>
                    {artist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[160px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'dd/MM/yyyy') : 'Date début'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[160px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd/MM/yyyy') : 'Date fin'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button type="submit" variant="secondary">
              Rechercher
            </Button>
            {Object.keys(searchParams).length > 0 && (
              <Button type="button" variant="ghost" onClick={resetSearch}>
                Réinitialiser
              </Button>
            )}
          </form>
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un album
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouvel album</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="releaseDate">Date de sortie</Label>
                  <Input
                    id="releaseDate"
                    name="releaseDate"
                    type="date"
                    value={formData.releaseDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artistId">Artiste</Label>
                  <Select value={formData.artistId} onValueChange={handleArtistChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un artiste" />
                    </SelectTrigger>
                    <SelectContent>
                      {artists.map(artist => (
                        <SelectItem key={artist.id} value={artist.id}>
                          {artist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cover">Couverture de l'album</Label>
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
                        id="cover"
                        name="cover"
                        type="file"
                        accept="image/*"
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById('cover')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {formData.cover ? "Changer l'image" : 'Sélectionner une image'}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCreateModalOpen(false)}
                    disabled={createAlbum.isPending}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createAlbum.isPending}>
                    {createAlbum.isPending ? (
                      <>
                        <span className="mr-2">Création en cours...</span>
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      "Créer l'album"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(searchResults || albums)?.map(album => (
          <Dialog
            key={album.id}
            open={dialogOpen && selectedAlbum?.id === album.id}
            onOpenChange={open => {
              setDialogOpen(open);
              if (!open) setSelectedAlbum(null);
            }}
          >
            <DialogTrigger asChild>
              <Card
                className="overflow-hidden transition-all hover:shadow-lg cursor-pointer"
                onClick={() => {
                  setSelectedAlbum(album);
                  setDialogOpen(true);
                }}
              >
                <CardHeader className="p-0">
                  <div className="relative aspect-square w-full">
                    {album.coverUrl ? (
                      <Image
                        src={album.coverUrl}
                        alt={album.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="line-clamp-1 text-lg">{album.title}</CardTitle>
                  <p className="mt-2 text-sm text-gray-500">
                    Sorti il y a {formatDistanceToNow(new Date(album.releaseDate), { locale: fr })}
                  </p>
                </CardContent>
              </Card>
            </DialogTrigger>
            {selectedAlbum?.id === album.id && (
              <AlbumDetails
                album={album}
                artist={artists.find(a => a.id === album.artistId)}
                onClose={() => {
                  setDialogOpen(false);
                  setSelectedAlbum(null);
                }}
              />
            )}
          </Dialog>
        ))}
      </div>
    </div>
  );
}
