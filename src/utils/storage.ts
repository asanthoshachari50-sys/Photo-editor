import { Album, Photo } from '../types/gallery';

const DB_NAME = 'lumina_mobile_gallery_v3';
const DB_VERSION = 3;
const PHOTOS_STORE = 'photos';
const ALBUMS_STORE = 'albums';
const UNLOCKED_KEY = 'lumina_unlocked_albums';

// Default starter album without any secret vaults
export const INITIAL_ALBUMS: Album[] = [
  {
    id: 'album-personal',
    title: 'Personal',
    description: 'Everyday photos and memories.',
    isPrivate: false,
    shareKey: 'personal-pub-01',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shareSettings: {
      allowDownload: true,
      requirePasscode: false,
    },
  },
];

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PHOTOS_STORE)) {
        db.createObjectStore(PHOTOS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(ALBUMS_STORE)) {
        db.createObjectStore(ALBUMS_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function initStorage(): Promise<{ photos: Photo[]; albums: Album[] }> {
  try {
    const db = await openDB();
    const photos = await getAllFromStore<Photo>(db, PHOTOS_STORE);
    const albums = await getAllFromStore<Album>(db, ALBUMS_STORE);

    let finalAlbums = albums;

    if (albums.length === 0) {
      for (const album of INITIAL_ALBUMS) {
        await putIntoStore(db, ALBUMS_STORE, album);
      }
      finalAlbums = INITIAL_ALBUMS;
    }

    // No random seed pictures: user starts completely fresh with 0 photos
    return { photos, albums: finalAlbums };
  } catch (err) {
    console.error('Failed to init IndexedDB storage', err);
    return { photos: [], albums: INITIAL_ALBUMS };
  }
}

export async function getPhotos(): Promise<Photo[]> {
  const db = await openDB();
  return getAllFromStore<Photo>(db, PHOTOS_STORE);
}

export async function getAlbums(): Promise<Album[]> {
  const db = await openDB();
  return getAllFromStore<Album>(db, ALBUMS_STORE);
}

export async function savePhoto(photo: Photo): Promise<void> {
  const db = await openDB();
  await putIntoStore(db, PHOTOS_STORE, photo);
}

export async function savePhotos(photos: Photo[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(PHOTOS_STORE, 'readwrite');
  const store = tx.objectStore(PHOTOS_STORE);
  for (const p of photos) {
    store.put(p);
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function updatePhoto(photo: Photo): Promise<void> {
  const db = await openDB();
  await putIntoStore(db, PHOTOS_STORE, photo);
}

export async function deletePhotos(photoIds: string[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(PHOTOS_STORE, 'readwrite');
  const store = tx.objectStore(PHOTOS_STORE);
  for (const id of photoIds) {
    store.delete(id);
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function batchMovePhotos(photoIds: string[], targetAlbumId: string | null): Promise<void> {
  const db = await openDB();
  const photos = await getAllFromStore<Photo>(db, PHOTOS_STORE);
  const tx = db.transaction(PHOTOS_STORE, 'readwrite');
  const store = tx.objectStore(PHOTOS_STORE);

  for (const photo of photos) {
    if (photoIds.includes(photo.id)) {
      photo.albumId = targetAlbumId;
      store.put(photo);
    }
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveAlbum(album: Album): Promise<void> {
  const db = await openDB();
  await putIntoStore(db, ALBUMS_STORE, album);
}

export async function deleteAlbum(albumId: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([ALBUMS_STORE, PHOTOS_STORE], 'readwrite');

  tx.objectStore(ALBUMS_STORE).delete(albumId);

  const photosStore = tx.objectStore(PHOTOS_STORE);
  const req = photosStore.getAll();
  req.onsuccess = () => {
    const photos: Photo[] = req.result;
    for (const p of photos) {
      if (p.albumId === albumId) {
        p.albumId = null;
        photosStore.put(p);
      }
    }
  };

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function getUnlockedAlbums(): string[] {
  try {
    const val = sessionStorage.getItem(UNLOCKED_KEY);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

export function unlockAlbum(albumId: string): void {
  try {
    const unlocked = getUnlockedAlbums();
    if (!unlocked.includes(albumId)) {
      unlocked.push(albumId);
      sessionStorage.setItem(UNLOCKED_KEY, JSON.stringify(unlocked));
    }
  } catch (e) {
    console.error(e);
  }
}

export function lockAlbum(albumId: string): void {
  try {
    const unlocked = getUnlockedAlbums().filter((id) => id !== albumId);
    sessionStorage.setItem(UNLOCKED_KEY, JSON.stringify(unlocked));
  } catch (e) {
    console.error(e);
  }
}

export function lockAllAlbums(): void {
  try {
    sessionStorage.removeItem(UNLOCKED_KEY);
  } catch (e) {
    console.error(e);
  }
}

function getAllFromStore<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function putIntoStore<T>(db: IDBDatabase, storeName: string, item: T): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}
