'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Upload,
  User,
  Music,
  Pencil,
  Trash,
  Calendar,
  Clock,
  Search,
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
  useArtists,
  useCreateArtist,
  useUpdateArtist,
  useDeleteArtist,
  useSearchArtists,
  SearchArtistParams,
} from '@/hooks/use-artists';
import { Artist } from '@/types/Artist';
import { Track } from '@/types/Track';
import { Textarea } from '@/components/ui/textarea';
import { formatDuration } from '@/lib/utils';
import { AudioPlayer } from '@/components/audio-player';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ArtistDetailsProps {
  artist: Artist;
  onClose: () => void;
}

function ArtistDetails({ artist, onClose }: ArtistDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedArtist, setEditedArtist] = useState(artist);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const router = useRouter();
  const updateArtist = useUpdateArtist();
  const deleteArtist = useDeleteArtist();

  const handleArtistEdit = async () => {
    if (updateArtist.isPending) return;

    try {
      await updateArtist.mutateAsync({
        id: artist.id,
        data: {
          name: editedArtist.name,
          biography: editedArtist.biography || undefined,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la modification de l'artiste:", error);
    }
  };

  const handleDeleteArtist = async () => {
    if (deleteArtist.isPending) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer cet artiste ?')) {
      try {
        await deleteArtist.mutateAsync(artist.id);
        onClose();
      } catch (error) {
        console.error("Erreur lors de la suppression de l'artiste:", error);
      }
    }
  };

  const handleAlbumClick = (albumId: string) => {
    onClose();
    router.push(`/albums?selected=${albumId}`);
  };

  const latestAlbums = artist.albums.slice(0, 5);
  const latestTracks = artist.tracks.slice(0, 5);

  return (
    <DialogContent className="sm:max-w-[825px] max-h-[90vh] overflow-y-auto">
      <DialogHeader className="sticky top-0 z-10 bg-background pt-6 pb-4">
        <DialogTitle className="flex items-center justify-between">
          <span>Détails de l'artiste</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
              disabled={updateArtist.isPending || deleteArtist.isPending}
            >
              {updateArtist.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Pencil className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteArtist}
              disabled={updateArtist.isPending || deleteArtist.isPending}
            >
              {deleteArtist.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin text-destructive" />
              ) : (
                <Trash className="h-4 w-4 text-destructive" />
              )}
            </Button>
          </div>
        </DialogTitle>
      </DialogHeader>

      <div className="px-1 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-6">
            <div className="relative aspect-square w-full bg-muted rounded-lg overflow-hidden">
              {editedArtist.imageUrl ? (
                <Image
                  src={editedArtist.imageUrl}
                  alt={editedArtist.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            {!isEditing && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Créé le {format(new Date(artist.createdAt), 'dd MMMM yyyy', { locale: fr })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Music className="h-4 w-4" />
                  <span>{artist.albums.length} albums</span>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Nom</Label>
                  <Input
                    id="edit-name"
                    value={editedArtist.name}
                    onChange={e => setEditedArtist(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-biography">Biographie</Label>
                  <Textarea
                    id="edit-biography"
                    value={editedArtist.biography || ''}
                    onChange={e =>
                      setEditedArtist(prev => ({ ...prev, biography: e.target.value }))
                    }
                    className="min-h-[100px]"
                  />
                </div>
                <Button
                  onClick={handleArtistEdit}
                  disabled={updateArtist.isPending}
                  className="mt-4"
                >
                  {updateArtist.isPending ? (
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
                <h3 className="text-2xl font-bold">{editedArtist.name}</h3>
                {editedArtist.biography && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Biographie</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {editedArtist.biography}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {!isEditing && (
          <>
            {selectedTrack && (
              <div className="sticky top-[72px] z-10 bg-background pt-2">
                <div className="p-4 rounded-lg border bg-card">
                  <AudioPlayer url={selectedTrack.audioUrl} title={selectedTrack.title} />
                </div>
              </div>
            )}
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Derniers albums</h4>
                {latestAlbums.length > 0 ? (
                  <div className="space-y-2">
                    {latestAlbums.map(album => (
                      <button
                        key={album.id}
                        onClick={() => handleAlbumClick(album.id)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
                          {album.coverUrl ? (
                            <Image
                              src={album.coverUrl}
                              alt={album.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{album.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(album.releaseDate), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun album</p>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Dernières pistes</h4>
                {latestTracks.length > 0 ? (
                  <div className="space-y-2">
                    {latestTracks.map(track => (
                      <button
                        key={track.id}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                        onClick={() =>
                          setSelectedTrack(selectedTrack?.id === track.id ? null : track)
                        }
                      >
                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                          {selectedTrack?.id === track.id ? (
                            <div className="relative w-full h-full">
                              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                              </div>
                            </div>
                          ) : (
                            <Music className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{track.title}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(track.duration)}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune piste</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DialogContent>
  );
}

export default function ArtistsPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<SearchArtistParams>({});
  const [searchName, setSearchName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    biography: '',
    image: null as File | null,
  });

  const { data: artists, isLoading: isLoadingArtists } = useArtists();
  const { data: searchResults, isLoading: isSearching } = useSearchArtists(searchParams);
  const createArtist = useCreateArtist();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      name: searchName || undefined,
    });
  };

  const resetSearch = () => {
    setSearchName('');
    setSearchParams({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'file') {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        const file = files[0];
        setFormData(prev => ({
          ...prev,
          image: file,
        }));

        if (file) {
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createArtist.isPending) return;

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('biography', formData.biography);
    if (formData.image) {
      submitData.append('image', formData.image);
    }

    try {
      await createArtist.mutateAsync(submitData);
      setCreateModalOpen(false);
      setFormData({
        name: '',
        biography: '',
        image: null,
      });
      setPreviewUrl(null);
    } catch (error) {
      console.error("Erreur lors de la création de l'artiste:", error);
    }
  };

  if (isLoadingArtists) {
    return (
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!artists) {
    return null;
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Artistes</h1>
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un artiste..."
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                className="pl-8"
              />
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
                Ajouter un artiste
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouvel artiste</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biography">Biographie</Label>
                  <Textarea
                    id="biography"
                    name="biography"
                    value={formData.biography}
                    onChange={handleInputChange}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Photo de l'artiste</Label>
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
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById('image')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {formData.image ? "Changer l'image" : 'Sélectionner une image'}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCreateModalOpen(false)}
                    disabled={createArtist.isPending}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createArtist.isPending}>
                    {createArtist.isPending ? (
                      <>
                        <span className="mr-2">Création en cours...</span>
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      "Créer l'artiste"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(searchResults || artists)?.map(artist => (
          <Dialog key={artist.id} onOpenChange={open => open && setSelectedArtist(artist)}>
            <DialogTrigger asChild>
              <Card className="overflow-hidden transition-all hover:shadow-lg cursor-pointer">
                <CardHeader className="p-0">
                  <div className="relative aspect-square w-full">
                    {artist.imageUrl ? (
                      <Image
                        src={artist.imageUrl}
                        alt={artist.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <User className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="line-clamp-1 text-lg">{artist.name}</CardTitle>
                </CardContent>
              </Card>
            </DialogTrigger>
            {selectedArtist?.id === artist.id && (
              <ArtistDetails artist={artist} onClose={() => setSelectedArtist(null)} />
            )}
          </Dialog>
        ))}
      </div>
    </div>
  );
}
