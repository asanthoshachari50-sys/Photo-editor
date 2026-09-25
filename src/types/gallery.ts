export interface PhotoExif {
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  iso?: number;
  shutterSpeed?: string;
  capturedAt?: string;
  location?: string;
}

export interface Photo {
  id: string;
  title: string;
  caption?: string;
  url: string;
  albumId?: string | null;
  createdAt: string;
  fileSize: number; // in bytes
  dimensions: {
    width: number;
    height: number;
  };
  tags: string[];
  isFavorite: boolean;
  exif?: PhotoExif;
}

export interface AlbumShareSettings {
  allowDownload: boolean;
  requirePasscode: boolean;
  expiresAt?: string | null;
}

export interface Album {
  id: string;
  title: string;
  description: string;
  coverPhotoId?: string | null;
  isPrivate: boolean;
  passcode?: string;
  shareKey: string;
  createdAt: string;
  updatedAt: string;
  shareSettings: AlbumShareSettings;
}

export type GalleryViewMode = 'masonry' | 'grid' | 'compact';
export type ActiveTab = 'all' | 'albums' | 'favorites';
