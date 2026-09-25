import React, { useState, useEffect, useMemo } from 'react';
import {
  initStorage,
  getPhotos,
  getAlbums,
  savePhoto,
  savePhotos,
  updatePhoto,
  deletePhotos,
  batchMovePhotos,
  saveAlbum,
  deleteAlbum,
  getUnlockedAlbums,
  unlockAlbum,
  lockAlbum,
  lockAllAlbums,
  formatDate,
} from './utils/storage';
import { Photo, Album, GalleryViewMode } from './types/gallery';
import { MobileBottomNav, MobileTab } from './components/MobileBottomNav';
import { MobileHeader } from './components/MobileHeader';
import { MobileUploadSheet } from './components/MobileUploadSheet';
import { PhotoCard } from './components/PhotoCard';
import { AlbumCard } from './components/AlbumCard';
import { PhotoEditor } from './components/PhotoEditor';
import { AlbumModal } from './components/AlbumModal';
import { UnlockModal } from './components/UnlockModal';
import { ShareModal } from './components/ShareModal';
import { Lightbox } from './components/Lightbox';
import { BatchActionBar } from './components/BatchActionBar';
import { GuestSharedView } from './components/GuestSharedView';
import { StudioView } from './components/StudioView';
import {
  Plus,
  Lock,
  Unlock,
  Share2,
  Edit2,
  Trash2,
  Search,
  Camera,
  SlidersHorizontal,
  Folder,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mobile App Navigation
  const [mobileTab, setMobileTab] = useState<MobileTab>('photos');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Selection & Lightbox State
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<Photo | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Studio / Editor State
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Security / Unlocked State
  const [unlockedAlbumIds, setUnlockedAlbumIds] = useState<string[]>([]);

  // Modals & Drawers
  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState(false);
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [albumToEdit, setAlbumToEdit] = useState<Album | null>(null);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [albumToUnlock, setAlbumToUnlock] = useState<Album | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [albumToShare, setAlbumToShare] = useState<Album | null>(null);

  // Standalone Guest View mode
  const [guestViewAlbum, setGuestViewAlbum] = useState<Album | null>(null);

  // Initialize DB
  useEffect(() => {
    async function loadData() {
      try {
        const { photos: loadedPhotos, albums: loadedAlbums } = await initStorage();
        setPhotos(loadedPhotos);
        setAlbums(loadedAlbums);
        setUnlockedAlbumIds(getUnlockedAlbums());

        // Check if sharedAlbum is in URL query parameters
        const params = new URLSearchParams(window.location.search);
        const sharedAlbumId = params.get('sharedAlbum');
        if (sharedAlbumId) {
          const matched = loadedAlbums.find((a) => a.id === sharedAlbumId);
          if (matched) {
            setGuestViewAlbum(matched);
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const isAlbumUnlocked = (albumId: string) => {
    return unlockedAlbumIds.includes(albumId);
  };

  const handleUnlockSuccess = (albumId: string) => {
    unlockAlbum(albumId);
    setUnlockedAlbumIds((prev) => [...new Set([...prev, albumId])]);
    setSelectedAlbumId(albumId);
  };

  const handleLockAlbum = (albumId: string) => {
    lockAlbum(albumId);
    setUnlockedAlbumIds((prev) => prev.filter((id) => id !== albumId));
    if (selectedAlbumId === albumId) {
      setSelectedAlbumId(null);
    }
  };

  const handleLockAll = () => {
    lockAllAlbums();
    setUnlockedAlbumIds([]);
    const current = albums.find((a) => a.id === selectedAlbumId);
    if (current && current.isPrivate) {
      setSelectedAlbumId(null);
    }
  };

  // Album Click
  const handleAlbumClick = (album: Album) => {
    if (album.isPrivate && !isAlbumUnlocked(album.id)) {
      setAlbumToUnlock(album);
      setUnlockModalOpen(true);
    } else {
      setSelectedAlbumId(album.id);
    }
  };

  // Photo actions
  const handleToggleSelect = (photoId: string) => {
    setSelectedPhotoIds((prev) =>
      prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]
    );
  };

  const handleToggleFavorite = async (photoId: string) => {
    const updated = photos.map((p) => (p.id === photoId ? { ...p, isFavorite: !p.isFavorite } : p));
    setPhotos(updated);
    const target = updated.find((p) => p.id === photoId);
    if (target) await updatePhoto(target);
  };

  const handleDeletePhoto = async (photoId: string) => {
    await deletePhotos([photoId]);
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    setSelectedPhotoIds((prev) => prev.filter((id) => id !== photoId));
  };

  // Upload handler from MobileUploadSheet
  const handleUploadPhotos = async (newPhotos: Photo[], openInEditor = false) => {
    await savePhotos(newPhotos);
    setPhotos((prev) => [...newPhotos, ...prev]);

    // Update album cover and timestamp if assigned
    if (newPhotos.length > 0 && newPhotos[0].albumId) {
      const albumId = newPhotos[0].albumId;
      const target = albums.find((a) => a.id === albumId);
      if (target) {
        const updatedAlbum: Album = {
          ...target,
          updatedAt: new Date().toISOString(),
          coverPhotoId: target.coverPhotoId || newPhotos[0].id,
        };
        await saveAlbum(updatedAlbum);
        setAlbums((prev) => prev.map((a) => (a.id === albumId ? updatedAlbum : a)));
      }
    }

    if (openInEditor && newPhotos.length > 0) {
      setEditingPhoto(newPhotos[0]);
      setIsEditorOpen(true);
    }
  };

  // Studio direct file upload and edit
  const handleDirectUploadAndEdit = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = async () => {
        const newPhoto: Photo = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title: file.name.replace(/\.[^/.]+$/, '').trim() || 'Studio Image',
          url: dataUrl,
          albumId: selectedAlbumId || null,
          createdAt: new Date().toISOString(),
          fileSize: file.size,
          dimensions: {
            width: img.naturalWidth || 1920,
            height: img.naturalHeight || 1080,
          },
          tags: ['Studio', 'Mobile'],
          isFavorite: false,
        };
        await savePhoto(newPhoto);
        setPhotos((prev) => [newPhoto, ...prev]);
        setEditingPhoto(newPhoto);
        setIsEditorOpen(true);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Save edited photo handler from PhotoEditor
  const handleSaveEditedPhoto = async (editedDataUrl: string, saveAsCopy: boolean) => {
    if (!editingPhoto) return;

    if (saveAsCopy) {
      const newPhoto: Photo = {
        id: `photo-edit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: `${editingPhoto.title} (Edited)`,
        url: editedDataUrl,
        albumId: editingPhoto.albumId,
        createdAt: new Date().toISOString(),
        fileSize: editingPhoto.fileSize,
        dimensions: editingPhoto.dimensions,
        tags: [...editingPhoto.tags, 'Edited'],
        isFavorite: false,
      };
      await savePhoto(newPhoto);
      setPhotos((prev) => [newPhoto, ...prev]);
    } else {
      const updated: Photo = {
        ...editingPhoto,
        url: editedDataUrl,
        tags: Array.from(new Set([...editingPhoto.tags, 'Edited'])),
      };
      await updatePhoto(updated);
      setPhotos((prev) => prev.map((p) => (p.id === editingPhoto.id ? updated : p)));
    }
  };

  // Album Create / Edit
  const handleSaveAlbum = async (albumData: Partial<Album>) => {
    if (albumToEdit) {
      const updatedAlbum: Album = {
        ...albumToEdit,
        ...albumData,
        updatedAt: new Date().toISOString(),
      } as Album;
      await saveAlbum(updatedAlbum);
      setAlbums((prev) => prev.map((a) => (a.id === albumToEdit.id ? updatedAlbum : a)));
      setAlbumToEdit(null);
    } else {
      const newAlbum: Album = {
        id: `album-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: albumData.title || 'Untitled Album',
        description: albumData.description || '',
        isPrivate: !!albumData.isPrivate,
        passcode: albumData.passcode,
        shareKey: `${Math.random().toString(36).substring(2, 6)}-${Date.now().toString(36)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        shareSettings: albumData.shareSettings || {
          allowDownload: true,
          requirePasscode: !!albumData.isPrivate,
        },
      };
      await saveAlbum(newAlbum);
      setAlbums((prev) => [newAlbum, ...prev]);
      if (newAlbum.isPrivate) {
        unlockAlbum(newAlbum.id);
        setUnlockedAlbumIds((prev) => [...prev, newAlbum.id]);
      }
      setSelectedAlbumId(newAlbum.id);
    }
  };

  const handleDeleteAlbum = async (album: Album) => {
    if (confirm(`Delete "${album.title}"? Photos will remain in your general gallery.`)) {
      await deleteAlbum(album.id);
      setAlbums((prev) => prev.filter((a) => a.id !== album.id));
      if (selectedAlbumId === album.id) {
        setSelectedAlbumId(null);
      }
    }
  };

  const handleUpdateAlbumPasscode = async (albumId: string, newPin: string) => {
    const target = albums.find((a) => a.id === albumId);
    if (!target) return;
    const updated = { ...target, passcode: newPin, updatedAt: new Date().toISOString() };
    await saveAlbum(updated);
    setAlbums((prev) => prev.map((a) => (a.id === albumId ? updated : a)));
  };

  const handleClearAllData = async () => {
    await deletePhotos(photos.map((p) => p.id));
    setPhotos([]);
    lockAllAlbums();
    setUnlockedAlbumIds([]);
    setSelectedAlbumId(null);
  };

  // Filtered Photos
  const filteredPhotos = useMemo(() => {
    let result = photos;

    if (selectedAlbumId) {
      result = result.filter((p) => p.albumId === selectedAlbumId);
    }

    if (selectedTag) {
      result = result.filter((p) => p.tags.includes(selectedTag));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [photos, selectedAlbumId, selectedTag, searchQuery]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [photos]);

  const currentAlbum = useMemo(() => {
    return albums.find((a) => a.id === selectedAlbumId) || null;
  }, [albums, selectedAlbumId]);

  const hasUnlockedVaults = useMemo(() => {
    return albums.some((a) => a.isPrivate && unlockedAlbumIds.includes(a.id));
  }, [albums, unlockedAlbumIds]);

  // If in Guest Shared View
  if (guestViewAlbum) {
    return (
      <GuestSharedView
        album={guestViewAlbum}
        photos={photos}
        onExit={() => {
          setGuestViewAlbum(null);
          const url = new URL(window.location.href);
          url.searchParams.delete('sharedAlbum');
          url.searchParams.delete('key');
          window.history.replaceState({}, '', url.toString());
        }}
      />
    );
  }

  // Determine Mobile App Title
  const getHeaderTitle = () => {
    if (currentAlbum) return currentAlbum.title;
    switch (mobileTab) {
      case 'photos':
        return 'Photos';
      case 'albums':
        return 'Albums';
      case 'editor':
        return 'Studio';
      default:
        return 'Lumina';
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#070709] text-zinc-100 flex flex-col justify-between selection:bg-amber-400/20 selection:text-amber-200">
      {/* Mobile App Canvas Shell (Responsive max-w-md centered container for native smartphone experience) */}
      <div className="w-full max-w-md mx-auto min-h-screen min-h-[100dvh] bg-[#09090b] flex flex-col relative sm:border-x sm:border-zinc-900 shadow-2xl">
        {/* Sticky Mobile App Bar */}
        <MobileHeader
          title={getHeaderTitle()}
          subtitle={currentAlbum ? `${filteredPhotos.length} photos` : undefined}
          showBack={!!selectedAlbumId}
          onBack={() => setSelectedAlbumId(null)}
          onOpenUpload={() => setIsUploadSheetOpen(true)}
        />

        {/* Scrollable Content Body */}
        <main className="flex-1 p-3.5 sm:p-4 pb-24 overflow-y-auto">
          {/* TAB 1: PHOTOS (or Album Detail) */}
          {(mobileTab === 'photos' || selectedAlbumId) && (
            <div className="space-y-4">
              {/* Inside Album Info Card */}
              {currentAlbum ? (
                <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {currentAlbum.isPrivate ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                          <Lock className="w-3 h-3" />
                          <span>Private Album</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-zinc-400 bg-zinc-800 px-2.5 py-0.5 rounded-full">
                          Public Album
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setAlbumToShare(currentAlbum);
                          setShareModalOpen(true);
                        }}
                        className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Share album"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setAlbumToEdit(currentAlbum);
                          setAlbumModalOpen(true);
                        }}
                        className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Album settings"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {currentAlbum.isPrivate && (
                        <button
                          onClick={() => handleLockAlbum(currentAlbum.id)}
                          className="p-2 rounded-xl text-amber-400 hover:bg-amber-400/10 transition-colors"
                          title="Lock album"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {currentAlbum.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {currentAlbum.description}
                    </p>
                  )}
                </div>
              ) : (
                /* Search & Quick Filter Bar on Photos tab */
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search photos, tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800/80 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-all"
                    />
                  </div>

                  {allTags.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      <button
                        onClick={() => setSelectedTag(null)}
                        className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap ${
                          selectedTag === null
                            ? 'bg-amber-400 text-zinc-950 font-semibold'
                            : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        All
                      </button>
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                          className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap ${
                            selectedTag === tag
                              ? 'bg-amber-400 text-zinc-950 font-semibold'
                              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Photos Grid */}
              {filteredPhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {filteredPhotos.map((photo) => {
                    const album = albums.find((a) => a.id === photo.albumId);
                    return (
                      <PhotoCard
                        key={photo.id}
                        photo={photo}
                        isSelected={selectedPhotoIds.includes(photo.id)}
                        onToggleSelect={handleToggleSelect}
                        onOpenLightbox={(p) => {
                          setActiveLightboxPhoto(p);
                          setIsLightboxOpen(true);
                        }}
                        onToggleFavorite={handleToggleFavorite}
                        onDeletePhoto={handleDeletePhoto}
                        onEditPhoto={(p) => {
                          setEditingPhoto(p);
                          setIsEditorOpen(true);
                        }}
                        albumName={album?.title}
                      />
                    );
                  })}
                </div>
              ) : (
                /* Fresh Clean Onboarding State */
                <div className="text-center py-20 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
                    <Camera className="w-8 h-8 stroke-1" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-white tracking-tight">
                      {searchQuery ? 'No matching photos' : 'No photos yet'}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-[240px] mx-auto">
                      {searchQuery
                        ? 'Try adjusting your search terms.'
                        : 'Upload your photographs or capture with your camera to begin.'}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsUploadSheetOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs shadow-lg transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Upload First Photo</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ALBUMS */}
          {mobileTab === 'albums' && !selectedAlbumId && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="font-display text-base font-bold text-white">Your Albums</h2>
                  <p className="text-xs text-zinc-400">Organize your photo collections</p>
                </div>
                <button
                  onClick={() => {
                    setAlbumToEdit(null);
                    setAlbumModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Album</span>
                </button>
              </div>

              <div className="space-y-3">
                {albums.map((album) => {
                  const cover = photos.find((p) => p.id === album.coverPhotoId) ||
                    photos.find((p) => p.albumId === album.id) ||
                    null;
                  const count = photos.filter((p) => p.albumId === album.id).length;
                  const unlocked = isAlbumUnlocked(album.id);

                  return (
                    <AlbumCard
                      key={album.id}
                      album={album}
                      coverPhoto={cover}
                      photoCount={count}
                      isUnlocked={unlocked}
                      onOpenAlbum={handleAlbumClick}
                      onShareAlbum={(a) => {
                        setAlbumToShare(a);
                        setShareModalOpen(true);
                      }}
                      onEditAlbum={(a) => {
                        setAlbumToEdit(a);
                        setAlbumModalOpen(true);
                      }}
                      onDeleteAlbum={handleDeleteAlbum}
                      onLockAlbum={handleLockAlbum}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: STUDIO / PHOTO EDITOR VIEW */}
          {mobileTab === 'editor' && (
            <StudioView
              photos={photos}
              onSelectPhotoToEdit={(p) => {
                setEditingPhoto(p);
                setIsEditorOpen(true);
              }}
              onUploadAndEdit={handleDirectUploadAndEdit}
            />
          )}
        </main>

        {/* Floating Batch Selection Bar */}
        <BatchActionBar
          selectedCount={selectedPhotoIds.length}
          albums={albums}
          onDeselectAll={() => setSelectedPhotoIds([])}
          onBatchMove={async (targetAlbumId) => {
            await batchMovePhotos(selectedPhotoIds, targetAlbumId);
            setPhotos((prev) =>
              prev.map((p) => (selectedPhotoIds.includes(p.id) ? { ...p, albumId: targetAlbumId } : p))
            );
            setSelectedPhotoIds([]);
          }}
          onBatchDelete={async () => {
            if (confirm(`Delete ${selectedPhotoIds.length} photos?`)) {
              await deletePhotos(selectedPhotoIds);
              setPhotos((prev) => prev.filter((p) => !selectedPhotoIds.includes(p.id)));
              setSelectedPhotoIds([]);
            }
          }}
          onBatchDownload={() => {
            const selected = photos.filter((p) => selectedPhotoIds.includes(p.id));
            selected.forEach((p, idx) => {
              setTimeout(() => {
                const link = document.createElement('a');
                link.href = p.url;
                link.download = `${p.title.toLowerCase().replace(/\s+/g, '_')}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }, idx * 250);
            });
          }}
          onBatchAddTag={async (tag) => {
            const updated = photos.map((p) => {
              if (selectedPhotoIds.includes(p.id) && !p.tags.includes(tag)) {
                return { ...p, tags: [...p.tags, tag] };
              }
              return p;
            });
            setPhotos(updated);
            for (const id of selectedPhotoIds) {
              const p = updated.find((x) => x.id === id);
              if (p) await updatePhoto(p);
            }
            setSelectedPhotoIds([]);
          }}
        />

        {/* Mobile Bottom Navigation Bar (3 Clean Tabs) */}
        <MobileBottomNav
          activeTab={mobileTab}
          onTabChange={(tab) => {
            setMobileTab(tab);
            setSelectedAlbumId(null);
          }}
          photosCount={photos.length}
          albumsCount={albums.length}
        />
      </div>

      {/* Mobile Upload Bottom Sheet */}
      <MobileUploadSheet
        isOpen={isUploadSheetOpen}
        onClose={() => setIsUploadSheetOpen(false)}
        albums={albums}
        defaultAlbumId={selectedAlbumId}
        onUploadPhotos={handleUploadPhotos}
      />

      {/* Mobile Photo Editor (Full Studio) */}
      {editingPhoto && (
        <PhotoEditor
          photo={editingPhoto}
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingPhoto(null);
          }}
          onSaveEditedPhoto={handleSaveEditedPhoto}
        />
      )}

      {/* Lightbox Modal */}
      <Lightbox
        photos={filteredPhotos}
        currentPhoto={activeLightboxPhoto}
        isOpen={isLightboxOpen}
        onClose={() => {
          setIsLightboxOpen(false);
          setActiveLightboxPhoto(null);
        }}
        onSelectPhoto={(p) => setActiveLightboxPhoto(p)}
        onToggleFavorite={handleToggleFavorite}
        onDeletePhoto={handleDeletePhoto}
        onEditPhoto={(p) => {
          setIsLightboxOpen(false);
          setEditingPhoto(p);
          setIsEditorOpen(true);
        }}
        allowDownload={true}
      />

      {/* Album Create/Edit Modal */}
      <AlbumModal
        isOpen={albumModalOpen}
        onClose={() => {
          setAlbumModalOpen(false);
          setAlbumToEdit(null);
        }}
        albumToEdit={albumToEdit}
        onSaveAlbum={handleSaveAlbum}
      />

      {/* Unlock Private Album Modal */}
      <UnlockModal
        isOpen={unlockModalOpen}
        onClose={() => {
          setUnlockModalOpen(false);
          setAlbumToUnlock(null);
        }}
        album={albumToUnlock}
        onSuccess={handleUnlockSuccess}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setAlbumToShare(null);
        }}
        album={albumToShare}
        onUpdateShareSettings={async (albumId, settings) => {
          const target = albums.find((a) => a.id === albumId);
          if (!target) return;
          const updated = { ...target, shareSettings: settings, updatedAt: new Date().toISOString() };
          await saveAlbum(updated);
          setAlbums((prev) => prev.map((a) => (a.id === albumId ? updated : a)));
        }}
        onPreviewGuestView={(album) => {
          setShareModalOpen(false);
          setGuestViewAlbum(album);
        }}
      />
    </div>
  );
}
