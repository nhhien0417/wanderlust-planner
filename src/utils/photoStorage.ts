// IndexedDB wrapper for photo storage
const DB_NAME = "wanderlust-photos";
const DB_VERSION = 1;
const STORE_NAME = "photos";

interface PhotoBlob {
  id: number;
  blob: Blob;
  tripId: string;
  photoId: string;
}

class PhotoStorage {
  private db: IDBDatabase | null = null;

  private async ensureDb(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    if (typeof indexedDB === "undefined") {
      throw new Error("IndexedDB is not available in this environment");
    }

    this.db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
          objectStore.createIndex("tripId", "tripId", { unique: false });
          objectStore.createIndex("photoId", "photoId", { unique: true });
        }
      };
    });

    return this.db;
  }

  async savePhoto(
    blob: Blob,
    tripId: string,
    photoId: string
  ): Promise<number> {
    try {
      const db = await this.ensureDb();

      return await new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add({ blob, tripId, photoId });

        request.onsuccess = () => resolve(request.result as number);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Failed to save photo", error);
      throw error;
    }
  }

  async getPhoto(photoId: string): Promise<Blob | null> {
    try {
      const db = await this.ensureDb();

      return await new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index("photoId");
        const request = index.get(photoId);

        request.onsuccess = () => {
          const result = request.result as PhotoBlob | undefined;
          resolve(result?.blob || null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Failed to fetch photo", error);
      return null;
    }
  }

  async deletePhoto(photoId: string): Promise<void> {
    try {
      const db = await this.ensureDb();

      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index("photoId");
        const request = index.getKey(photoId);

        request.onsuccess = () => {
          const key = request.result;
          if (key) {
            const deleteRequest = store.delete(key);
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Failed to delete photo", error);
      throw error;
    }
  }

  async getAllPhotos(tripId: string): Promise<PhotoBlob[]> {
    try {
      const db = await this.ensureDb();

      return await new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index("tripId");
        const request = index.getAll(tripId);

        request.onsuccess = () => resolve(request.result as PhotoBlob[]);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Failed to read photos for trip", error);
      return [];
    }
  }

  async deleteAllPhotos(tripId: string): Promise<void> {
    try {
      const db = await this.ensureDb();

      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index("tripId");
        const request = index.getAllKeys(tripId);

        request.onsuccess = () => {
          const keys = request.result;
          keys.forEach((key) => store.delete(key));
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Failed to delete photos for trip", error);
      throw error;
    }
  }

  async getPhotoUrl(photoId: string): Promise<string | null> {
    try {
      const blob = await this.getPhoto(photoId);
      if (!blob) return null;
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Failed to resolve photo URL", error);
      return null;
    }
  }
}

export const photoStorage = new PhotoStorage();
